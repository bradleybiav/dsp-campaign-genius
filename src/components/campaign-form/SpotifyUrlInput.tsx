
import React from 'react';
import { Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SpotifyUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isValid: boolean;
}

const SpotifyUrlInput: React.FC<SpotifyUrlInputProps> = ({
  value,
  onChange,
  placeholder = 'https://open.spotify.com/track/... or artist/...',
  isValid
}) => {
  return (
    <div className="spotify-url-input-wrapper relative flex items-center">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pr-9 transition-all-200 spotify-url-input ${
          value && !isValid
            ? 'border-red-400/50 focus-visible:ring-red-400/20'
            : value && isValid
            ? 'border-green-400/50 focus-visible:ring-green-400/20'
            : ''
        }`}
        pattern="^https:\/\/open\.spotify\.com\/(track|artist|album)\/[a-zA-Z0-9]{22}(\?si=[a-zA-Z0-9]{16})?$"
      />
      <div className="absolute right-0 pr-3 flex gap-1">
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full opacity-70 hover:opacity-100"
            onClick={() => onChange('')}
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
  );
};

export default SpotifyUrlInput;
