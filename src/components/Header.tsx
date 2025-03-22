
import React from 'react';
import { MusicIcon } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-8 flex items-center justify-between">
      <div className="flex items-center space-x-3 animate-fade-in">
        <div className="rounded-xl p-2 bg-primary/5 transition-all-200">
          <MusicIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-medium tracking-tight">DSP Campaign Research</h1>
          <p className="text-sm text-muted-foreground">Discover your next playlist placement</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
