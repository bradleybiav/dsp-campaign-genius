
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { verticalOptions } from './campaign-form/VerticalSelector';
import { Badge } from './ui/badge';

interface FilterSectionProps {
  filterRecent: boolean;
  onFilterRecentChange: (checked: boolean) => void;
  followerThreshold: number;
  onFollowerThresholdChange: (value: number) => void;
  selectedVerticals: string[];
  onSelectedVerticalsChange: (verticals: string[]) => void;
}

// Available follower thresholds for filtering
const followerOptions = [
  { label: 'No minimum', value: 0 },
  { label: '1,000+ followers', value: 1000 },
  { label: '5,000+ followers', value: 5000 },
  { label: '10,000+ followers', value: 10000 },
  { label: '50,000+ followers', value: 50000 },
  { label: '100,000+ followers', value: 100000 },
];

const FilterSection: React.FC<FilterSectionProps> = ({
  filterRecent,
  onFilterRecentChange,
  followerThreshold,
  onFollowerThresholdChange,
  selectedVerticals,
  onSelectedVerticalsChange,
}) => {
  const toggleVertical = (value: string) => {
    if (selectedVerticals.includes(value)) {
      onSelectedVerticalsChange(selectedVerticals.filter(v => v !== value));
    } else {
      onSelectedVerticalsChange([...selectedVerticals, value]);
    }
  };

  // Helper function to get color for a vertical
  const getVerticalColor = (value: string): string => {
    const option = verticalOptions.find(opt => opt.value === value);
    return option?.color || '';
  };

  return (
    <div className="flex flex-col gap-4 py-4 px-2 animate-slide-in mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
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
          <Label
            htmlFor="followerThreshold"
            className="text-sm transition-all-200"
          >
            Minimum followers:
          </Label>
          <Select
            value={followerThreshold.toString()}
            onValueChange={(value) => onFollowerThresholdChange(Number(value))}
          >
            <SelectTrigger id="followerThreshold" className="w-[180px]">
              <SelectValue placeholder="Select minimum followers" />
            </SelectTrigger>
            <SelectContent>
              {followerOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <Label className="text-sm transition-all-200">Filter by vertical:</Label>
        <div className="flex flex-wrap gap-2">
          {verticalOptions.map((option) => {
            const isSelected = selectedVerticals.includes(option.value);
            return (
              <Badge
                key={option.value}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1 ${isSelected ? option.color : "hover:bg-secondary"}`}
                onClick={() => toggleVertical(option.value)}
              >
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${option.color.replace('text-', 'bg-').replace('-700', '-500')}`}></span>
                  {option.label}
                </span>
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
