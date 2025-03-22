
export interface PlaylistResult {
  id: string;
  playlistName: string;
  curatorName: string;
  followerCount: number;
  lastUpdated: string;
  matchedInputs: number[];
  playlistUrl: string;
  vertical: string;
}

export interface ResultsTableProps {
  results: {
    dsp: PlaylistResult[];
    radio: PlaylistResult[];
    dj: PlaylistResult[];
    press: PlaylistResult[];
  };
  filterRecent: boolean;
  followerThreshold: number;
  selectedVerticals: string[];
  loading?: boolean;
}

export interface ResultsTableContentProps {
  results: PlaylistResult[];
  loading?: boolean;
}

// Helper function to format numbers with commas
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Helper function to get color for a vertical
export const getVerticalColor = (vertical: string): string => {
  switch (vertical) {
    case 'dsp': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'radio': return 'bg-green-100 text-green-700 border-green-200';
    case 'dj': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'press': return 'bg-orange-100 text-orange-700 border-orange-200';
    default: return '';
  }
};

// Helper function to get background color for tab
export const getTabColor = (vertical: string): string => {
  switch (vertical) {
    case 'dsp': return 'data-[state=active]:bg-blue-50';
    case 'radio': return 'data-[state=active]:bg-green-50';
    case 'dj': return 'data-[state=active]:bg-purple-50';
    case 'press': return 'data-[state=active]:bg-orange-50';
    case 'all': return 'data-[state=active]:bg-gray-50';
    default: return '';
  }
};
