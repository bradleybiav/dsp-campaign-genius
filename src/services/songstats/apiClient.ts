
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
      
      // If API returns a 404 Not Found or similar error, we consider it a normal response for non-existing resources
      // This helps prevent cascading errors when resources don't exist
      if (error.message?.includes('404')) {
        console.log(`Resource not found at ${path}, returning empty result`);
        return null;
      }
      
      // Show error toast with details if available
      toast.error(`Songstats API Error: ${error.message || "Unknown error"}`, {
        description: `Path: ${path}`
      });
      
      // Log additional troubleshooting information
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

    // Handle data being null or undefined
    if (!data) {
      console.warn(`No data returned from Songstats API for ${path}`);
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
      
      // If API returns a 404 Not Found, we consider it a normal response for non-existing resources
      if (data.status === 404) {
        console.log(`Resource not found at ${path}, returning empty result`);
        return null;
      }
      
      // Show error toast with details
      toast.error(`Songstats API Error: ${data.error || "Unknown error"}`, {
        description: data.details || `Path: ${path}`
      });
      
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
    
    toast.error(`Error connecting to Songstats: ${error.message || "Network error"}`);
    return null;
  }
};

/**
 * Get Songstats ID from Spotify URL
 * Updated to gracefully handle API errors
 */
export const getSongstatsId = async (spotifyId: string, type: 'track' | 'artist'): Promise<string | null> => {
  try {
    console.log(`Getting Songstats ID for Spotify ${type} ID: ${spotifyId}`);
    
    // Call the Edge Function to get Songstats ID
    const data = await callSongstatsApi('mappings/spotify', {
      id: spotifyId,
      type: type
    });
    
    if (!data) {
      console.log(`No mapping data returned for Spotify ${type} ID ${spotifyId}`);
      return null;
    }
    
    console.log(`Songstats ID mapping response:`, data);
    
    // Extract ID based on the response structure
    const songstatsId = data.songstats_id;
    
    if (!songstatsId) {
      console.log(`Songstats ID not found for Spotify ${type} ID ${spotifyId}`);
      return null;
    }
    
    console.log(`Songstats ID for Spotify ${type} ID ${spotifyId}:`, songstatsId);
    return songstatsId;
  } catch (error) {
    console.error('Error getting Songstats ID:', error);
    return null;
  }
};
