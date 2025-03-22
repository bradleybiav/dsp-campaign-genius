
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const CampaignFormFooter: React.FC = () => {
  return (
    <div className="pt-4">
      <Separator className="mb-6" />
      <Button 
        type="submit" 
        className="w-full transition-all-200 py-6 rounded-xl"
      >
        Run Research
      </Button>
    </div>
  );
};

export default CampaignFormFooter;
