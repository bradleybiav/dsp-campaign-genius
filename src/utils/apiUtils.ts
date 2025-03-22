
import { toast } from 'sonner';

// Types for normalized inputs
export interface NormalizedInput {
  id: string;
  type: 'spotify_track' | 'spotify_artist' | '1001tracklists' | 'youtube' | 'isrc';
  originalUrl: string;
  inputIndex: number;
}

/**
 * Extract identifier from various URL formats
 */
export const extractIdentifier = (url: string): NormalizedInput | null => {
  try {
    // ISRC pattern (CC-XXX-YY-NNNNN, but often without hyphens)
    const isrcPattern = /^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/;
    if (isrcPattern.test(url)) {
      return {
        id: url,
        type: 'isrc',
        originalUrl: url,
        inputIndex: -1 // Will be set by the caller
      };
    }

    // Spotify URL pattern: https://open.spotify.com/(track|artist|album)/[a-zA-Z0-9]{22}
    const spotifyMatch = url.match(/https:\/\/open\.spotify\.com\/(track|artist|album)\/([a-zA-Z0-9]{22})/);
    if (spotifyMatch) {
      return {
        id: spotifyMatch[2],
        type: spotifyMatch[1] === 'track' ? 'spotify_track' : 'spotify_artist',
        originalUrl: url,
        inputIndex: -1 // Will be set by the caller
      };
    }

    // 1001Tracklists URL pattern: https://www.1001tracklists.com/tracklist/[id]
    const tracklists1001Match = url.match(/https:\/\/www\.1001tracklists\.com\/tracklist\/([a-zA-Z0-9]+)/);
    if (tracklists1001Match) {
      return {
        id: tracklists1001Match[1],
        type: '1001tracklists',
        originalUrl: url,
        inputIndex: -1 // Will be set by the caller
      };
    }

    // YouTube URL pattern: https://www.youtube.com/watch?v=[id]
    const youtubeMatch = url.match(/https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      return {
        id: youtubeMatch[1],
        type: 'youtube',
        originalUrl: url,
        inputIndex: -1 // Will be set by the caller
      };
    }

    return null;
  } catch (error) {
    console.error('Error extracting identifier:', error);
    return null;
  }
};

/**
 * Normalize multiple input URLs
 */
export const normalizeInputs = (inputs: string[]): NormalizedInput[] => {
  return inputs
    .map((url, index) => {
      if (!url.trim()) return null;
      
      const normalizedInput = extractIdentifier(url);
      if (!normalizedInput) return null;
      
      normalizedInput.inputIndex = index;
      return normalizedInput;
    })
    .filter((input): input is NormalizedInput => input !== null);
};

/**
 * Generic API fetcher with error handling
 */
export const fetchWithTimeout = async (
  url: string, 
  options: RequestInit = {}, 
  timeout = 10000
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(id);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};
