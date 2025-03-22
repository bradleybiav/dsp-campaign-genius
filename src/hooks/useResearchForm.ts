
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { PlaylistResult } from '@/components/ResultsTable';
import { normalizeInputs } from '@/utils/apiUtils';
import { getPlaylistPlacements, getRadioPlays, RadioResult } from '@/services/songstats';
import { getDjPlacements, DjResult } from '@/services/tracklistsService';
import { getPressResults, PressResult } from '@/services/pressService';
import { saveCampaign } from '@/services/supabaseService';
import { generateMockResults } from '@/utils/mockDataGenerator';

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
            console.log('DSP results:', results.length);
          })
          .catch(error => {
            console.error('Error fetching playlist placements:', error);
            toast.error('Failed to fetch playlist data');
          });
        researchPromises.push(dspPromise);
      }
      
      // Radio vertical
      if (formData.selectedVerticals.includes('radio')) {
        const radioPromise = getRadioPlays(normalized)
          .then(results => {
            researchResults.radioResults = results;
            console.log('Radio results:', results.length);
          })
          .catch(error => {
            console.error('Error fetching radio plays:', error);
            toast.error('Failed to fetch radio data');
          });
        researchPromises.push(radioPromise);
      }
      
      // DJ vertical
      if (formData.selectedVerticals.includes('dj')) {
        const djPromise = getDjPlacements(normalized)
          .then(results => {
            researchResults.djResults = results;
            console.log('DJ results:', results.length);
          })
          .catch(error => {
            console.error('Error fetching DJ placements:', error);
            toast.error('Failed to fetch DJ data');
          });
        researchPromises.push(djPromise);
      }
      
      // Press vertical
      if (formData.selectedVerticals.includes('press')) {
        const pressPromise = getPressResults(normalized)
          .then(results => {
            researchResults.pressResults = results;
            console.log('Press results:', results.length);
          })
          .catch(error => {
            console.error('Error fetching press results:', error);
            toast.error('Failed to fetch press data');
          });
        researchPromises.push(pressPromise);
      }
      
      // Wait for all research to complete
      await Promise.all(researchPromises);
      
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
        const apiKeyCheck = await fetch('/api/check-songstats-key');
        const apiKeyStatus = await apiKeyCheck.json();
        
        if (!apiKeyStatus.configured) {
          toast.error('Songstats API key is not configured', {
            description: 'Please check your Supabase Edge Function configuration'
          });
          setUsingMockData(true);
          
          // Generate mock data as fallback
          const mockResults = generateMockResults(formData.referenceInputs, formData.selectedVerticals);
          
          // Distribute mock results based on verticals
          researchResults.dspResults = mockResults.filter(r => r.vertical === 'dsp');
          researchResults.radioResults = mockResults.filter(r => r.vertical === 'radio') as unknown as RadioResult[];
          researchResults.djResults = mockResults.filter(r => r.vertical === 'dj') as unknown as DjResult[];
          researchResults.pressResults = mockResults.filter(r => r.vertical === 'press') as unknown as PressResult[];
          
          toast.warning('Using demo data for preview purposes', {
            description: 'To see real data, configure your Songstats API key in Supabase'
          });
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
};
