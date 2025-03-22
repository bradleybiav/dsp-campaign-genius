import { NormalizedInput } from '@/utils/apiUtils';
import { callSongstatsApi, getISRCFromSpotifyTrack } from './apiClient';
import { toast } from 'sonner';

/**
 * Radio results interface matching the expected output
 */
export interface RadioResult {
  id: string;
  station: string;
  show: string;
  dj: string;
  country: string;
  lastSpin: string;
  matchedInputs: number[];
  airplayLink: string;
  vertical: 'radio';
}

/**
 * Get radio play data for tracks using the Enterprise API
 */
export const getRadioPlays = async (
  normalizedInputs: NormalizedInput[]
): Promise<RadioResult[]> => {
  try {
    const results: RadioResult[] = [];
    const processedRadios = new Map<string, RadioResult>();
    let apiSuccessCalls = 0;
    let totalApiCalls = 0;
    
    // Process each input
    for (const input of normalizedInputs) {
      // For ISRC inputs, use them directly
      if (input.type === 'isrc') {
        const isrc = input.id;
        console.log(`Using direct ISRC input for radio: ${isrc}`);
        totalApiCalls++;
        
        // Get track stats with radio plays using ISRC
        const trackData = await callSongstatsApi('tracks/stats', { 
          isrc: isrc,
          with_radio: "true" // Using string "true" instead of boolean true
        });
        
        if (!trackData || trackData.error) {
          console.error('Error getting track stats for ISRC:', trackData?.error || 'Unknown error');
          continue;
        }
        
        apiSuccessCalls++;
        
        // Process radio plays from the stats
        const radioStats = trackData.stats?.find(stat => stat.source === 'radio');
        
        if (!radioStats || !radioStats.data) {
          console.log(`No radio data found for ISRC: ${isrc}`);
          continue;
        }
        
        // Check if we have detailed plays data
        if (radioStats.data.plays && radioStats.data.plays.length > 0) {
          // Log found radio plays for debugging
          console.log(`Found ${radioStats.data.plays.length} radio plays for ISRC: ${isrc}`);
          
          // Process each radio play
          for (const play of radioStats.data.plays) {
            const radioKey = `${play.station}-${play.show || ''}-${play.dj || ''}`;
            
            if (processedRadios.has(radioKey)) {
              // If we've seen this radio before, update the matched inputs
              const existingRadio = processedRadios.get(radioKey)!;
              if (!existingRadio.matchedInputs.includes(input.inputIndex)) {
                existingRadio.matchedInputs.push(input.inputIndex);
              }
            } else {
              // Otherwise, create a new result
              const result: RadioResult = {
                id: play.id || `radio-${radioKey}-${Date.now()}`,
                station: play.station || 'Unknown Station',
                show: play.show || '',
                dj: play.dj || '',
                country: play.country || 'Unknown',
                lastSpin: play.last_spin || play.played_at || new Date().toISOString(),
                matchedInputs: [input.inputIndex],
                airplayLink: play.url || '',
                vertical: 'radio'
              };
              
              processedRadios.set(radioKey, result);
              results.push(result);
            }
          }
        } 
        // Handle case where we have summary stats but no individual plays
        else if (radioStats.data.radio_plays_total && radioStats.data.radio_plays_total > 0) {
          console.log(`Radio summary data found for ISRC ${isrc}: ${radioStats.data.radio_plays_total} plays across ${radioStats.data.radio_stations_total} stations`);
          
          // Create a generic result for the track based on summary data
          const track = trackData.track || {};
          const radioKey = `summary-${isrc}`;
          
          if (!processedRadios.has(radioKey)) {
            // Create a summary result entry
            const result: RadioResult = {
              id: `radio-summary-${isrc}-${Date.now()}`,
              station: `${radioStats.data.radio_stations_total || 0} Radio Stations`,
              show: track.title || 'Unknown Track',
              dj: track.artist || 'Unknown Artist',
              country: 'Various',
              lastSpin: new Date().toISOString(),
              matchedInputs: [input.inputIndex],
              airplayLink: '',
              vertical: 'radio'
            };
            
            processedRadios.set(radioKey, result);
            results.push(result);
          } else {
            // Update matched inputs for existing summary
            const existingRadio = processedRadios.get(radioKey)!;
            if (!existingRadio.matchedInputs.includes(input.inputIndex)) {
              existingRadio.matchedInputs.push(input.inputIndex);
            }
          }
        } else {
          console.log(`No radio plays found for ISRC: ${isrc}`);
        }
        
        continue; // Skip to next input
      }
      
      // Skip non-Spotify track inputs for radio research
      if (input.type !== 'spotify_track') continue;
      
      // For track URLs, first get the ISRC
      let isrc: string | null = null;
      
      // Try to get ISRC from Spotify ID
      isrc = await getISRCFromSpotifyTrack(input.id);
      
      if (!isrc) {
        console.log(`No ISRC found for Spotify track: ${input.id}, skipping`);
        continue;
      }
      
      console.log(`Found ISRC: ${isrc} for Spotify track: ${input.id}`);
      totalApiCalls++;
      
      // Get track stats with radio plays using ISRC
      const trackData = await callSongstatsApi('tracks/stats', { 
        isrc: isrc,
        with_radio: "true" // Using string "true" instead of boolean true
      });
      
      if (!trackData || trackData.error) {
        console.error('Error getting track stats:', trackData?.error || 'Unknown error');
        continue;
      }
      
      apiSuccessCalls++;
      
      // Process radio plays from the stats
      const radioStats = trackData.stats?.find(stat => stat.source === 'radio');
      
      if (!radioStats || !radioStats.data) {
        console.log(`No radio data found for ISRC: ${isrc}`);
        continue;
      }
      
      // Check if we have detailed plays data
      if (radioStats.data.plays && radioStats.data.plays.length > 0) {
        // Log found radio plays for debugging
        console.log(`Found ${radioStats.data.plays.length} radio plays for ISRC: ${isrc}`);
        
        // Process each radio play
        for (const play of radioStats.data.plays) {
          const radioKey = `${play.station}-${play.show || ''}-${play.dj || ''}`;
          
          if (processedRadios.has(radioKey)) {
            // If we've seen this radio before, update the matched inputs
            const existingRadio = processedRadios.get(radioKey)!;
            if (!existingRadio.matchedInputs.includes(input.inputIndex)) {
              existingRadio.matchedInputs.push(input.inputIndex);
            }
          } else {
            // Otherwise, create a new result
            const result: RadioResult = {
              id: play.id || `radio-${radioKey}-${Date.now()}`,
              station: play.station || 'Unknown Station',
              show: play.show || '',
              dj: play.dj || '',
              country: play.country || 'Unknown',
              lastSpin: play.last_spin || play.played_at || new Date().toISOString(),
              matchedInputs: [input.inputIndex],
              airplayLink: play.url || '',
              vertical: 'radio'
            };
            
            processedRadios.set(radioKey, result);
            results.push(result);
          }
        }
      }
      // Handle case where we have summary stats but no individual plays
      else if (radioStats.data.radio_plays_total && radioStats.data.radio_plays_total > 0) {
        console.log(`Radio summary data found for ISRC ${isrc}: ${radioStats.data.radio_plays_total} plays across ${radioStats.data.radio_stations_total} stations`);
        
        // Create a generic result for the track based on summary data
        const track = trackData.track || {};
        const radioKey = `summary-${isrc}`;
        
        if (!processedRadios.has(radioKey)) {
          // Create a summary result entry
          const result: RadioResult = {
            id: `radio-summary-${isrc}-${Date.now()}`,
            station: `${radioStats.data.radio_stations_total || 0} Radio Stations`,
            show: track.title || 'Unknown Track',
            dj: track.artist || 'Unknown Artist',
            country: 'Various',
            lastSpin: new Date().toISOString(),
            matchedInputs: [input.inputIndex],
            airplayLink: '',
            vertical: 'radio'
          };
          
          processedRadios.set(radioKey, result);
          results.push(result);
        } else {
          // Update matched inputs for existing summary
          const existingRadio = processedRadios.get(radioKey)!;
          if (!existingRadio.matchedInputs.includes(input.inputIndex)) {
            existingRadio.matchedInputs.push(input.inputIndex);
          }
        }
      } else {
        console.log(`No radio plays found for ISRC: ${isrc}`);
      }
    }
    
    // Log summary of radio API calls
    console.log(`Radio API stats: ${apiSuccessCalls} successful calls out of ${totalApiCalls} total calls`);
    console.log(`Radio results: ${results.length}`);
    
    if (totalApiCalls > 0 && apiSuccessCalls === 0) {
      toast.warning("No radio data could be retrieved", {
        description: "The radio data API endpoint might be unavailable"
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error getting radio plays:', error);
    toast.error("Failed to retrieve radio data", {
      description: "Please try again later"
    });
    return [];
  }
};

