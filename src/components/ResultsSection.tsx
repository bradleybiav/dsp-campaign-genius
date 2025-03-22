
import React from 'react';
import FilterSection from '@/components/FilterSection';
import ResultsTable from '@/components/ResultsTable';
import type { PlaylistResult, RadioResult, DjResult, PressResult } from '@/components/results-table/types';

interface ResultsSectionProps {
  results: {
    dsp: PlaylistResult[];
    radio: RadioResult[];
    dj: DjResult[];
    press: PressResult[];
  };
  loading: boolean;
  filterRecent: boolean;
  onFilterRecentChange: (checked: boolean) => void;
  followerThreshold: number;
  onFollowerThresholdChange: (value: number) => void;
  selectedVerticals: string[];
  onSelectedVerticalsChange: (verticals: string[]) => void;
  resultsRef: React.RefObject<HTMLDivElement>;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  results,
  loading,
  filterRecent,
  onFilterRecentChange,
  followerThreshold,
  onFollowerThresholdChange,
  selectedVerticals,
  onSelectedVerticalsChange,
  resultsRef
}) => {
  // Calculate total results count
  const totalResults = results.dsp.length + results.radio.length + results.dj.length + results.press.length;

  return (
    <section ref={resultsRef} className="animate-slide-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Playlist Results</h2>
        <span className="text-sm text-muted-foreground">
          {!loading && `Showing ${totalResults} results`}
        </span>
      </div>
      
      <FilterSection
        filterRecent={filterRecent}
        onFilterRecentChange={onFilterRecentChange}
        followerThreshold={followerThreshold}
        onFollowerThresholdChange={onFollowerThresholdChange}
        selectedVerticals={selectedVerticals}
        onSelectedVerticalsChange={onSelectedVerticalsChange}
      />
      
      <ResultsTable
        results={results}
        filterRecent={filterRecent}
        followerThreshold={followerThreshold}
        selectedVerticals={selectedVerticals}
        loading={loading}
      />
    </section>
  );
};

export default ResultsSection;
