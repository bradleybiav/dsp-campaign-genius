
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
import { ResultsTableContentProps, formatNumber } from './types';

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
          <TableHead className="font-medium">Name</TableHead>
          <TableHead className="font-medium">Creator</TableHead>
          <TableHead className="font-medium text-right">Metric</TableHead>
          <TableHead className="font-medium">Date</TableHead>
          <TableHead className="font-medium">Matched Inputs</TableHead>
          <TableHead className="font-medium text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((result) => {
          // Determine fields based on result type
          let name = '';
          let creator = '';
          let metric = '';
          let date = '';
          let link = '';
          
          if ('playlistName' in result) {
            // PlaylistResult
            name = result.playlistName;
            creator = result.curatorName;
            metric = formatNumber(result.followerCount);
            date = format(parseISO(result.lastUpdated), 'MMM d, yyyy');
            link = result.playlistUrl;
          } else if ('station' in result) {
            // RadioResult
            name = result.station;
            creator = result.dj;
            metric = result.country;
            date = format(parseISO(result.lastSpin), 'MMM d, yyyy');
            link = result.airplayLink;
          } else if ('event' in result) {
            // DjResult
            name = result.event;
            creator = result.dj;
            metric = result.location;
            date = format(parseISO(result.date), 'MMM d, yyyy');
            link = result.tracklistUrl;
          } else {
            // PressResult
            name = result.articleTitle;
            creator = result.writer;
            metric = result.outlet;
            date = format(parseISO(result.date), 'MMM d, yyyy');
            link = result.link;
          }
          
          return (
            <TableRow 
              key={result.id}
              className="group transition-all-200"
            >
              <TableCell className="font-medium">{name}</TableCell>
              <TableCell>{creator}</TableCell>
              <TableCell className="text-right">{metric}</TableCell>
              <TableCell>{date}</TableCell>
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
                  onClick={() => window.open(link, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ResultsTableContent;
