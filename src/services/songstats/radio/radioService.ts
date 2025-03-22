
import { RadioResult } from '@/components/results-table/types';
import { NormalizedInput } from '@/utils/apiUtils';
import { callSongstatsApi, getISRCFromSpotifyTrack } from '../apiClient';
import { processRadioData } from './radioDataProcessor';
import { toast } from 'sonner';
import { showServiceError } from '@/hooks/research-form/errorHandler';

/**
 * Get radio plays for a track using the RadioStats API
 */
export const getRadioPlays = async (
  normalizedInputs: NormalizedInput[]
): Promise<RadioResult[]> => {
  try {
    const results: RadioResult[] = [];
    const processedStations = new Map<string, RadioResult>();
    const radioApiStats = { total: 0, successful: 0 };
    
    // Process each input
    for (const input of normalizedInputs) {
      let isrc: string | null = null;
      
      // For ISRC inputs, use them directly
      if (input.type === 'isrc') {
        isrc = input.id;
        console.log(`Using direct ISRC input for radio: ${isrc}`);
      } else if (input.type === 'spotify_track') {
        // For track URLs, first get the ISRC
        isrc = await getISRCFromSpotifyTrack(input.id);
        
        if (!isrc) {
          console.log(`No ISRC found for Spotify track: ${input.id}, skipping radio lookup`);
          continue;
        }
        
        console.log(`Found ISRC: ${isrc} for Spotify track: ${input.id}`);
      } else {
        // Skip other input types for radio research
        continue;
      }
      
      if (!isrc) continue;
      
      radioApiStats.total++;
      
      // Use the tracks/stats endpoint with the with_radio parameter
      // This is more reliable according to the documentation
      const response = await callSongstatsApi('tracks/stats', { 
        isrc: isrc,
        with_radio: "true" // Using string "true" instead of boolean true
      });
      
      if (!response || response.error) {
        console.error('Error getting radio data for ISRC:', response?.error || 'Unknown error');
        continue;
      }
      
      radioApiStats.successful++;
      
      // Process the radio data and add it to our results
      const radioResults = processRadioData(response, input.inputIndex, processedStations);
      if (radioResults.length > 0) {
        results.push(...radioResults);
      }
    }
    
    // Log stats about the API calls
    console.log(`Radio API stats: ${radioApiStats.successful} successful calls out of ${radioApiStats.total} total calls`);
    console.log(`Radio results: ${results.length}`);
    
    return results;
  } catch (error) {
    console.error('Error getting radio plays:', error);
    showServiceError('Radio', error);
    return [];
  }
};
