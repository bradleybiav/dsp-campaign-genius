
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { callSongstatsApi } from '@/services/songstats/apiClient';

/**
 * Test specific Songstats API endpoints to verify connectivity
 */
export async function testSongstatsApi() {
  try {
    console.log('Testing Songstats API connection...');
    
    // Try these endpoints in order
    const endpointsToTest = [
      { path: 'me', description: 'account info' },
      { path: 'health', description: 'health check' },
      { path: 'users/current', description: 'current user' },
      { path: 'tracks/top', params: { limit: 1 }, description: 'top tracks' }
    ];
    
    for (const endpoint of endpointsToTest) {
      console.log(`Testing ${endpoint.description} endpoint: ${endpoint.path}`);
      const testResult = await callSongstatsApi(endpoint.path, endpoint.params || {});
      
      if (testResult && !testResult.error) {
        console.log(`✅ API test successful with ${endpoint.description}!`, testResult);
        return true;
      }
      
      console.log(`${endpoint.description} test failed, trying next endpoint...`);
    }
    
    // If we get this far, try a specific track ID test as last resort
    console.log('Testing with a specific track ID...');
    const testTrackId = '3Wrjm47oTz2sjIgck11l5e'; // Billie Eilish - bad guy
    
    const trackResult = await callSongstatsApi('tracks/spotify', { 
      id: testTrackId
    });
    
    if (trackResult && !trackResult.error) {
      console.log('✅ API test successful with track lookup!', trackResult);
      return true;
    }
    
    console.error('❌ All API tests failed');
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
