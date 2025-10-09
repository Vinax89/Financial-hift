import { toast as sonnerToast } from '@/ui/sonner';
import { ReactNode } from 'react';

// Provider-less toast wrapper that works globally with Sonner.
// Exposes the same API surface used across the app, without requiring a Provider.

type ToastVariant = "default" | "destructive" | "error" | "success" | "warning" | "warn";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastOptions) => {
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
  const success = (title?: string, description?: string) => sonnerToast.success(title || "Success", { description });
  const error = (title?: string, description?: string) => sonnerToast.error(title || "Error", { description });
  const warning = (title?: string, description?: string) => sonnerToast.warning(title || "Warning", { description });

  // Dismiss not supported per-toast without id; provide a global clear as fallback
  const dismiss = () => sonnerToast.dismiss();

  return { toast, dismiss, success, error, warning };
}

interface ToastProviderProps {
  children: ReactNode;
}

// No-op Provider to maintain backward compatibility if imported/used.
export function ToastProvider({ children }: ToastProviderProps) {
  return children;
}

export default ToastProvider;
