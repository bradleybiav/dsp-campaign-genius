
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { normalizeInputs } from '@/utils/apiUtils';
import { saveCampaign } from '@/services/supabaseService';
import type { FormData, ResearchResults } from './types';
import { executeResearch } from './requestHandlers';

export function useResearchForm() {
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
  const [usingMockData, setUsingMockData] = useState(false);

  const handleFormSubmit = async (formData: FormData) => {
    setLoading(true);
    setUsingMockData(false);
    
    try {
      // Normalize inputs
      const normalized = normalizeInputs(formData.referenceInputs);
      
      if (normalized.length === 0) {
        toast.error('No valid inputs found');
        setLoading(false);
        return;
      }
      
      console.log('Normalized inputs:', normalized);
      console.log('Selected verticals:', formData.selectedVerticals);
      
      // Execute research with normalized inputs
      const researchResults = await executeResearch(normalized, formData.selectedVerticals);
      
      // Check if we're using mock data
      const isMockData = 
        researchResults.dspResults.some(r => r.id.includes('mock')) ||
        researchResults.radioResults.some(r => r.id.includes('mock')) ||
        researchResults.djResults.some(r => r.id.includes('mock')) ||
        researchResults.pressResults.some(r => r.id.includes('mock'));
      
      setUsingMockData(isMockData);
      
      // Update results state
      setResults(researchResults);
      setShowResults(true);
      
      // Save campaign to Supabase
      try {
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
          toast.success(isMockData 
            ? 'Campaign saved with demo data' 
            : 'Research completed and saved');
        } else {
          toast.error('Failed to save campaign to database');
        }
      } catch (saveError) {
        console.error('Error saving campaign:', saveError);
        toast.error('Failed to save campaign', {
          description: saveError.message || 'Database error occurred'
        });
      }
      
      // Scroll to results
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('Error in research:', error);
      toast.error('Error conducting research', {
        description: error.message || 'Please try again later'
      });
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
    usingMockData,
    handleFormSubmit
  };
}
