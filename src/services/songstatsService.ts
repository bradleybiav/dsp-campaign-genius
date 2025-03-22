import { fetchWithTimeout, NormalizedInput } from '@/utils/apiUtils';
import { PlaylistResult } from '@/components/ResultsTable';

// Mock API key - in production, this would be stored securely
const SONGSTATS_API_KEY = 'mock-api-key';
const SONGSTATS_API_URL = 'https://api.songstats.com/v1';

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
 * Get Songstats ID from Spotify URL
 */
export const getSongstatsId = async (spotifyId: string, type: 'track' | 'artist'): Promise<string | null> => {
  try {
    // In a real implementation, this would call the Songstats API
    // For now, we'll simulate a response
    console.log(`Getting Songstats ID for ${type} ${spotifyId}`);
    
    // Mock response - in production, this would call the actual API
    // const response = await fetchWithTimeout(
    //   `${SONGSTATS_API_URL}/search?q=spotify:${type}:${spotifyId}`,
    //   {
    //     headers: {
    //       'Authorization': `Bearer ${SONGSTATS_API_KEY}`,
    //       'Content-Type': 'application/json'
    //     }
    //   }
    // );
    // const data: SongstatsSearchResponse = await response.json();
    // return data.id;
    
    // Return a mock ID based on the input
    return `songstats-${type}-${spotifyId.substring(0, 8)}`;
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
      
      // In a real implementation, this would call the Songstats API
      // Mock playlist data based on input index
      const playlists = Array(5).fill(null).map((_, i) => ({
        id: `playlist-${input.inputIndex}-${i}`,
        name: `Playlist ${i} for Input ${input.inputIndex}`,
        curator: { name: `Curator ${i}` },
        followers: 10000 + (input.inputIndex * 1000) + (i * 500),
        last_updated: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
        url: `https://open.spotify.com/playlist/mock${input.inputIndex}${i}`
      }));
      
      // Process each playlist
      for (const playlist of playlists) {
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
      
      // In a real implementation, this would call the Songstats API
      // Mock radio data based on input index
      const radioPlays = Array(3).fill(null).map((_, i) => ({
        id: `radio-${input.inputIndex}-${i}`,
        station: ['BBC Radio 1', 'KEXP', 'Triple J', 'NTS Radio'][i % 4],
        show: [`Essential Mix`, `Morning Show`, `Drive Time`][i % 3],
        dj: [`Pete Tong`, `Mary Anne Hobbs`, `Zane Lowe`][i % 3],
        country: ['UK', 'US', 'AU', 'Global'][i % 4],
        last_spin: new Date(
          Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000
        ).toISOString(),
        url: `https://radiostats.songstats.com/station/mock-${i}`
      }));
      
      // Process each radio play
      for (const play of radioPlays) {
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
            id: play.id,
            station: play.station,
            show: play.show,
            dj: play.dj,
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
