
import React from 'react';
import Header from '@/components/Header';
import CampaignForm from '@/components/CampaignForm';
import ResultsSection from '@/components/ResultsSection';
import { useResearchForm } from '@/hooks/useResearchForm';
import { useResultsFilter } from '@/hooks/useResultsFilter';

const Index = () => {
  const {
    showResults,
    results,
    loading,
    resultsRef,
    usingMockData,
    handleFormSubmit
  } = useResearchForm();

  // Initialize the filter with DSP vertical selected by default
  const {
    filterRecent,
    setFilterRecent,
    followerThreshold,
    setFollowerThreshold,
    selectedFilterVerticals,
    setSelectedFilterVerticals,
    applyFilters
  } = useResultsFilter(['dsp']);
  
  // Process results through filters
  const filteredResults = showResults 
    ? applyFilters(
        results.dspResults, 
        results.radioResults, 
        results.djResults, 
        results.pressResults
      )
    : {
        dspResults: [],
        radioResults: [],
        djResults: [],
        pressResults: [],
        allResults: []
      };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <section className="mb-16">
            <CampaignForm 
              onSubmit={(formData) => {
                // Update filter verticals to match form selection
                setSelectedFilterVerticals(formData.selectedVerticals);
                // Submit the form data for processing
                handleFormSubmit(formData);
              }} 
            />
          </section>
          
          {(loading || showResults) && (
            <ResultsSection
              results={{
                dsp: filteredResults.dspResults,
                radio: filteredResults.radioResults,
                dj: filteredResults.djResults,
                press: filteredResults.pressResults
              }}
              loading={loading}
              filterRecent={filterRecent}
              onFilterRecentChange={setFilterRecent}
              followerThreshold={followerThreshold}
              onFollowerThresholdChange={setFollowerThreshold}
              selectedVerticals={selectedFilterVerticals}
              onSelectedVerticalsChange={setSelectedFilterVerticals}
              resultsRef={resultsRef}
              usingMockData={usingMockData}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
