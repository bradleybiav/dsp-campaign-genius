
import { supabase } from "@/integrations/supabase/client";
import { 
  PlaylistResult, 
  RadioResult, 
  DjResult, 
  PressResult 
} from "@/components/results-table/types";
import { NormalizedInput } from "@/utils/apiUtils";

export interface CampaignData {
  id?: string;
  name: string;
  referenceInputs: string[];
  selectedVerticals: string[];
}

// Save campaign and results to Supabase
export const saveCampaign = async (
  campaignData: CampaignData,
  normalizedInputs: NormalizedInput[],
  results: {
    dspResults: PlaylistResult[];
    radioResults: RadioResult[];
    djResults: DjResult[];
    pressResults: PressResult[];
  }
): Promise<string | null> => {
  try {
    // Insert campaign record
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert([{ name: campaignData.name }])
      .select('id')
      .single();

    if (campaignError || !campaign) {
      console.error('Error saving campaign:', campaignError);
      return null;
    }

    const campaignId = campaign.id;

    // Save reference inputs
    if (normalizedInputs.length > 0) {
      const referenceInputsData = normalizedInputs.map(input => ({
        campaign_id: campaignId,
        input_url: input.originalUrl,
        input_index: input.inputIndex,
        input_type: input.type,
        normalized_id: input.id
      }));

      const { error: inputsError } = await supabase
        .from('reference_inputs')
        .insert(referenceInputsData);

      if (inputsError) {
        console.error('Error saving reference inputs:', inputsError);
      }
    }

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

      const { error: dspError } = await supabase
        .from('dsp_results')
        .insert(dspResultsData);

      if (dspError) {
        console.error('Error saving DSP results:', dspError);
      }
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

      const { error: radioError } = await supabase
        .from('radio_results')
        .insert(radioResultsData);

      if (radioError) {
        console.error('Error saving Radio results:', radioError);
      }
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

      const { error: djError } = await supabase
        .from('dj_results')
        .insert(djResultsData);

      if (djError) {
        console.error('Error saving DJ results:', djError);
      }
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

      const { error: pressError } = await supabase
        .from('press_results')
        .insert(pressResultsData);

      if (pressError) {
        console.error('Error saving Press results:', pressError);
      }
    }

    return campaignId;
  } catch (error) {
    console.error('Error in saveCampaign:', error);
    return null;
  }
};

// Get all campaigns
export const getCampaigns = async () => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }

  return data || [];
};

// Get a single campaign with all its results
export const getCampaignWithResults = async (campaignId: string) => {
  try {
    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error('Error fetching campaign:', campaignError);
      return null;
    }

    // Get reference inputs
    const { data: referenceInputs, error: inputsError } = await supabase
      .from('reference_inputs')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('input_index', { ascending: true });

    if (inputsError) {
      console.error('Error fetching reference inputs:', inputsError);
    }

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

    // Transform to frontend format
    const formattedDspResults = dspResults?.map(r => ({
      id: r.id,
      playlistName: r.playlist_name,
      curatorName: r.curator_name,
      followerCount: r.follower_count,
      lastUpdated: r.last_updated,
      playlistUrl: r.playlist_url,
      matchedInputs: r.matched_inputs,
      vertical: r.vertical
    })) || [];

    const formattedRadioResults = radioResults?.map(r => ({
      id: r.id,
      station: r.station,
      show: r.show,
      dj: r.dj,
      country: r.country,
      lastSpin: r.last_spin,
      airplayLink: r.airplay_link,
      matchedInputs: r.matched_inputs,
      vertical: r.vertical
    })) || [];

    const formattedDjResults = djResults?.map(r => ({
      id: r.id,
      dj: r.dj,
      event: r.event,
      location: r.location,
      date: r.date,
      tracklistUrl: r.tracklist_url,
      matchedInputs: r.matched_inputs,
      vertical: r.vertical
    })) || [];

    const formattedPressResults = pressResults?.map(r => ({
      id: r.id,
      outlet: r.outlet,
      writer: r.writer,
      articleTitle: r.article_title,
      date: r.date,
      link: r.link,
      matchedInputs: r.matched_inputs,
      vertical: r.vertical
    })) || [];

    return {
      campaign,
      referenceInputs: referenceInputs || [],
      results: {
        dsp: formattedDspResults,
        radio: formattedRadioResults,
        dj: formattedDjResults,
        press: formattedPressResults
      }
    };
  } catch (error) {
    console.error('Error in getCampaignWithResults:', error);
    return null;
  }
};
