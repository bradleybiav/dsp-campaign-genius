
import { RadioResult } from '@/components/results-table/types';

/**
 * Process radio data from the RadioStats API response
 */
export const processRadioData = (
  response: any,
  inputIndex: number,
  processedStations: Map<string, RadioResult>
): RadioResult[] => {
  const results: RadioResult[] = [];
  
  // Guard against invalid response format
  if (!response || !response.data || !Array.isArray(response.data)) {
    // Some versions of the API return directly in response.stations
    if (response.stations && Array.isArray(response.stations)) {
      console.log('Found radio data in response.stations format');
      return processStationsArray(response.stations, inputIndex, processedStations);
    }
    
    // Other versions might have a different structure
    if (response.radio && Array.isArray(response.radio)) {
      console.log('Found radio data in response.radio format');
      return processStationsArray(response.radio, inputIndex, processedStations);
    }
    
    // Check for tracks array that contains radio data
    if (response.tracks && Array.isArray(response.tracks) && response.tracks.length > 0) {
      const track = response.tracks[0];
      if (track.radio && Array.isArray(track.radio)) {
        console.log('Found radio data in response.tracks[0].radio format');
        return processStationsArray(track.radio, inputIndex, processedStations);
      }
    }
    
    console.warn('Invalid radio data format:', response);
    return results;
  }
  
  // Process standard data array format
  return processStationsArray(response.data, inputIndex, processedStations);
};

/**
 * Process an array of station data, handling different possible data structures
 */
const processStationsArray = (
  stations: any[],
  inputIndex: number,
  processedStations: Map<string, RadioResult>
): RadioResult[] => {
  const results: RadioResult[] = [];
  
  for (const station of stations) {
    // Skip if required data is missing
    if (!station.name && !station.station_name) {
      console.warn('Skipping station with missing name:', station);
      continue;
    }
    
    // Create unique key for this station - handle different API field names
    const stationName = station.name || station.station_name || station.station || 'Unknown Station';
    const stationKey = stationName;
    
    // For spins/plays count - handle different API field names
    const playsCount = station.spins || station.plays || station.count || 1;
    
    // Format date - use the most recent spin date if available
    const lastSpin = station.last_spin_date || station.last_play || station.date || new Date().toISOString();
    
    // Check if we've already processed this station
    if (processedStations.has(stationKey)) {
      // Update existing result with additional input index
      const existingResult = processedStations.get(stationKey)!;
      
      if (!existingResult.matchedInputs.includes(inputIndex)) {
        existingResult.matchedInputs.push(inputIndex);
      }
      
      // Update plays count if higher
      if (playsCount > existingResult.playsCount) {
        existingResult.playsCount = playsCount;
      }
      
      // Update last spin if more recent
      if (new Date(lastSpin) > new Date(existingResult.lastSpin)) {
        existingResult.lastSpin = lastSpin;
      }
    } else {
      // Create new result
      const result: RadioResult = {
        id: `radio-${stationName}-${inputIndex}`,
        station: stationName,
        country: station.country || (station.region ? station.region : 'Unknown'), // Try country first, then region as fallback
        dj: station.dj || station.host || 'Unknown DJ',
        show: station.show || station.program || '',
        playsCount: playsCount,
        lastSpin: lastSpin,
        airplayLink: station.link || '',
        matchedInputs: [inputIndex],
        vertical: 'radio'
      };
      
      // Store in processed stations and results
      processedStations.set(stationKey, result);
      results.push(result);
    }
  }
  
  return results;
};
