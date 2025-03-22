
import { NormalizedInput } from '@/utils/apiUtils';
import { callSongstatsApi, getSongstatsId } from './apiClient';

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
 * Updated to match current Songstats API documentation
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
      
      // Call the radio endpoint - updated path format
      const data = await callSongstatsApi(`track/${songstatsId}/radio`);
      
      if (!data || !data.radio || data.error) {
        console.error('Error getting radio plays:', data?.error || 'Unknown error');
        continue;
      }
      
      // Process each radio play
      for (const play of data.radio) {
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
            country: play.country,
            lastSpin: play.last_spin,
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
