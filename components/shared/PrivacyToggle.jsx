
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/api/entities";

export default function PrivacyToggle({ className }) {
  const { toast } = useToast();
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    const attr = typeof document !== "undefined" ? document.documentElement.getAttribute("data-privacy") : null;
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("apex-finance:privacy-mode") : null;
    const initial = attr != null ? attr === "true" : (saved === "true");
    setEnabled(initial);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-privacy", initial ? "true" : "false");
    }
  }, []);

  const toggle = async () => {
    const next = !enabled;
    setEnabled(next);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-privacy", next ? "true" : "false");
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("apex-finance:privacy-mode", next ? "true" : "false");
    }
    try {
      await User.updateMyUserData({ privacy_mode: next });
    } catch {
      // ignore if unauthenticated
    }
    toast({
      title: next ? "Privacy mode enabled" : "Privacy mode disabled",
      description: next ? "Sensitive amounts are blurred. Hold Alt to reveal temporarily." : "Sensitive amounts are visible.",
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={toggle}
      className={className}
      aria-pressed={enabled}
      aria-label={enabled ? "Disable privacy mode" : "Enable privacy mode"}
      title={enabled ? "Disable Privacy Mode (Alt to reveal)" : "Enable Privacy Mode"}
    >
      {enabled ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
      {enabled ? "Privacy On" : "Privacy Off"}
    </Button>
  );
}
