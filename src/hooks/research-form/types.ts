
import { PlaylistResult, RadioResult, DjResult, PressResult } from '@/components/results-table/types';

export interface FormData {
  campaignName: string;
  referenceInputs: string[];
  selectedVerticals: string[];
}

export interface ResearchResults {
  dspResults: PlaylistResult[];
  radioResults: RadioResult[];
  djResults: DjResult[];
  pressResults: PressResult[];
}
