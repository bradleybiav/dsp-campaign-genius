
import { toast } from "sonner";

// Re-export toast from sonner for consistency
export { toast };

// Maintain compatibility with existing useToast hook
export const useToast = () => {
  return {
    toast,
    // This is a dummy object to maintain compatibility with old useToast consumers
    toasts: [],
    // These functions are stubs to maintain compatibility
    dismiss: () => {},
    remove: () => {}
  };
};
