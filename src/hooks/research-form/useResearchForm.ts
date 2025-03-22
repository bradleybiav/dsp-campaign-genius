
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { normalizeInputs } from '@/utils/apiUtils';
import { saveCampaign } from '@/services/supabaseService';
import { FormData, ResearchResults } from './types';
import { executeResearch } from './requestHandlers';
import { generateMockResearchResults } from './mockDataHandler';
import { checkAPIConfiguration } from './requestHandlers';

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
      
      // Execute research for selected verticals
      const researchResults = await executeResearch(normalized, formData.selectedVerticals);
      
      // Check if we actually got any results
      const hasResults = 
        researchResults.dspResults.length > 0 ||
        researchResults.radioResults.length > 0 ||
        researchResults.djResults.length > 0 ||
        researchResults.pressResults.length > 0;
      
      // Only use mock data if we have no results at all
      if (!hasResults) {
        console.warn('No results found from APIs, checking API configuration');
        
        // Check if Songstats API key is properly configured
        const apiConfigured = await checkAPIConfiguration();
        
        if (!apiConfigured) {
          toast.error('Songstats API key is not configured', {
            description: 'Please check your Supabase Edge Function configuration'
          });
          setUsingMockData(true);
          
          // Generate mock data as fallback
          const mockResearchResults = generateMockResearchResults(
            formData.referenceInputs, 
            formData.selectedVerticals
          );
          
          // Use mock results
          Object.assign(researchResults, mockResearchResults);
        } else {
          // No results but API key is configured - likely no matches found
          toast.info('No matching results found', {
            description: 'Try different reference tracks or artists'
          });
        }
      }
      
      // Update results state
      setResults(researchResults);
      setShowResults(true);
      
      // Save campaign to Supabase
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
        toast.success(usingMockData 
          ? 'Campaign saved with demo data' 
          : 'Research completed and saved');
      } else {
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
