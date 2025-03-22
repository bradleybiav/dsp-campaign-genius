
import { useState, useMemo } from 'react';
import { isAfter, parseISO, subDays } from 'date-fns';
import { PlaylistResult, RadioResult, DjResult, PressResult } from '@/components/results-table/types';

type AnyResult = PlaylistResult | RadioResult | DjResult | PressResult;

export function useResultsFilter(defaultVerticals: string[] = []) {
  const [filterRecent, setFilterRecent] = useState(false);
  const [followerThreshold, setFollowerThreshold] = useState(0);
  const [selectedFilterVerticals, setSelectedFilterVerticals] = useState<string[]>(defaultVerticals);

  const applyFilters = (
    dspResults: PlaylistResult[],
    radioResults: RadioResult[],
    djResults: DjResult[],
    pressResults: PressResult[]
  ) => {
    // Helper function to filter by date
    const isRecentEnough = (result: AnyResult): boolean => {
      if (!filterRecent) return true;
      
      const thirtyDaysAgo = subDays(new Date(), 30);
      let dateToCheck: Date;
      
      if ('lastUpdated' in result) {
        dateToCheck = parseISO(result.lastUpdated);
      } else if ('lastSpin' in result) {
        dateToCheck = parseISO(result.lastSpin);
      } else if ('date' in result) {
        dateToCheck = parseISO(result.date);
      } else {
        return false;
      }
      
      return isAfter(dateToCheck, thirtyDaysAgo);
    };

    // Helper function for follower threshold (only applies to playlists)
    const hasEnoughFollowers = (result: AnyResult): boolean => {
      if (followerThreshold <= 0) return true;
      return !('followerCount' in result) || result.followerCount >= followerThreshold;
    };

    // Helper function for vertical filtering
    const matchesSelectedVertical = (result: AnyResult): boolean => {
      if (selectedFilterVerticals.length === 0) return true;
      return selectedFilterVerticals.includes(result.vertical || '');
    };

    // Apply all filters to each result set
    const filteredDsp = dspResults.filter(result => 
      isRecentEnough(result) && hasEnoughFollowers(result) && matchesSelectedVertical(result)
    );
    
    const filteredRadio = radioResults.filter(result => 
      isRecentEnough(result) && hasEnoughFollowers(result) && matchesSelectedVertical(result)
    );
    
    const filteredDj = djResults.filter(result => 
      isRecentEnough(result) && hasEnoughFollowers(result) && matchesSelectedVertical(result)
    );
    
    const filteredPress = pressResults.filter(result => 
      isRecentEnough(result) && hasEnoughFollowers(result) && matchesSelectedVertical(result)
    );

    // Combine all results for the "All" tab
    const filteredAllResults = [
      ...filteredDsp,
      ...filteredRadio,
      ...filteredDj,
      ...filteredPress
    ];

    return {
      dspResults: filteredDsp,
      radioResults: filteredRadio,
      djResults: filteredDj,
      pressResults: filteredPress,
      allResults: filteredAllResults
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
}

export default useResultsFilter;
