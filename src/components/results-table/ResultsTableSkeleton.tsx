
import React from 'react';

const ResultsTableSkeleton: React.FC = () => {
  return (
    <div className="mt-4 relative overflow-hidden glass-panel subtle-shadow rounded-xl animate-fade-in">
      {Array.from({ length: 5 }).map((_, index) => (
        <div 
          key={index}
          className="animate-shimmer h-16 border-b border-border/30"
        ></div>
      ))}
    </div>
  );
};

export default ResultsTableSkeleton;
