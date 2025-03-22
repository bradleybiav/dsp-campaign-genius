
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const SONGSTATS_API_URL = 'https://api.songstats.com/v1';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

/**
 * Retry mechanism for API calls
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 0): Promise<Response> {
  try {
    console.log(`Making request to: ${url}`);
    console.log(`Request headers:`, options.headers);
    
    const response = await fetch(url, options);
    console.log(`Response status: ${response.status}`);
    
    // For debugging, log response headers and body preview
    const headers = Object.fromEntries([...response.headers.entries()]);
    console.log(`Response headers:`, headers);
    
    // Clone response to be able to read body and still return original response
    const clonedResponse = response.clone();
    let bodyPreview = "";
    try {
      const responseText = await clonedResponse.text();
      bodyPreview = responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '');
      console.log(`Response body preview:`, bodyPreview);
    } catch (e) {
      console.error(`Error reading response body:`, e);
    }
    
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { path, params } = await req.json()
    console.log(`Request received for path: ${path}, params:`, params);
    
    // Get the API key from Supabase secrets
    const apiKey = Deno.env.get("SONGSTATS_API_KEY")
    
    if (!apiKey) {
      console.error("API key not configured in environment variables");
      return new Response(
        JSON.stringify({ 
          error: "API key not configured",
          details: "The Songstats API key is missing in the edge function configuration."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      )
    }

    // Log API key information (safely)
    console.log(`API key information: length=${apiKey.length}, first4Chars=${apiKey.substring(0, 4)}..., last4Chars=...${apiKey.substring(apiKey.length - 4)}`);

    // Construct URL with query parameters
    let url = `${SONGSTATS_API_URL}/${path}`
    
    if (params) {
      const queryParams = new URLSearchParams(params)
      url = `${url}?${queryParams.toString()}`
    }

    console.log(`Making request to Songstats API: ${url}`);

    // Make request to Songstats API with retry logic
    const response = await fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Songstats API responded with status ${response.status}`;
      
      try {
        // Try to parse error as JSON if possible
        const errorJson = JSON.parse(errorText);
        console.error("Songstats API error response:", errorJson);
        
        return new Response(
          JSON.stringify({ 
            error: errorMessage,
            status: response.status,
            details: errorJson
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.status }
        )
      } catch (e) {
        // Fall back to raw error text
        console.error("Songstats API error response:", errorText);
        
        return new Response(
          JSON.stringify({ 
            error: errorMessage,
            status: response.status,
            details: errorText
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.status }
        )
      }
    }

    const data = await response.json()
    console.log(`Songstats API response for ${path} received successfully`);

    // Return response data
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error in Songstats edge function:", error);
    
    // Return detailed error message
    return new Response(
      JSON.stringify({ 
        error: "Error processing Songstats API request",
        details: error.message,
        stack: Deno.env.get("ENVIRONMENT") === "development" ? error.stack : undefined
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
