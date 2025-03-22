import { supabase } from "@/integrations/supabase/client";
import { 
  PlaylistResult, 
  RadioResult, 
  DjResult, 
  PressResult 
} from "@/components/results-table/types";
import { formatResultsForFrontend } from "./formatters";

// Save all results to their respective tables
export const saveResults = async (
  campaignId: string,
  results: {
    dspResults: PlaylistResult[];
    radioResults: RadioResult[];
    djResults: DjResult[];
    pressResults: PressResult[];
  }
): Promise<boolean> => {
  try {
    const savePromises: Promise<void>[] = [];
    
    // Save DSP results
    if (results.dspResults.length > 0) {
      const dspResultsData = results.dspResults.map(result => ({
        campaign_id: campaignId,
        playlist_name: result.playlistName,
        curator_name: result.curatorName,
        follower_count: result.followerCount,
        last_updated: result.lastUpdated,
        playlist_url: result.playlistUrl,
        matched_inputs: result.matchedInputs,
        vertical: 'dsp'
      }));

      savePromises.push(
        new Promise<void>((resolve) => {
          supabase.from('dsp_results').insert(dspResultsData)
            .then(({ error }) => {
              if (error) console.error('Error saving DSP results:', error);
              resolve();
            });
          // We don't use .catch() here as the PromiseLike returned by Supabase doesn't have it
        })
      );
    }

    // Save Radio results
    if (results.radioResults.length > 0) {
      const radioResultsData = results.radioResults.map(result => ({
        campaign_id: campaignId,
        station: result.station,
        show: result.show,
        dj: result.dj,
        country: result.country,
        last_spin: result.lastSpin,
        airplay_link: result.airplayLink,
        matched_inputs: result.matchedInputs,
        vertical: 'radio'
      }));

      savePromises.push(
        new Promise<void>((resolve) => {
          supabase.from('radio_results').insert(radioResultsData)
            .then(({ error }) => {
              if (error) console.error('Error saving Radio results:', error);
              resolve();
            });
        })
      );
    }

    // Save DJ results
    if (results.djResults.length > 0) {
      const djResultsData = results.djResults.map(result => ({
        campaign_id: campaignId,
        dj: result.dj,
        event: result.event,
        location: result.location,
        date: result.date,
        tracklist_url: result.tracklistUrl,
        matched_inputs: result.matchedInputs,
        vertical: 'dj'
      }));

      savePromises.push(
        new Promise<void>((resolve) => {
          supabase.from('dj_results').insert(djResultsData)
            .then(({ error }) => {
              if (error) console.error('Error saving DJ results:', error);
              resolve();
            });
        })
      );
    }

    // Save Press results
    if (results.pressResults.length > 0) {
      const pressResultsData = results.pressResults.map(result => ({
        campaign_id: campaignId,
        outlet: result.outlet,
        writer: result.writer,
        article_title: result.articleTitle,
        date: result.date,
        link: result.link,
        matched_inputs: result.matchedInputs,
        vertical: 'press'
      }));

      savePromises.push(
        new Promise<void>((resolve) => {
          supabase.from('press_results').insert(pressResultsData)
            .then(({ error }) => {
              if (error) console.error('Error saving Press results:', error);
              resolve();
            });
        })
      );
    }

    await Promise.all(savePromises);
    return true;
  } catch (error) {
    console.error('Error in saveResults:', error);
    return false;
  }
};

// Get all results for a campaign
export const getResultsForCampaign = async (campaignId: string) => {
  try {
    // Get DSP results
    const { data: dspResults, error: dspError } = await supabase
      .from('dsp_results')
      .select('*')
      .eq('campaign_id', campaignId);

    if (dspError) {
      console.error('Error fetching DSP results:', dspError);
    }

    // Get Radio results
    const { data: radioResults, error: radioError } = await supabase
      .from('radio_results')
      .select('*')
      .eq('campaign_id', campaignId);

    if (radioError) {
      console.error('Error fetching Radio results:', radioError);
    }

    // Get DJ results
    const { data: djResults, error: djError } = await supabase
      .from('dj_results')
      .select('*')
      .eq('campaign_id', campaignId);

    if (djError) {
      console.error('Error fetching DJ results:', djError);
    }

    // Get Press results
    const { data: pressResults, error: pressError } = await supabase
      .from('press_results')
      .select('*')
      .eq('campaign_id', campaignId);

    if (pressError) {
      console.error('Error fetching Press results:', pressError);
    }

    // Format results for frontend
    return {
      dsp: formatResultsForFrontend.dsp(dspResults || []),
      radio: formatResultsForFrontend.radio(radioResults || []),
      dj: formatResultsForFrontend.dj(djResults || []),
      press: formatResultsForFrontend.press(pressResults || [])
    };
  } catch (error) {
    console.error('Error in getResultsForCampaign:', error);
    return {
      dsp: [],
      radio: [],
      dj: [],
      press: []
    };
  }
};
