
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// Default base URL for Songstats Enterprise API
const ENTERPRISE_API_URL = 'https://api.songstats.com/enterprise/v1';
const RADIOSTATS_API_URL = 'https://api.songstats.com/radiostats/v1';

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
 * Process response from Songstats API
 */
async function processApiResponse(response: Response): Promise<object> {
  try {
    const text = await response.text();
    
    try {
      const data = JSON.parse(text || "{}");
      
      // If non-success status code, include error information
      if (!response.ok) {
        console.log(`API responded with status ${response.status}: ${text.substring(0, 200)}`);
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

/**
 * Call the Songstats API (Enterprise or RadioStats)
 */
async function callSongstatsApi(path: string, params: any, apiKey: string): Promise<any> {
  const queryParams = new URLSearchParams(params);
  
  // Determine which API to use based on the path or params
  let baseUrl = ENTERPRISE_API_URL;
  
  // If the path explicitly starts with 'radio/' or we're requesting radio data,
  // use the RadioStats API
  if (path.startsWith('radio/') || params.with_radio === "true") {
    baseUrl = RADIOSTATS_API_URL;
  }
  
  const url = `${baseUrl}/${path}?${queryParams.toString()}`;
  
  console.log(`Calling API: ${url}`);
  
  const requestOptions = {
    method: "GET",
    headers: {
      'Accept-Encoding': '',
      "Accept": 'application/json',
      'apikey': apiKey,
      "Content-Type": "application/json"
    }
  };
  
  try {
    const response = await fetchWithRetry(url, requestOptions, 0);
    return await processApiResponse(response);
  } catch (error) {
    console.error(`Error calling API: ${error.message}`);
    return { error: error.message };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { path, params } = await req.json();
    console.log(`Request for path: ${path}, params:`, params);
    
    // Get API key from environment
    const apiKey = Deno.env.get("SONGSTATS_API_KEY");
    
    // Validate API key
    if (!apiKey || apiKey.length < 10) {
      return new Response(
        JSON.stringify({ 
          error: "API key not configured or invalid",
          details: "Please configure a valid Songstats API key"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    try {
      // Call the API with the provided path and params
      const result = await callSongstatsApi(path, params, apiKey);
      
      // Return processed data with CORS headers
      return new Response(
        JSON.stringify(result),
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
