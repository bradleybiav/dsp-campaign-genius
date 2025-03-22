
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
  
  // Additional logging for API specific errors
  if (error?.status || error?.error) {
    console.error(`${service} API error details:`, {
      status: error.status,
      error: error.error,
      details: error.details
    });
  }
  
  return errorMessage;
};

/**
 * Display appropriate error toast for a service
 */
export const showServiceError = (service: string, error: any) => {
  const errorMsg = handleApiError(service, error);
  
  // Customize the error message based on common API errors
  if (error?.status === 404) {
    toast.warning(`${service} resource not found`, { 
      description: 'This endpoint may not be available in your API subscription'
    });
  } else if (error?.status === 401 || error?.status === 403) {
    toast.error(`Authentication error with ${service}`, { 
      description: 'Please check your API credentials'
    });
  } else if (error?.status === 429) {
    toast.warning(`Rate limit exceeded for ${service}`, { 
      description: 'Please try again later'
    });
  } else {
    toast.error(`Failed to fetch ${service} data`, { 
      description: errorMsg.substring(0, 100) 
    });
  }
};
