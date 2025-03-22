
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// API versions supported by Songstats
const API_VERSIONS = ['v1', 'v2'];
// Default base URL (will be modified based on API version detection)
const DEFAULT_API_URL = 'https://api.songstats.com/api';

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
 * Try different API versions and endpoint structures
 */
async function tryMultipleEndpoints(basePath: string, params: any, apiKey: string): Promise<{ result: any, successUrl?: string }> {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    }
  };

  const endpointsToTry = [];
  
  // Try with prefix /api first as it's in the official docs
  for (const version of API_VERSIONS) {
    endpointsToTry.push(`https://api.songstats.com/api/${version}/${basePath}`);
  }
  
  // Then try without /api prefix
  for (const version of API_VERSIONS) {
    endpointsToTry.push(`https://api.songstats.com/${version}/${basePath}`);
  }
  
  // Finally try direct endpoint without version
  endpointsToTry.push(`https://api.songstats.com/api/${basePath}`);
  endpointsToTry.push(`https://api.songstats.com/${basePath}`);
  
  console.log(`Will try these endpoints:`, endpointsToTry);
  
  for (const apiUrl of endpointsToTry) {
    try {
      let fullUrl = apiUrl;
      
      if (params && Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams(params);
        fullUrl = `${apiUrl}?${queryParams.toString()}`;
      }
      
      console.log(`Trying Songstats API at: ${fullUrl}`);
      
      const response = await fetchWithRetry(fullUrl, requestOptions, 0);
      const responseData = await processApiResponse(response);
      
      if (response.ok && !responseData.error) {
        console.log(`Found working endpoint: ${apiUrl}`);
        return { result: responseData, successUrl: apiUrl };
      }
      
      console.log(`Endpoint ${apiUrl} returned ${response.status}`);
    } catch (e) {
      console.error(`Error with endpoint ${apiUrl}:`, e.message);
    }
  }
  
  // If we get here, all endpoints failed
  return { 
    result: { 
      error: "All Songstats API endpoints failed", 
      attemptedEndpoints: endpointsToTry 
    } 
  };
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
      // Strip any version prefix from the path to allow us to try different versions
      const cleanedPath = path.replace(/^v[12]\//, '');
      
      // Try multiple endpoint formats to find one that works
      const { result, successUrl } = await tryMultipleEndpoints(cleanedPath, params, apiKey);
      
      if (successUrl) {
        console.log(`Successfully used endpoint: ${successUrl}`);
      }
      
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
