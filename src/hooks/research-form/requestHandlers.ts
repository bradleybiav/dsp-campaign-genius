
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
  const failedVerticals: string[] = [];
  
  // DSP vertical
  if (selectedVerticals.includes('dsp')) {
    // Filter inputs for DSP research (both track and artist URLs are valid)
    const dspInputs = normalizedInputs.filter(input => 
      input.type === 'spotify_track' || input.type === 'isrc');
    
    console.log(`Filtered ${dspInputs.length} inputs for DSP research`);
    
    if (dspInputs.length > 0) {
      const dspPromise = getPlaylistPlacements(dspInputs)
        .then(results => {
          researchResults.dspResults = results;
          console.log('DSP results:', results.length);
          if (results.length > 0) successfulVerticals.push('dsp');
          else if (results.length === 0) failedVerticals.push('dsp');
        })
        .catch(error => {
          failedVerticals.push('dsp');
          showServiceError('Playlist', error);
        });
      researchPromises.push(dspPromise);
    } else {
      console.warn('No valid inputs for DSP research');
      failedVerticals.push('dsp');
    }
  }
  
  // Radio vertical
  if (selectedVerticals.includes('radio')) {
    // Filter inputs for Radio research (only track URLs and ISRCs are valid)
    const radioInputs = normalizedInputs.filter(input => 
      input.type === 'spotify_track' || input.type === 'isrc');
    
    console.log(`Filtered ${radioInputs.length} inputs for Radio research`);
    
    if (radioInputs.length > 0) {
      const radioPromise = getRadioPlays(radioInputs)
        .then(results => {
          researchResults.radioResults = results;
          console.log('Radio results:', results.length);
          if (results.length > 0) successfulVerticals.push('radio');
          else if (results.length === 0) failedVerticals.push('radio');
        })
        .catch(error => {
          failedVerticals.push('radio');
          showServiceError('Radio', error);
        });
      researchPromises.push(radioPromise);
    } else {
      console.warn('No valid inputs for Radio research');
      failedVerticals.push('radio');
    }
  }
  
  // Skip DJ and Press as requested
  
  // Wait for all research to complete
  await Promise.all(researchPromises);
  
  // Check if we actually got any results
  const hasResults = 
    researchResults.dspResults.length > 0 ||
    researchResults.radioResults.length > 0;
  
  // Show which verticals succeeded and which failed
  if (hasResults) {
    console.log('Live data retrieved for verticals:', successfulVerticals);
    if (failedVerticals.length > 0) {
      toast.success('Research partially completed', {
        description: `Found data in ${successfulVerticals.join(', ')} verticals. No data for ${failedVerticals.join(', ')}.`
      });
    } else {
      toast.success('Research completed successfully', {
        description: `Found data in ${successfulVerticals.join(', ')} verticals`
      });
    }
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
