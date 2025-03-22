
import { toast } from 'sonner';
import { NormalizedInput } from '@/utils/apiUtils';
import { getPlaylistPlacements } from '@/services/songstats';
import { getRadioPlays } from '@/services/songstats';
import { getDjPlacements } from '@/services/tracklists';
import { getPressResults } from '@/services/pressService';
import type { ResearchResults } from './types';
import { generateMockResearchResults } from './mockDataHandler';
import { checkAPIConfiguration } from './apiConfigurationHandler';
import { showServiceError } from './errorHandler';

/**
 * Execute research across selected verticals
 */
export async function executeResearch(
  normalizedInputs: NormalizedInput[],
  selectedVerticals: string[]
): Promise<ResearchResults> {
  // Check API configuration first
  const apiConfigured = await checkAPIConfiguration();
  
  // Create an object to store results for each vertical
  const researchResults: ResearchResults = {
    dspResults: [],
    radioResults: [],
    djResults: [],
    pressResults: []
  };
  
  // If API is not configured, return mock data
  if (!apiConfigured) {
    console.warn('Songstats API configuration check failed, using mock data');
    toast.warning('Using demo data for research results', {
      description: 'API access is unavailable at this time'
    });
    
    return generateMockResearchResults(normalizedInputs, selectedVerticals);
  }
  
  // Execute vertical-specific research based on selected verticals
  const researchPromises: Promise<void>[] = [];
  const successfulVerticals: string[] = [];
  
  // DSP vertical
  if (selectedVerticals.includes('dsp')) {
    const dspPromise = getPlaylistPlacements(normalizedInputs)
      .then(results => {
        researchResults.dspResults = results;
        console.log('DSP results:', results.length);
        if (results.length > 0) successfulVerticals.push('dsp');
      })
      .catch(error => showServiceError('Playlist', error));
    researchPromises.push(dspPromise);
  }
  
  // Radio vertical
  if (selectedVerticals.includes('radio')) {
    const radioPromise = getRadioPlays(normalizedInputs)
      .then(results => {
        researchResults.radioResults = results;
        console.log('Radio results:', results.length);
        if (results.length > 0) successfulVerticals.push('radio');
      })
      .catch(error => showServiceError('Radio', error));
    researchPromises.push(radioPromise);
  }
  
  // DJ vertical
  if (selectedVerticals.includes('dj')) {
    const djPromise = getDjPlacements(normalizedInputs)
      .then(results => {
        researchResults.djResults = results;
        console.log('DJ results:', results.length);
        if (results.length > 0) successfulVerticals.push('dj');
      })
      .catch(error => showServiceError('DJ', error));
    researchPromises.push(djPromise);
  }
  
  // Press vertical
  if (selectedVerticals.includes('press')) {
    const pressPromise = getPressResults(normalizedInputs)
      .then(results => {
        researchResults.pressResults = results;
        console.log('Press results:', results.length);
        if (results.length > 0) successfulVerticals.push('press');
      })
      .catch(error => showServiceError('Press', error));
    researchPromises.push(pressPromise);
  }
  
  // Wait for all research to complete
  await Promise.all(researchPromises);
  
  // Check if we actually got any results
  const hasResults = 
    researchResults.dspResults.length > 0 ||
    researchResults.radioResults.length > 0 ||
    researchResults.djResults.length > 0 ||
    researchResults.pressResults.length > 0;
  
  // Show which verticals succeeded
  if (hasResults && successfulVerticals.length > 0) {
    console.log('Live data retrieved for verticals:', successfulVerticals);
    toast.success('Research completed successfully', {
      description: `Found data in ${successfulVerticals.join(', ')} verticals`
    });
    return researchResults;
  }
  
  // If no results, fallback to mock data
  if (!hasResults) {
    console.warn('No results found from APIs, falling back to mock data');
    toast.info('Using demo data for research results', {
      description: 'No live data available at this time'
    });
    
    const mockResearchResults = generateMockResearchResults(
      normalizedInputs,
      selectedVerticals
    );
    
    // Use mock results
    Object.assign(researchResults, mockResearchResults);
  }
  
  console.log('Final results:', {
    dsp: researchResults.dspResults.length,
    radio: researchResults.radioResults.length,
    dj: researchResults.djResults.length,
    press: researchResults.pressResults.length
  });
  
  return researchResults;
}
