
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// Base URL according to Songstats API docs
const SONGSTATS_API_URL = 'https://api.songstats.com/api/v1';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

/**
 * Retry mechanism for API calls
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 0): Promise<Response> {
  try {
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url, options);
    console.log(`Response status: ${response.status}`);
    
    // Handle rate limiting (429) specifically
    if (response.status === 429 && retries < MAX_RETRIES) {
      console.log(`Rate limited, retry ${retries + 1}/${MAX_RETRIES} after ${RETRY_DELAY_MS}ms`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retries + 1)));
      return fetchWithRetry(url, options, retries + 1);
    }
    
    // Handle other server errors that might be temporary
    if (response.status >= 500 && retries < MAX_RETRIES) {
      console.log(`Server error ${response.status}, retry ${retries + 1}/${MAX_RETRIES} after ${RETRY_DELAY_MS}ms`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retries + 1)));
      return fetchWithRetry(url, options, retries + 1);
    }
    
    // For all other responses, including 404s, just return the response
    return response;
  } catch (error) {
    console.error(`Fetch error:`, error);
    // Handle network errors
    if (retries < MAX_RETRIES) {
      console.log(`Network error, retry ${retries + 1}/${MAX_RETRIES} after ${RETRY_DELAY_MS}ms`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retries + 1)));
      return fetchWithRetry(url, options, retries + 1);
    }
    throw error;
  }
}

/**
 * Helper function to validate API key
 */
function validateApiKey(apiKey: string | undefined): boolean {
  if (!apiKey) {
    console.error("API key not configured in environment variables");
    return false;
  }
  
  // Basic validation
  if (apiKey.length < 10) {
    console.error(`API key looks invalid (too short): length=${apiKey.length}`);
    return false;
  }
  
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { path, params } = await req.json();
    console.log(`Request received for path: ${path}, params:`, params);
    
    // Get the API key from Supabase secrets
    const apiKey = Deno.env.get("SONGSTATS_API_KEY");
    
    if (!validateApiKey(apiKey)) {
      return new Response(
        JSON.stringify({ 
          error: "API key not configured or invalid",
          details: "The Songstats API key is missing or invalid in the edge function configuration."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    try {
      // Build the URL according to the API docs
      let apiUrl = `${SONGSTATS_API_URL}/${path}`;
      
      if (params) {
        const queryParams = new URLSearchParams(params);
        apiUrl = `${apiUrl}?${queryParams.toString()}`;
      }
      
      console.log(`Making request to Songstats API: ${apiUrl}`);
      
      // Make request to Songstats API with retry logic
      const response = await fetchWithRetry(apiUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
      });

      // Even for error responses like 404, try to parse the response
      let responseData;
      try {
        const responseText = await response.text();
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          console.log("Response text:", responseText.substring(0, 200));
          
          // For non-JSON responses, create a structured error response
          responseData = { 
            error: "Invalid response format", 
            status: response.status,
            text: responseText.substring(0, 300)
          };
        }
      } catch (textError) {
        console.error("Error reading response text:", textError);
        responseData = { 
          error: "Failed to read response body",
          status: response.status
        };
      }

      // For non-200 responses, include error information but still return structured data
      if (!response.ok) {
        console.log(`Songstats API returned non-OK status: ${response.status}`);
        
        // Include the status code and appropriate error message
        if (!responseData.error) {
          responseData = {
            ...responseData,
            error: `Songstats API responded with status ${response.status}`,
            status: response.status
          };
        }
      } else {
        console.log(`Songstats API response for ${path} received successfully`);
      }

      // Return response data with proper headers
      return new Response(
        JSON.stringify(responseData),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 // Always return 200 to the client, with error details in the response body
        }
      );
    } catch (apiError) {
      console.error("Error calling Songstats API:", apiError);
      
      return new Response(
        JSON.stringify({ 
          error: "Error calling Songstats API",
          details: apiError.message,
          troubleshooting: "The Songstats API might be unavailable or has changed."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in Songstats edge function:", error);
    
    // Return detailed error message
    return new Response(
      JSON.stringify({ 
        error: "Error processing Songstats API request",
        details: error.message
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
