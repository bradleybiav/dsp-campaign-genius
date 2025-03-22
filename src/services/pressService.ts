
import { NormalizedInput } from '@/utils/apiUtils';
import { toast } from 'sonner';

/**
 * Press result interface matching the expected output
 */
export interface PressResult {
  id: string;
  outlet: string;
  writer: string;
  articleTitle: string;
  date: string;
  matchedInputs: number[];
  link: string;
  vertical: 'press';
}

/**
 * Get press mentions - currently using static mock data
 * 
 * NOTE: Press functionality is limited until a proper API solution is found
 */
export const getPressResults = async (
  normalizedInputs: NormalizedInput[]
): Promise<PressResult[]> => {
  try {
    // Inform the user that we're using mock data
    toast.info("Using demo data for press results", {
      description: "Press API integration is not yet available"
    });
    
    console.log("NOTICE: Press reporting functionality is limited - using mock data only");
    
    // Create a static set of press results and randomly assign them to inputs
    const pressOutlets = [
      { outlet: 'Mixmag', writer: 'Ben Murphy' },
      { outlet: 'DJ Mag', writer: 'Carl Loben' },
      { outlet: 'Resident Advisor', writer: 'Ryan Keeling' },
      { outlet: 'Pitchfork', writer: 'Philip Sherburne' },
      { outlet: 'Billboard', writer: 'Katie Bain' },
    ];
    
    const articleTitles = [
      'Artist to Watch: {artist}',
      'New Release Spotlight: {artist}\'s Latest EP',
      'The Rise of {artist} in Underground Electronic Music',
      'Inside the Studio with {artist}',
      'Interview: {artist} on Their Creative Process',
    ];
    
    const results: PressResult[] = [];
    
    // Generate 5-8 random press mentions
    const numResults = 5 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < numResults; i++) {
      // Pick a random outlet and title
      const outletIndex = Math.floor(Math.random() * pressOutlets.length);
      const titleIndex = Math.floor(Math.random() * articleTitles.length);
      
      // Pick 1-2 random inputs to match
      const numMatches = 1 + Math.floor(Math.random() * 2);
      const matchedInputs: number[] = [];
      
      for (let j = 0; j < numMatches; j++) {
        if (normalizedInputs.length > 0) {
          const randomInputIndex = normalizedInputs[
            Math.floor(Math.random() * normalizedInputs.length)
          ].inputIndex;
          
          if (!matchedInputs.includes(randomInputIndex)) {
            matchedInputs.push(randomInputIndex);
          }
        }
      }
      
      // Only create results if we have matched inputs
      if (matchedInputs.length > 0) {
        // Random date in the last 6 months
        const date = new Date(
          Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000
        ).toISOString();
        
        const result: PressResult = {
          id: `press-${i}`,
          outlet: pressOutlets[outletIndex].outlet,
          writer: pressOutlets[outletIndex].writer,
          articleTitle: articleTitles[titleIndex].replace('{artist}', `Artist ${matchedInputs[0]}`),
          date,
          matchedInputs,
          link: `https://example.com/press/${pressOutlets[outletIndex].outlet.toLowerCase().replace(' ', '-')}/article-${i}`,
          vertical: 'press'
        };
        
        results.push(result);
      }
    }
    
    console.log(`Generated ${results.length} mock press results`);
    return results;
  } catch (error) {
    console.error('Error getting press results:', error);
    return [];
  }
};
