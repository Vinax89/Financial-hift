import React, { useState, useMemo } from 'react';
import { Investment } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, TrendingUp, DollarSign, MoreHorizontal, X } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import { AnimatePresence, motion } from 'framer-motion';

const investmentTypes = ["stock", "bond", "mutual_fund", "etf", "crypto", "real_estate", "other"];
const accountTypes = ["taxable", "401k", "ira_traditional", "ira_roth", "hsa", "other"];

const InvestmentForm = ({ investment, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(investment || {
        symbol: '', name: '', type: 'stock', shares: '', purchase_price: '', current_price: '', account_type: 'taxable', purchase_date: new Date().toISOString().split('T')[0]
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const numericData = {
            ...formData,
            shares: parseFloat(formData.shares),
            purchase_price: parseFloat(formData.purchase_price),
            current_price: parseFloat(formData.current_price),
        };
        numericData.current_value = numericData.shares * numericData.current_price;
        onSubmit(numericData);
    };

    return (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="mb-6 bg-slate-50/80">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>{investment ? 'Edit' : 'Add'} Investment</CardTitle>
                        <Button variant="ghost" size="icon" onClick={onCancel}><X className="h-4 w-4" /></Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="symbol">Symbol</Label>
                                <Input id="symbol" value={formData.symbol} onChange={(e) => handleChange('symbol', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="type">Type</Label>
                                <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{investmentTypes.map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="shares">Shares</Label>
                                <Input id="shares" type="number" step="any" value={formData.shares} onChange={(e) => handleChange('shares', e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="purchase_price">Purchase Price</Label>
                                <Input id="purchase_price" type="number" step="any" value={formData.purchase_price} onChange={(e) => handleChange('purchase_price', e.target.value)} required />
                            </div>
                             <div className="space-y-1">
                                <Label htmlFor="current_price">Current Price</Label>
                                <Input id="current_price" type="number" step="any" value={formData.current_price} onChange={(e) => handleChange('current_price', e.target.value)} required />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                            <Button type="submit">{investment ? 'Update' : 'Save'} Investment</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default function InvestmentTracker({ investments, refreshData }) {
    const { toast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState(null);

    const investmentTotals = useMemo(() => {
        if (!investments) return { totalValue: 0, totalCost: 0, totalGainLoss: 0, performance: 0 };
        const totalValue = investments.reduce((sum, i) => sum + (i.shares * i.current_price), 0);
        const totalCost = investments.reduce((sum, i) => sum + (i.shares * i.purchase_price), 0);
        const totalGainLoss = totalValue - totalCost;
        const performance = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
        return { totalValue, totalCost, totalGainLoss, performance };
    }, [investments]);

    const handleSubmit = async (data) => {
        try {
            if (editingInvestment) {
                await Investment.update(editingInvestment.id, data);
                toast({ title: "Success", description: "Investment updated." });
            } else {
                await Investment.create(data);
                toast({ title: "Success", description: "Investment added." });
            }
            setShowForm(false);
            setEditingInvestment(null);
            refreshData();
        } catch (error) {
            toast({ title: "Error", description: "Could not save investment.", variant: "destructive" });
            console.error(error);
        }
    };

    const handleEdit = (inv) => {
        setEditingInvestment(inv);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            await Investment.delete(id);
            toast({ title: "Success", description: "Investment deleted." });
            refreshData();
        } catch (error) {
            toast({ title: "Error", description: "Could not delete investment.", variant: "destructive" });
        }
    };

    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Investment Portfolio
                    </CardTitle>
                    <Button size="sm" onClick={() => { setShowForm(!showForm); setEditingInvestment(null); }}>
                        <Plus className="w-4 h-4 mr-2" /> Add Investment
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <AnimatePresence>
                    {showForm && <InvestmentForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} investment={editingInvestment} />}
                </AnimatePresence>
                
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Current Value</TableHead>
                            <TableHead>Gain/Loss</TableHead>
                            <TableHead>% Change</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {investments && investments.map(inv => {
                            const currentValue = inv.shares * inv.current_price;
                            const costBasis = inv.shares * inv.purchase_price;
                            const gainLoss = currentValue - costBasis;
                            const percentage = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
                            return (
                                <TableRow key={inv.id}>
                                    <TableCell className="font-medium">{inv.name}</TableCell>
                                    <TableCell>{formatCurrency(currentValue)}</TableCell>
                                    <TableCell className={gainLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{formatCurrency(gainLoss)}</TableCell>
                                    <TableCell className={percentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{percentage.toFixed(2)}%</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(inv)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(inv.id)}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                 {investments.length === 0 && <p className="text-center text-slate-500 py-8">No investments tracked yet.</p>}
            </CardContent>
            <CardFooter className="bg-slate-50/80 flex justify-around p-4 border-t">
                <div className="text-center">
                    <p className="text-sm text-slate-600">Total Value</p>
                    <p className="font-bold text-lg text-blue-600">{formatCurrency(investmentTotals.totalValue)}</p>
                </div>
                 <div className="text-center">
                    <p className="text-sm text-slate-600">Total Gain/Loss</p>
                    <p className={`font-bold text-lg ${investmentTotals.totalGainLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(investmentTotals.totalGainLoss)}</p>
                </div>
                 <div className="text-center">
                    <p className="text-sm text-slate-600">Overall Return</p>
                    <p className={`font-bold text-lg ${investmentTotals.performance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{investmentTotals.performance.toFixed(2)}%</p>
                </div>
            </CardFooter>
        </Card>
    );
}