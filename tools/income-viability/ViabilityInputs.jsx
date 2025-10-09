import React from "react";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { DollarSign, MapPin, Calendar, User } from "lucide-react";

export default function ViabilityInputs({
  zipCode,
  setZipCode,
  grossIncome,
  setGrossIncome,
  filingStatus,
  setFilingStatus,
  year,
  setYear,
}) {
  const handleIncomeChange = (e) => setGrossIncome(e.target.value);
  const handleZipChange = (e) => setZipCode(e.target.value.replace(/\D/g, ""));
  const handleYearChange = (e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4));

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label htmlFor="gross-income-viability">Annual Gross Income</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            id="gross-income-viability"
            type="number"
            min="0"
            max="10000000"
            step="1000"
            placeholder="65000"
            value={grossIncome}
            onChange={handleIncomeChange}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="zip-code-viability">Target Zip Code</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            id="zip-code-viability"
            placeholder="90210"
            maxLength={5}
            value={zipCode}
            onChange={handleZipChange}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filing-status-viability">Filing Status</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <select
            id="filing-status-viability"
            value={filingStatus}
            onChange={(e) => setFilingStatus(e.target.value)}
            className="pl-10 border rounded-md h-10 w-full bg-background"
          >
            <option value="single">Single</option>
            <option value="married_jointly">Married, filing jointly</option>
            <option value="married_separately">Married, separately</option>
            <option value="head_of_household">Head of household</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tax-year-viability">Tax Year</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            id="tax-year-viability"
            inputMode="numeric"
            placeholder={String(new Date().getFullYear())}
            value={year}
            onChange={handleYearChange}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
}