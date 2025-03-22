
import { useState } from 'react';
import type { PlaylistResult, RadioResult, DjResult, PressResult } from '@/components/results-table/types';

export interface FilteredResults {
  dspResults: PlaylistResult[];
  radioResults: RadioResult[];
  djResults: DjResult[];
  pressResults: PressResult[];
}

export const useResultsFilter = (initialVerticals: string[] = []) => {
  const [filterRecent, setFilterRecent] = useState(false);
  const [followerThreshold, setFollowerThreshold] = useState(0);
  const [selectedFilterVerticals, setSelectedFilterVerticals] = useState<string[]>(initialVerticals);

  // Apply filters to all result types
  const applyFilters = (
    dspResults: PlaylistResult[],
    radioResults: RadioResult[],
    djResults: DjResult[],
    pressResults: PressResult[]
  ): FilteredResults => {
    // Filter DSP results
    const filteredDspResults = dspResults.filter(result => {
      // Only include if vertical is selected
      if (!selectedFilterVerticals.includes('dsp')) return false;
      
      // Filter by follower threshold
      if (result.followerCount < followerThreshold) return false;
      
      // Filter by recency if enabled
      if (filterRecent) {
        const lastUpdated = new Date(result.lastUpdated);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        if (lastUpdated < threeMonthsAgo) return false;
      }
      
      return true;
    });

    // Filter Radio results
    const filteredRadioResults = radioResults.filter(result => {
      // Only include if vertical is selected
      if (!selectedFilterVerticals.includes('radio')) return false;
      
      // Filter by recency if enabled
      if (filterRecent) {
        const lastSpin = new Date(result.lastSpin);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        if (lastSpin < threeMonthsAgo) return false;
      }
      
      return true;
    });

    // Filter DJ results
    const filteredDjResults = djResults.filter(result => {
      // Only include if vertical is selected
      if (!selectedFilterVerticals.includes('dj')) return false;
      
      // Filter by recency if enabled
      if (filterRecent) {
        const date = new Date(result.date);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        if (date < threeMonthsAgo) return false;
      }
      
      return true;
    });

    // Filter Press results
    const filteredPressResults = pressResults.filter(result => {
      // Only include if vertical is selected
      if (!selectedFilterVerticals.includes('press')) return false;
      
      // Filter by recency if enabled
      if (filterRecent) {
        const date = new Date(result.date);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        if (date < threeMonthsAgo) return false;
      }
      
      return true;
    });

    return {
      dspResults: filteredDspResults,
      radioResults: filteredRadioResults,
      djResults: filteredDjResults,
      pressResults: filteredPressResults
    };
  };

  return {
    filterRecent,
    setFilterRecent,
    followerThreshold,
    setFollowerThreshold,
    selectedFilterVerticals,
    setSelectedFilterVerticals,
    applyFilters
  };
};
