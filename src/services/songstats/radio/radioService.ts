
import { RadioResult } from '@/components/ResultsTable';
import { NormalizedInput } from '@/utils/apiUtils';
import { callSongstatsApi } from '../apiClient';
import { processRadioData } from './radioDataProcessor';
import { toast } from 'sonner';

/**
 * Get radio airplay data for a track from RadioStats API
 */
export const getRadioPlays = async (
  normalizedInputs: NormalizedInput[]
): Promise<RadioResult[]> => {
  try {
    const results: RadioResult[] = [];
    const processedStations = new Map<string, RadioResult>();
    
    // Track API statistics for debugging
    const radioApiStats = {
      success: 0,
      failed: 0,
      total: 0
    };
    
    // Process each input
    for (const input of normalizedInputs) {
      let isrc: string | null = null;
      
      if (input.type === 'isrc') {
        // For ISRC inputs, use them directly
        isrc = input.id;
        console.log(`Using direct ISRC input for radio: ${isrc}`);
      } else if (input.type === 'spotify_track') {
        // For Spotify tracks, we would need to get the ISRC first
        // This would be handled by a function like getISRCFromSpotify
        // For now, we'll skip non-ISRC inputs for RadioStats research
        continue;
      } else {
        // Skip other input types
        continue;
      }
      
      if (!isrc) continue;
      
      radioApiStats.total++;
      
      // Try "tracks/radio" endpoint (for some RadioStats API versions)
      const response = await callSongstatsApi('tracks/radio', { 
        isrc: isrc
      }, true); // Explicitly tell it's a RadioStats API call
      
      if (!response || response.error) {
        console.error('Error getting radio data for ISRC:', response?.error || 'Unknown error');
        radioApiStats.failed++;
        continue;
      }
      
      // Process successful response
      radioApiStats.success++;
      
      // Use the radioDataProcessor to extract radio results
      const radioResults = processRadioData(response, input.inputIndex, processedStations);
      results.push(...radioResults);
    }
    
    // Log API statistics for debugging
    console.log(`Radio API stats: ${radioApiStats.success} successful calls out of ${radioApiStats.total} total calls`);
    console.log('Radio results:', results.length);
    
    // Return all processed results
    return results;
  } catch (error) {
    console.error('Error getting radio play data:', error);
    toast.error('Failed to fetch radio data', {
      description: 'There was a problem connecting to the RadioStats API'
    });
    return [];
  }
};

