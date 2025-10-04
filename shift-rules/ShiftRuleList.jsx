import React from 'react';
import { Button } from '@/ui/button.jsx';
import { Badge } from '@/ui/badge.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { 
    Edit, 
    Trash2, 
    Copy, 
    ToggleLeft, 
    ToggleRight, 
    DollarSign, 
    Clock, 
    Calendar,
    MapPin,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import { ThemedCard } from '@/ui/enhanced-components.jsx';

export default function ShiftRuleList({ rules, onEdit, onDelete, onClone, onToggleActive }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString();
    };

    const isExpired = (rule) => {
        if (!rule.expiration_date) return false;
        return new Date(rule.expiration_date) < new Date();
    };

    const getDifferentialCount = (rule) => {
        return rule.differentials?.length || 0;
    };

    return (
        <div className="space-y-4">
            {rules.map(rule => (
                <ThemedCard key={rule.id} className={`transition-all ${isExpired(rule) ? 'border-orange-200 bg-orange-50/50 dark:bg-orange-950/20' : ''}`}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        {rule.active ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                Inactive
                                            </Badge>
                                        )}
                                        {isExpired(rule) && (
                                            <Badge variant="destructive">
                                                <AlertTriangle className="w-3 h-3 mr-1" />
                                                Expired
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                {rule.description && (
                                    <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                                )}
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        <span>Base: {formatCurrency(rule.base_hourly_rate)}/hr</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>OT: {rule.overtime_threshold || 40}h @ {rule.overtime_multiplier}x</span>
                                    </div>
                                    {rule.facility && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{rule.facility}</span>
                                        </div>
                                    )}
                                    {getDifferentialCount(rule) > 0 && (
                                        <div className="flex items-center gap-1">
                                            <span className="w-4 h-4 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                                                {getDifferentialCount(rule)}
                                            </span>
                                            <span>Differentials</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onToggleActive(rule)}
                                    className={rule.active ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}
                                >
                                    {rule.active ? (
                                        <ToggleRight className="w-5 h-5" />
                                    ) : (
                                        <ToggleLeft className="w-5 h-5" />
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onClone(rule)}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit(rule)}
                                    className="text-orange-600 hover:text-orange-700"
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(rule)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    
                    {(rule.effective_date || rule.expiration_date || rule.union_contract) && (
                        <CardContent className="pt-0">
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                {rule.effective_date && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>Effective: {formatDate(rule.effective_date)}</span>
                                    </div>
                                )}
                                {rule.expiration_date && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>Expires: {formatDate(rule.expiration_date)}</span>
                                    </div>
                                )}
                                {rule.union_contract && (
                                    <div>
                                        <span>Contract: {rule.union_contract}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    )}
                </ThemedCard>
            ))}
        </div>
    );
}