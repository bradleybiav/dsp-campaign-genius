
import React, { useState, useRef } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

interface SpotifyUrlExample {
  type: string;
  name: string;
  url: string;
}

// Example Spotify URLs and ISRCs for testing
export const EXAMPLE_SPOTIFY_URLS: SpotifyUrlExample[] = [
  { type: 'Track', name: 'Bad Guy - Billie Eilish', url: 'https://open.spotify.com/track/2Fxmhks0bxGSBdJ92vM42m' },
  { type: 'Artist', name: 'Dua Lipa', url: 'https://open.spotify.com/artist/6M2wZ9GZgrQXHCFfjv46we' },
  { type: 'ISRC', name: 'Covex - What U Need', url: 'QZSPN2529568' },
  { type: 'ISRC', name: 'SIDEPIECE & Barnacle Boi', url: 'QT47L2500001' },
  { type: 'ISRC', name: 'Zen Freeman', url: 'QM24S2500595' },
  { type: 'ISRC', name: 'Lumia - Paris (Ami)', url: 'QT3F42426045' },
  { type: 'ISRC', name: 'ASHRR - 20/20 Vision', url: 'GBEWY2100216' },
  { type: 'ISRC', name: 'WhoMadeWho', url: 'QM4TX2517190' }
];

interface SpotifyUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isValid: boolean;
  examples?: SpotifyUrlExample[];
}

const SpotifyUrlInput: React.FC<SpotifyUrlInputProps> = ({
  value,
  onChange,
  placeholder = 'https://open.spotify.com/track/... or artist/...',
  isValid,
  examples = EXAMPLE_SPOTIFY_URLS
}) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleExampleSelect = (url: string) => {
    onChange(url);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  // Determine status classes based on validation state
  const getInputClasses = () => {
    if (!value) return '';
    
    return !isValid
      ? 'border-red-400/50 focus-visible:ring-red-400/20'
      : 'border-green-400/50 focus-visible:ring-green-400/20';
  };

  return (
    <div className="spotify-url-input-wrapper relative">
      <div className="relative flex items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              type="button"
              variant="outline" 
              size="icon"
              className="absolute left-0 h-full rounded-r-none border-r-0 bg-muted/40"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-2 text-xs text-muted-foreground font-medium">
              Example Spotify URLs for testing
            </div>
            <div className="max-h-72 overflow-auto">
              {examples.map((example, index) => (
                <button
                  key={index}
                  className="w-full flex flex-col items-start px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                  onClick={() => handleExampleSelect(example.url)}
                >
                  <div className="font-medium">{example.name}</div>
                  <div className="text-xs text-muted-foreground truncate w-full">
                    {example.url}
                  </div>
                  <span className="text-xs px-1.5 py-0.5 bg-muted rounded-full mt-1">
                    {example.type}
                  </span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pl-9 pr-9 transition-all-200 spotify-url-input ${getInputClasses()}`}
          pattern="^https:\/\/open\.spotify\.com\/(track|artist|album)\/[a-zA-Z0-9]{22}(\?si=[a-zA-Z0-9]{16})?$"
          ref={inputRef}
        />
        
        <div className="absolute right-0 pr-3 flex gap-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full opacity-70 hover:opacity-100"
              onClick={handleClear}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          
          <div className="flex items-center">
            {value && (
              isValid ? (
                <Check className="h-4 w-4 text-green-500 transition-opacity" />
              ) : (
                <X className="h-4 w-4 text-red-500 transition-opacity" />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotifyUrlInput;
