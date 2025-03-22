
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ResultsTableContent from './ResultsTableContent';
import ResultsTableSkeleton from './ResultsTableSkeleton';
import { useResultsFilter } from './ResultsFilter';
import { ResultsTableProps, getTabColor, getVerticalColor } from './types';

const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  filterRecent,
  followerThreshold,
  selectedVerticals,
  loading = false,
}) => {
  const { filteredAllResults, filteredResults } = useResultsFilter({
    results,
    filterRecent,
    followerThreshold,
    selectedVerticals
  });

  if (loading) {
    return <ResultsTableSkeleton />;
  }

  // Group results by vertical for tabs
  const verticals = ['dsp', 'radio', 'dj', 'press'];
  
  const activeVerticals = verticals.filter(vertical => 
    selectedVerticals.length === 0 || selectedVerticals.includes(vertical)
  );
  
  // Set default active tab to the first non-empty vertical
  const firstNonEmptyVertical = activeVerticals.find(vertical => 
    filteredResults[vertical as keyof typeof filteredResults].length > 0
  ) || 'all';
  
  // Track result counts for display
  const resultCounts = {
    all: filteredAllResults.length,
    dsp: filteredResults.dsp.length,
    radio: filteredResults.radio.length,
    dj: filteredResults.dj.length,
    press: filteredResults.press.length
  };

  // If there are no results across any vertical
  if (resultCounts.all === 0) {
    return (
      <div className="mt-4 relative overflow-hidden glass-panel subtle-shadow rounded-xl animate-fade-in p-8">
        <div className="flex flex-col items-center justify-center h-32 space-y-2">
          <p className="text-muted-foreground">No results found.</p>
          <p className="text-sm text-muted-foreground/70">
            Try adjusting your filters or adding more reference tracks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 relative overflow-hidden glass-panel subtle-shadow rounded-xl animate-fade-in">
      <Tabs defaultValue={firstNonEmptyVertical} className="w-full">
        <TabsList className="w-full bg-muted/50 rounded-t-xl rounded-b-none border-b p-0">
          <TabsTrigger 
            value="all" 
            className={`flex-1 rounded-none ${getTabColor('all')}`}
          >
            All Results ({resultCounts.all})
          </TabsTrigger>
          
          {activeVerticals.map(vertical => (
            <TabsTrigger 
              key={vertical}
              value={vertical}
              className={`flex-1 rounded-none ${getTabColor(vertical)}`}
              disabled={resultCounts[vertical as keyof typeof resultCounts] === 0}
            >
              <div className="flex items-center gap-2">
                <Badge className={`${getVerticalColor(vertical)} w-2 h-2 p-0 rounded-full`} />
                {vertical.toUpperCase()} ({resultCounts[vertical as keyof typeof resultCounts]})
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all" className="pt-0 mt-0">
          <ResultsTableContent results={filteredAllResults} />
        </TabsContent>
        
        {activeVerticals.map(vertical => (
          <TabsContent key={vertical} value={vertical} className="pt-0 mt-0">
            <ResultsTableContent 
              results={filteredResults[vertical as keyof typeof filteredResults]} 
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ResultsTable;
