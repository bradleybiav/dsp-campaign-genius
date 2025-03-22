
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
    console.warn('Invalid radio data format:', response);
    return results;
  }
  
  // Process each radio station data
  for (const station of response.data) {
    // Skip if required data is missing
    if (!station.name) {
      console.warn('Skipping station with missing name:', station);
      continue;
    }
    
    // Create unique key for this station
    const stationKey = station.name;
    
    // For spins/plays count
    const playsCount = station.spins || 1;  // Default to 1 if not provided
    
    // Format date - use the most recent spin date if available
    const lastSpin = station.last_spin_date || new Date().toISOString();
    
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
        id: `radio-${station.name}-${inputIndex}`,
        station: station.name,
        region: station.region || 'Unknown',
        dj: station.dj || 'Unknown DJ',
        show: station.show || '',
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
