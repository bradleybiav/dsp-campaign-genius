
import { toast } from 'sonner';

/**
 * Consistent error handling function for API requests
 */
export const handleApiError = (service: string, error: any) => {
  console.error(`Error in ${service} service:`, error);
  const errorMessage = error?.message || 'Unknown error occurred';
  
  // Log detailed error information for debugging
  if (error?.response) {
    console.error(`${service} API response:`, {
      status: error.response.status,
      data: error.response.data
    });
  }
  
  return errorMessage;
};

/**
 * Display appropriate error toast for a service
 */
export const showServiceError = (service: string, error: any) => {
  const errorMsg = handleApiError(service, error);
  toast.error(`Failed to fetch ${service} data`, { 
    description: errorMsg.substring(0, 100) 
  });
};
