
import { NormalizedInput } from '@/utils/apiUtils';
import { callSongstatsApi, getISRCFromSpotifyTrack } from './apiClient';

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
 * Get radio play data for tracks using the Enterprise API
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
      
      // For track URLs, first get the ISRC
      let isrc: string | null = null;
      
      // Try to get ISRC from Spotify ID
      isrc = await getISRCFromSpotifyTrack(input.id);
      
      if (!isrc) {
        console.log(`No ISRC found for Spotify track: ${input.id}, skipping`);
        continue;
      }
      
      console.log(`Found ISRC: ${isrc} for Spotify track: ${input.id}`);
      
      // Get track stats with radio plays using ISRC
      const trackData = await callSongstatsApi('tracks/stats', { 
        isrc: isrc,
        with_radio: "true" // Using string "true" instead of boolean true
      });
      
      if (!trackData || trackData.error) {
        console.error('Error getting track stats:', trackData?.error || 'Unknown error');
        continue;
      }
      
      // Process radio plays from the stats
      const radioStats = trackData.stats?.find(stat => stat.source === 'radio');
      
      if (!radioStats || !radioStats.data || !radioStats.data.plays) {
        console.log(`No radio play data for ISRC: ${isrc}`);
        continue;
      }
      
      // Process each radio play
      for (const play of radioStats.data.plays) {
        const radioKey = `${play.station}-${play.show || ''}-${play.dj || ''}`;
        
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
            country: play.country || '',
            lastSpin: play.last_spin || play.played_at || new Date().toISOString(),
            matchedInputs: [input.inputIndex],
            airplayLink: play.url || '',
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
