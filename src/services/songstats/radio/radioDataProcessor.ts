
import { RadioResult } from '@/components/results-table/types';
import { addOrUpdateRadioStation } from './stationHandler';

/**
 * Process radio data from the API response
 */
export const processRadioData = (
  trackData: any, 
  inputIndex: number,
  processedStations: Map<string, RadioResult>
): RadioResult[] => {
  const newResults: RadioResult[] = [];
  
  // Find the radio stats section from the response
  const radioStats = trackData.stats?.find(stat => 
    stat.source === 'radio' || 
    (stat.source === 'stats' && stat.data?.radio_plays_total !== undefined)
  );
  
  // If no radio data found, return empty results
  if (!radioStats || !radioStats.data) {
    console.log(`No radio data found for input index: ${inputIndex}`);
    return newResults;
  }
  
  // Log the stats we found
  const statsData = {
    radio_plays_total: radioStats.data.radio_plays_total || 0,
    radio_stations_total: radioStats.data.radio_stations_total || 0,
    sxm_plays_total: radioStats.data.sxm_plays_total || 0
  };
  console.log(`Radio stats data:`, JSON.stringify(statsData));
  
  // Check for detailed radio play data
  const radioPlays = radioStats.data.radio_plays || [];
  
  if (radioPlays.length > 0) {
    // Process actual play data from the API
    console.log(`Found ${radioPlays.length} radio plays`);
    
    // Group plays by station to consolidate multiple plays at the same station
    const stationPlays = new Map<string, any[]>();
    
    for (const play of radioPlays) {
      const stationKey = play.station_id || play.station || `station-${Math.random().toString(36).substring(2, 10)}`;
      
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
        ...stationData,
        plays_count: plays.length,
        station_id: stationKey,
        station: stationData.station || 'Unknown Station',
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
  } else if (statsData.radio_plays_total > 0) {
    // When we only have summary data but no detailed plays,
    // create station entries based on the summary data
    console.log(`Radio plays found (${statsData.radio_plays_total}) but no detailed station information`);
    
    // Handle SiriusXM plays if present
    if (statsData.sxm_plays_total > 0) {
      const sxmResult = createOrUpdateSummaryStation(
        'SiriusXM',
        'sirius-xm',
        'USA',
        statsData.sxm_plays_total,
        inputIndex,
        processedStations
      );
      
      if (sxmResult && !processedStations.has(sxmResult.id)) {
        newResults.push(sxmResult);
        processedStations.set(sxmResult.id, sxmResult);
      }
    }
    
    // Handle terrestrial radio plays
    const terrestrialPlays = statsData.radio_plays_total - (statsData.sxm_plays_total || 0);
    
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
