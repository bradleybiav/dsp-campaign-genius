
import { supabase } from "@/integrations/supabase/client";

/**
 * Call Songstats API securely through Supabase Edge Function
 */
export const callSongstatsApi = async (
  path: string, 
  params: Record<string, string> = {}
) => {
  try {
    const { data, error } = await supabase.functions.invoke('songstats', {
      body: { path, params },
    });

    if (error) {
      console.error('Error calling Songstats API:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in callSongstatsApi:', error);
    return null;
  }
};

/**
 * Get Songstats ID from Spotify URL
 */
export const getSongstatsId = async (spotifyId: string, type: 'track' | 'artist'): Promise<string | null> => {
  try {
    // Call the Edge Function to get Songstats ID
    const data = await callSongstatsApi('search', {
      q: `spotify:${type}:${spotifyId}`
    });
    
    if (!data || data.error) {
      console.error('Error getting Songstats ID:', data?.error || 'Unknown error');
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error('Error getting Songstats ID:', error);
    return null;
  }
};
