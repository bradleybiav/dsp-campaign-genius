
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

    return new Response(
      JSON.stringify({ 
        configured: !!apiKey,
        message: apiKey 
          ? "API key is configured" 
          : "API key is not configured or is empty",
        apiKeyLength: apiKey ? apiKey.length : 0
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

