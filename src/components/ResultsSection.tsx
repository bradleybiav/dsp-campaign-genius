
import React from 'react';
import FilterSection from '@/components/FilterSection';
import ResultsTable, { PlaylistResult } from '@/components/ResultsTable';

interface ResultsSectionProps {
  results: PlaylistResult[];
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
  return (
    <section ref={resultsRef} className="animate-slide-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Playlist Results</h2>
        <span className="text-sm text-muted-foreground">
          {!loading && `Showing ${results.length} results`}
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
