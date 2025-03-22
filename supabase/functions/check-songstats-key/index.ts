
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
      apiKeyLength: apiKey ? apiKey.length : 0
    });
    
    // Check if the API key format appears valid (basic check)
    const apiKeyValid = apiKey && apiKey.length >= 10;
    
    // Make sure we set proper headers for CORS and content type
    const headers = { 
      ...corsHeaders, 
      "Content-Type": "application/json" 
    };

    return new Response(
      JSON.stringify({ 
        configured: !!apiKey,
        valid: apiKeyValid,
        message: apiKey 
          ? `API key is configured (${apiKeyValid ? "appears valid" : "invalid format"})` 
          : "API key is not configured or is empty",
        apiKeyLength: apiKey ? apiKey.length : 0
      }),
      { headers }
    )
  } catch (error) {
    console.error("Error checking Songstats API key:", error);
    
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
        status: 200  // Return 200 even for errors, with error details in the body
      }
    )
  }
})
