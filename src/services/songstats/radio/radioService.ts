
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
      // Skip non-track inputs
      if (input.type !== 'spotify_track' && input.type !== 'isrc') {
        console.log(`Skipping non-track input type: ${input.type}`);
        continue;
      }
      
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
      }
      
      if (!isrc) continue;
      
      radioApiStats.total++;
      
      // Try "tracks/stats" endpoint with radio parameter
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
      
      // Enhanced debugging - log the first part of the response to see its structure
      console.log(`Radio API response structure for ISRC ${isrc}:`, 
        JSON.stringify(response).substring(0, 300) + '...');
      
      // Extract radio data from the stats response with enhanced extraction
      const radioData = extractRadioDataFromStats(response);
      
      if (radioData && Array.isArray(radioData) && radioData.length > 0) {
        console.log(`Found ${radioData.length} radio plays for ISRC: ${isrc}`);
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
 * Extract radio data from the tracks/stats response with enhanced path checking
 */
const extractRadioDataFromStats = (response: any): any[] | null => {
  // For debugging, log a summary of the response structure
  console.log('Extracting radio data from response with keys:', Object.keys(response));
  
  // CASE 1: Check if response has stats array
  if (response.stats && Array.isArray(response.stats)) {
    // Try to find radio data in stats
    for (const stat of response.stats) {
      // Log the stat source for debugging
      console.log('Checking stats source:', stat.source);
      
      // Case 1.1: Radio source with radio_plays array
      if (stat.source === 'radio' && stat.data && stat.data.radio_plays && Array.isArray(stat.data.radio_plays)) {
        console.log('Found radio data in stats with source=radio, data.radio_plays');
        return stat.data.radio_plays;
      }
      
      // Case 1.2: Radio source with plays array
      if (stat.source === 'radio' && stat.data && stat.data.plays && Array.isArray(stat.data.plays)) {
        console.log('Found radio data in stats with source=radio, data.plays');
        return stat.data.plays;
      }
      
      // Case 1.3: Radio source with direct array data
      if (stat.source === 'radio' && Array.isArray(stat.data)) {
        console.log('Found radio data in stats with source=radio, direct array');
        return stat.data;
      }
      
      // Case 1.4: Stats source containing radio plays
      if (stat.source === 'stats' && stat.data && stat.data.radio_plays && Array.isArray(stat.data.radio_plays)) {
        console.log('Found radio data in stats with source=stats, data.radio_plays');
        return stat.data.radio_plays;
      }
      
      // Case 1.5: Check for radio_stations array
      if (stat.data && stat.data.radio_stations && Array.isArray(stat.data.radio_stations)) {
        console.log('Found radio data in stats data.radio_stations');
        return stat.data.radio_stations;
      }
    }
  }
  
  // CASE 2: Direct paths in response body
  
  // Case 2.1: Direct radio_plays array at top level
  if (response.radio_plays && Array.isArray(response.radio_plays)) {
    console.log('Found radio data in response.radio_plays');
    return response.radio_plays;
  }
  
  // Case 2.2: Direct radio array at top level
  if (response.radio && Array.isArray(response.radio)) {
    console.log('Found radio data in response.radio');
    return response.radio;
  }
  
  // Case 2.3: Direct stations array at top level
  if (response.stations && Array.isArray(response.stations)) {
    console.log('Found radio data in response.stations');
    return response.stations;
  }
  
  // CASE 3: Nested within data object
  if (response.data) {
    // Case 3.1: Radio plays in data
    if (response.data.radio_plays && Array.isArray(response.data.radio_plays)) {
      console.log('Found radio data in response.data.radio_plays');
      return response.data.radio_plays;
    }
    
    // Case 3.2: Radio in data
    if (response.data.radio && Array.isArray(response.data.radio)) {
      console.log('Found radio data in response.data.radio');
      return response.data.radio;
    }
    
    // Case 3.3: Stations in data
    if (response.data.stations && Array.isArray(response.data.stations)) {
      console.log('Found radio data in response.data.stations');
      return response.data.stations;
    }
  }
  
  // CASE 4: Look in track object if present
  if (response.track) {
    // Case 4.1: Radio in track
    if (response.track.radio && Array.isArray(response.track.radio)) {
      console.log('Found radio data in response.track.radio');
      return response.track.radio;
    }
    
    // Case 4.2: Radio plays in track
    if (response.track.radio_plays && Array.isArray(response.track.radio_plays)) {
      console.log('Found radio data in response.track.radio_plays');
      return response.track.radio_plays;
    }
  }
  
  // CASE 5: Look in first track of tracks array
  if (response.tracks && Array.isArray(response.tracks) && response.tracks.length > 0) {
    const track = response.tracks[0];
    
    // Case 5.1: Radio in first track
    if (track.radio && Array.isArray(track.radio)) {
      console.log('Found radio data in response.tracks[0].radio');
      return track.radio;
    }
    
    // Case 5.2: Radio plays in first track
    if (track.radio_plays && Array.isArray(track.radio_plays)) {
      console.log('Found radio data in response.tracks[0].radio_plays');
      return track.radio_plays;
    }
  }
  
  console.log('No radio data found in any expected location in the response');
  return null;
};
