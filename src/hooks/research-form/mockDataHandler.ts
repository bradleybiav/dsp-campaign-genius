
import { toast } from 'sonner';
import { generateMockResults } from '@/utils/mockDataGenerator';
import { ResearchResults } from './types';
import { PlaylistResult, RadioResult, DjResult, PressResult } from '@/components/results-table/types';

export function generateMockResearchResults(
  referenceInputs: string[],
  selectedVerticals: string[]
): ResearchResults {
  toast.warning('Using demo data for preview purposes', {
    description: 'The Songstats API is not returning results. Please check your API key configuration in Supabase Edge Function secrets.'
  });
  
  console.log('Generating mock results for inputs:', referenceInputs);
  console.log('Selected verticals:', selectedVerticals);
  
  const mockResults = generateMockResults(referenceInputs, selectedVerticals);
  
  return {
    dspResults: mockResults.filter((r): r is PlaylistResult => r.vertical === 'dsp'),
    radioResults: mockResults.filter((r): r is RadioResult => r.vertical === 'radio'),
    djResults: mockResults.filter((r): r is DjResult => r.vertical === 'dj'),
    pressResults: mockResults.filter((r): r is PressResult => r.vertical === 'press')
  };
}
