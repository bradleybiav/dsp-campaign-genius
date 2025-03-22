
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { PlaylistResult } from '@/components/ResultsTable';
import { generateMockResults } from '@/utils/mockDataGenerator';

export interface FormData {
  campaignName: string;
  referenceInputs: string[];
  selectedVerticals: string[];
}

export const useResearchForm = () => {
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<PlaylistResult[]>([]);
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFormSubmit = (formData: FormData) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResults = generateMockResults(formData.referenceInputs, formData.selectedVerticals);
      setResults(mockResults);
      setShowResults(true);
      setLoading(false);
      toast.success('Research completed successfully');
      
      // Scroll to results
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }, 1500);
  };

  return {
    showResults,
    results,
    loading,
    resultsRef,
    handleFormSubmit
  };
};
