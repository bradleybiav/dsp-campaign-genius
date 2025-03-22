import { RadioResult } from '@/components/results-table/types';

/**
 * Add or update a radio station in the processed stations map
 */
export const addOrUpdateRadioStation = (
  play: any,
  inputIndex: number,
  processedStations: Map<string, RadioResult>
): RadioResult | null => {
  // Use the actual station name from the API response if available
  const stationKey = play.station_id || play.station || `station-${Math.random().toString(36).substring(2, 10)}`;
  
  if (processedStations.has(stationKey)) {
    // If we've seen this station before, update the matched inputs
    const existingStation = processedStations.get(stationKey)!;
    
    if (!existingStation.matchedInputs.includes(inputIndex)) {
      existingStation.matchedInputs.push(inputIndex);
    }
    
    // Update the play count if it exists
    if (existingStation.playsCount !== undefined) {
      existingStation.playsCount += 1;
    }
    
    if (play.date && (!existingStation.lastSpin || play.date > existingStation.lastSpin)) {
      existingStation.lastSpin = play.date;
    }
    
    return null; // No new station to add
  } else {
    // Otherwise, create a new result with actual data
    const result: RadioResult = {
      id: stationKey,
      station: play.station || 'Unknown Station',
      dj: play.dj || undefined,
      show: play.show || undefined,
      country: play.country || 'Unknown',
      playsCount: 1,
      lastSpin: play.date || new Date().toISOString(),
      airplayLink: play.link || undefined,
      matchedInputs: [inputIndex],
      vertical: 'radio'
    };
    
    return result;
  }
};
