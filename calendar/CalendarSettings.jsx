/**
 * @fileoverview Calendar settings popover component
 * @description Provides settings controls for calendar display options
 */

import React from "react";
import { Button } from "@/ui/button.jsx";
import { Switch } from "@/ui/switch.jsx";
import { Label } from "@/ui/label.jsx";
import { Popover, PopoverTrigger, PopoverContent } from "@/ui/popover.jsx";
import { SlidersHorizontal } from "lucide-react";

/**
 * Calendar settings component
 * @param {Object} props - Component props
 * @param {Object} props.value - Current settings values
 * @param {Function} props.onChange - Settings change handler
 * @returns {JSX.Element} Settings popover
 */
function CalendarSettings({ value, onChange }) {
  const v = value || { showNetChips: true, compactMode: false, highlightToday: true };
  /**
   * Update a specific setting
   * @param {string} key - Setting key
   * @param {any} val - New value
   */
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

export default React.memo(CalendarSettings);