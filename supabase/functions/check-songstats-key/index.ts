
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Get the API key from Supabase secrets
    const apiKey = Deno.env.get("SONGSTATS_API_KEY")
    
    console.log("Checking Songstats API key configuration:", {
      apiKeyPresent: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiKeyFirstChars: apiKey ? apiKey.substring(0, 4) : 'none',
      apiKeyLastChars: apiKey ? apiKey.substring(apiKey.length - 4) : 'none'
    });
    
    // Check if the API key format appears valid (basic check)
    const apiKeyValid = apiKey && apiKey.length >= 10;
    const apiKeyFormat = apiKey ? "appears valid" : "missing or invalid";
    
    // Try to make a simple request to validate the API key if it exists
    let validationResult = null;
    if (apiKeyValid) {
      try {
        console.log("Attempting to validate API key with a test request...");
        
        // Make a simple request to the Songstats API
        const testUrl = "https://api.songstats.com/api/v1/version";
        const response = await fetch(testUrl, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });
        
        console.log(`Test API request result: status=${response.status}`);
        
        try {
          // Log response for debugging
          const responseText = await response.text();
          console.log(`API test response: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
          
          validationResult = {
            status: response.status,
            response: responseText.substring(0, 200)
          };
        } catch (e) {
          console.error("Error reading test response:", e);
        }
      } catch (e) {
        console.error("Error validating API key:", e);
        validationResult = {
          error: e.message
        };
      }
    }

    return new Response(
      JSON.stringify({ 
        configured: !!apiKey,
        valid: apiKeyValid,
        message: apiKey 
          ? `API key is configured (${apiKeyFormat})` 
          : "API key is not configured or is empty",
        apiKeyLength: apiKey ? apiKey.length : 0,
        validationResult
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    )
  } catch (error) {
    console.error("Detailed error checking Songstats API key:", {
      errorMessage: error.message,
      errorStack: error.stack
    });
    
    return new Response(
      JSON.stringify({ 
        configured: false,
        error: "Error checking API key configuration",
        details: error.message
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        }, 
        status: 500 
      }
    )
  }
})
