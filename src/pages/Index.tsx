
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import CampaignForm from '@/components/CampaignForm';
import FilterSection from '@/components/FilterSection';
import ResultsTable, { PlaylistResult } from '@/components/ResultsTable';
import { Separator } from '@/components/ui/separator';

// Mock data for placeholder results
const generateMockResults = (referenceInputs: string[]): PlaylistResult[] => {
  const mockPlaylists: PlaylistResult[] = [
    {
      id: '1',
      playlistName: 'Discover Weekly',
      curatorName: 'Spotify',
      followerCount: 13246789,
      lastUpdated: '2023-06-15T12:00:00Z',
      matchedInputs: [0, 2],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZEVXcDGlrEgKfUyi',
    },
    {
      id: '2',
      playlistName: 'Indie Chill',
      curatorName: 'Indie Sounds',
      followerCount: 8542,
      lastUpdated: '2023-06-01T12:00:00Z',
      matchedInputs: [1],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2Nc3B70tvx0',
    },
    {
      id: '3',
      playlistName: 'Fresh Finds',
      curatorName: 'Spotify',
      followerCount: 942876,
      lastUpdated: '2023-06-18T12:00:00Z',
      matchedInputs: [0, 3],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2pSTOxoPbx9',
    },
    {
      id: '4',
      playlistName: 'Alternative Mix',
      curatorName: 'Music Explorer',
      followerCount: 124587,
      lastUpdated: '2023-04-20T12:00:00Z',
      matchedInputs: [2],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWUVpAXiEPK8P',
    },
    {
      id: '5',
      playlistName: 'Today\'s Top Hits',
      curatorName: 'Spotify',
      followerCount: 31245789,
      lastUpdated: '2023-06-19T12:00:00Z',
      matchedInputs: [0, 1, 4],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    },
    {
      id: '6',
      playlistName: 'Underground Gems',
      curatorName: 'Indie Curator',
      followerCount: 5487,
      lastUpdated: '2023-05-10T12:00:00Z',
      matchedInputs: [1, 3],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4JAvHpjipBk',
    },
    {
      id: '7',
      playlistName: 'Viral Hits',
      curatorName: 'Trending Now',
      followerCount: 2456789,
      lastUpdated: '2023-06-14T12:00:00Z',
      matchedInputs: [4],
      playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2L6XfQRG0Z1',
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

const Index = () => {
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<PlaylistResult[]>([]);
  const [filterRecent, setFilterRecent] = useState(false);
  const [filterFollowers, setFilterFollowers] = useState(false);
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFormSubmit = (formData: {
    campaignName: string;
    referenceInputs: string[];
    selectedVerticals: string[];
  }) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResults = generateMockResults(formData.referenceInputs);
      setResults(mockResults);
      setShowResults(true);
      setLoading(false);
      toast.success('Research completed successfully');
      
      // Scroll to results
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <section className="mb-16">
            <CampaignForm onSubmit={handleFormSubmit} />
          </section>
          
          {(loading || showResults) && (
            <section ref={resultsRef} className="animate-slide-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium">Playlist Results</h2>
                <span className="text-sm text-muted-foreground">
                  {!loading && `Showing ${results.length} results`}
                </span>
              </div>
              
              <FilterSection
                filterRecent={filterRecent}
                onFilterRecentChange={setFilterRecent}
                filterFollowers={filterFollowers}
                onFilterFollowersChange={setFilterFollowers}
              />
              
              <ResultsTable
                results={results}
                filterRecent={filterRecent}
                filterFollowers={filterFollowers}
                loading={loading}
              />
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
