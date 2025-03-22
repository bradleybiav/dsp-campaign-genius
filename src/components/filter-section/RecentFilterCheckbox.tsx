
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface RecentFilterCheckboxProps {
  filterRecent: boolean;
  onFilterRecentChange: (checked: boolean) => void;
}

const RecentFilterCheckbox: React.FC<RecentFilterCheckboxProps> = ({
  filterRecent,
  onFilterRecentChange
}) => {
  return (
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
  );
};

export default RecentFilterCheckbox;
