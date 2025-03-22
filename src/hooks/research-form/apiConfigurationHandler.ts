
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { callSongstatsApi } from '@/services/songstats/apiClient';

/**
 * Test specific Songstats API endpoints to verify connectivity
 */
export async function testSongstatsApi() {
  try {
    console.log('Testing Songstats API connection...');
    
    // Try different endpoint formats to account for API version differences
    // First try v2 health endpoint
    let testResult = await callSongstatsApi('v2/health');
    
    // If that fails, try v1 health
    if (!testResult) {
      testResult = await callSongstatsApi('health');
    }
    
    // If health endpoints fail, try a specific test with a popular track ID
    if (!testResult) {
      console.log('Testing with a specific track ID...');
      const testTrackId = '3Wrjm47oTz2sjIgck11l5e'; // Billie Eilish - bad guy
      
      // Try both v1 and v2 formats
      testResult = await callSongstatsApi('v2/tracks/spotify', { 
        id: testTrackId
      });
      
      if (!testResult) {
        testResult = await callSongstatsApi('tracks/spotify', { 
          id: testTrackId
        });
      }
    }
    
    // If we get any response, consider it a success
    if (testResult) {
      console.log('✅ API test successful!', testResult);
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
    
    if (apiKeyStatus.apiError) {
      console.warn('API key validation failed:', apiKeyStatus.apiError);
      toast.warning('Songstats API key may be invalid', {
        description: 'Using demo data as fallback'
      });
      // Continue with reduced confidence
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
