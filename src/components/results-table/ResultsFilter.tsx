
import React from 'react';
import { isAfter, parseISO, subDays } from 'date-fns';
import { PlaylistResult } from './types';

interface ResultsFilterProps {
  results: {
    dsp: PlaylistResult[];
    radio: PlaylistResult[];
    dj: PlaylistResult[];
    press: PlaylistResult[];
  };
  filterRecent: boolean;
  followerThreshold: number;
  selectedVerticals: string[];
}

export const useResultsFilter = ({
  results,
  filterRecent,
  followerThreshold,
  selectedVerticals,
}: ResultsFilterProps) => {
  // Apply filters to all results
  const filteredAllResults = [
    ...results.dsp,
    ...results.radio,
    ...results.dj,
    ...results.press
  ].filter(result => {
    if (filterRecent) {
      const thirtyDaysAgo = subDays(new Date(), 30);
      if (!isAfter(parseISO(result.lastUpdated), thirtyDaysAgo)) {
        return false;
      }
    }
    
    if (followerThreshold > 0 && result.followerCount < followerThreshold) {
      return false;
    }
    
    if (selectedVerticals.length > 0 && !selectedVerticals.includes(result.vertical)) {
      return false;
    }
    
    return true;
  });

  // Apply filters to each vertical
  const applyFiltersToVertical = (verticalResults: PlaylistResult[]) => {
    return verticalResults.filter(result => {
      if (filterRecent) {
        const thirtyDaysAgo = subDays(new Date(), 30);
        if (!isAfter(parseISO(result.lastUpdated), thirtyDaysAgo)) {
          return false;
        }
      }
      if (followerThreshold > 0 && result.followerCount < followerThreshold) {
        return false;
      }
      if (selectedVerticals.length > 0 && !selectedVerticals.includes(result.vertical)) {
        return false;
      }
      return true;
    });
  };

  const filteredResults = {
    dsp: applyFiltersToVertical(results.dsp),
    radio: applyFiltersToVertical(results.radio),
    dj: applyFiltersToVertical(results.dj),
    press: applyFiltersToVertical(results.press)
  };

  return {
    filteredAllResults,
    filteredResults
  };
};

export default useResultsFilter;
