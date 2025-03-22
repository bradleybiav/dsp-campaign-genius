import { PlaylistResult } from '@/components/ResultsTable';
import { NormalizedInput } from '@/utils/apiUtils';
import { callSongstatsApi, getSongstatsId } from './apiClient';

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
