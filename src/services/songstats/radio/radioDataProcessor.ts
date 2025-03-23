
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
  
  // Log debugging information about the response structure
  console.log('Processing radio data response:', 
    JSON.stringify(response).substring(0, 200) + '...');
  console.log('Response keys:', Object.keys(response).join(', '));
  
  // Extract stations array from various possible response formats
  let stations: any[] = [];
  
  // Case 1: Direct data array
  if (response.data && Array.isArray(response.data)) {
    console.log('Found radio stations in response.data array format');
    stations = response.data;
  } 
  // Case 2: Response.stations format
  else if (response.stations && Array.isArray(response.stations)) {
    console.log('Found radio stations in response.stations format');
    stations = response.stations;
  }
  // Case 3: Response.radio format
  else if (response.radio && Array.isArray(response.radio)) {
    console.log('Found radio stations in response.radio format');
    stations = response.radio;
  }
  // Case 4: Response.tracks[0].radio format
  else if (response.tracks && Array.isArray(response.tracks) && response.tracks.length > 0) {
    const track = response.tracks[0];
    if (track.radio && Array.isArray(track.radio)) {
      console.log('Found radio stations in response.tracks[0].radio format');
      stations = track.radio;
    }
  }
  // Case 5: Stats array with radio data
  else if (response.stats && Array.isArray(response.stats)) {
    for (const stat of response.stats) {
      if (stat.source === 'radio' && stat.data) {
        if (Array.isArray(stat.data)) {
          console.log('Found radio stations in response.stats[].data array format');
          stations = stat.data;
          break;
        } else if (stat.data.plays && Array.isArray(stat.data.plays)) {
          console.log('Found radio stations in response.stats[].data.plays format');
          stations = stat.data.plays;
          break;
        } else if (stat.data.radio_plays && Array.isArray(stat.data.radio_plays)) {
          console.log('Found radio stations in response.stats[].data.radio_plays format');
          stations = stat.data.radio_plays;
          break;
        }
      }
    }
  }
  
  // If no stations found in any format, log and return empty
  if (stations.length === 0) {
    console.warn('No radio stations found in the response:', 
      JSON.stringify(response).substring(0, 300));
    return results;
  }
  
  console.log(`Processing ${stations.length} radio stations`);
  
  // Process each station
  for (const station of stations) {
    // Debug log to see the station data structure
    console.log('Processing station:', JSON.stringify(station).substring(0, 200));
    
    // Enhanced name extraction with multiple fallbacks
    const stationName = station.name || station.station_name || station.station || 
                        station.call_sign || 'Unknown Station';
    
    // Create a unique key for this station
    const stationKey = `${stationName}-${station.country || ''}`;
    
    // Extract plays count with fallbacks
    const playsCount = station.spins || station.plays || station.count || 
                      station.frequency || station.spin_count || 1;
    
    // Format date - use the most recent spin date if available
    const lastSpin = station.last_spin_date || station.last_play || station.date || 
                    station.last_played || station.last_spin || new Date().toISOString();
    
    // Extract country information with more fallbacks
    const country = station.country || station.region || station.market || 'Unknown';
    
    // DJ/Host information with fallbacks
    const dj = station.dj || station.host || station.presenter || '';
    
    // Show/Program information with fallbacks
    const show = station.show || station.program || station.broadcast || '';
    
    // Extract any airplay link if available
    const airplayLink = station.link || station.url || station.airplay_link || '';
    
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
      const existingDate = new Date(existingResult.lastSpin);
      const newDate = new Date(lastSpin);
      if (!isNaN(newDate.getTime()) && !isNaN(existingDate.getTime()) && newDate > existingDate) {
        existingResult.lastSpin = lastSpin;
      }
    } else {
      // Create new result
      const result: RadioResult = {
        id: `radio-${stationName}-${inputIndex}-${Math.random().toString(36).substring(2, 10)}`,
        station: stationName,
        country: country,
        dj: dj || undefined,
        show: show || undefined,
        playsCount: playsCount,
        lastSpin: lastSpin,
        airplayLink: airplayLink || undefined,
        matchedInputs: [inputIndex],
        vertical: 'radio'
      };
      
      // Store in processed stations and results
      processedStations.set(stationKey, result);
      results.push(result);
    }
  }
  
  console.log(`Processed ${results.length} unique radio stations`);
  return results;
};
