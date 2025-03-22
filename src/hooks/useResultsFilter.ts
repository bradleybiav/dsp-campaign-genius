
import { useState } from 'react';

export const useResultsFilter = (initialVerticals: string[] = []) => {
  const [filterRecent, setFilterRecent] = useState(false);
  const [followerThreshold, setFollowerThreshold] = useState(0);
  const [selectedFilterVerticals, setSelectedFilterVerticals] = useState<string[]>(initialVerticals);

  return {
    filterRecent,
    setFilterRecent,
    followerThreshold,
    setFollowerThreshold,
    selectedFilterVerticals,
    setSelectedFilterVerticals
  };
};
