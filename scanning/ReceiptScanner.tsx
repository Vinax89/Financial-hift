// @ts-nocheck
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Label } from "@/ui/label";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";
import { Separator } from "@/ui/separator";
import { Upload, Loader2, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { useToast } from "@/ui/use-toast";
import { UploadFile, ExtractDataFromUploadedFile } from "@/api/integrations";
import { Transaction } from "@/api/entities";
import { Bill } from "@/api/entities";
import { format } from "date-fns";

const CATEGORY_OPTIONS = [
  "food_dining","groceries","transportation","shopping","entertainment","bills_utilities","healthcare","education","travel","housing","insurance","investments","other_expense"
];
const ACCOUNT_OPTIONS = ["checking","savings","credit_card","cash","investment"];
const BILL_CATEGORIES = ["housing","utilities","insurance","telecommunications","subscriptions","loans","credit_cards","other"];

interface ReceiptScannerProps { [key: string]: any; }


function ReceiptScanner({ refreshData }: ReceiptScannerProps) {
  const { toast } = useToast();
  const [file, setFile] = React.useState<any>(null);
  const [fileUrl, setFileUrl] = React.useState("");
  const [uploading, setUploading] = React.useState<boolean>(false);
  const [extracting, setExtracting] = React.useState<boolean>(false);
  const [error, setError] = React.useState("");

  const [saveAsBill, setSaveAsBill] = React.useState<boolean>(false);

  const [txForm, setTxForm] = React.useState({
    title: "",
    amount: "",
    category: "shopping",
    type: "expense",
    date: format(new Date(), "yyyy-MM-dd"),
    account: "checking",
    notes: "",
  });

  const [billForm, setBillForm] = React.useState({
    name: "",
    amount: "",
    category: "subscriptions",
    due_date: new Date().getDate(),
    frequency: "monthly",
    auto_pay: false,
  });

  const onFileChange = async (e: any) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError("");
    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file: f });
      setFileUrl(file_url || "");
      toast({ title: "Uploaded", description: "Analyzing receiptÃ¢â‚¬Â¦" });
      await extractData(file_url);
    } catch (err) {
      setError("Upload failed");
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const extractData = async (url) => {
    if (!url) return;
    setExtracting(true);
    try {
      const schema = {
        type: "object",
        properties: {
          merchant: { type: "string" },
          amount: { type: "number" },
          date: { type: "string" },
          category: { type: "string" },
          is_recurring_bill: { type: "boolean" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                merchant: { type: "string" },
                amount: { type: "number" },
                date: { type: "string" },
                category: { type: "string" },
                is_recurring_bill: { type: "boolean" }
              }
            }
          }
        }
      };

      const res = await ExtractDataFromUploadedFile({
        file_url: url,
        json_schema: schema
      });

      if (res.status !== "success") {
        setError(res.details || "Could not extract data from receipt.");
        return;
      }

      const output = res.output;
      const first =
        Array.isArray(output) ? output[0] :
        (output?.items && Array.isArray(output.items) ? output.items[0] : output);

      if (!first) {
        setError("No recognizable data found.");
        return;
      }

      const parsedAmount = typeof first.amount === "number" ? first.amount :
        Number(String(first.amount || "").replace(/[^0-9.]/g, "") || 0);
      const parsedDate = first.date ? format(new Date(first.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
      const mappedCategory = CATEGORY_OPTIONS.includes(first.category) ? first.category : "shopping";

      setTxForm((s) => ({
        ...s,
        title: first.merchant || "Receipt",
        amount: parsedAmount || "",
        category: mappedCategory,
        date: parsedDate
      }));

      setBillForm((s) => ({
        ...s,
        name: first.merchant || "Subscription",
        amount: parsedAmount || "",
        category: "subscriptions",
        due_date: Number(parsedDate.split("-")[2] || new Date().getDate()),
      }));

      setSaveAsBill(!!first.is_recurring_bill);
      setError("");
      toast({ title: "Data extracted", description: "Review and save." });
    } catch (err) {
      setError("Extraction failed");
      toast({ title: "Extraction failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setExtracting(false);
    }
  };

  const saveTransaction = async () => {
    const amt = Number(txForm.amount || 0);
    if (!txForm.title || !amt || !txForm.category || !txForm.date) {
      toast({ title: "Missing fields", description: "Please review the form.", variant: "destructive" });
      return;
    }
    await Transaction.create({
      title: txForm.title,
      amount: amt,
      category: txForm.category,
      type: "expense",
      date: txForm.date,
      account: txForm.account,
      notes: txForm.notes || `Imported from receipt${fileUrl ? ` (${fileUrl})` : ""}`,
      receipt_url: fileUrl || undefined
    });
    toast({ title: "Transaction saved", description: txForm.title, variant: "success" });
    if (refreshData) await refreshData(["transactions"]);
  };

  const saveBill = async () => {
    const amt = Number(billForm.amount || 0);
    if (!billForm.name || !amt || !billForm.category || !billForm.due_date) {
      toast({ title: "Missing fields", description: "Please review the bill details.", variant: "destructive" });
      return;
    }
    await Bill.create({
      name: billForm.name,
      amount: amt,
      category: billForm.category,
      due_date: Number(billForm.due_date),
      frequency: billForm.frequency,
      auto_pay: !!billForm.auto_pay,
      status: "active",
      last_paid_date: txForm.date || undefined
    });
    toast({ title: "Bill saved", description: billForm.name, variant: "success" });
    if (refreshData) await refreshData(["bills"]);
  };

  return (
    <Card className="bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Receipt Scanner</CardTitle>
        </div>
        <div className="text-xs text-muted-foreground">{file ? file.name : "No file selected"}</div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-3">
            <Label htmlFor="receipt-upload" className="font-medium">Upload receipt</Label>
            {(uploading || extracting) && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            {fileUrl && !uploading && !extracting && <CheckCircle2 className="h-4 w-4 text-success" />}
            {error && <AlertCircle className="h-4 w-4 text-expense" />}
          </div>
          <div className="flex gap-3">
            <Input id="receipt-upload" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={onFileChange} className="max-w-sm" />
            <Button variant="outline" onClick={() => document.getElementById("receipt-upload")?.click()} className="gap-2">
              <Upload className="h-4 w-4" /> Choose File
            </Button>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction form */}
          <div className="space-y-4">
            <div className="text-sm font-semibold">Transaction</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input value={txForm.title} onChange={(e: any) => setTxForm({ ...txForm, title: e.target.value })} />
              </div>
              <div>
                <Label>Amount</Label>
                <Input type="number" step="0.01" value={txForm.amount} onChange={(e: any) => setTxForm({ ...txForm, amount: e.target.value })} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={txForm.category} onValueChange={(v) => setTxForm({ ...txForm, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c.replaceAll("_"," ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Account</Label>
                <Select value={txForm.account} onValueChange={(v) => setTxForm({ ...txForm, account: v })}>
                  <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_OPTIONS.map(a => <SelectItem key={a} value={a}>{a.replaceAll("_"," ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={txForm.date} onChange={(e: any) => setTxForm({ ...txForm, date: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Notes</Label>
                <Input value={txForm.notes} onChange={(e: any) => setTxForm({ ...txForm, notes: e.target.value })} placeholder="Optional" />
              </div>
            </div>
            <Button onClick={saveTransaction} className="w-full sm:w-auto">Save Transaction</Button>
          </div>

          {/* Bill form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Convert to Bill (optional)</div>
              <div className="flex items-center gap-2">
                <Switch checked={saveAsBill} onCheckedChange={setSaveAsBill} />
                <span className="text-sm text-muted-foreground">{saveAsBill ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${saveAsBill ? "" : "opacity-60 pointer-events-none"}`}>
              <div>
                <Label>Name</Label>
                <Input value={billForm.name} onChange={(e: any) => setBillForm({ ...billForm, name: e.target.value })} />
              </div>
              <div>
                <Label>Amount</Label>
                <Input type="number" step="0.01" value={billForm.amount} onChange={(e: any) => setBillForm({ ...billForm, amount: e.target.value })} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={billForm.category} onValueChange={(v) => setBillForm({ ...billForm, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Bill category" /></SelectTrigger>
                  <SelectContent>
                    {BILL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replaceAll("_"," ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Day (1-31)</Label>
                <Input type="number" min={1} max={31} value={billForm.due_date} onChange={(e: any) => setBillForm({ ...billForm, due_date: e.target.value })} />
              </div>
              <div>
                <Label>Frequency</Label>
                <Select value={billForm.frequency} onValueChange={(v) => setBillForm({ ...billForm, frequency: v })}>
                  <SelectTrigger><SelectValue placeholder="Frequency" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Biweekly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={billForm.auto_pay} onCheckedChange={(v) => setBillForm({ ...billForm, auto_pay: v })} />
                <Label className="text-sm">Auto-pay</Label>
              </div>
            </div>
            <Button onClick={saveBill} className="w-full sm:w-auto" variant="outline">Save Bill</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


export default ReceiptScanner;