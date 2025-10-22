/**
 * @fileoverview Investment portfolio tracker and manager (TypeScript)
 * @description Manages investment portfolio with CRUD operations, tracks gains/losses,
 * calculates total value and performance metrics across all accounts
 */

import React, { useState, useMemo } from 'react';
import { logError } from '@/utils/logger';
import { Investment } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table';
import { useToast } from "@/ui/use-toast";
import { Plus, Edit, Trash2, TrendingUp, DollarSign, MoreHorizontal, X } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import { AnimatePresence, motion } from 'framer-motion';

/** Investment type options */
const investmentTypes = ["stock", "bond", "mutual_fund", "etf", "crypto", "real_estate", "other"] as const;
type InvestmentType = typeof investmentTypes[number];

/** Account type options */
const accountTypes = ["taxable", "401k", "ira_traditional", "ira_roth", "hsa", "other"] as const;
type AccountType = typeof accountTypes[number];

/**
 * Investment data structure
 */
interface InvestmentData {
    id?: string;
    symbol: string;
    name: string;
    type: InvestmentType;
    shares: number | string;
    purchase_price: number | string;
    current_price: number | string;
    current_value?: number;
    account_type: AccountType;
    purchase_date: string;
}

/**
 * Investment totals calculation
 */
interface InvestmentTotals {
    totalValue: number;
    totalCost: number;
    totalGainLoss: number;
    performance: number;
}

/**
 * Props for InvestmentForm component
 */
interface InvestmentFormProps {
    /** Existing investment to edit (null for new) */
    investment: InvestmentData | null;
    /** Submit handler */
    onSubmit: (data: InvestmentData) => void;
    /** Cancel handler */
    onCancel: () => void;
}

/**
 * Props for InvestmentTracker component
 */
interface InvestmentTrackerProps {
    /** List of investment holdings */
    investments: InvestmentData[];
    /** Callback to refresh data after changes */
    refreshData: () => void;
}

/**
 * Investment Form Component
 * 
 * Form for adding or editing investment holdings with:
 * - Symbol, name, type selection
 * - Shares and pricing inputs
 * - Account type classification
 * - Form validation
 * 
 * @component
 * @param {InvestmentFormProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const InvestmentForm: React.FC<InvestmentFormProps> = ({ investment, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<InvestmentData>(investment || {
        symbol: '', 
        name: '', 
        type: 'stock', 
        shares: '', 
        purchase_price: '', 
        current_price: '', 
        account_type: 'taxable', 
        purchase_date: new Date().toISOString().split('T')[0]
    });

    const handleChange = (field: keyof InvestmentData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericData: InvestmentData = {
            ...formData,
            shares: parseFloat(formData.shares as string),
            purchase_price: parseFloat(formData.purchase_price as string),
            current_price: parseFloat(formData.current_price as string),
        };
        numericData.current_value = numericData.shares as number * (numericData.current_price as number);
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
                                    <SelectContent>
                                        {investmentTypes.map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}
                                    </SelectContent>
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

/**
 * Investment Tracker Component
 * 
 * Manages investment portfolio with:
 * - CRUD operations for holdings
 * - Real-time gain/loss calculations
 * - Portfolio performance metrics
 * - Total value aggregation
 * - Type-safe data management
 * 
 * @component
 * @param {InvestmentTrackerProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
function InvestmentTracker({ investments, refreshData }: InvestmentTrackerProps): JSX.Element {
    const { toast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState<InvestmentData | null>(null);

    const investmentTotals = useMemo<InvestmentTotals>(() => {
        if (!investments) return { totalValue: 0, totalCost: 0, totalGainLoss: 0, performance: 0 };
        const totalValue = investments.reduce((sum, i) => sum + ((i.shares as number) * (i.current_price as number)), 0);
        const totalCost = investments.reduce((sum, i) => sum + ((i.shares as number) * (i.purchase_price as number)), 0);
        const totalGainLoss = totalValue - totalCost;
        const performance = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
        return { totalValue, totalCost, totalGainLoss, performance };
    }, [investments]);

    const handleSubmit = async (data: InvestmentData) => {
        try {
            if (editingInvestment && editingInvestment.id) {
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
            logError('Investment operation failed', error);
        }
    };

    const handleEdit = (inv: InvestmentData) => {
        setEditingInvestment(inv);
        setShowForm(true);
    };

    const handleDelete = async (id: string | undefined) => {
        if (!id) return;
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
                            const shares = inv.shares as number;
                            const currentPrice = inv.current_price as number;
                            const purchasePrice = inv.purchase_price as number;
                            const currentValue = shares * currentPrice;
                            const costBasis = shares * purchasePrice;
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

export default InvestmentTracker;

import { logError } from '@/utils/logger';
import { Investment } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table';
import { useToast } from '@/ui/use-toast';
import { Plus, Edit, Trash2, TrendingUp, DollarSign, MoreHorizontal, X } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import { AnimatePresence, motion } from 'framer-motion';

/** @constant {string[]} Available investment types */
const investmentTypes = ["stock", "bond", "mutual_fund", "etf", "crypto", "real_estate", "other"];
/** @constant {string[]} Available account types */
const accountTypes = ["taxable", "401k", "ira_traditional", "ira_roth", "hsa", "other"];

/**
 * Investment Form Component
 * @param {Object} props
 * @param {Object} props.investment - Existing investment to edit (null for new)
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} props.onCancel - Cancel handler
 * @returns {JSX.Element}
 */
const InvestmentForm = ({ investment, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(investment || {
        symbol: '', name: '', type: 'stock', shares: '', purchase_price: '', current_price: '', account_type: 'taxable', purchase_date: new Date().toISOString().split('T')[0]
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: any) => {
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
                                <Input id="name" value={formData.name} onChange={(e: any) => handleChange('name', e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="symbol">Symbol</Label>
                                <Input id="symbol" value={formData.symbol} onChange={(e: any) => handleChange('symbol', e.target.value)} />
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
                                <Input id="shares" type="number" step="any" value={formData.shares} onChange={(e: any) => handleChange('shares', e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="purchase_price">Purchase Price</Label>
                                <Input id="purchase_price" type="number" step="any" value={formData.purchase_price} onChange={(e: any) => handleChange('purchase_price', e.target.value)} required />
                            </div>
                             <div className="space-y-1">
                                <Label htmlFor="current_price">Current Price</Label>
                                <Input id="current_price" type="number" step="any" value={formData.current_price} onChange={(e: any) => handleChange('current_price', e.target.value)} required />
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

/**
 * Investment Tracker Component
 * @component
 * @param {Object} props
 * @param {Array} props.investments - List of investment holdings
 * @param {Function} props.refreshData - Callback to refresh data after changes
 * @returns {JSX.Element}
 */
interface InvestmentTrackerProps {
  investments?: any[];
  refreshData?: () => void;
}

function InvestmentTracker({ investments, refreshData }: InvestmentTrackerProps) {
    const { toast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState<any>(null);

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
            logError('Investment operation failed', error);
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

export default InvestmentTracker;
