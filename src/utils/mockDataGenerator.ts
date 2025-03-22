
import { PlaylistResult } from '@/components/ResultsTable';

// Mock data for placeholder results
export const generateMockResults = (referenceInputs: string[], selectedVerticals: string[]): PlaylistResult[] => {
  const mockPlaylists: PlaylistResult[] = [
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
      playlistName: 'Alternative Rock Radio',
      curatorName: 'KEXP',
      followerCount: 124587,
      lastUpdated: '2023-04-20T12:00:00Z',
      matchedInputs: [2],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWUVpAXiEPK8P',
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
      playlistName: 'DJ Mix - Club Essentials',
      curatorName: 'DJ TrendSetter',
      followerCount: 75487,
      lastUpdated: '2023-05-10T12:00:00Z',
      matchedInputs: [1, 3],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4JAvHpjipBk',
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
      playlistName: 'NPR Music Discoveries',
      curatorName: 'NPR',
      followerCount: 347890,
      lastUpdated: '2023-06-12T12:00:00Z',
      matchedInputs: [0, 2],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2L6XfQRG0Z1',
      vertical: 'press',
    },
    {
      id: '9',
      playlistName: 'DJ Weekend Warmup',
      curatorName: 'DJ Beatmaster',
      followerCount: 128954,
      lastUpdated: '2023-06-16T12:00:00Z',
      matchedInputs: [1, 4],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2L6XfQRG0Z1',
      vertical: 'dj',
    },
    {
      id: '10',
      playlistName: 'Rolling Stone Essentials',
      curatorName: 'Rolling Stone',
      followerCount: 862145,
      lastUpdated: '2023-06-10T12:00:00Z',
      matchedInputs: [2, 3],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2L6XfQRG0Z1',
      vertical: 'press',
    },
    {
      id: '11',
      playlistName: 'KIIS FM Top 40',
      curatorName: 'KIIS FM',
      followerCount: 542178,
      lastUpdated: '2023-06-17T12:00:00Z',
      matchedInputs: [0, 4],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2L6XfQRG0Z1',
      vertical: 'radio',
    },
  ];

  // Filter out results with matchedInputs that don't have content
  return mockPlaylists.filter(playlist => {
    const validMatches = playlist.matchedInputs.filter(
      idx => idx < referenceInputs.length && referenceInputs[idx].trim() !== ''
    );
    return validMatches.length > 0;
  });
};
