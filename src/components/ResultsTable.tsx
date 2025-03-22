
import React from 'react';
import { ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isAfter, parseISO, subDays } from 'date-fns';

export interface PlaylistResult {
  id: string;
  playlistName: string;
  curatorName: string;
  followerCount: number;
  lastUpdated: string;
  matchedInputs: number[];
  playlistUrl: string;
}

interface ResultsTableProps {
  results: PlaylistResult[];
  filterRecent: boolean;
  filterFollowers: boolean;
  loading?: boolean;
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  filterRecent,
  filterFollowers,
  loading = false,
}) => {
  // Apply filters
  const filteredResults = results.filter(result => {
    if (filterRecent) {
      const thirtyDaysAgo = subDays(new Date(), 30);
      if (!isAfter(parseISO(result.lastUpdated), thirtyDaysAgo)) {
        return false;
      }
    }
    
    if (filterFollowers && result.followerCount < 10000) {
      return false;
    }
    
    return true;
  });

  if (loading) {
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
  }

  return (
    <div className="mt-4 relative overflow-hidden glass-panel subtle-shadow rounded-xl animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-medium">Playlist Name</TableHead>
            <TableHead className="font-medium">Curator Name</TableHead>
            <TableHead className="font-medium text-right">Followers</TableHead>
            <TableHead className="font-medium">Last Updated</TableHead>
            <TableHead className="font-medium">Matched Inputs</TableHead>
            <TableHead className="font-medium text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredResults.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <p className="text-muted-foreground">No results found.</p>
                  <p className="text-sm text-muted-foreground/70">
                    Try adjusting your filters or adding more reference tracks.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredResults.map((result) => (
              <TableRow 
                key={result.id}
                className="group transition-all-200"
              >
                <TableCell className="font-medium">
                  {result.playlistName}
                </TableCell>
                <TableCell>{result.curatorName}</TableCell>
                <TableCell className="text-right">
                  {formatNumber(result.followerCount)}
                </TableCell>
                <TableCell>
                  {format(parseISO(result.lastUpdated), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {result.matchedInputs.map((inputIdx) => (
                      <Badge key={inputIdx} variant="outline" className="text-xs">
                        #{inputIdx + 1}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="opacity-50 group-hover:opacity-100 transition-all-200"
                    onClick={() => window.open(result.playlistUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ResultsTable;
