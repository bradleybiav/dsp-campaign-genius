import { RadioResult } from '@/components/ResultsTable';
import { NormalizedInput } from '@/utils/apiUtils';
import { callSongstatsApi, getISRCFromSpotifyTrack } from './apiClient';

/**
 * Get radio plays for a track using the Enterprise API
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
      
      // Get track stats with radio using ISRC
      const trackData = await callSongstatsApi('tracks/stats', { 
        isrc: isrc,
        with_radio: "true" // Using string "true" instead of boolean true
      });
      
      if (!trackData || trackData.error) {
        console.error('Error getting radio data for ISRC:', trackData?.error || 'Unknown error');
        continue;
      }
      
      radioApiStats.successful++;
      
      // Find the radio stats section from the response
      const radioStats = trackData.stats?.find(stat => 
        stat.source === 'radio' || 
        (stat.source === 'stats' && stat.data?.radio_plays_total !== undefined)
      );
      
      // If no radio data found, continue to next input
      if (!radioStats || !radioStats.data) {
        console.log(`No radio data found for ISRC: ${isrc}`);
        continue;
      }
      
      // Log the stats we found
      const statsData = {
        radio_plays_total: radioStats.data.radio_plays_total,
        radio_stations_total: radioStats.data.radio_stations_total,
        sxm_plays_total: radioStats.data.sxm_plays_total
      };
      console.log(`Radio stats data:`, JSON.stringify(statsData));
      
      // Check for detailed radio play data
      const radioPlays = radioStats.data.radio_plays || [];
      
      if (radioPlays.length > 0) {
        // Process detailed play data if available
        console.log(`Found ${radioPlays.length} radio plays for ISRC: ${isrc}`);
        
        for (const play of radioPlays) {
          const stationKey = play.station_id || play.station || `station-${Math.random().toString(36).substring(2, 10)}`;
          
          if (processedStations.has(stationKey)) {
            // If we've seen this station before, update the matched inputs
            const existingStation = processedStations.get(stationKey)!;
            if (!existingStation.matchedInputs.includes(input.inputIndex)) {
              existingStation.matchedInputs.push(input.inputIndex);
            }
            
            // Update the play count and last spin date if newer
            existingStation.playsCount = (existingStation.playsCount || 0) + 1;
            
            if (play.date && (!existingStation.lastSpin || play.date > existingStation.lastSpin)) {
              existingStation.lastSpin = play.date;
            }
          } else {
            // Otherwise, create a new result
            const result: RadioResult = {
              id: stationKey,
              station: play.station || 'Unknown Station',
              dj: play.dj || undefined,
              show: play.show || undefined,
              country: play.country || 'Unknown',
              playsCount: 1,
              lastSpin: play.date || new Date().toISOString(),
              airplayLink: play.link || undefined,
              matchedInputs: [input.inputIndex],
              vertical: 'radio'
            };
            
            processedStations.set(stationKey, result);
            results.push(result);
          }
        }
      } else if (statsData.radio_plays_total > 0) {
        // Create a summary result when we have total plays but no detailed data
        console.log(`Radio data found for ISRC ${isrc} but no plays available`);
        
        // Create a single result for SiriusXM if there are plays
        if (statsData.sxm_plays_total > 0) {
          const sxmKey = 'sirius-xm';
          
          if (processedStations.has(sxmKey)) {
            const existingStation = processedStations.get(sxmKey)!;
            if (!existingStation.matchedInputs.includes(input.inputIndex)) {
              existingStation.matchedInputs.push(input.inputIndex);
            }
          } else {
            const result: RadioResult = {
              id: sxmKey,
              station: 'SiriusXM',
              country: 'USA',
              playsCount: statsData.sxm_plays_total,
              lastSpin: new Date().toISOString(), // Current date as fallback
              matchedInputs: [input.inputIndex],
              vertical: 'radio'
            };
            
            processedStations.set(sxmKey, result);
            results.push(result);
          }
        }
        
        // Create a generic terrestrial radio entry if there are plays beyond SXM
        const terrestrialPlays = statsData.radio_plays_total - (statsData.sxm_plays_total || 0);
        
        if (terrestrialPlays > 0) {
          const radioKey = 'terrestrial-radio';
          
          if (processedStations.has(radioKey)) {
            const existingStation = processedStations.get(radioKey)!;
            if (!existingStation.matchedInputs.includes(input.inputIndex)) {
              existingStation.matchedInputs.push(input.inputIndex);
            }
          } else {
            const result: RadioResult = {
              id: radioKey,
              station: 'Terrestrial Radio',
              country: 'Multiple Countries',
              playsCount: terrestrialPlays,
              lastSpin: new Date().toISOString(), // Current date as fallback
              matchedInputs: [input.inputIndex],
              vertical: 'radio'
            };
            
            processedStations.set(radioKey, result);
            results.push(result);
          }
        }
      }
    }
    
    // Log stats about the API calls
    console.log(`Radio API stats: ${radioApiStats.successful} successful calls out of ${radioApiStats.total} total calls`);
    console.log(`Radio results: ${results.length}`);
    
    return results;
  } catch (error) {
    console.error('Error getting radio plays:', error);
    return [];
  }
};
