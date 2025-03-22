
import { toast } from 'sonner';
import { generateMockResults } from '@/utils/mockDataGenerator';
import { ResearchResults } from './types';

export function generateMockResearchResults(
  referenceInputs: string[],
  selectedVerticals: string[]
): ResearchResults {
  toast.warning('Using demo data for preview purposes', {
    description: 'To see real data, configure your Songstats API key in Supabase'
  });
  
  const mockResults = generateMockResults(referenceInputs, selectedVerticals);
  
  return {
    dspResults: mockResults.filter(r => r.vertical === 'dsp'),
    radioResults: mockResults.filter(r => r.vertical === 'radio') as any,
    djResults: mockResults.filter(r => r.vertical === 'dj') as any,
    pressResults: mockResults.filter(r => r.vertical === 'press') as any
  };
}
