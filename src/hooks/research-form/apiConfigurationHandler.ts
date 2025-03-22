
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { callSongstatsApi } from '@/services/songstats/apiClient';

/**
 * Test specific Songstats API endpoints to verify connectivity
 */
export async function testSongstatsApi() {
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

/**
 * Check if the Songstats API is properly configured
 */
export async function checkAPIConfiguration(): Promise<boolean> {
  try {
    console.log('Checking Songstats API configuration...');
    
    // Call the Songstats check key edge function directly using Supabase client
    const { data: apiKeyStatus, error } = await supabase.functions.invoke('check-songstats-key');
    
    if (error) {
      console.error('API key check failed:', error);
      toast.error('Failed to check Songstats API key', {
        description: error.message || 'Error connecting to Edge Function'
      });
      return false;
    }
    
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
