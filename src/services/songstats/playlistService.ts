
import { PlaylistResult } from '@/components/ResultsTable';
import { NormalizedInput } from '@/utils/apiUtils';
import { callSongstatsApi, getSongstatsId } from './apiClient';

/**
 * Get playlist placements for a track
 * Updated to handle different API response formats
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
      
      if (!songstatsId) {
        console.log(`No Songstats ID found for ${input.type} ${input.id}, using direct ID`);
        continue; 
      }
      
      // Try multiple endpoint patterns
      const entityType = input.type === 'spotify_track' ? 'track' : 'artist';
      
      // Try v2 endpoint first (modern format)
      let data = await callSongstatsApi(
        `v2/${entityType}s/${songstatsId}/playlists`,
        { platform: 'spotify' }
      );
      
      // If that fails, try v1 format
      if (!data || data.error) {
        data = await callSongstatsApi(
          `${entityType}/${songstatsId}/playlists`,
          { platform: 'spotify' }
        );
      }
      
      // Last attempt - try legacy format
      if (!data || data.error) {
        data = await callSongstatsApi(
          `${entityType}s/${songstatsId}/playlists`,
          { platform: 'spotify' }
        );
      }
      
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
            curatorName: playlist.curator?.name || playlist.owner?.name || 'Unknown',
            followerCount: playlist.followers || playlist.follower_count || 0,
            lastUpdated: playlist.last_updated || playlist.updated_at || new Date().toISOString(),
            matchedInputs: [input.inputIndex],
            playlistUrl: playlist.url || playlist.external_url || '',
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
