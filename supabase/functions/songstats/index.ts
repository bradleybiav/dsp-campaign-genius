
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const SONGSTATS_API_URL = 'https://api.songstats.com/v1';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { path, params } = await req.json()
    
    // Get the API key from Supabase secrets
    const apiKey = Deno.env.get("SONGSTATS_API_KEY")
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      )
    }

    // Construct URL with query parameters
    let url = `${SONGSTATS_API_URL}/${path}`
    
    if (params) {
      const queryParams = new URLSearchParams(params)
      url = `${url}?${queryParams.toString()}`
    }

    // Make request to Songstats API
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    // Return response data
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    // Return error message
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
