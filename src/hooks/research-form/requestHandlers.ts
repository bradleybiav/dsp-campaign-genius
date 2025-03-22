
import { toast } from 'sonner';
import { NormalizedInput } from '@/utils/apiUtils';
import { getPlaylistPlacements } from '@/services/songstats';
import { getRadioPlays } from '@/services/songstats';
import { getDjPlacements } from '@/services/tracklistsService';
import { getPressResults } from '@/services/pressService';
import type { ResearchResults } from './types';
import { callSongstatsApi } from '@/services/songstats/apiClient';

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

// Test specific Songstats API endpoints
async function testSongstatsApi() {
  try {
    console.log('Testing Songstats API connection...');
    
    // Step 1: Test the API version endpoint
    console.log('Step 1: Testing API version endpoint');
    try {
      const versionCheck = await callSongstatsApi('version', {});
      console.log('Version check result:', versionCheck);
    } catch (err) {
      console.warn('Version check failed, but continuing with specific endpoint tests');
    }
    
    // Step 2: Test the mappings endpoint with a known track ID
    console.log('Step 2: Testing mappings endpoint with a known track');
    const testTrackId = '3Wrjm47oTz2sjIgck11l5e'; // Billie Eilish - bad guy
    const testTrackResult = await callSongstatsApi('mappings/spotify', { 
      id: testTrackId,
      type: 'track'
    });
    
    console.log('Mappings endpoint test result:', testTrackResult);
    
    if (testTrackResult && testTrackResult.songstats_id) {
      console.log('✅ Mappings endpoint test successful!');
      
      // Step 3: If mapping was successful, try to get track details
      const trackId = testTrackResult.songstats_id;
      console.log('Step 3: Testing track details endpoint');
      const trackDetails = await callSongstatsApi(`tracks/${trackId}`, {});
      console.log('Track details test result:', trackDetails);
    } else {
      console.error('❌ Mappings endpoint test failed - invalid response format:', testTrackResult);
      return false;
    }
    
    // Step 4: Test artist mapping
    console.log('Step 4: Testing artist mapping');
    const testArtistId = '4dpARuHxo51G3z768sgnrY'; // Adele
    const testArtistResult = await callSongstatsApi('mappings/spotify', {
      id: testArtistId,
      type: 'artist'
    });
    
    console.log('Artist mapping test result:', testArtistResult);
    
    // Return overall status
    const apiWorking = !!(testTrackResult && testTrackResult.songstats_id);
    console.log(`Songstats API testing complete. Working: ${apiWorking}`);
    return apiWorking;
    
  } catch (error) {
    console.error('❌ Songstats API test failed with error:', error);
    return false;
  }
}

export async function executeResearch(
  normalizedInputs: NormalizedInput[],
  selectedVerticals: string[]
): Promise<ResearchResults> {
  // Test Songstats API connection first
  const apiConnected = await testSongstatsApi();
  if (!apiConnected) {
    console.warn('Songstats API connection test failed, research results may be limited');
    toast.error('Unable to connect to Songstats API', {
      description: 'The API may be unavailable or the endpoint structure may have changed. Check Edge Function logs for details.'
    });
  }
  
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
    
    // First check if the API key is configured
    const apiKeyCheck = await fetch('/api/check-songstats-key');
    
    if (!apiKeyCheck.ok) {
      console.error('API key check failed with status:', apiKeyCheck.status);
      return false;
    }
    
    const apiKeyStatus = await apiKeyCheck.json();
    console.log('API key configuration status:', apiKeyStatus);
    
    if (!apiKeyStatus.configured) {
      console.error('API key is not configured or empty. Length:', apiKeyStatus.apiKeyLength);
      toast.error('Songstats API key is not properly configured', {
        description: 'Please check your API key in Supabase Edge Function secrets'
      });
      return false;
    }
    
    // Next attempt to make a test call to verify the API is working
    const apiTest = await testSongstatsApi();
    if (!apiTest) {
      toast.error('Songstats API connection test failed', {
        description: 'The API may be unavailable or the URL structure may have changed'
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking API configuration:', error);
    return false;
  }
}
