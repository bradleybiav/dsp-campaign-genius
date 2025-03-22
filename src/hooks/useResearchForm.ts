
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { PlaylistResult } from '@/components/ResultsTable';
import { normalizeInputs } from '@/utils/apiUtils';
import { getPlaylistPlacements, getRadioPlays, RadioResult } from '@/services/songstatsService';
import { getDjPlacements, DjResult } from '@/services/tracklistsService';
import { getPressResults, PressResult } from '@/services/pressService';
import { saveCampaign } from '@/services/supabaseService';

export interface FormData {
  campaignName: string;
  referenceInputs: string[];
  selectedVerticals: string[];
}

export interface ResearchResults {
  dspResults: PlaylistResult[];
  radioResults: RadioResult[];
  djResults: DjResult[];
  pressResults: PressResult[];
}

export const useResearchForm = () => {
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<ResearchResults>({
    dspResults: [],
    radioResults: [],
    djResults: [],
    pressResults: []
  });
  const [loading, setLoading] = useState(false);
  const [savedCampaignId, setSavedCampaignId] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFormSubmit = async (formData: FormData) => {
    setLoading(true);
    
    try {
      // Normalize inputs
      const normalized = normalizeInputs(formData.referenceInputs);
      
      if (normalized.length === 0) {
        toast.error('No valid inputs found');
        setLoading(false);
        return;
      }
      
      console.log('Normalized inputs:', normalized);
      
      // Create an object to store results for each vertical
      const researchResults: ResearchResults = {
        dspResults: [],
        radioResults: [],
        djResults: [],
        pressResults: []
      };
      
      // Execute vertical-specific research based on selected verticals
      const researchPromises: Promise<void>[] = [];
      
      // DSP vertical
      if (formData.selectedVerticals.includes('dsp')) {
        const dspPromise = getPlaylistPlacements(normalized)
          .then(results => {
            researchResults.dspResults = results;
          });
        researchPromises.push(dspPromise);
      }
      
      // Radio vertical
      if (formData.selectedVerticals.includes('radio')) {
        const radioPromise = getRadioPlays(normalized)
          .then(results => {
            researchResults.radioResults = results;
          });
        researchPromises.push(radioPromise);
      }
      
      // DJ vertical
      if (formData.selectedVerticals.includes('dj')) {
        const djPromise = getDjPlacements(normalized)
          .then(results => {
            researchResults.djResults = results;
          });
        researchPromises.push(djPromise);
      }
      
      // Press vertical
      if (formData.selectedVerticals.includes('press')) {
        const pressPromise = getPressResults(normalized)
          .then(results => {
            researchResults.pressResults = results;
          });
        researchPromises.push(pressPromise);
      }
      
      // Wait for all research to complete
      await Promise.all(researchPromises);
      
      // Update results state
      setResults(researchResults);
      setShowResults(true);
      
      // Save campaign to Supabase - this uses the refactored function
      const campaignId = await saveCampaign(
        {
          name: formData.campaignName,
          referenceInputs: formData.referenceInputs,
          selectedVerticals: formData.selectedVerticals
        },
        normalized,
        researchResults
      );
      
      if (campaignId) {
        setSavedCampaignId(campaignId);
        toast.success('Research completed and saved to database');
      } else {
        toast.success('Research completed successfully');
        toast.error('Failed to save campaign to database');
      }
      
      // Scroll to results
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('Error in research:', error);
      toast.error('Error conducting research');
    } finally {
      setLoading(false);
    }
  };

  return {
    showResults,
    results,
    loading,
    resultsRef,
    savedCampaignId,
    handleFormSubmit
  };
};
