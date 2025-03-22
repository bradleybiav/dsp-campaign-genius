
import { toast } from 'sonner';
import { NormalizedInput } from '@/utils/apiUtils';
import { getPlaylistPlacements } from '@/services/songstats';
import { getRadioPlays } from '@/services/songstats';
import { getDjPlacements } from '@/services/tracklistsService';
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
    toast.error('Songstats API key is not configured', {
      description: 'Using demo data for research results'
    });
    
    return generateMockResearchResults(normalizedInputs, selectedVerticals);
  }
  
  // Execute vertical-specific research based on selected verticals
  const researchPromises: Promise<void>[] = [];
  
  // DSP vertical
  if (selectedVerticals.includes('dsp')) {
    const dspPromise = getPlaylistPlacements(normalizedInputs)
      .then(results => {
        researchResults.dspResults = results;
        console.log('DSP results:', results.length);
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
    return researchResults;
  }
  
  console.log('Real API results found:', {
    dsp: researchResults.dspResults.length,
    radio: researchResults.radioResults.length,
    dj: researchResults.djResults.length,
    press: researchResults.pressResults.length
  });
  
  return researchResults;
}
