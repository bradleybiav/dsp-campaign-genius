
import React, { useState } from 'react';
import { Check, ChevronDown, ExternalLink, Info, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Vertical options for the multi-select
const verticalOptions = [
  { label: 'DSP', value: 'dsp' },
  { label: 'Radio', value: 'radio' },
  { label: 'DJ', value: 'dj' },
  { label: 'Press', value: 'press' },
];

interface CampaignFormProps {
  onSubmit: (formData: {
    campaignName: string;
    referenceInputs: string[];
    selectedVerticals: string[];
  }) => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ onSubmit }) => {
  const [campaignName, setCampaignName] = useState('');
  const [referenceInputs, setReferenceInputs] = useState<string[]>(Array(10).fill(''));
  const [selectedVerticals, setSelectedVerticals] = useState<string[]>(['dsp']);
  const [openVerticalPopover, setOpenVerticalPopover] = useState(false);

  const handleReferenceInputChange = (index: number, value: string) => {
    const newInputs = [...referenceInputs];
    newInputs[index] = value;
    setReferenceInputs(newInputs);
  };

  const toggleVertical = (value: string) => {
    setSelectedVerticals(
      selectedVerticals.includes(value)
        ? selectedVerticals.filter(v => v !== value)
        : [...selectedVerticals, value]
    );
  };

  const validateSpotifyUrl = (url: string): boolean => {
    if (!url) return true; // Empty inputs are allowed
    const spotifyUrlPattern = /^https:\/\/open\.spotify\.com\/(track|artist|album)\/[a-zA-Z0-9]{22}(\?si=[a-zA-Z0-9]{16})?$/;
    return spotifyUrlPattern.test(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!campaignName.trim()) {
      toast.error('Please enter a campaign name');
      return;
    }

    const filledInputs = referenceInputs.filter(input => input.trim() !== '');
    if (filledInputs.length === 0) {
      toast.error('Please enter at least one Spotify URL');
      return;
    }

    // Validate all filled inputs
    const invalidUrls = filledInputs.filter(url => !validateSpotifyUrl(url));
    if (invalidUrls.length > 0) {
      toast.error('Please enter valid Spotify URLs');
      return;
    }

    if (selectedVerticals.length === 0) {
      toast.error('Please select at least one vertical');
      return;
    }

    onSubmit({
      campaignName,
      referenceInputs,
      selectedVerticals,
    });
  };

  return (
    <Card className="glass-panel subtle-shadow transition-all-200 animate-fade-in">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="campaign-name" className="text-sm font-medium">
                Campaign Name
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <p className="text-sm text-muted-foreground">
                    Enter a descriptive name for your campaign to easily identify it later.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            <Input
              id="campaign-name"
              placeholder="e.g., Summer Release 2023"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="transition-all-200"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium">Reference Tracks & Artists</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4">
                    <p className="text-sm text-muted-foreground">
                      Enter Spotify URLs for tracks or artists you want to target for your campaign. 
                      You can leave some inputs empty.
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
              <Badge variant="outline" className="text-xs">
                {referenceInputs.filter(input => input.trim() !== '').length} / 10
              </Badge>
            </div>

            <div className="grid gap-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="spotify-url-input-wrapper relative flex items-center">
                  <Input
                    placeholder={`https://open.spotify.com/track/... or artist/...`}
                    value={referenceInputs[index]}
                    onChange={(e) => handleReferenceInputChange(index, e.target.value)}
                    className={`pr-9 transition-all-200 spotify-url-input ${
                      referenceInputs[index] && !validateSpotifyUrl(referenceInputs[index])
                        ? 'border-red-400/50 focus-visible:ring-red-400/20'
                        : referenceInputs[index] && validateSpotifyUrl(referenceInputs[index])
                        ? 'border-green-400/50 focus-visible:ring-green-400/20'
                        : ''
                    }`}
                    pattern="^https:\/\/open\.spotify\.com\/(track|artist|album)\/[a-zA-Z0-9]{22}(\?si=[a-zA-Z0-9]{16})?$"
                  />
                  <div className="absolute right-0 pr-3 flex gap-1">
                    {referenceInputs[index] && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full opacity-70 hover:opacity-100"
                        onClick={() => handleReferenceInputChange(index, '')}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 opacity-0 spotify-url-status-icon valid transition-opacity" />
                      <X className="h-4 w-4 text-red-500 opacity-0 spotify-url-status-icon invalid transition-opacity" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verticals" className="text-sm font-medium">Verticals</Label>
            <Popover open={openVerticalPopover} onOpenChange={setOpenVerticalPopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openVerticalPopover}
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

          <div className="pt-4">
            <Separator className="mb-6" />
            <Button 
              type="submit" 
              className="w-full transition-all-200 py-6 rounded-xl"
            >
              Run Research
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CampaignForm;
