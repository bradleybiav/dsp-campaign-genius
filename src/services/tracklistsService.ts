
import { NormalizedInput } from '@/utils/apiUtils';
import { toast } from 'sonner';
import { showServiceError } from '@/hooks/research-form/errorHandler';

// API endpoint for 1001Tracklists
const TRACKLISTS_API_BASE_URL = 'https://api.1001tracklists.com/v1';

// Using import.meta.env for Vite's environment variables
const TRACKLISTS_API_KEY = import.meta.env.VITE_TRACKLISTS_API_KEY || 'mock-api-key';

/**
 * DJ result interface matching the expected output
 */
export interface DjResult {
  id: string;
  dj: string;
  event: string;
  location: string;
  date: string;
  matchedInputs: number[];
  tracklistUrl: string;
  vertical: 'dj';
}

/**
 * Interface for the 1001Tracklists API response
 */
interface TracklistsApiResponse {
  success: boolean;
  data?: {
    tracklists: Array<{
      id: string;
      dj: string;
      name: string;
      venue: string;
      date: string;
      url: string;
    }>;
  };
  error?: string;
}

/**
 * Call the 1001Tracklists API to search for tracklists containing a track
 */
async function searchTracklistsByTrack(isrc: string): Promise<TracklistsApiResponse> {
  try {
    console.log(`Searching 1001Tracklists for ISRC: ${isrc}`);
    
    // Check if API key is set
    if (!TRACKLISTS_API_KEY || TRACKLISTS_API_KEY === 'mock-api-key') {
      console.log('1001Tracklists API key not configured - using mock data');
      return {
        success: false,
        error: "API key not configured"
      };
    }
    
    // This is a placeholder - in production, you would implement an actual API call
    console.log('1001Tracklists API not implemented yet - using mock data');
    
    // Simulate API call
    return {
      success: false,
      error: "API integration not yet available"
    };
    
    // Actual implementation would look like this:
    /*
    const response = await fetch(`${TRACKLISTS_API_BASE_URL}/search?isrc=${isrc}`, {
      headers: {
        'Authorization': `Bearer ${TRACKLISTS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API returned ${response.status}: ${error}`);
    }
    
    return await response.json();
    */
  } catch (error) {
    console.error('Error searching 1001Tracklists:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get DJ placements from 1001Tracklists
 */
export const getDjPlacements = async (
  normalizedInputs: NormalizedInput[]
): Promise<DjResult[]> => {
  try {
    const results: DjResult[] = [];
    const processedDjs = new Map<string, DjResult>();
    let apiAttempts = 0;
    let apiSuccesses = 0;
    
    console.log(`Searching for DJ placements for ${normalizedInputs.length} inputs`);
    
    // Process each input
    for (const input of normalizedInputs) {
      // We'll only process ISRC inputs for now
      if (input.type === 'isrc') {
        apiAttempts++;
        const response = await searchTracklistsByTrack(input.id);
        
        if (!response.success || !response.data) {
          console.log(`No tracklists found for ISRC: ${input.id}`);
          continue;
        }
        
        apiSuccesses++;
        
        // Process tracklists from the API response
        for (const tracklist of response.data.tracklists) {
          const djKey = `${tracklist.dj}-${tracklist.name}-${tracklist.date}`;
          
          if (processedDjs.has(djKey)) {
            // If we've seen this DJ before, update the matched inputs
            const existingDj = processedDjs.get(djKey)!;
            if (!existingDj.matchedInputs.includes(input.inputIndex)) {
              existingDj.matchedInputs.push(input.inputIndex);
            }
          } else {
            // Otherwise, create a new result
            const result: DjResult = {
              id: tracklist.id || `dj-${input.inputIndex}-${results.length}`,
              dj: tracklist.dj,
              event: tracklist.name,
              location: tracklist.venue,
              date: tracklist.date,
              matchedInputs: [input.inputIndex],
              tracklistUrl: tracklist.url,
              vertical: 'dj'
            };
            
            processedDjs.set(djKey, result);
            results.push(result);
          }
        }
      }
    }
    
    // Log API call statistics
    console.log(`1001Tracklists API stats: ${apiSuccesses} successful calls out of ${apiAttempts} attempts`);
    
    // If we couldn't get any real data, fall back to mock data
    if (apiAttempts > 0 && apiSuccesses === 0) {
      console.log('Using mock DJ data as 1001Tracklists API is not available');
      return generateMockDjData(normalizedInputs);
    }
    
    if (results.length === 0) {
      console.log('No DJ results found, falling back to mock data');
      return generateMockDjData(normalizedInputs);
    }
    
    return results;
  } catch (error) {
    console.error('Error getting DJ placements:', error);
    showServiceError('DJ', error);
    return generateMockDjData(normalizedInputs);
  }
};

/**
 * Generate mock DJ data for testing and fallback
 */
function generateMockDjData(normalizedInputs: NormalizedInput[]): DjResult[] {
  const results: DjResult[] = [];
  const processedDjs = new Map<string, DjResult>();
  
  console.log('Generating mock DJ data for', normalizedInputs.length, 'inputs');
  
  // Process each input
  for (const input of normalizedInputs) {
    // We'll process all input types as DJs might play anything
    
    // Generate mock DJ data based on input index
    const djPlays = Array(4).fill(null).map((_, i) => ({
      id: `dj-${input.inputIndex}-${i}`,
      dj: [`Carl Cox`, `Amelie Lens`, `Charlotte de Witte`, `Jamie Jones`, `Adam Beyer`][i % 5],
      event: [`Tomorrowland`, `Awakenings`, `Warehouse Project`, `Circoloco`][i % 4],
      location: [`Ibiza`, `Amsterdam`, `London`, `Berlin`, `New York`][i % 5],
      date: new Date(
        Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000
      ).toISOString(),
      url: `https://www.1001tracklists.com/tracklist/mock-${input.inputIndex}-${i}`
    }));
    
    // Process each DJ play
    for (const play of djPlays) {
      const djKey = `${play.dj}-${play.event}-${play.date}`;
      
      if (processedDjs.has(djKey)) {
        // If we've seen this DJ before, update the matched inputs
        const existingDj = processedDjs.get(djKey)!;
        if (!existingDj.matchedInputs.includes(input.inputIndex)) {
          existingDj.matchedInputs.push(input.inputIndex);
        }
      } else {
        // Otherwise, create a new result
        const result: DjResult = {
          id: play.id,
          dj: play.dj,
          event: play.event,
          location: play.location,
          date: play.date,
          matchedInputs: [input.inputIndex],
          tracklistUrl: play.url,
          vertical: 'dj'
        };
        
        processedDjs.set(djKey, result);
        results.push(result);
      }
    }
  }
  
  toast.info('Using mock data for DJ results', {
    description: '1001Tracklists API integration is in development'
  });
  
  return results;
}
