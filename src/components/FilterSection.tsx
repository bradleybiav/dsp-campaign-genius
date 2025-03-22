
import React from 'react';
import { 
  RecentFilterCheckbox, 
  FollowerThresholdFilter, 
  VerticalFilterBadges 
} from './filter-section';

interface FilterSectionProps {
  filterRecent: boolean;
  onFilterRecentChange: (checked: boolean) => void;
  followerThreshold: number;
  onFollowerThresholdChange: (value: number) => void;
  selectedVerticals: string[];
  onSelectedVerticalsChange: (verticals: string[]) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filterRecent,
  onFilterRecentChange,
  followerThreshold,
  onFollowerThresholdChange,
  selectedVerticals,
  onSelectedVerticalsChange,
}) => {
  return (
    <div className="flex flex-col gap-4 py-4 px-2 animate-slide-in mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
        <RecentFilterCheckbox 
          filterRecent={filterRecent} 
          onFilterRecentChange={onFilterRecentChange} 
        />
        
        <FollowerThresholdFilter 
          followerThreshold={followerThreshold} 
          onFollowerThresholdChange={onFollowerThresholdChange} 
        />
      </div>

      <VerticalFilterBadges 
        selectedVerticals={selectedVerticals} 
        onSelectedVerticalsChange={onSelectedVerticalsChange} 
      />
    </div>
  );
};

export default FilterSection;
