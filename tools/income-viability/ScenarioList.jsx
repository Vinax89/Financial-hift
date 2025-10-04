import React from "react";
import { Button } from "@/ui/button.jsx";
import { Input } from "@/ui/input.jsx";
import { Save, FolderOpen, Trash2 } from "lucide-react";

const STORAGE_KEY = "apex-finance:viability-scenarios";

function loadScenarios() {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : "[]";
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveScenarios(list) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list || []));
    }
  } catch {
    // ignore
  }
}

export default function ScenarioList({ current, onLoad }) {
  const [scenarios, setScenarios] = React.useState(loadScenarios());
  const [name, setName] = React.useState("");

  const handleSave = () => {
    if (!current) return;
    const item = {
      id: Date.now(),
      name: name || `${current.zipCode} · $${current.grossIncome}`,
      zipCode: current.zipCode,
      grossIncome: current.grossIncome,
      filingStatus: current.filingStatus,
      year: current.year,
      created_at: new Date().toISOString(),
    };
    const updated = [item, ...scenarios].slice(0, 20);
    setScenarios(updated);
    saveScenarios(updated);
    setName("");
  };

  const handleDelete = (id) => {
    const updated = scenarios.filter((s) => s.id !== id);
    setScenarios(updated);
    saveScenarios(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input placeholder="Scenario name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save</Button>
      </div>
      <div className="space-y-2">
        {scenarios.length === 0 ? (
          <p className="text-sm text-muted-foreground">No saved scenarios yet.</p>
        ) : (
          scenarios.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-2 rounded-md bg-muted/40">
              <div className="text-sm">
                <div className="font-medium">{s.name}</div>
                <div className="text-muted-foreground">{s.zipCode} • ${s.grossIncome} • {s.filingStatus} • {s.year}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onLoad(s)}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Load
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}