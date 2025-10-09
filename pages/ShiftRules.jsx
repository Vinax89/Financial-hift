
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { logError } from '@/utils/logger.js';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { Input } from '@/ui/input';
import { Settings, Plus, Search, Filter, DollarSign, Clock, Star, AlertTriangle, CheckCircle, Edit, Trash2, Copy } from 'lucide-react';
import { ShiftRule } from '@/api/entities';
import { useToast } from '@/ui/use-toast';
import { formatCurrency } from '@/utils/calculations';
import { ThemedCard, ThemedButton } from '@/ui/enhanced-components';
import { Loading, LoadingWrapper } from '@/ui/loading';
import { ErrorBoundary } from '@/shared/ErrorBoundary';
import ShiftRuleForm from '@/shift-rules/ShiftRuleForm';
import ShiftRuleList from '@/shift-rules/ShiftRuleList';
import ShiftRulePreview from '@/shift-rules/ShiftRulePreview';

export default function ShiftRulesPage() {
    const [shiftRules, setShiftRules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeTab, setActiveTab] = useState('overview');
    const { toast } = useToast();

    const loadShiftRules = useCallback(async () => {
        try {
            setIsLoading(true);
            const rules = await ShiftRule.list('-updated_date');
            setShiftRules(Array.isArray(rules) ? rules : []);
        } catch (error) {
            logError('Failed to load shift rules', error);
            toast({
                title: 'Failed to load shift rules',
                description: error.message,
                variant: 'destructive'
            });
            setShiftRules([]);
        } finally {
            setIsLoading(false);
        }
    }, [toast]); // Added toast to dependency array

    useEffect(() => {
        loadShiftRules();
    }, [loadShiftRules]); // Added loadShiftRules to dependency array

    const filteredRules = useMemo(() => {
        let filtered = shiftRules;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(rule => 
                rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rule.facility?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (filterStatus !== 'all') {
            if (filterStatus === 'active') {
                filtered = filtered.filter(rule => rule.active);
            } else if (filterStatus === 'inactive') {
                filtered = filtered.filter(rule => !rule.active);
            } else if (filterStatus === 'expired') {
                const now = new Date();
                filtered = filtered.filter(rule => 
                    rule.expiration_date && new Date(rule.expiration_date) < now
                );
            }
        }

        return filtered;
    }, [shiftRules, searchTerm, filterStatus]);

    const handleCreateRule = () => {
        setEditingRule(null);
        setShowForm(true);
        setActiveTab('form');
    };

    const handleEditRule = (rule) => {
        setEditingRule(rule);
        setShowForm(true);
        setActiveTab('form');
    };

    const handleSaveRule = async (ruleData) => {
        try {
            if (editingRule) {
                await ShiftRule.update(editingRule.id, ruleData);
                toast({
                    title: 'Shift Rule Updated',
                    description: `${ruleData.name} has been updated successfully.`
                });
            } else {
                await ShiftRule.create(ruleData);
                toast({
                    title: 'Shift Rule Created',
                    description: `${ruleData.name} has been created successfully.`
                });
            }
            
            setShowForm(false);
            setEditingRule(null);
            setActiveTab('overview');
            await loadShiftRules();
        } catch (error) {
            toast({
                title: 'Failed to save shift rule',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    const handleDeleteRule = async (rule) => {
        if (!confirm(`Are you sure you want to delete "${rule.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await ShiftRule.delete(rule.id);
            toast({
                title: 'Shift Rule Deleted',
                description: `${rule.name} has been deleted.`
            });
            await loadShiftRules();
        } catch (error) {
            toast({
                title: 'Failed to delete shift rule',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    const handleCloneRule = async (rule) => {
        const clonedData = {
            ...rule,
            name: `${rule.name} (Copy)`,
            active: false // Clone as inactive for safety
        };
        
        // Remove ID and timestamps
        delete clonedData.id;
        delete clonedData.created_date;
        delete clonedData.updated_date;
        
        setEditingRule(clonedData);
        setShowForm(true);
        setActiveTab('form');
    };

    const handleToggleActive = async (rule) => {
        try {
            await ShiftRule.update(rule.id, { active: !rule.active });
            toast({
                title: `Rule ${rule.active ? 'Deactivated' : 'Activated'}`,
                description: `${rule.name} is now ${rule.active ? 'inactive' : 'active'}.`
            });
            await loadShiftRules();
        } catch (error) {
            toast({
                title: 'Failed to update rule',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    const stats = useMemo(() => {
        const activeRules = shiftRules.filter(r => r.active).length;
        const inactiveRules = shiftRules.filter(r => !r.active).length;
        const now = new Date();
        const expiredRules = shiftRules.filter(r => 
            r.expiration_date && new Date(r.expiration_date) < now
        ).length;
        const avgHourlyRate = shiftRules.length > 0 
            ? shiftRules.reduce((sum, r) => sum + (r.base_hourly_rate || 0), 0) / shiftRules.length 
            : 0;

        return { activeRules, inactiveRules, expiredRules, avgHourlyRate };
    }, [shiftRules]);

    return (
        <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Settings className="h-8 w-8 text-primary" />
                            Shift Rules Management
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Configure pay rates, differentials, and calculation rules for your shifts
                        </p>
                    </div>
                    <ThemedButton onClick={handleCreateRule} className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Rule
                    </ThemedButton>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <ThemedCard>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Rules</p>
                                    <p className="text-2xl font-bold">{shiftRules.length}</p>
                                </div>
                                <Settings className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </ThemedCard>
                    <ThemedCard>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.activeRules}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </ThemedCard>
                    <ThemedCard>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Average Rate</p>
                                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.avgHourlyRate)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </ThemedCard>
                    <ThemedCard>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Expired</p>
                                    <p className="text-2xl font-bold text-orange-600">{stats.expiredRules}</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </ThemedCard>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-3 w-full max-w-md">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="form">
                            {showForm ? (editingRule ? 'Edit Rule' : 'New Rule') : 'Create Rule'}
                        </TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {/* Search and Filters */}
                        <ThemedCard>
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by name, facility, or description..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="px-3 py-2 border border-input bg-background text-foreground rounded-md"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active Only</option>
                                            <option value="inactive">Inactive Only</option>
                                            <option value="expired">Expired Only</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </ThemedCard>

                        {/* Rules List */}
                        <ErrorBoundary>
                            <LoadingWrapper 
                                isLoading={isLoading}
                                fallback={<Loading text="Loading shift rules..." />}
                                emptyState={
                                    <ThemedCard>
                                        <CardContent className="p-8 text-center">
                                            <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                                            <h3 className="text-lg font-semibold mb-2">No shift rules found</h3>
                                            <p className="text-muted-foreground mb-4">
                                                Create your first shift rule to start managing pay calculations
                                            </p>
                                            <Button onClick={handleCreateRule}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create Your First Rule
                                            </Button>
                                        </CardContent>
                                    </ThemedCard>
                                }
                                isEmpty={filteredRules.length === 0 && !isLoading}
                            >
                                <ShiftRuleList
                                    rules={filteredRules}
                                    onEdit={handleEditRule}
                                    onDelete={handleDeleteRule}
                                    onClone={handleCloneRule}
                                    onToggleActive={handleToggleActive}
                                />
                            </LoadingWrapper>
                        </ErrorBoundary>
                    </TabsContent>

                    <TabsContent value="form">
                        <ErrorBoundary>
                            <ShiftRuleForm
                                rule={editingRule}
                                onSave={handleSaveRule}
                                onCancel={() => {
                                    setShowForm(false);
                                    setEditingRule(null);
                                    setActiveTab('overview');
                                }}
                            />
                        </ErrorBoundary>
                    </TabsContent>

                    <TabsContent value="preview">
                        <ErrorBoundary>
                            <ShiftRulePreview 
                                rules={shiftRules.filter(r => r.active)}
                                onEditRule={handleEditRule}
                            />
                        </ErrorBoundary>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
