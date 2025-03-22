
import { PlaylistResult } from '@/components/ResultsTable';
import { NormalizedInput } from '@/utils/apiUtils';
import { callSongstatsApi, getISRCFromSpotifyTrack } from './apiClient';

/**
 * Get playlist placements for a track using the Enterprise API
 */
export const getPlaylistPlacements = async (
  normalizedInputs: NormalizedInput[]
): Promise<PlaylistResult[]> => {
  try {
    const results: PlaylistResult[] = [];
    const processedPlaylists = new Map<string, PlaylistResult>();
    
    // Process each input
    for (const input of normalizedInputs) {
      // Skip non-Spotify track inputs for DSP research
      if (input.type !== 'spotify_track') continue;
      
      // For track URLs, first get the ISRC
      let isrc: string | null = null;
      
      // Try to get ISRC from Spotify ID
      isrc = await getISRCFromSpotifyTrack(input.id);
      
      if (!isrc) {
        console.log(`No ISRC found for Spotify track: ${input.id}, skipping`);
        continue;
      }
      
      console.log(`Found ISRC: ${isrc} for Spotify track: ${input.id}`);
      
      // Get track stats with playlists using ISRC
      const trackData = await callSongstatsApi('tracks/stats', { 
        isrc: isrc,
        with_playlists: "true" // Using string "true" instead of boolean true
      });
      
      if (!trackData || trackData.error) {
        console.error('Error getting track stats:', trackData?.error || 'Unknown error');
        continue;
      }
      
      // Process Spotify playlists from the stats
      const spotifyStats = trackData.stats?.find(stat => stat.source === 'spotify');
      
      if (!spotifyStats || !spotifyStats.data || !spotifyStats.data.playlists) {
        console.log(`No Spotify playlist data for ISRC: ${isrc}`);
        continue;
      }
      
      // Process each playlist
      for (const playlist of spotifyStats.data.playlists) {
        const playlistKey = playlist.spotifyid || playlist.id;
        
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
            curatorName: playlist.owner_name || playlist.curator || 'Unknown',
            followerCount: playlist.followers || 0,
            lastUpdated: playlist.last_updated || new Date().toISOString(),
            matchedInputs: [input.inputIndex],
            playlistUrl: `https://open.spotify.com/playlist/${playlistKey}`,
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
