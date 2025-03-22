
import React from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { verticalOptions } from '../campaign-form/VerticalSelector';

interface VerticalFilterBadgesProps {
  selectedVerticals: string[];
  onSelectedVerticalsChange: (verticals: string[]) => void;
}

const VerticalFilterBadges: React.FC<VerticalFilterBadgesProps> = ({
  selectedVerticals,
  onSelectedVerticalsChange
}) => {
  const toggleVertical = (value: string) => {
    if (selectedVerticals.includes(value)) {
      onSelectedVerticalsChange(selectedVerticals.filter(v => v !== value));
    } else {
      onSelectedVerticalsChange([...selectedVerticals, value]);
    }
  };

  return (
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
  );
};

export default VerticalFilterBadges;
