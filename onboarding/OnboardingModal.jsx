
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { User } from "@/api/entities";
import { PaycheckSettings } from "@/api/entities";
import { useToast } from "@/ui/use-toast";
import { logError } from "@/utils/logger";

// The requested change 'export { default } from "./OnboardingModal";' would turn this file
// into an index file re-exporting another file named OnboardingModal.
// However, this file *is* the OnboardingModal component definition itself,
// already using 'export default function OnboardingModal(...)'.
// Applying the requested change literally to this file would result in a circular
// dependency, remove the component's implementation, and make the file non-functional.
// Per instructions, the goal is to create a "functional, valid file" and
// "preserve all other features, elements and functionality".
// Therefore, the original, functional export statement is preserved here.
export default function OnboardingModal({ open, onClose }) {
  const [zip, setZip] = React.useState("");
  const [filing, setFiling] = React.useState("single");
  const [hourly, setHourly] = React.useState("");
  const [hoursPerWeek, setHoursPerWeek] = React.useState("40");
  const [privacy, setPrivacy] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const me = await User.me();
        setZip(me?.zip_code || "");
        setFiling(me?.filing_status || "single");
        setPrivacy(!!me?.privacy_mode);
        // try to load paycheck settings
        const settings = await PaycheckSettings.filter({}, "-updated_date", 1);
        const s = Array.isArray(settings) && settings[0] ? settings[0] : null;
        if (s) {
          setHourly(String(s.hourly_rate || ""));
          setHoursPerWeek(String(s.hours_per_week || "40"));
        }
      } catch (error) {
        logError("Failed to load user or paycheck settings", error);
        // ignore - user will fill it out
      }
    })();
  }, [open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const hourlyNum = Number(hourly) || 0;
      const hpwNum = Number(hoursPerWeek) || 40;

      await User.updateMyUserData({
        zip_code: zip,
        filing_status: filing,
        privacy_mode: privacy,
        onboarding_completed: true
      });

      // Upsert paycheck settings (create if none)
      const existing = await PaycheckSettings.filter({}, "-updated_date", 1);
      if (Array.isArray(existing) && existing[0]) {
        await PaycheckSettings.update(existing[0].id, {
          hourly_rate: hourlyNum,
          hours_per_week: hpwNum
        });
      } else {
        await PaycheckSettings.create({
          hourly_rate: hourlyNum,
          hours_per_week: hpwNum
        });
      }

      toast({ title: "You're all set!", description: "We saved your preferences to personalize the app." });
      onClose(true);
    } catch (e) {
      toast({ title: "Couldn't save onboarding", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose(false)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Welcome to Financial $hift</DialogTitle>
          <DialogDescription>Let's set up a few basics to tailor insights for you.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input id="zip" placeholder="e.g. 90210" value={zip} maxLength={5} onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))} />
            </div>
            <div className="space-y-2">
              <Label>Filing Status</Label>
              <Select value={filing} onValueChange={setFiling}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married_jointly">Married, jointly</SelectItem>
                  <SelectItem value="married_separately">Married, separately</SelectItem>
                  <SelectItem value="head_of_household">Head of household</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="hourly">Hourly Rate ($)</Label>
              <Input id="hourly" type="number" min="0" step="0.5" placeholder="e.g. 38" value={hourly} onChange={(e) => setHourly(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hpw">Hours per Week</Label>
              <Input id="hpw" type="number" min="1" step="1" placeholder="e.g. 40" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
            Enable Privacy Mode (blur sensitive amounts)
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onClose(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
