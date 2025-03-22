
import React from 'react';
import { Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import SpotifyUrlInput from './SpotifyUrlInput';

interface ReferenceInputsSectionProps {
  referenceInputs: string[];
  onReferenceInputChange: (index: number, value: string) => void;
  validateSpotifyUrl: (url: string) => boolean;
  maxInputs?: number;
}

const ReferenceInputsSection: React.FC<ReferenceInputsSectionProps> = ({
  referenceInputs,
  onReferenceInputChange,
  validateSpotifyUrl,
  maxInputs = 10
}) => {
  const filledInputCount = referenceInputs.filter(input => input.trim() !== '').length;
  
  return (
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
          {filledInputCount} / {maxInputs}
        </Badge>
      </div>

      <div className="grid gap-4">
        {Array.from({ length: maxInputs }).map((_, index) => (
          <SpotifyUrlInput
            key={index}
            value={referenceInputs[index] || ''}
            onChange={(value) => onReferenceInputChange(index, value)}
            isValid={validateSpotifyUrl(referenceInputs[index] || '')}
          />
        ))}
      </div>
    </div>
  );
};

export default ReferenceInputsSection;
