
import { PlaylistResult, RadioResult, DjResult, PressResult } from '@/components/results-table/types';

// Mock data for placeholder results
export const generateMockResults = (referenceInputs: string[], selectedVerticals: string[]): Array<PlaylistResult | RadioResult | DjResult | PressResult> => {
  const mockResults: Array<PlaylistResult | RadioResult | DjResult | PressResult> = [
    {
      id: '1',
      playlistName: 'Discover Weekly',
      curatorName: 'Spotify',
      followerCount: 13246789,
      lastUpdated: '2023-06-15T12:00:00Z',
      matchedInputs: [0, 2],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZEVXcDGlrEgKfUyi',
      vertical: 'dsp',
    },
    {
      id: '2',
      playlistName: 'Indie Chill',
      curatorName: 'Indie Sounds',
      followerCount: 8542,
      lastUpdated: '2023-06-01T12:00:00Z',
      matchedInputs: [1],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2Nc3B70tvx0',
      vertical: 'dsp',
    },
    {
      id: '3',
      playlistName: 'Fresh Finds',
      curatorName: 'Spotify',
      followerCount: 942876,
      lastUpdated: '2023-06-18T12:00:00Z',
      matchedInputs: [0, 3],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2pSTOxoPbx9',
      vertical: 'dsp',
    },
    {
      id: '4',
      station: 'KEXP',
      show: 'Alternative Rock Radio',
      dj: 'DJ Rockstar',
      country: 'USA',
      lastSpin: '2023-04-20T12:00:00Z',
      matchedInputs: [2],
      airplayLink: 'https://example.com/kexp/show/12345',
      vertical: 'radio',
    },
    {
      id: '5',
      playlistName: 'Today\'s Top Hits',
      curatorName: 'Spotify',
      followerCount: 31245789,
      lastUpdated: '2023-06-19T12:00:00Z',
      matchedInputs: [0, 1, 4],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
      vertical: 'dsp',
    },
    {
      id: '6',
      dj: 'DJ TrendSetter',
      event: 'Club Essentials',
      location: 'Berlin, Germany',
      date: '2023-05-10T12:00:00Z',
      tracklistUrl: 'https://example.com/dj-trendsetter/events/club-essentials',
      matchedInputs: [1, 3],
      vertical: 'dj',
    },
    {
      id: '7',
      playlistName: 'Viral Hits',
      curatorName: 'Trending Now',
      followerCount: 2456789,
      lastUpdated: '2023-06-14T12:00:00Z',
      matchedInputs: [4],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2L6XfQRG0Z1',
      vertical: 'dsp',
    },
    {
      id: '8',
      outlet: 'NPR',
      writer: 'Music Journalist',
      articleTitle: 'NPR Music Discoveries',
      date: '2023-06-12T12:00:00Z', 
      link: 'https://example.com/npr/articles/music-discoveries',
      matchedInputs: [0, 2],
      vertical: 'press',
    },
    {
      id: '9',
      dj: 'DJ Beatmaster',
      event: 'Weekend Warmup',
      location: 'Miami, USA',
      date: '2023-06-16T12:00:00Z',
      tracklistUrl: 'https://example.com/dj-beatmaster/events/weekend-warmup',
      matchedInputs: [1, 4],
      vertical: 'dj',
    },
    {
      id: '10',
      outlet: 'Rolling Stone',
      writer: 'Music Critic',
      articleTitle: 'Rolling Stone Essentials',
      date: '2023-06-10T12:00:00Z',
      link: 'https://example.com/rolling-stone/articles/essentials',
      matchedInputs: [2, 3],
      vertical: 'press',
    },
    {
      id: '11',
      station: 'KIIS FM',
      show: 'Top 40 Countdown',
      dj: 'Radio Host',
      country: 'USA',
      lastSpin: '2023-06-17T12:00:00Z',
      matchedInputs: [0, 4],
      airplayLink: 'https://example.com/kiis-fm/shows/top-40',
      vertical: 'radio',
    },
  ];

  // Filter out results with matchedInputs that don't have content
  return mockResults.filter(result => {
    const validMatches = result.matchedInputs.filter(
      idx => idx < referenceInputs.length && referenceInputs[idx].trim() !== ''
    );
    return validMatches.length > 0 && selectedVerticals.includes(result.vertical);
  });
};
