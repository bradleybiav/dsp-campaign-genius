
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
      
      // Track if all API calls failed
      let allApiFailed = true;
      
      // Execute vertical-specific research based on selected verticals
      const researchPromises: Promise<void>[] = [];
      
      // DSP vertical
      if (formData.selectedVerticals.includes('dsp')) {
        const dspPromise = getPlaylistPlacements(normalized)
          .then(results => {
            if (results.length > 0) {
              allApiFailed = false;
            }
            researchResults.dspResults = results;
          });
        researchPromises.push(dspPromise);
      }
      
      // Radio vertical
      if (formData.selectedVerticals.includes('radio')) {
        const radioPromise = getRadioPlays(normalized)
          .then(results => {
            if (results.length > 0) {
              allApiFailed = false;
            }
            researchResults.radioResults = results;
          });
        researchPromises.push(radioPromise);
      }
      
      // DJ vertical
      if (formData.selectedVerticals.includes('dj')) {
        const djPromise = getDjPlacements(normalized)
          .then(results => {
            if (results.length > 0) {
              allApiFailed = false;
            }
            researchResults.djResults = results;
          });
        researchPromises.push(djPromise);
      }
      
      // Press vertical
      if (formData.selectedVerticals.includes('press')) {
        const pressPromise = getPressResults(normalized)
          .then(results => {
            if (results.length > 0) {
              allApiFailed = false;
            }
            researchResults.pressResults = results;
          });
        researchPromises.push(pressPromise);
      }
      
      // Wait for all research to complete
      await Promise.all(researchPromises);
      
      // If all API calls failed or returned empty results, use mock data as fallback
      if (allApiFailed) {
        console.log('Using mock data as fallback');
        toast.warning('Unable to reach Songstats API. Using demo data instead.', {
          description: 'Check your API key or try again later.'
        });
        
        const mockResults = generateMockResults(formData.referenceInputs, formData.selectedVerticals);
        
        // Distribute mock results based on verticals
        researchResults.dspResults = mockResults.filter(r => r.vertical === 'dsp');
        researchResults.radioResults = mockResults.filter(r => r.vertical === 'radio') as unknown as RadioResult[];
        researchResults.djResults = mockResults.filter(r => r.vertical === 'dj') as unknown as DjResult[];
        researchResults.pressResults = mockResults.filter(r => r.vertical === 'press') as unknown as PressResult[];
        
        setUsingMockData(true);
      }
      
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
        toast.success(usingMockData 
          ? 'Demo data loaded and saved to database' 
          : 'Research completed and saved to database');
      } else {
        toast.success(usingMockData 
          ? 'Demo data loaded successfully' 
          : 'Research completed successfully');
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
      
      // Use mock data as last resort fallback
      const mockResults = generateMockResults(formData.referenceInputs, formData.selectedVerticals);
      setResults({
        dspResults: mockResults.filter(r => r.vertical === 'dsp'),
        radioResults: mockResults.filter(r => r.vertical === 'radio') as unknown as RadioResult[],
        djResults: mockResults.filter(r => r.vertical === 'dj') as unknown as DjResult[],
        pressResults: mockResults.filter(r => r.vertical === 'press') as unknown as PressResult[]
      });
      setShowResults(true);
      setUsingMockData(true);
      toast.warning('Unable to reach Songstats API. Using demo data instead.', {
        description: 'Check your API key or try again later.'
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
