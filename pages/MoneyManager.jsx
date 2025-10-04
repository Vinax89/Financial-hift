
import React, { Suspense } from "react";
import { useFinancialData } from "@/hooks/useFinancialData.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs.jsx";
import { Button } from "@/ui/button.jsx";
import { Wallet, List, ReceiptText, RefreshCw } from "lucide-react";
import { Loading, CardLoading } from "@/ui/loading.jsx";
import ReceiptScanner from "@/scanning/ReceiptScanner.jsx";

// Existing components (present in repo)
import TransactionList from "@/transactions/TransactionList.jsx";
import BudgetOverview from "@/budget/BudgetOverview.jsx";

export default function MoneyManager() {
  const {
    transactions,
    budgets,
    loading,
    dataLoaded,
    refreshData,
  } = useFinancialData();

  const handleRefresh = async () => {
    await refreshData(["transactions", "budgets"]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Money Manager</h1>
              <p className="text-muted-foreground">Track spending, budgets, and scan receipts.</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleRefresh} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading.transactions || loading.budgets ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {!dataLoaded && loading.all ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loading text="Loading your money data..." variant="pulse" size="lg" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <Card className="bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80">
              <div className="p-4">
                <TabsList className="grid grid-cols-3 gap-2 w-full h-auto">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Wallet className="h-4 w-4 mr-2" /> Overview
                  </TabsTrigger>
                  <TabsTrigger value="transactions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <List className="h-4 w-4 mr-2" /> Transactions
                  </TabsTrigger>
                  <TabsTrigger value="receipts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <ReceiptText className="h-4 w-4 mr-2" /> Receipts
                  </TabsTrigger>
                </TabsList>
              </div>
            </Card>

            <TabsContent value="overview">
              <Suspense fallback={<CardLoading />}>
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BudgetOverview transactions={transactions} budgets={budgets} />
                  </CardContent>
                </Card>
              </Suspense>
            </TabsContent>

            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <TransactionList transactions={transactions} onRefresh={() => refreshData(["transactions"])} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="receipts">
              <ReceiptScanner refreshData={() => refreshData(["transactions", "bills"])} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
