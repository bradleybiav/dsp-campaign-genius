
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import CampaignNameInput from './campaign-form/CampaignNameInput';
import ReferenceInputsSection from './campaign-form/ReferenceInputsSection';
import VerticalSelector from './campaign-form/VerticalSelector';
import CampaignFormFooter from './campaign-form/CampaignFormFooter';
import { validateSpotifyUrl } from './campaign-form/util/validationUtils';
import { Button } from './ui/button';
import { Beaker } from 'lucide-react';

// Test data for quick population - now with real ISRCs from the image
const TEST_DATA = {
  name: "ISRCs Campaign " + new Date().toLocaleString(),
  references: [
    "QZSPN2529568", // Covex
    "QT47L2500001", // SIDEPIECE & Barnacle Boi
    "QM24S2500595", // Zen Freeman
    "QT3F42426045", // Lumia Nocito
    "GBEWY2100216", // ASHRR - 20/20 Vision
    "QM4TX2517190", // WhoMadeWho
    "QZS642541674", // STRAWBRY
    "QM4TX2517420", // Notre Dame
    "USZ4V2500091", // Malóne - Get Me There
    "USUS12500114"  // Amal Nemer
  ],
  verticals: ["dsp", "radio", "dj", "press"]
};

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
      referenceInputs: referenceInputs.filter(url => url.trim() !== ''),
      selectedVerticals,
    });
  };

  // Fill form with test data
  const populateTestData = () => {
    setCampaignName(TEST_DATA.name);
    
    const newInputs = [...Array(10).fill('')];
    TEST_DATA.references.forEach((url, index) => {
      if (index < 10) newInputs[index] = url;
    });
    
    setReferenceInputs(newInputs);
    setSelectedVerticals(TEST_DATA.verticals);
    
    toast.success('Test data populated');
  };

  // Run the research with the populated data
  const runTest = () => {
    if (!campaignName.trim()) {
      setCampaignName(TEST_DATA.name);
    }
    
    const filledInputs = referenceInputs.filter(input => input.trim() !== '');
    if (filledInputs.length === 0) {
      const newInputs = [...Array(10).fill('')];
      TEST_DATA.references.forEach((url, index) => {
        if (index < 10) newInputs[index] = url;
      });
      setReferenceInputs(newInputs);
    }
    
    if (selectedVerticals.length === 0) {
      setSelectedVerticals(TEST_DATA.verticals);
    }
    
    // Submit after a short delay to ensure state updates
    setTimeout(() => {
      onSubmit({
        campaignName: campaignName || TEST_DATA.name,
        referenceInputs: referenceInputs.filter(url => url.trim() !== '') || TEST_DATA.references,
        selectedVerticals: selectedVerticals.length ? selectedVerticals : TEST_DATA.verticals,
      });
      
      toast.success('Test research submitted');
    }, 100);
  };

  return (
    <Card className="glass-panel subtle-shadow transition-all-200 animate-fade-in">
      <CardContent className="p-8">
        <div className="flex justify-end gap-2 mb-4">
          <Button 
            onClick={populateTestData}
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Beaker className="h-4 w-4" />
            Populate Test Data
          </Button>
          <Button 
            onClick={runTest}
            type="button"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Beaker className="h-4 w-4" />
            Run Test
          </Button>
        </div>
        
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
