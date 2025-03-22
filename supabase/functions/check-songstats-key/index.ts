
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
    
    // Log key information without exposing the key itself
    console.log("Checking Songstats API key:", {
      present: !!apiKey,
      length: apiKey ? apiKey.length : 0
    });
    
    // Try making a simple test request to validate the key
    let apiTestResult = null;
    let apiError = null;
    
    if (apiKey && apiKey.length >= 10) {
      try {
        // Use a simple endpoint to test the API key
        const testUrl = 'https://api.songstats.com/v1/health';
        const response = await fetch(testUrl, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Accept": "application/json"
          },
        });
        
        console.log("API test response status:", response.status);
        
        if (response.ok) {
          apiTestResult = 'success';
        } else {
          const errorText = await response.text();
          apiError = `API responded with status ${response.status}: ${errorText.substring(0, 100)}`;
          console.error("API test failed:", apiError);
        }
      } catch (e) {
        apiError = e.message;
        console.error("API test error:", e);
      }
    }
    
    // Basic validation - keys should be reasonably long
    const isValidFormat = apiKey && apiKey.length >= 10;
    
    return new Response(
      JSON.stringify({ 
        configured: !!apiKey,
        valid: isValidFormat,
        apiTestResult,
        apiError,
        message: apiKey 
          ? `API key is ${isValidFormat ? "configured properly" : "configured but may be invalid"}`
          : "API key is not configured",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error checking Songstats API key:", error);
    
    return new Response(
      JSON.stringify({ 
        configured: false,
        error: "Error checking API key configuration",
        details: error.message
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )
  }
})
