
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// API call configuration
const MAX_CLIENT_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

/**
 * Call Songstats API securely through Supabase Edge Function with retry logic
 */
export const callSongstatsApi = async (
  path: string, 
  params: Record<string, string | number> = {},
  retries = 0
) => {
  try {
    console.log(`Calling Songstats API: ${path}`, params);
    
    const startTime = Date.now();
    const { data, error } = await supabase.functions.invoke('songstats', {
      body: { path, params },
    });
    const duration = Date.now() - startTime;
    
    console.log(`API call completed in ${duration}ms`);
    
    // Handle Supabase invocation errors
    if (error) {
      console.error('Supabase function error:', error);
      
      // Retry logic for temporary errors
      if (shouldRetry(error.message) && retries < MAX_CLIENT_RETRIES) {
        console.log(`Retrying API call (${retries + 1}/${MAX_CLIENT_RETRIES})`);
        await delay(RETRY_DELAY_MS * (retries + 1));
        return callSongstatsApi(path, params, retries + 1);
      }
      
      // Handle 404s gracefully
      if (error.message?.includes('404')) {
        console.log(`Resource not found at ${path}`);
        return null;
      }
      
      toast.error(`API Error: ${getErrorMessage(error)}`, {
        description: `Path: ${path}`
      });
      
      return null;
    }

    // Handle missing data
    if (!data) {
      console.warn(`No data returned for ${path}`);
      return null;
    }

    // Handle API-level errors in the response
    if (data.error) {
      console.error('API error in response:', data.error);
      
      // Retry for rate limiting or server errors
      if (shouldRetryStatus(data.status) && retries < MAX_CLIENT_RETRIES) {
        console.log(`Retrying due to status ${data.status} (${retries + 1}/${MAX_CLIENT_RETRIES})`);
        await delay(RETRY_DELAY_MS * (retries + 1));
        return callSongstatsApi(path, params, retries + 1);
      }
      
      // Handle 404s gracefully
      if (data.status === 404) {
        console.log(`Resource not found at ${path}`);
        return null;
      }
      
      // Return data anyway, the caller might be able to use partial results
      return data;
    }

    return data;
  } catch (error) {
    console.error('Exception in API call:', error);
    
    // Retry on network errors
    if (retries < MAX_CLIENT_RETRIES) {
      console.log(`Retrying after error (${retries + 1}/${MAX_CLIENT_RETRIES})`);
      await delay(RETRY_DELAY_MS * (retries + 1));
      return callSongstatsApi(path, params, retries + 1);
    }
    
    toast.error(`Connection error: ${getErrorMessage(error)}`);
    return null;
  }
};

/**
 * Determine if we should retry based on error message
 */
function shouldRetry(errorMessage?: string): boolean {
  if (!errorMessage) return false;
  return errorMessage.includes('429') || // Rate limiting
         errorMessage.includes('50') ||  // Server errors
         errorMessage.includes('timeout') ||
         errorMessage.includes('network');
}

/**
 * Determine if we should retry based on status code
 */
function shouldRetryStatus(status?: number): boolean {
  if (!status) return false;
  return status === 429 || status >= 500;
}

/**
 * Extract readable message from error
 */
function getErrorMessage(error: any): string {
  return error.message || error.toString() || "Unknown error";
}

/**
 * Promise-based delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get track details using ISRC
 */
export const getTrackByISRC = async (isrc: string) => {
  try {
    console.log(`Getting track details for ISRC: ${isrc}`);
    return await callSongstatsApi('tracks/stats', { isrc, with_playlists: true });
  } catch (error) {
    console.error('Error getting track by ISRC:', error);
    return null;
  }
};

/**
 * Get Songstats track ID from Spotify ID
 */
export const getTrackBySpotifyId = async (spotifyId: string) => {
  try {
    console.log(`Getting track details for Spotify ID: ${spotifyId}`);
    return await callSongstatsApi('tracks/by-platform', { 
      platform: 'spotify',
      id: spotifyId
    });
  } catch (error) {
    console.error('Error getting track by Spotify ID:', error);
    return null;
  }
};

/**
 * Extract ISRC from track ID or URL
 */
export const getISRCFromSpotifyTrack = async (spotifyId: string): Promise<string | null> => {
  try {
    const trackData = await getTrackBySpotifyId(spotifyId);
    
    if (!trackData || trackData.error) {
      return null;
    }
    
    return trackData.isrc || null;
  } catch (error) {
    console.error('Error getting ISRC from Spotify track:', error);
    return null;
  }
};
