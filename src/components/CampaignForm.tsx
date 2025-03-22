
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import CampaignNameInput from './campaign-form/CampaignNameInput';
import ReferenceInputsSection from './campaign-form/ReferenceInputsSection';
import VerticalSelector from './campaign-form/VerticalSelector';
import CampaignFormFooter from './campaign-form/CampaignFormFooter';
import { validateSpotifyUrl } from './campaign-form/util/validationUtils';

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
          <CampaignNameInput 
            value={campaignName}
            onChange={setCampaignName}
          />

          <ReferenceInputsSection
            referenceInputs={referenceInputs}
            onReferenceInputChange={handleReferenceInputChange}
            validateSpotifyUrl={validateSpotifyUrl}
          />

          <VerticalSelector
            selectedVerticals={selectedVerticals}
            toggleVertical={toggleVertical}
            open={openVerticalPopover}
            onOpenChange={setOpenVerticalPopover}
          />

          <CampaignFormFooter />
        </form>
      </CardContent>
    </Card>
  );
};

export default CampaignForm;
