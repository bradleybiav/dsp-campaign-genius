
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FilterSectionProps {
  filterRecent: boolean;
  onFilterRecentChange: (checked: boolean) => void;
  filterFollowers: boolean;
  onFilterFollowersChange: (checked: boolean) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filterRecent,
  onFilterRecentChange,
  filterFollowers,
  onFilterFollowersChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 py-4 px-2 animate-slide-in">
      <div className="flex items-center space-x-3">
        <Checkbox
          id="filterRecent"
          checked={filterRecent}
          onCheckedChange={onFilterRecentChange}
          className="transition-all-200"
        />
        <Label
          htmlFor="filterRecent"
          className="text-sm cursor-pointer transition-all-200"
        >
          Only show playlists updated in the last 30 days
        </Label>
      </div>
      
      <div className="flex items-center space-x-3">
        <Checkbox
          id="filterFollowers"
          checked={filterFollowers}
          onCheckedChange={onFilterFollowersChange}
          className="transition-all-200"
        />
        <Label
          htmlFor="filterFollowers"
          className="text-sm cursor-pointer transition-all-200"
        >
          Only show playlists with more than 10,000 followers
        </Label>
      </div>
    </div>
  );
};

export default FilterSection;
