
import React from 'react';
import { isAfter, parseISO, subDays } from 'date-fns';
import { PlaylistResult, RadioResult, DjResult, PressResult } from './types';

interface ResultsFilterProps {
  results: {
    dsp: PlaylistResult[];
    radio: RadioResult[];
    dj: DjResult[];
    press: PressResult[];
  };
  filterRecent: boolean;
  followerThreshold: number;
  selectedVerticals: string[];
}

type AnyResult = PlaylistResult | RadioResult | DjResult | PressResult;

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
  ].filter((result: AnyResult) => {
    // Check date field based on result type
    if (filterRecent) {
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
      
      if (!isAfter(dateToCheck, thirtyDaysAgo)) {
        return false;
      }
    }
    
    // Check follower threshold (only for playlist results)
    if ('followerCount' in result && followerThreshold > 0 && result.followerCount < followerThreshold) {
      return false;
    }
    
    // Check selected verticals
    if (selectedVerticals.length > 0 && !selectedVerticals.includes(result.vertical || '')) {
      return false;
    }
    
    return true;
  });

  // Apply filters to each vertical type
  const applyFiltersToVertical = <T extends AnyResult>(verticalResults: T[], verticalType: string) => {
    return verticalResults.filter(result => {
      if (selectedVerticals.length > 0 && !selectedVerticals.includes(verticalType)) {
        return false;
      }
      
      if (filterRecent) {
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
        
        if (!isAfter(dateToCheck, thirtyDaysAgo)) {
          return false;
        }
      }
      
      if ('followerCount' in result && followerThreshold > 0 && result.followerCount < followerThreshold) {
        return false;
      }
      
      return true;
    });
  };

  const filteredResults = {
    dsp: applyFiltersToVertical(results.dsp, 'dsp'),
    radio: applyFiltersToVertical(results.radio, 'radio'),
    dj: applyFiltersToVertical(results.dj, 'dj'),
    press: applyFiltersToVertical(results.press, 'press')
  };

  return {
    filteredAllResults,
    filteredResults
  };
};

export default useResultsFilter;
