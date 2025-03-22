
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
    
    // First check if the key exists
    if (!apiKeyStatus?.configured) {
      console.warn('API key is not configured');
      toast.warning('Songstats API key is not set up', {
        description: 'Please contact administrator to configure the API key in Supabase'
      });
      return false;
    }
    
    // Check if any endpoints are accessible
    if (apiKeyStatus.apiConnectivity === 'Connected') {
      console.log('✅ Songstats API is properly configured and accessible');
      
      // But show warning if some endpoints failed
      if (!apiKeyStatus.allTestsSuccessful) {
        console.warn('⚠️ Some API endpoints are not accessible', 
          apiKeyStatus.apiTestResults?.filter(r => !r.success));
        
        toast.warning('Some Songstats API features may be limited', {
          description: 'Not all API endpoints are accessible with your current API key'
        });
      }
      
      return true;
    }
    
    // If we get here, the API key format looks good but no endpoints are accessible
    console.error('❌ Songstats API key format is valid but endpoints are not accessible');
    
    // Display recommendations if available
    if (apiKeyStatus.recommendations && apiKeyStatus.recommendations.length > 0) {
      const recommendations = apiKeyStatus.recommendations.join('. ');
      toast.error('Songstats API key validation failed', {
        description: recommendations
      });
    } else {
      toast.error('Unable to connect to Songstats API', {
        description: 'Your API key may be inactive or have incorrect permissions'
      });
    }
    
    // Run an additional connectivity test as a final check
    const apiTestPassed = await testSongstatsApi();
    
    if (apiTestPassed) {
      console.log('✅ Additional API test passed, proceeding with real data');
      return true;
    }
    
    console.warn('❌ All API connectivity tests failed, using demo data');
    return false;
  } catch (error) {
    console.error('Error checking API configuration:', error);
    toast.error('Error checking API configuration', {
      description: 'Using demo data for now'
    });
    return false;
  }
}
