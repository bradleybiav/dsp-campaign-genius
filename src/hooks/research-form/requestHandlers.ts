
import { toast } from 'sonner';
import { NormalizedInput } from '@/utils/apiUtils';
import { getPlaylistPlacements } from '@/services/songstats';
import { getRadioPlays, RadioResult } from '@/services/songstats';
import { getDjPlacements, DjResult } from '@/services/tracklistsService';
import { getPressResults, PressResult } from '@/services/pressService';
import { ResearchResults } from './types';
import { PlaylistResult } from '@/components/ResultsTable';

export async function executeResearch(
  normalizedInputs: NormalizedInput[],
  selectedVerticals: string[]
): Promise<ResearchResults> {
  // Create an object to store results for each vertical
  const researchResults: ResearchResults = {
    dspResults: [],
    radioResults: [],
    djResults: [],
    pressResults: []
  };
  
  // Execute vertical-specific research based on selected verticals
  const researchPromises: Promise<void>[] = [];
  
  // DSP vertical
  if (selectedVerticals.includes('dsp')) {
    const dspPromise = getPlaylistPlacements(normalizedInputs)
      .then(results => {
        researchResults.dspResults = results;
        console.log('DSP results:', results.length);
      })
      .catch(error => {
        console.error('Error fetching playlist placements:', error);
        toast.error('Failed to fetch playlist data');
      });
    researchPromises.push(dspPromise);
  }
  
  // Radio vertical
  if (selectedVerticals.includes('radio')) {
    const radioPromise = getRadioPlays(normalizedInputs)
      .then(results => {
        researchResults.radioResults = results;
        console.log('Radio results:', results.length);
      })
      .catch(error => {
        console.error('Error fetching radio plays:', error);
        toast.error('Failed to fetch radio data');
      });
    researchPromises.push(radioPromise);
  }
  
  // DJ vertical
  if (selectedVerticals.includes('dj')) {
    const djPromise = getDjPlacements(normalizedInputs)
      .then(results => {
        researchResults.djResults = results;
        console.log('DJ results:', results.length);
      })
      .catch(error => {
        console.error('Error fetching DJ placements:', error);
        toast.error('Failed to fetch DJ data');
      });
    researchPromises.push(djPromise);
  }
  
  // Press vertical
  if (selectedVerticals.includes('press')) {
    const pressPromise = getPressResults(normalizedInputs)
      .then(results => {
        researchResults.pressResults = results;
        console.log('Press results:', results.length);
      })
      .catch(error => {
        console.error('Error fetching press results:', error);
        toast.error('Failed to fetch press data');
      });
    researchPromises.push(pressPromise);
  }
  
  // Wait for all research to complete
  await Promise.all(researchPromises);
  
  return researchResults;
}

export async function checkAPIConfiguration(): Promise<boolean> {
  try {
    const apiKeyCheck = await fetch('/api/check-songstats-key');
    const apiKeyStatus = await apiKeyCheck.json();
    
    return apiKeyStatus.configured;
  } catch (error) {
    console.error('Error checking API configuration:', error);
    return false;
  }
}
