
import { supabase } from "@/integrations/supabase/client";
import { CampaignData } from "@/services/supabase/types";
import { NormalizedInput } from "@/utils/apiUtils";
import { saveResults } from "./resultsService";

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

// Save campaign to Supabase
export const saveCampaign = async (
  campaignData: CampaignData,
  normalizedInputs: NormalizedInput[],
  results: any
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

    // Save all results using the separate function
    await saveResults(campaignId, results);

    return campaignId;
  } catch (error) {
    console.error('Error in saveCampaign:', error);
    return null;
  }
};

// Get campaign with reference inputs
export const getCampaignInputs = async (campaignId: string) => {
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

    return {
      campaign,
      referenceInputs: referenceInputs || []
    };
  } catch (error) {
    console.error('Error in getCampaignInputs:', error);
    return null;
  }
};
