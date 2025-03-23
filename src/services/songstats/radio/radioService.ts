
import { RadioResult } from '@/components/results-table/types';
import { NormalizedInput } from '@/utils/apiUtils';
import { callSongstatsApi, getISRCFromSpotifyTrack } from '../apiClient';
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
        // For Spotify tracks, get the ISRC
        isrc = await getISRCFromSpotifyTrack(input.id);
        
        if (!isrc) {
          console.log(`No ISRC found for Spotify track: ${input.id}, skipping radio lookup`);
          continue;
        }
        
        console.log(`Found ISRC: ${isrc} for Spotify track: ${input.id}`);
      } else {
        // Skip other input types
        continue;
      }
      
      if (!isrc) continue;
      
      radioApiStats.total++;
      
      // Try "tracks/stats" endpoint with radio parameter instead of dedicated radio endpoint
      // This mirrors how the DSP service is working successfully
      const response = await callSongstatsApi('tracks/stats', { 
        isrc: isrc,
        with_radio: "true" // Using string "true" instead of boolean true
      });
      
      if (!response || response.error) {
        console.error('Error getting radio data for ISRC:', response?.error || 'Unknown error');
        radioApiStats.failed++;
        continue;
      }
      
      // Process successful response
      radioApiStats.success++;
      
      // Extract radio data from the stats response
      const radioData = extractRadioDataFromStats(response);
      
      if (radioData && Array.isArray(radioData)) {
        // Process the radio data
        const radioResults = processRadioData({ data: radioData }, input.inputIndex, processedStations);
        results.push(...radioResults);
      } else {
        console.log(`No radio data found in response for ISRC: ${isrc}`);
      }
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

/**
 * Extract radio data from the tracks/stats response
 */
const extractRadioDataFromStats = (response: any): any[] | null => {
  // Check if response has stats array
  if (response && response.stats && Array.isArray(response.stats)) {
    // Try to find radio data in stats
    for (const stat of response.stats) {
      // Case 1: Radio source with data array
      if (stat.source === 'radio' && stat.data && Array.isArray(stat.data)) {
        return stat.data;
      }
      
      // Case 2: Radio source with radio_plays array
      if (stat.source === 'radio' && stat.data && Array.isArray(stat.data.radio_plays)) {
        return stat.data.radio_plays;
      }
      
      // Case 3: Stats source with radio_plays array
      if (stat.source === 'stats' && stat.data && Array.isArray(stat.data.radio_plays)) {
        return stat.data.radio_plays;
      }
    }
  }
  
  // For single track response format
  if (response && response.radio && Array.isArray(response.radio)) {
    return response.radio;
  }
  
  // For API responses that include radio_plays at the top level
  if (response && response.radio_plays && Array.isArray(response.radio_plays)) {
    return response.radio_plays;
  }
  
  return null;
};
