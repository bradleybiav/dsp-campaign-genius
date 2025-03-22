
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { callSongstatsApi } from '@/services/songstats/apiClient';

/**
 * Test Songstats API connectivity using Enterprise API
 */
export async function testSongstatsApi() {
  try {
    console.log('Testing Songstats Enterprise API connection...');
    
    // Test with a known ISRC from a popular track
    const testISRC = "USIR20400274"; // Black Eyed Peas - Let's Get It Started
    
    // Try to get stats for the test ISRC
    const testResult = await callSongstatsApi('tracks/stats', { 
      isrc: testISRC, 
      with_playlists: "true" // Using string "true" instead of boolean true
    });
    
    if (testResult && !testResult.error && testResult.result === 'success') {
      console.log(`✅ Enterprise API test successful with ISRC ${testISRC}!`, testResult);
      return true;
    }
    
    console.error('❌ Enterprise API test failed', testResult);
    return false;
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
    
    // Call the Songstats check key edge function
    const { data: apiKeyStatus, error } = await supabase.functions.invoke('check-songstats-key');
    
    if (error) {
      console.error('API key check failed:', error);
      toast.error('Failed to check API configuration', {
        description: 'Using demo data for now'
      });
      return false;
    }
    
    console.log('API key configuration status:', apiKeyStatus);
    
    if (!apiKeyStatus?.configured) {
      console.warn('API key is not configured');
      toast.warning('Songstats API key is not set up', {
        description: 'Contact administrator to configure the API'
      });
      return false;
    }
    
    // Check if we have detailed API response info
    if (apiKeyStatus.apiResponseInfo && apiKeyStatus.apiResponseInfo.data) {
      console.log('API responded with data:', apiKeyStatus.apiResponseInfo.data);
      console.log('✅ Songstats API is properly configured');
      return true;
    }
    
    if (apiKeyStatus.apiError) {
      console.warn('API key validation failed:', apiKeyStatus.apiError);
      // Don't show error toast yet, we'll try additional tests
    }
    
    // Run an additional connectivity test to verify API access
    const apiTestPassed = await testSongstatsApi();
    
    if (!apiTestPassed) {
      console.warn('API connectivity test failed');
      toast.warning('Unable to connect to Songstats API', {
        description: 'Using demo data for now'
      });
      return false;
    }
    
    // API configuration appears valid
    console.log('✅ Songstats API is properly configured');
    return true;
  } catch (error) {
    console.error('Error checking API configuration:', error);
    toast.error('Error checking API configuration', {
      description: 'Using demo data for now'
    });
    return false;
  }
}
