
import React from 'react';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FollowerThresholdFilterProps {
  followerThreshold: number;
  onFollowerThresholdChange: (value: number) => void;
}

// Available follower thresholds for filtering
export const followerOptions = [
  { label: 'No minimum', value: 0 },
  { label: '1,000+ followers', value: 1000 },
  { label: '5,000+ followers', value: 5000 },
  { label: '10,000+ followers', value: 10000 },
  { label: '50,000+ followers', value: 50000 },
  { label: '100,000+ followers', value: 100000 },
];

const FollowerThresholdFilter: React.FC<FollowerThresholdFilterProps> = ({
  followerThreshold,
  onFollowerThresholdChange
}) => {
  return (
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
  );
};

export default FollowerThresholdFilter;
