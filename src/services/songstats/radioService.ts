
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
        
        if (!radioStats || !radioStats.data || !radioStats.data.plays) {
          // Log specifically when no radio plays are found
          if (radioStats && radioStats.data) {
            console.log(`Radio data found for ISRC ${isrc} but no plays available`);
            // Log the entire radio stats for debugging
            console.log('Radio stats data:', JSON.stringify(radioStats.data));
          } else {
            console.log(`No radio play data for ISRC: ${isrc}`);
          }
          continue;
        }
        
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
              id: play.id || `radio-${radioKey}`,
              station: play.station,
              show: play.show || '',
              dj: play.dj || '',
              country: play.country || '',
              lastSpin: play.last_spin || play.played_at || new Date().toISOString(),
              matchedInputs: [input.inputIndex],
              airplayLink: play.url || '',
              vertical: 'radio'
            };
            
            processedRadios.set(radioKey, result);
            results.push(result);
          }
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
      
      if (!radioStats || !radioStats.data || !radioStats.data.plays) {
        // Log specifically when no radio plays are found
        if (radioStats && radioStats.data) {
          console.log(`Radio data found for ISRC ${isrc} but no plays available`);
          // Log the entire radio stats for debugging
          console.log('Radio stats data:', JSON.stringify(radioStats.data));
        } else {
          console.log(`No radio play data for ISRC: ${isrc}`);
        }
        continue;
      }
      
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
            id: play.id || `radio-${radioKey}`,
            station: play.station,
            show: play.show || '',
            dj: play.dj || '',
            country: play.country || '',
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
