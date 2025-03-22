
import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

// Vertical options for the multi-select with color indicators
const verticalOptions = [
  { label: 'DSP', value: 'dsp', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Radio', value: 'radio', color: 'bg-green-100 text-green-700 border-green-200' },
  { label: 'DJ', value: 'dj', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: 'Press', value: 'press', color: 'bg-orange-100 text-orange-700 border-orange-200' },
];

// Helper function to get color for a specific vertical
const getVerticalColor = (value: string): string => {
  const option = verticalOptions.find(opt => opt.value === value);
  return option?.color || '';
};

interface VerticalSelectorProps {
  selectedVerticals: string[];
  toggleVertical: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VerticalSelector: React.FC<VerticalSelectorProps> = ({
  selectedVerticals,
  toggleVertical,
  open,
  onOpenChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="verticals" className="text-sm font-medium">Verticals</Label>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between transition-all-200"
            id="verticals"
          >
            <div className="flex items-center gap-2 truncate">
              {selectedVerticals.length === 0 
                ? <span>Select Verticals</span> 
                : (
                  <div className="flex flex-wrap gap-1.5 max-w-[90%]">
                    {selectedVerticals.map(value => (
                      <span 
                        key={value} 
                        className={`px-2 py-0.5 text-xs rounded-full ${getVerticalColor(value)}`}
                      >
                        {verticalOptions.find(opt => opt.value === value)?.label}
                      </span>
                    ))}
                  </div>
                )
              }
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="center">
          <Command>
            <CommandInput placeholder="Search verticals..." />
            <CommandList>
              <CommandEmpty>No verticals found.</CommandEmpty>
              <CommandGroup>
                {verticalOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleVertical(option.value)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className={`w-3 h-3 rounded-full ${option.color.split(' ')[0]}`} 
                        aria-hidden="true"
                      />
                      <span>{option.label}</span>
                    </div>
                    <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                      selectedVerticals.includes(option.value) 
                        ? `bg-primary border-primary ${option.color.includes('text-') ? '' : 'text-white'}` 
                        : "opacity-50"
                    }`}>
                      {selectedVerticals.includes(option.value) && (
                        <Check className="h-3 w-3" />
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default VerticalSelector;
export { verticalOptions };
