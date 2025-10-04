import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AutomationRule } from "@/api/entities";
import { Notification } from "@/api/entities";
import { Transaction } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";

const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not equals" },
  { value: "greater_than", label: "Greater than" },
  { value: "less_than", label: "Less than" },
  { value: "contains", label: "Contains" },
];

export default function AutomationRulesCenter({ transactions = [] }) {
  const { toast } = useToast();
  const [rules, setRules] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState({
    name: "",
    entity: "Transaction",
    field: "amount",
    operator: "greater_than",
    value: "",
    actionType: "notify",
    tagValue: ""
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    const list = await AutomationRule.list("-created_date", 200);
    setRules(Array.isArray(list) ? list : []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const addRule = async () => {
    if (!form.name || !form.value) {
      toast({ title: "Please fill name and value", variant: "destructive" }); return;
    }
    const created = await AutomationRule.create({
      name: form.name,
      entity: form.entity,
      condition: { field: form.field, operator: form.operator, value: form.value },
      action: { type: form.actionType, params: { tag: form.tagValue } },
      enabled: true
    });
    setForm({ ...form, name: "", value: "", tagValue: "" });
    toast({ title: "Rule created", variant: "success" });
    load();
  };

  const evaluate = async () => {
    let applied = 0;
    for (const rule of rules.filter(r => r.enabled)) {
      if (rule.entity !== "Transaction") continue;
      for (const t of transactions) {
        const fieldVal = t[rule.condition.field];
        const cmp = String(rule.condition.value);
        let match = false;
        switch (rule.condition.operator) {
          case "equals": match = String(fieldVal) === cmp; break;
          case "not_equals": match = String(fieldVal) !== cmp; break;
          case "greater_than": match = Number(fieldVal) > Number(cmp); break;
          case "less_than": match = Number(fieldVal) < Number(cmp); break;
          case "contains": match = String(fieldVal).toLowerCase().includes(cmp.toLowerCase()); break;
          default: match = false;
        }
        if (match) {
          if (rule.action.type === "notify") {
            const unique = `rule:${rule.id}:tx:${t.id}`;
            const existing = await Notification.filter({ unique_key: unique });
            if (!existing || existing.length === 0) {
              await Notification.create({
                title: rule.name,
                message: `Rule matched on transaction "${t.title}"`,
                type: "info",
                link_url: "/"+(window?.location?.pathname?.includes("Dashboard") ? "" : ""),
                unique_key: unique
              });
            }
            applied++;
          } else if (rule.action.type === "tag_transaction") {
            const current = Array.isArray(t.tags) ? t.tags : [];
            const tag = rule.action.params?.tag || "automation";
            if (!current.includes(tag)) {
              await Transaction.update(t.id, { tags: [...current, tag] });
              applied++;
            }
          }
        }
      }
    }
    toast({ title: "Rules evaluated", description: `Applied ${applied} action(s).` });
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-card">
      <CardHeader>
        <CardTitle>Automation Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-6 gap-3">
          <Input className="md:col-span-2" placeholder="Rule name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          <div>
            <Label>Entity</Label>
            <Select value={form.entity} onValueChange={(v) => setForm(f => ({ ...f, entity: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Transaction">Transaction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input placeholder="Field" value={form.field} onChange={(e) => setForm(f => ({ ...f, field: e.target.value }))} />
          <div>
            <Label>Operator</Label>
            <Select value={form.operator} onValueChange={(v) => setForm(f => ({ ...f, operator: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {OPERATORS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Input placeholder="Value" value={form.value} onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))} />
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <Label>Action</Label>
            <Select value={form.actionType} onValueChange={(v) => setForm(f => ({ ...f, actionType: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="notify">Notify</SelectItem>
                <SelectItem value="tag_transaction">Tag Transaction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.actionType === "tag_transaction" && (
            <Input placeholder="Tag value" value={form.tagValue} onChange={(e) => setForm(f => ({ ...f, tagValue: e.target.value }))} />
          )}
          <div className="flex items-end gap-2">
            <Button onClick={addRule}>Add Rule</Button>
            <Button variant="outline" onClick={evaluate}>Run Now</Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">{loading ? "Loading rules..." : `${rules.length} rule(s)`}</div>
          <div className="flex flex-wrap gap-2">
            {rules.map(r => (
              <Badge key={r.id} variant={r.enabled ? "secondary" : "outline"} className="capitalize">
                {r.name} • {r.entity} • {r.condition.field} {r.condition.operator} {String(r.condition.value)}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}