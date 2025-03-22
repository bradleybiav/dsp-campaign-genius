
import { TracklistsApiResponse } from './types';
import { showServiceError } from '@/hooks/research-form/errorHandler';
import { toast } from 'sonner';

// Using import.meta.env for Vite's environment variables
const TRACKLISTS_API_KEY = import.meta.env.VITE_TRACKLISTS_API_KEY || '';

/**
 * Call the 1001Tracklists API to search for tracklists containing a track
 */
export async function searchTracklistsByTrack(isrc: string): Promise<TracklistsApiResponse> {
  try {
    console.log(`Searching 1001Tracklists for ISRC: ${isrc}`);
    
    // Check if environment is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.error('Supabase configuration missing');
      return {
        success: false,
        error: "Supabase configuration missing"
      };
    }
    
    // Call the Supabase Edge Function to proxy the request to 1001Tracklists API
    try {
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
        const errorText = await response.text();
        console.error(`1001Tracklists API returned ${response.status}: ${errorText}`);
        
        if (response.status === 404) {
          toast.error('1001Tracklists search endpoint not found', {
            description: 'Please check your Supabase edge function configuration'
          });
        } else {
          toast.error(`1001Tracklists API error (${response.status})`, {
            description: 'There was a problem connecting to the tracklists service'
          });
        }
        
        return {
          success: false,
          error: `API returned ${response.status}: ${errorText}`
        };
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('1001Tracklists API error:', data.error);
        
        if (data.error.includes('API key not configured')) {
          toast.warning('1001Tracklists API key not configured', {
            description: 'Using mock data instead'
          });
        }
        
        return {
          success: false,
          error: data.error
        };
      }
      
      // Check for empty response
      if (!data.tracklists || data.tracklists.length === 0) {
        console.log(`No tracklists found for ISRC: ${isrc}`);
        return {
          success: true,
          data: { tracklists: [] }
        };
      }
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error calling 1001Tracklists API:', error);
      
      toast.error('Error connecting to 1001Tracklists', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      
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
