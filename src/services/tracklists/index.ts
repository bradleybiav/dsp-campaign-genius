import { NormalizedInput } from '@/utils/apiUtils';
import { DjResult } from './types';
import { searchTracklistsByTrack } from './apiClient';
import { generateMockDjData } from './mockDataGenerator';
import { showServiceError } from '@/hooks/research-form/errorHandler';

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
        console.log(`Searching 1001Tracklists for ISRC: ${input.id}`);
        
        const response = await searchTracklistsByTrack(input.id);
        
        if (!response.success || !response.data) {
          console.log(`No tracklists found for ISRC: ${input.id}`, response.error || 'Unknown reason');
          continue;
        }
        
        apiSuccesses++;
        
        // Process tracklists from the API response
        if (response.data.tracklists && response.data.tracklists.length > 0) {
          console.log(`Found ${response.data.tracklists.length} tracklists for ISRC: ${input.id}`);
          
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
                dj: tracklist.dj || 'Unknown DJ',
                event: tracklist.name || 'Unknown Event',
                location: tracklist.venue || 'Unknown Venue',
                date: tracklist.date || new Date().toISOString(),
                matchedInputs: [input.inputIndex],
                tracklistUrl: tracklist.url,
                vertical: 'dj'
              };
              
              processedDjs.set(djKey, result);
              results.push(result);
            }
          }
        } else {
          console.log(`No tracklists found in the response for ISRC: ${input.id}`);
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

// Re-export types and functions for backward compatibility
export type { DjResult } from './types';
