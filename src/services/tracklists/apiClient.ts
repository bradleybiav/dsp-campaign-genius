
import { TracklistsApiResponse } from './types';
import { showServiceError } from '@/hooks/research-form/errorHandler';

// Using import.meta.env for Vite's environment variables
const TRACKLISTS_API_KEY = import.meta.env.VITE_TRACKLISTS_API_KEY || '';

/**
 * Call the 1001Tracklists API to search for tracklists containing a track
 */
export async function searchTracklistsByTrack(isrc: string): Promise<TracklistsApiResponse> {
  try {
    console.log(`Searching 1001Tracklists for ISRC: ${isrc}`);
    
    // Check if API key is set
    if (!TRACKLISTS_API_KEY) {
      console.log('1001Tracklists API key not configured - using mock data');
      return {
        success: false,
        error: "API key not configured"
      };
    }
    
    try {
      // Call the Supabase Edge Function to proxy the request to 1001Tracklists API
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tracklists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          path: 'search',
          params: { isrc }
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error(`Tracklists API returned ${response.status}: ${error}`);
        throw new Error(`API returned ${response.status}: ${error}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('1001Tracklists API error:', data.error);
        return {
          success: false,
          error: data.error
        };
      }
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error calling 1001Tracklists API:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  } catch (error) {
    console.error('Error searching 1001Tracklists:', error);
    showServiceError('1001Tracklists', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
