
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

  // Helper function to safely format dates
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Unknown';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (e) {
      console.error('Date parsing error:', e);
      return 'Invalid date';
    }
  };

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
            date = formatDate(result.lastUpdated);
            link = result.playlistUrl;
          } else if ('station' in result) {
            // RadioResult
            name = result.station || 'Unknown Station';
            creator = result.dj || result.show || 'Unknown DJ';
            metric = result.playsCount !== undefined ? `${formatNumber(result.playsCount)} plays` : '1+ plays';
            date = result.lastSpin ? formatDate(result.lastSpin) : 'Recent';
            link = result.airplayLink || '#';
          } else if ('event' in result) {
            // DjResult
            name = result.event || 'Unknown Event';
            creator = result.dj || 'Unknown DJ';
            metric = result.location || 'Unknown';
            date = formatDate(result.date);
            link = result.tracklistUrl || '#';
          } else {
            // PressResult
            name = result.articleTitle || 'Unknown Article';
            creator = result.writer || 'Unknown Writer';
            metric = result.outlet || 'Unknown';
            date = formatDate(result.date);
            link = result.link || '#';
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
                {link && link !== '#' ? (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="opacity-50 group-hover:opacity-100 transition-all-200"
                    onClick={() => window.open(link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    N/A
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ResultsTableContent;
