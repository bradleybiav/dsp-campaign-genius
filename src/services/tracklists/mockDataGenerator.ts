import { NormalizedInput } from '@/utils/apiUtils';
import { DjResult } from './types';
import { toast } from 'sonner';

/**
 * Generate mock DJ data for testing and fallback
 */
export function generateMockDjData(normalizedInputs: NormalizedInput[]): DjResult[] {
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
