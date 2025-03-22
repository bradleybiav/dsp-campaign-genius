
import { RadioResult } from '@/components/results-table/types';
import { addOrUpdateRadioStation } from './stationHandler';

/**
 * Process radio data from the API response
 */
export const processRadioData = (
  response: any, 
  inputIndex: number,
  processedStations: Map<string, RadioResult>
): RadioResult[] => {
  const newResults: RadioResult[] = [];
  
  // If no data found, return empty results
  if (!response) {
    console.log(`No radio data found for input index: ${inputIndex}`);
    return newResults;
  }
  
  // Find the radio stats section from the response
  // The tracks/stats endpoint with with_radio=true returns stats in a different format
  const radioStats = response.stats?.find((stat: any) => 
    stat.source === 'radio' || 
    (stat.source === 'stats' && stat.data?.radio_plays_total !== undefined)
  );
  
  // If no radio data found, return empty results
  if (!radioStats || !radioStats.data) {
    console.log(`No radio stats found in response for input index: ${inputIndex}`);
    return newResults;
  }
  
  // Log the stats we found
  console.log(`Found radio stats for input index ${inputIndex}:`, {
    radio_plays_total: radioStats.data.radio_plays_total || 0,
    radio_stations_total: radioStats.data.radio_stations_total || 0,
    sxm_plays_total: radioStats.data.sxm_plays_total || 0
  });
  
  // Check for detailed airplay data
  const radioPlays = radioStats.data.radio_plays || [];
  
  if (radioPlays.length > 0) {
    // Process actual play data from the API
    console.log(`Found ${radioPlays.length} radio plays for input index ${inputIndex}`);
    
    // Group plays by station to consolidate multiple plays at the same station
    const stationPlays = new Map<string, any[]>();
    
    for (const play of radioPlays) {
      // Station id should be unique per station
      const stationKey = play.station_id || 
        play.station || 
        play.call_sign || 
        `station-${Math.random().toString(36).substring(2, 10)}`;
      
      if (!stationPlays.has(stationKey)) {
        stationPlays.set(stationKey, []);
      }
      
      stationPlays.get(stationKey)?.push(play);
    }
    
    // Process each station
    for (const [stationKey, plays] of stationPlays.entries()) {
      // Use the first play as the base for station data
      const stationData = plays[0];
      
      // Create a consolidated play object with the total count
      const consolidatedPlay = {
        station_id: stationKey,
        station: stationData.station || stationData.call_sign || 'Unknown Station',
        dj: stationData.dj || undefined,
        show: stationData.show || undefined,
        country: stationData.country || 'Unknown',
        date: stationData.date || stationData.timestamp,
        plays_count: plays.length,
        link: stationData.link
      };
      
      const result = addOrUpdateRadioStation(
        consolidatedPlay, 
        inputIndex, 
        processedStations
      );
      
      if (result) {
        newResults.push(result);
        processedStations.set(result.id, result);
      }
    }
  } else if (radioStats.data.radio_plays_total > 0) {
    // When we only have summary data but no detailed plays,
    // create station entries based on the summary data
    console.log(`Radio plays found (${radioStats.data.radio_plays_total}) but no detailed station information`);
    
    // Handle SiriusXM plays if present
    if (radioStats.data.sxm_plays_total > 0) {
      const sxmResult: RadioResult = {
        id: `sirius-xm-${inputIndex}`,
        station: 'SiriusXM',
        country: 'USA',
        playsCount: radioStats.data.sxm_plays_total,
        lastSpin: new Date().toISOString(),
        matchedInputs: [inputIndex],
        vertical: 'radio'
      };
      
      newResults.push(sxmResult);
      processedStations.set(sxmResult.id, sxmResult);
    }
    
    // Handle terrestrial radio plays
    const terrestrialPlays = radioStats.data.radio_plays_total - (radioStats.data.sxm_plays_total || 0);
    
    if (terrestrialPlays > 0) {
      const terrestrialResult: RadioResult = {
        id: `terrestrial-radio-${inputIndex}`,
        station: 'Terrestrial Radio',
        country: 'Various',
        playsCount: terrestrialPlays,
        lastSpin: new Date().toISOString(),
        matchedInputs: [inputIndex],
        vertical: 'radio'
      };
      
      newResults.push(terrestrialResult);
      processedStations.set(terrestrialResult.id, terrestrialResult);
    }
  }
  
  return newResults;
};
