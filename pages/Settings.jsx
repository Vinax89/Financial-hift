import React from "react";
import { User } from "@/api/entities";
import { useTheme } from "@/theme/ThemeProvider.jsx";
import { ThemeSelector } from "@/theme/ThemeToggle.jsx";
import PrivacyToggle from "@/shared/PrivacyToggle.jsx";
import { useToast } from "@/ui/use-toast.jsx";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card.jsx";
import { Button } from "@/ui/button.jsx";
import { Label } from "@/ui/label.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select.jsx";
import { Switch } from "@/ui/switch.jsx";
import { Separator } from "@/ui/separator.jsx";
import { RefreshCw, Save, Palette, Shield, Globe, CalendarDays, LayoutGrid } from "lucide-react";

const DEFAULT_TABS = ["overview", "debts", "budget", "tools", "automations", "progress"];
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"];
const DATE_FORMATS = ["MM/dd/yyyy", "dd/MM/yyyy", "yyyy-MM-dd"];

export default function Settings() {
  const { toast } = useToast();
  const { setTheme } = useTheme();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [user, setUser] = React.useState(null);

  const [currency, setCurrency] = React.useState("USD");
  const [dateFormat, setDateFormat] = React.useState("MM/dd/yyyy");
  const [privacy, setPrivacy] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [defaultTab, setDefaultTab] = React.useState("overview");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await User.me();
        if (!mounted) return;
        setUser(me || null);
        setCurrency(me?.currency || "USD");
        setDateFormat(me?.date_format || "MM/dd/yyyy");
        setPrivacy(!!me?.privacy_mode);
        setReducedMotion(!!me?.reduced_motion);
        setDefaultTab(me?.default_dashboard_tab || "overview");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const applyPrivacyDom = (val) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-privacy", val ? "true" : "false");
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("apex-finance:privacy-mode", val ? "true" : "false");
    }
  };

  const applyReducedMotionDom = (val) => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.reducedMotion = val ? "true" : "false";
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await User.updateMyUserData({
        currency,
        date_format: dateFormat,
        privacy_mode: privacy,
        reduced_motion: reducedMotion,
        default_dashboard_tab: defaultTab,
      });

      // Apply to DOM/local immediately
      applyPrivacyDom(privacy);
      applyReducedMotionDom(reducedMotion);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("apex-finance:dashboard-tab", defaultTab);
      }

      toast({ title: "Settings saved", description: "Your preferences have been updated." });
    } catch (e) {
      toast({ title: "Save failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const resetToSystem = async () => {
    // Clear local theme preference; layout will prefer system or user stored
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("apex-finance:theme");
      }
      // Keep user's saved theme_preference unchanged; user can change via ThemeSelector
      toast({ title: "Theme reset", description: "Theme preference cleared locally. Using account preference now." });
    } catch {}
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-muted-foreground">Loading settings…</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Personalize your experience.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetToSystem} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset Theme Cache
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border shadow-sm">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Choose your preferred theme.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ThemeSelector />
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm">Reduced motion</Label>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground mr-4">
                  Minimize animations and motion effects.
                </p>
                <Switch
                  checked={reducedMotion}
                  onCheckedChange={(val) => {
                    setReducedMotion(val);
                    applyReducedMotionDom(val);
                  }}
                  aria-label="Toggle reduced motion"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Privacy</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Control how sensitive amounts are displayed.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Privacy mode</Label>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground mr-4">
                  Blur sensitive amounts by default (hold Alt to reveal).
                </p>
                <Switch
                  checked={privacy}
                  onCheckedChange={(val) => {
                    setPrivacy(val);
                    applyPrivacyDom(val);
                  }}
                  aria-label="Toggle privacy mode"
                />
              </div>
            </div>
            <div className="pt-2">
              <PrivacyToggle />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Localization</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Currency and date display preferences.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-format">Date format</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger id="date-format">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map((fmt) => (
                    <SelectItem key={fmt} value={fmt}>{fmt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" />
              <CardTitle>Dashboard</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Choose your default dashboard tab.</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="default-tab">Default tab</Label>
            <Select value={defaultTab} onValueChange={(v) => setDefaultTab(v)}>
              <SelectTrigger id="default-tab">
                <SelectValue placeholder="Select default tab" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_TABS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This tab will open first on your dashboard. We’ll also remember your last selection.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}