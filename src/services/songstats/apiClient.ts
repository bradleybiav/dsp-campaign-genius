
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Maximum retries for API calls
const MAX_CLIENT_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

/**
 * Call Songstats API securely through Supabase Edge Function with retry logic
 */
export const callSongstatsApi = async (
  path: string, 
  params: Record<string, string> = {},
  retries = 0
) => {
  try {
    console.log(`Calling Songstats API path: ${path}, params:`, params);
    
    const startTime = Date.now();
    const { data, error } = await supabase.functions.invoke('songstats', {
      body: { path, params },
    });
    const duration = Date.now() - startTime;
    
    console.log(`Songstats API call took ${duration}ms`);

    if (error) {
      console.error('Error calling Songstats API:', error);
      console.error('Error details:', error.message, error.name, error.cause);
      
      // Handle rate limiting or temporary server errors
      if ((error.message?.includes('429') || error.message?.includes('50')) && retries < MAX_CLIENT_RETRIES) {
        console.log(`Retrying API call (${retries + 1}/${MAX_CLIENT_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retries + 1)));
        return callSongstatsApi(path, params, retries + 1);
      }
      
      // Show error toast with details if available
      if (data?.details) {
        toast.error(`Songstats API Error: ${data.details}`, {
          description: `Path: ${path}`
        });
      } else {
        toast.error(`Songstats API Error: ${error.message}`, {
          description: `Path: ${path}`
        });
      }
      
      // Log additional troubleshooting information to help diagnose the issue
      console.error('Troubleshooting info:', {
        path,
        params,
        errorMessage: error.message,
        errorName: error.name,
        errorCause: error.cause,
        dataReceived: data
      });
      
      return null;
    }

    // Handle API-level errors that might be in the response
    if (data?.error) {
      console.error('Songstats API returned an error:', data);
      
      // Handle rate limiting or temporary server errors in the response
      if ((data.status === 429 || data.status >= 500) && retries < MAX_CLIENT_RETRIES) {
        console.log(`Retrying API call due to status ${data.status} (${retries + 1}/${MAX_CLIENT_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retries + 1)));
        return callSongstatsApi(path, params, retries + 1);
      }
      
      // Show error toast with details
      if (data.details) {
        let detailsStr = typeof data.details === 'string' 
          ? data.details 
          : JSON.stringify(data.details).substring(0, 100);
        
        // Include troubleshooting info if available
        if (data.troubleshooting) {
          detailsStr += ` (${data.troubleshooting})`;
        }
        
        toast.error(`Songstats API Error: ${data.error}`, {
          description: detailsStr
        });
      } else {
        toast.error(`Songstats API Error: ${data.error}`);
      }
      
      return null;
    }

    console.log(`Songstats API response for ${path}:`, data);
    return data;
  } catch (error) {
    console.error('Error in callSongstatsApi:', error);
    
    // Handle network errors
    if (retries < MAX_CLIENT_RETRIES) {
      console.log(`Retrying API call after network error (${retries + 1}/${MAX_CLIENT_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retries + 1)));
      return callSongstatsApi(path, params, retries + 1);
    }
    
    toast.error(`Error connecting to Songstats: ${error.message}`);
    return null;
  }
};

/**
 * Get Songstats ID from Spotify URL
 */
export const getSongstatsId = async (spotifyId: string, type: 'track' | 'artist'): Promise<string | null> => {
  try {
    console.log(`Getting Songstats ID for Spotify ${type} ID: ${spotifyId}`);
    
    // Call the Edge Function to get Songstats ID
    const data = await callSongstatsApi('search', {
      q: `spotify:${type}:${spotifyId}`
    });
    
    if (!data || data.error) {
      console.error('Error getting Songstats ID:', data?.error || 'Unknown error');
      return null;
    }
    
    console.log(`Songstats ID search response:`, data);
    
    if (!data.id) {
      console.error(`Songstats ID not found for Spotify ${type} ID ${spotifyId}`);
      toast.error(`Could not find Songstats ID for the Spotify ${type}`, {
        description: "The API may not recognize this Spotify ID or the API structure may have changed"
      });
      return null;
    }
    
    console.log(`Songstats ID for Spotify ${type} ID ${spotifyId}:`, data.id);
    return data.id;
  } catch (error) {
    console.error('Error getting Songstats ID:', error);
    return null;
  }
};
