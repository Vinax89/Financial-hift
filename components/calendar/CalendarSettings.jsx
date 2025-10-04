import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { SlidersHorizontal } from "lucide-react";

export default function CalendarSettings({ value, onChange }) {
  const v = value || { showNetChips: true, compactMode: false, highlightToday: true };
  const set = (key, val) => onChange({ ...v, [key]: val });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm">Highlight Today</Label>
              <p className="text-xs text-muted-foreground">Emphasize the current date in the grid</p>
            </div>
            <Switch checked={!!v.highlightToday} onCheckedChange={(val) => set("highlightToday", val)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm">Show Net Chips</Label>
              <p className="text-xs text-muted-foreground">Per-day net (income − outflow) chip</p>
            </div>
            <Switch checked={!!v.showNetChips} onCheckedChange={(val) => set("showNetChips", val)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm">Compact Mode</Label>
              <p className="text-xs text-muted-foreground">Smaller cells to fit more on screen</p>
            </div>
            <Switch checked={!!v.compactMode} onCheckedChange={(val) => set("compactMode", val)} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}