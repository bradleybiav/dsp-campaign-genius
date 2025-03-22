
import React from 'react';
import { Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';

interface CampaignNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

const CampaignNameInput: React.FC<CampaignNameInputProps> = ({
  value,
  onChange
}) => {
  return (
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="transition-all-200"
        required
      />
    </div>
  );
};

export default CampaignNameInput;
