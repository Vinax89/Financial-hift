/**
 * @fileoverview useToast hook for provider-less global toast notifications
 * @description Hook that wraps Sonner toast with consistent API (supports variants: success, error, warning)
 */

import { toast as sonnerToast } from "@/ui/sonner.jsx";

/**
 * Hook for displaying toast notifications (provider-less)
 * @returns {{
 *   toast: (options: {title: string, description?: string, variant?: string}) => void,
 *   dismiss: () => void,
 *   success: (title: string, description?: string) => void,
 *   error: (title: string, description?: string) => void,
 *   warning: (title: string, description?: string) => void
 * }} Toast notification functions
 * @example
 * const { toast, success, error } = useToast();
 * toast({ title: "Hello", variant: "success" });
 * success("Saved successfully");
 * error("Failed to save");
 */
export function useToast() {
  const toast = ({ title, description, variant = "default" }) => {
    // Map variants to Sonner styles
    if (variant === "destructive" || variant === "error") {
      sonnerToast.error(title || "Error", { description });
      return;
    }
    if (variant === "success") {
      sonnerToast.success(title || "Success", { description });
      return;
    }
    if (variant === "warning" || variant === "warn") {
      sonnerToast.warning(title || "Warning", { description });
      return;
    }
    sonnerToast(title || "", { description });
  };

  // Convenience helpers for common variants
  const success = (title, description) => sonnerToast.success(title || "Success", { description });
  const error = (title, description) => sonnerToast.error(title || "Error", { description });
  const warning = (title, description) => sonnerToast.warning(title || "Warning", { description });

  // Dismiss not supported per-toast without id; provide a global clear as fallback
  const dismiss = () => sonnerToast.dismiss();

  return { toast, dismiss, success, error, warning };
}

// No-op Provider to maintain backward compatibility if imported/used.
export function ToastProvider({ children }) {
  return children;
}

export default ToastProvider;
