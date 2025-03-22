
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
      length: apiKey ? apiKey.length : 0,
      firstChar: apiKey ? apiKey.charAt(0) : '',
      lastChar: apiKey ? apiKey.charAt(apiKey.length - 1) : ''
    });
    
    // Try making simple test requests to validate the key using different enterprise endpoints
    let apiTestResults = [];
    let apiResponseInfo = {};
    
    if (apiKey && apiKey.length >= 10) {
      try {
        // Test multiple endpoints to see which ones work
        const testEndpoints = [
          {
            name: 'Enterprise API - tracks/stats',
            url: 'https://api.songstats.com/enterprise/v1/tracks/stats?isrc=USIR20400274'
          },
          {
            name: 'Enterprise API - tracks/metadata',
            url: 'https://api.songstats.com/enterprise/v1/tracks/metadata?platform=spotify&id=3n3Ppam7vgaVa1iaRUc9Lp'
          },
          {
            name: 'Enterprise API - tracks/search',
            url: 'https://api.songstats.com/enterprise/v1/tracks/search?q=Let%27s%20Get%20It%20Started&platform=spotify'
          }
        ];
        
        for (const endpoint of testEndpoints) {
          console.log(`Testing endpoint: ${endpoint.name}`);
          
          const response = await fetch(endpoint.url, {
            method: "GET",
            headers: {
              'Accept-Encoding': '',
              "Accept": 'application/json',
              'apikey': apiKey,
              "Content-Type": "application/json"
            }
          });
          
          const status = response.status;
          const statusText = response.statusText;
          console.log(`${endpoint.name} response: ${status} ${statusText}`);
          
          let responseData = null;
          try {
            const text = await response.text();
            responseData = JSON.parse(text);
          } catch (e) {
            console.log(`Error parsing response: ${e.message}`);
          }
          
          apiTestResults.push({
            endpoint: endpoint.name,
            status,
            statusText,
            success: status >= 200 && status < 300,
            data: responseData ? (typeof responseData === 'object' ? 'Valid JSON response' : 'Invalid response format') : null
          });
          
          apiResponseInfo[endpoint.name] = {
            status,
            statusText,
            success: status >= 200 && status < 300
          };
          
          // Add the first successful response data for reference
          if (status >= 200 && status < 300 && responseData && !apiResponseInfo.sampleData) {
            apiResponseInfo.sampleData = responseData;
          }
        }
      } catch (e) {
        console.error("API test error:", e);
        apiTestResults.push({
          endpoint: 'General test',
          error: e.message,
          success: false
        });
      }
    }
    
    // Determine overall API status
    const anySuccessful = apiTestResults.some(result => result.success);
    
    return new Response(
      JSON.stringify({ 
        configured: !!apiKey,
        valid: apiKey && apiKey.length >= 10,
        apiConnectivity: anySuccessful ? 'Connected' : 'Failed',
        allTestsSuccessful: apiTestResults.every(result => result.success),
        apiTestResults,
        apiResponseInfo,
        message: apiKey 
          ? (anySuccessful 
              ? "API key is valid and at least one endpoint is accessible" 
              : "API key format is valid but no endpoints are accessible")
          : "API key is not configured",
        recommendations: !apiKey 
          ? ["Configure your Songstats API key in Supabase Edge Function secrets"] 
          : (!anySuccessful 
              ? ["Verify your Songstats API key has the correct permissions", 
                 "Check if your Enterprise subscription is active", 
                 "Contact Songstats support to verify your account"] 
              : [])
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error checking Songstats API key:", error);
    
    return new Response(
      JSON.stringify({ 
        configured: false,
        error: "Error checking API key configuration",
        details: error.message,
        stackTrace: error.stack
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )
  }
})
