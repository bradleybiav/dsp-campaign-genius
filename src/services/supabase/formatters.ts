
import { 
  PlaylistResult, 
  RadioResult, 
  DjResult, 
  PressResult 
} from "@/components/results-table/types";

// Format database results for frontend consumption
export const formatResultsForFrontend = {
  // Format DSP results
  dsp: (results: any[]): PlaylistResult[] => {
    return results.map(r => ({
      id: r.id,
      playlistName: r.playlist_name,
      curatorName: r.curator_name,
      followerCount: r.follower_count,
      lastUpdated: r.last_updated,
      playlistUrl: r.playlist_url,
      matchedInputs: r.matched_inputs,
      vertical: r.vertical
    }));
  },

  // Format Radio results
  radio: (results: any[]): RadioResult[] => {
    return results.map(r => ({
      id: r.id,
      station: r.station,
      show: r.show,
      dj: r.dj,
      country: r.country,
      lastSpin: r.last_spin,
      airplayLink: r.airplay_link,
      matchedInputs: r.matched_inputs,
      vertical: r.vertical
    }));
  },

  // Format DJ results
  dj: (results: any[]): DjResult[] => {
    return results.map(r => ({
      id: r.id,
      dj: r.dj,
      event: r.event,
      location: r.location,
      date: r.date,
      tracklistUrl: r.tracklist_url,
      matchedInputs: r.matched_inputs,
      vertical: r.vertical
    }));
  },

  // Format Press results
  press: (results: any[]): PressResult[] => {
    return results.map(r => ({
      id: r.id,
      outlet: r.outlet,
      writer: r.writer,
      articleTitle: r.article_title,
      date: r.date,
      link: r.link,
      matchedInputs: r.matched_inputs,
      vertical: r.vertical
    }));
  }
};
