
import { fetchWithTimeout, NormalizedInput } from '@/utils/apiUtils';
import { PlaylistResult } from '@/components/ResultsTable';
import { supabase } from "@/integrations/supabase/client";

// Response types for Songstats API
interface SongstatsSearchResponse {
  id: string;
  name: string;
  artist: string;
  // Other fields omitted for brevity
}

interface SongstatsPlaylistResponse {
  playlists: {
    id: string;
    name: string;
    curator?: {
      name: string;
    };
    followers: number;
    last_updated: string;
    url: string;
  }[];
}

interface SongstatsRadioResponse {
  radiostats: {
    station: string;
    show?: string;
    dj?: string;
    country: string;
    last_spin: string;
    url: string;
  }[];
}

/**
 * Call Songstats API securely through Supabase Edge Function
 */
const callSongstatsApi = async (
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

/**
 * Get playlist placements for a track
 */
export const getPlaylistPlacements = async (
  normalizedInputs: NormalizedInput[]
): Promise<PlaylistResult[]> => {
  try {
    const results: PlaylistResult[] = [];
    const processedPlaylists = new Map<string, PlaylistResult>();
    
    // Process each input
    for (const input of normalizedInputs) {
      // Skip non-Spotify inputs for DSP research
      if (!input.type.startsWith('spotify_')) continue;
      
      // Get Songstats ID
      const songstatsId = await getSongstatsId(
        input.id, 
        input.type === 'spotify_track' ? 'track' : 'artist'
      );
      
      if (!songstatsId) continue;
      
      // Call the playlists endpoint
      const data = await callSongstatsApi(`${input.type === 'spotify_track' ? 'tracks' : 'artists'}/${songstatsId}/playlists`);
      
      if (!data || !data.playlists || data.error) {
        console.error('Error getting playlists:', data?.error || 'Unknown error');
        continue;
      }
      
      // Process each playlist
      for (const playlist of data.playlists) {
        const playlistKey = playlist.id;
        
        if (processedPlaylists.has(playlistKey)) {
          // If we've seen this playlist before, update the matched inputs
          const existingPlaylist = processedPlaylists.get(playlistKey)!;
          if (!existingPlaylist.matchedInputs.includes(input.inputIndex)) {
            existingPlaylist.matchedInputs.push(input.inputIndex);
          }
        } else {
          // Otherwise, create a new result
          const result: PlaylistResult = {
            id: playlistKey,
            playlistName: playlist.name,
            curatorName: playlist.curator?.name || 'Unknown',
            followerCount: playlist.followers,
            lastUpdated: playlist.last_updated,
            matchedInputs: [input.inputIndex],
            playlistUrl: playlist.url,
            vertical: 'dsp'
          };
          
          processedPlaylists.set(playlistKey, result);
          results.push(result);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error getting playlist placements:', error);
    return [];
  }
};

/**
 * Radio results interface matching the expected output
 */
export interface RadioResult {
  id: string;
  station: string;
  show: string;
  dj: string;
  country: string;
  lastSpin: string;
  matchedInputs: number[];
  airplayLink: string;
  vertical: 'radio';
}

/**
 * Get radio play data for tracks
 */
export const getRadioPlays = async (
  normalizedInputs: NormalizedInput[]
): Promise<RadioResult[]> => {
  try {
    const results: RadioResult[] = [];
    const processedRadios = new Map<string, RadioResult>();
    
    // Process each input
    for (const input of normalizedInputs) {
      // Skip non-Spotify track inputs for radio research
      if (input.type !== 'spotify_track') continue;
      
      // Get Songstats ID
      const songstatsId = await getSongstatsId(input.id, 'track');
      if (!songstatsId) continue;
      
      // Call the radio endpoint
      const data = await callSongstatsApi(`tracks/${songstatsId}/radio`);
      
      if (!data || !data.radiostats || data.error) {
        console.error('Error getting radio plays:', data?.error || 'Unknown error');
        continue;
      }
      
      // Process each radio play
      for (const play of data.radiostats) {
        const radioKey = `${play.station}-${play.show}-${play.dj}`;
        
        if (processedRadios.has(radioKey)) {
          // If we've seen this radio before, update the matched inputs
          const existingRadio = processedRadios.get(radioKey)!;
          if (!existingRadio.matchedInputs.includes(input.inputIndex)) {
            existingRadio.matchedInputs.push(input.inputIndex);
          }
        } else {
          // Otherwise, create a new result
          const result: RadioResult = {
            id: play.id || `radio-${radioKey}`,
            station: play.station,
            show: play.show || '',
            dj: play.dj || '',
            country: play.country,
            lastSpin: play.last_spin,
            matchedInputs: [input.inputIndex],
            airplayLink: play.url,
            vertical: 'radio'
          };
          
          processedRadios.set(radioKey, result);
          results.push(result);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error getting radio plays:', error);
    return [];
  }
};
