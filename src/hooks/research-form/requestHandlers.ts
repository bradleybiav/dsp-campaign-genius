
import { toast } from 'sonner';
import { NormalizedInput } from '@/utils/apiUtils';
import { getPlaylistPlacements } from '@/services/songstats';
import { getRadioPlays } from '@/services/songstats';
import { getDjPlacements } from '@/services/tracklistsService';
import { getPressResults } from '@/services/pressService';
import type { ResearchResults } from './types';

// Consistent error handling function
const handleApiError = (service: string, error: any) => {
  console.error(`Error in ${service} service:`, error);
  const errorMessage = error?.message || 'Unknown error occurred';
  
  // Log detailed error information for debugging
  if (error?.response) {
    console.error(`${service} API response:`, {
      status: error.response.status,
      data: error.response.data
    });
  }
  
  return errorMessage;
};

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
        const errorMsg = handleApiError('Playlist', error);
        toast.error('Failed to fetch playlist data', { 
          description: errorMsg.substring(0, 100) 
        });
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
        const errorMsg = handleApiError('Radio', error);
        toast.error('Failed to fetch radio data', {
          description: errorMsg.substring(0, 100)
        });
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
        const errorMsg = handleApiError('DJ', error);
        toast.error('Failed to fetch DJ data', {
          description: errorMsg.substring(0, 100)
        });
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
        const errorMsg = handleApiError('Press', error);
        toast.error('Failed to fetch press data', {
          description: errorMsg.substring(0, 100)
        });
      });
    researchPromises.push(pressPromise);
  }
  
  // Wait for all research to complete
  await Promise.all(researchPromises);
  
  return researchResults;
}

export async function checkAPIConfiguration(): Promise<boolean> {
  try {
    console.log('Checking Songstats API configuration...');
    const apiKeyCheck = await fetch('/api/check-songstats-key');
    
    if (!apiKeyCheck.ok) {
      console.error('API key check failed with status:', apiKeyCheck.status);
      return false;
    }
    
    const apiKeyStatus = await apiKeyCheck.json();
    console.log('API key configuration status:', apiKeyStatus.configured);
    
    return apiKeyStatus.configured;
  } catch (error) {
    console.error('Error checking API configuration:', error);
    return false;
  }
}
