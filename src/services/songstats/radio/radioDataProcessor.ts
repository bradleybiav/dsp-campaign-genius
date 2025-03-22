
import { RadioResult } from '@/components/results-table/types';
import { addOrUpdateRadioStation } from './stationHandler';

/**
 * Process radio data from the API response
 */
export const processRadioData = (
  radioData: any, 
  inputIndex: number,
  processedStations: Map<string, RadioResult>
): RadioResult[] => {
  const newResults: RadioResult[] = [];
  
  // If no data found, return empty results
  if (!radioData) {
    console.log(`No radio data found for input index: ${inputIndex}`);
    return newResults;
  }
  
  // Per API docs, the main data is in the "data" field, which contains
  // information about the track and its radio plays
  const data = radioData.data || {};
  
  // Log the stats we found
  const statsData = {
    spins: data.spins || 0,
    total_stations: data.total_stations || 0,
    sxm_spins: data.sxm_spins || 0
  };
  console.log(`Radio stats data:`, JSON.stringify(statsData));
  
  // Check for detailed airplay data
  const airplays = data.airplay || [];
  
  if (airplays.length > 0) {
    // Process actual play data from the API
    console.log(`Found ${airplays.length} radio plays`);
    
    // Group plays by station to consolidate multiple plays at the same station
    const stationPlays = new Map<string, any[]>();
    
    for (const play of airplays) {
      // Station id should be unique per station
      const stationKey = play.station_id || 
        play.station_name || 
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
        station: stationData.station_name || stationData.call_sign || 'Unknown Station',
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
      
      if (result && !processedStations.has(result.id)) {
        newResults.push(result);
        processedStations.set(result.id, result);
      }
    }
  } else if (statsData.spins > 0) {
    // When we only have summary data but no detailed plays,
    // create station entries based on the summary data
    console.log(`Radio plays found (${statsData.spins}) but no detailed station information`);
    
    // Handle SiriusXM plays if present
    if (statsData.sxm_spins > 0) {
      const sxmResult = createOrUpdateSummaryStation(
        'SiriusXM',
        'sirius-xm',
        'USA',
        statsData.sxm_spins,
        inputIndex,
        processedStations
      );
      
      if (sxmResult && !processedStations.has(sxmResult.id)) {
        newResults.push(sxmResult);
        processedStations.set(sxmResult.id, sxmResult);
      }
    }
    
    // Handle terrestrial radio plays
    const terrestrialPlays = statsData.spins - (statsData.sxm_spins || 0);
    
    if (terrestrialPlays > 0) {
      const terrestrialResult = createOrUpdateSummaryStation(
        'Terrestrial Radio',
        'terrestrial-radio',
        'Various',
        terrestrialPlays,
        inputIndex,
        processedStations
      );
      
      if (terrestrialResult && !processedStations.has(terrestrialResult.id)) {
        newResults.push(terrestrialResult);
        processedStations.set(terrestrialResult.id, terrestrialResult);
      }
    }
  }
  
  return newResults;
};

/**
 * Create or update a summary station when we only have aggregate data
 */
const createOrUpdateSummaryStation = (
  stationName: string,
  stationPrefix: string,
  country: string,
  playsCount: number,
  inputIndex: number,
  processedStations: Map<string, RadioResult>
): RadioResult | null => {
  const stationKey = `${stationPrefix}-${inputIndex}`;
  
  if (processedStations.has(stationKey)) {
    const existing = processedStations.get(stationKey)!;
    
    if (!existing.matchedInputs.includes(inputIndex)) {
      existing.matchedInputs.push(inputIndex);
    }
    
    if (existing.playsCount !== undefined) {
      existing.playsCount += playsCount;
    }
    
    return null; // No new station to add
  } else {
    const result: RadioResult = {
      id: stationKey,
      station: stationName,
      country: country,
      playsCount: playsCount,
      lastSpin: new Date().toISOString(),
      matchedInputs: [inputIndex],
      vertical: 'radio'
    };
    
    return result;
  }
};
