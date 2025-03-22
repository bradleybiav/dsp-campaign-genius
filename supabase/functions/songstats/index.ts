
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// Base URL according to Songstats API docs
const SONGSTATS_API_URL = 'https://api.songstats.com/api/v1';

// Maximum retries for API calls
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

/**
 * Makes a fetch request with automatic retry for certain error conditions
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 0): Promise<Response> {
  try {
    console.log(`Request to Songstats API: ${url} (attempt ${retries + 1})`);
    
    const response = await fetch(url, options);
    
    // Handle rate limiting (429) and server errors (5xx) with retries
    if ((response.status === 429 || response.status >= 500) && retries < MAX_RETRIES) {
      console.log(`Received status ${response.status}, retrying (${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retries + 1)));
      return fetchWithRetry(url, options, retries + 1);
    }
    
    return response;
  } catch (error) {
    // Handle network errors with retries
    if (retries < MAX_RETRIES) {
      console.error(`Network error (attempt ${retries + 1}):`, error);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retries + 1)));
      return fetchWithRetry(url, options, retries + 1);
    }
    throw error;
  }
}

/**
 * Validate API key format
 */
function isApiKeyValid(apiKey: string | undefined): boolean {
  return !!apiKey && apiKey.length >= 10;
}

/**
 * Process response from Songstats API
 */
async function processApiResponse(response: Response): Promise<object> {
  try {
    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      
      // If non-success status code, include error information
      if (!response.ok) {
        return {
          ...data,
          error: data.error || `Songstats API responded with status ${response.status}`,
          status: response.status
        };
      }
      
      return data;
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      return { 
        error: "Invalid response format", 
        status: response.status,
        text: text.substring(0, 300) // Include part of the response text for debugging
      };
    }
  } catch (textError) {
    console.error("Error reading response:", textError);
    return { 
      error: "Failed to read response",
      status: response.status 
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { path, params } = await req.json();
    console.log(`Request for path: ${path}`);
    
    // Get API key from environment
    const apiKey = Deno.env.get("SONGSTATS_API_KEY");
    
    // Validate API key
    if (!isApiKeyValid(apiKey)) {
      return new Response(
        JSON.stringify({ 
          error: "API key not configured or invalid",
          details: "Please configure a valid Songstats API key"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    try {
      // Build the API URL with query parameters
      let apiUrl = `${SONGSTATS_API_URL}/${path}`;
      
      if (params && Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams(params);
        apiUrl = `${apiUrl}?${queryParams.toString()}`;
      }
      
      // Call Songstats API with retry logic
      const response = await fetchWithRetry(apiUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
      });

      // Process the response
      const responseData = await processApiResponse(response);
      
      // Return processed data with CORS headers
      return new Response(
        JSON.stringify(responseData),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } catch (apiError) {
      console.error("Error calling Songstats API:", apiError);
      
      return new Response(
        JSON.stringify({ 
          error: "Error calling Songstats API",
          details: apiError.message
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in edge function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Error processing request",
        details: error.message
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
