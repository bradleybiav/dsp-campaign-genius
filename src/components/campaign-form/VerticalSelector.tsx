
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

// Vertical options for the multi-select
const verticalOptions = [
  { label: 'DSP', value: 'dsp' },
  { label: 'Radio', value: 'radio' },
  { label: 'DJ', value: 'dj' },
  { label: 'Press', value: 'press' },
];

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
            <span className="truncate">
              {selectedVerticals.length === 0 
                ? "Select Verticals" 
                : `${selectedVerticals.length} selected`}
            </span>
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
                    <span>{option.label}</span>
                    <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                      selectedVerticals.includes(option.value) 
                        ? "bg-primary border-primary" 
                        : "opacity-50"
                    }`}>
                      {selectedVerticals.includes(option.value) && (
                        <Check className="h-3 w-3 text-white" />
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
