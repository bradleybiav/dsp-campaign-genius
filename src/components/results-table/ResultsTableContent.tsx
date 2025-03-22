
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';
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
import { PlaylistResult, ResultsTableContentProps, formatNumber } from './types';

const ResultsTableContent: React.FC<ResultsTableContentProps> = ({ results, loading }) => {
  if (results.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center flex-col space-y-2">
        <p className="text-muted-foreground">No results found.</p>
        <p className="text-sm text-muted-foreground/70">
          Try adjusting your filters or adding more reference tracks.
        </p>
      </div>
    );
  }

  return (
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
        {results.map((result) => (
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
        ))}
      </TableBody>
    </Table>
  );
};

export default ResultsTableContent;
