import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/ui/card.jsx";
import { Button } from "@/ui/button.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select.jsx";
import { Label } from "@/ui/label.jsx";
import { Input } from "@/ui/input.jsx";
import { ScrollArea } from "@/ui/scroll-area.jsx";
import { UploadFile, ExtractDataFromUploadedFile } from "@/api/integrations";
import { Transaction } from "@/api/entities";
import { Bill } from "@/api/entities";
import { DebtAccount } from "@/api/entities";
import { useToast } from "@/ui/use-toast.jsx";
import { TableLoading } from "@/ui/loading.jsx";

const ENTITY_SCHEMAS = {
  Transaction: {
    required: ["title", "amount", "category", "type", "date"],
  },
  Bill: {
    required: ["name", "amount", "category", "due_date"],
  },
  DebtAccount: {
    required: ["name", "type", "balance", "apr", "minimum_payment", "due_date"],
  },
};

const ENTITY_SDK = {
  Transaction,
  Bill,
  DebtAccount,
};

export default function DataImporter() {
  const { toast } = useToast();
  const [target, setTarget] = React.useState("Transaction");
  const [file, setFile] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);
  const [columns, setColumns] = React.useState([]);
  const [rows, setRows] = React.useState([]);
  const [mapping, setMapping] = React.useState({});
  const [importing, setImporting] = React.useState(false);

  const handleFile = (f) => setFile(f || null);

  const uploadAndExtract = async () => {
    if (!file) {
      toast({ title: "Select a file first", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      const schema = { type: "object", properties: {} };
      // Use required fields as hints for extraction
      ENTITY_SCHEMAS[target].required.forEach((k) => (schema.properties[k] = { type: ["string", "number", "boolean", "null"] }));
      const res = await ExtractDataFromUploadedFile({ file_url, json_schema: schema });
      if (res.status !== "success" || !res.output) {
        throw new Error(res.details || "Extraction failed");
      }
      const arr = Array.isArray(res.output) ? res.output : [res.output];
      const keys = Object.keys(arr[0] || {});
      setColumns(keys);
      setRows(arr);
      // Auto-map by best-effort
      const auto = {};
      ENTITY_SCHEMAS[target].required.forEach((k) => {
        const guess = keys.find((c) => c.toLowerCase() === k.toLowerCase() || c.toLowerCase().includes(k.replace(/_/g, " ").toLowerCase()));
        if (guess) auto[k] = guess;
      });
      setMapping(auto);
      toast({ title: "File processed", description: `Detected ${arr.length} row(s).` });
    } catch (e) {
      toast({ title: "Import failed", description: e.message || "Could not parse file.", variant: "destructive" });
      setColumns([]);
      setRows([]);
      setMapping({});
    } finally {
      setUploading(false);
    }
  };

  const beginImport = async () => {
    const required = ENTITY_SCHEMAS[target].required;
    for (const k of required) {
      if (!mapping[k]) {
        toast({ title: "Missing mapping", description: `Map the '${k}' field.`, variant: "destructive" });
        return;
      }
    }
    setImporting(true);
    try {
      const payload = rows.map((r) => {
        const obj = {};
        required.forEach((k) => (obj[k] = r[mapping[k]]));
        return obj;
      });
      const sdk = ENTITY_SDK[target];
      if (!sdk) throw new Error("Invalid target entity");
      if (sdk.bulkCreate) {
        await sdk.bulkCreate(payload);
      } else {
        await Promise.all(payload.map((p) => sdk.create(p)));
      }
      toast({ title: "Imported", description: `Imported ${payload.length} ${target} record(s).`, variant: "success" });
      setFile(null);
      setColumns([]);
      setRows([]);
      setMapping({});
    } catch (e) {
      toast({ title: "Import failed", description: e.message || "Error importing data.", variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg shadow-slate-200/40 bg-white/80 dark:bg-card">
      <CardHeader>
        <CardTitle>Data Importer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Target</Label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger><SelectValue placeholder="Select entity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Transaction">Transactions</SelectItem>
                <SelectItem value="Bill">Bills</SelectItem>
                <SelectItem value="DebtAccount">Debts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>File (CSV, XLSX, PDF image receipts supported)</Label>
            <Input type="file" accept=".csv,.xlsx,.xls,.pdf,.png,.jpg,.jpeg" onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={uploadAndExtract} disabled={!file || uploading}>
            {uploading ? "Processing..." : "Upload & Detect"}
          </Button>
          <Button variant="outline" onClick={() => { setFile(null); setColumns([]); setRows([]); setMapping({}); }} disabled={uploading}>
            Reset
          </Button>
        </div>

        {uploading && <TableLoading rows={4} columns={4} />}

        {rows.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              {ENTITY_SCHEMAS[target].required.map((field) => (
                <div key={field} className="space-y-1">
                  <Label>Map: {field}</Label>
                  <Select value={mapping[field] || ""} onValueChange={(v) => setMapping((m) => ({ ...m, [field]: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                    <SelectContent>
                      {columns.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Preview</Label>
              <ScrollArea className="h-48 rounded-md border p-2">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{JSON.stringify(rows.slice(0, 10), null, 2)}</pre>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <div className="text-sm text-muted-foreground">{rows.length} row(s) detected</div>
        <Button onClick={beginImport} disabled={rows.length === 0 || importing}>
          {importing ? "Importing..." : "Import"}
        </Button>
      </CardFooter>
    </Card>
  );
}