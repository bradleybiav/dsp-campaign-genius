
import { getCampaigns, saveCampaign, getCampaignInputs } from './supabase/campaignService';
import { getResultsForCampaign } from './supabase/resultsService';
import { NormalizedInput } from "@/utils/apiUtils";
import { ResearchResults } from "@/hooks/useResearchForm";
import { CampaignData } from './supabase/types';

// Get campaign with all its results
export const getCampaignWithResults = async (campaignId: string) => {
  try {
    // Get campaign and inputs
    const campaignData = await getCampaignInputs(campaignId);
    
    if (!campaignData) {
      return null;
    }
    
    // Get all results
    const results = await getResultsForCampaign(campaignId);
    
    return {
      campaign: campaignData.campaign,
      referenceInputs: campaignData.referenceInputs,
      results
    };
  } catch (error) {
    console.error('Error in getCampaignWithResults:', error);
    return null;
  }
};

// Re-export all needed functions
export { 
  getCampaigns, 
  saveCampaign 
};

// Re-export types
export type { CampaignData };
