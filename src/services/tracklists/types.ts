
/**
 * DJ result interface matching the expected output
 */
export interface DjResult {
  id: string;
  dj: string;
  event: string;
  location: string;
  date: string;
  matchedInputs: number[];
  tracklistUrl: string;
  vertical: 'dj';
}

/**
 * Interface for the 1001Tracklists API response
 */
export interface TracklistsApiResponse {
  success: boolean;
  data?: {
    tracklists: Array<{
      id: string;
      dj: string;
      name: string;
      venue: string;
      date: string;
      url: string;
    }>;
  };
  error?: string;
}
