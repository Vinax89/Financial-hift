/**
 * @fileoverview Enhanced card components with advanced styling and interactions
 * @description Card extensions with status indicators, trends, actions, and multiple variants (stats, features)
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { MoreVertical, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/ui/dropdown-menu';

/**
 * Enhanced card with visual hierarchy, status, trends, and actions
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.title] - Card title
 * @param {string} [props.subtitle] - Card subtitle
 * @param {string|number} [props.value] - Primary value display
 * @param {number} [props.trend] - Trend percentage (positive/negative)
 * @param {React.ComponentType} [props.icon] - Icon component
 * @param {Array} [props.actions=[]] - Dropdown actions
 * @param {'default'|'success'|'warning'|'danger'|'info'} [props.variant='default'] - Card variant
 * @param {'active'|'warning'|'danger'|'inactive'} [props.status] - Status indicator
 * @returns {JSX.Element} Enhanced card with rich features
 */
export function EnhancedCard({ 
    title,
    subtitle,
    value,
    previousValue,
    icon: Icon,
    trend,
    actions = [],
    className,
    children,
    variant = 'default',
    status,
    onClick,
    ...props
}) {
    const isClickable = !!onClick;
    
    const trendIcon = trend > 0 ? TrendingUp : TrendingDown;
    const trendColor = trend > 0 ? 'text-emerald-600' : 'text-red-600';
    
    const variantStyles = {
        default: 'bg-white border-slate-200',
        success: 'bg-emerald-50 border-emerald-200',
        warning: 'bg-amber-50 border-amber-200',
        danger: 'bg-red-50 border-red-200',
        info: 'bg-blue-50 border-blue-200'
    };

    const statusStyles = {
        active: 'border-l-4 border-l-emerald-500',
        warning: 'border-l-4 border-l-amber-500',
        danger: 'border-l-4 border-l-red-500',
        inactive: 'border-l-4 border-l-slate-300'
    };

    return (
        <Card 
            className={cn(
                'transition-all duration-200 hover:shadow-lg',
                variantStyles[variant],
                status && statusStyles[status],
                isClickable && 'cursor-pointer hover:shadow-xl hover:scale-[1.02]',
                className
            )}
            onClick={onClick}
            {...props}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center space-x-3">
                    {Icon && (
                        <div className={cn(
                            'p-2 rounded-lg',
                            variant === 'success' ? 'bg-emerald-100' :
                            variant === 'warning' ? 'bg-amber-100' :
                            variant === 'danger' ? 'bg-red-100' :
                            variant === 'info' ? 'bg-blue-100' :
                            'bg-slate-100'
                        )}>
                            <Icon className={cn(
                                'h-5 w-5',
                                variant === 'success' ? 'text-emerald-700' :
                                variant === 'warning' ? 'text-amber-700' :
                                variant === 'danger' ? 'text-red-700' :
                                variant === 'info' ? 'text-blue-700' :
                                'text-slate-700'
                            )} />
                        </div>
                    )}
                    <div>
                        <CardTitle className="text-lg font-semibold text-slate-900">
                            {title}
                        </CardTitle>
                        {subtitle && (
                            <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
                        )}
                    </div>
                </div>
                
                {actions.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {actions.map((action, index) => (
                                <DropdownMenuItem key={index} onClick={action.onClick}>
                                    {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                                    {action.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </CardHeader>
            
            <CardContent>
                {value !== undefined && (
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-3xl font-bold text-slate-900">
                                {value}
                            </div>
                            {trend !== undefined && (
                                <div className={cn('flex items-center text-sm mt-1', trendColor)}>
                                    {React.createElement(trendIcon, { className: 'h-4 w-4 mr-1' })}
                                    {Math.abs(trend).toFixed(1)}%
                                </div>
                            )}
                        </div>
                        {previousValue && (
                            <Badge variant="secondary" className="text-xs">
                                vs {previousValue}
                            </Badge>
                        )}
                    </div>
                )}
                
                {children}
            </CardContent>
        </Card>
    );
}

// Quick stats card for dashboard
export function StatsCard({ 
    title, 
    value, 
    change, 
    changeType = 'neutral',
    icon: Icon,
    className 
}) {
    const changeColor = {
        positive: 'text-emerald-600 bg-emerald-50',
        negative: 'text-red-600 bg-red-50',
        neutral: 'text-slate-600 bg-slate-50'
    };

    return (
        <div className={cn(
            'bg-white rounded-xl border border-slate-200 p-6',
            'hover:shadow-lg transition-shadow duration-200',
            className
        )}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
                {Icon && (
                    <div className="p-3 bg-emerald-100 rounded-lg">
                        <Icon className="h-6 w-6 text-emerald-700" />
                    </div>
                )}
            </div>
            
            {change && (
                <div className={cn(
                    'flex items-center mt-4 px-2 py-1 rounded-lg text-sm font-medium',
                    changeColor[changeType]
                )}>
                    {change}
                </div>
            )}
        </div>
    );
}

// Feature card for highlighting key functionality
export function FeatureCard({ 
    title, 
    description, 
    icon: Icon, 
    actions = [],
    isNew = false,
    className 
}) {
    return (
        <div className={cn(
            'relative bg-white rounded-xl border border-slate-200 p-6',
            'hover:shadow-lg hover:border-emerald-300 transition-all duration-200',
            'group cursor-pointer',
            className
        )}>
            {isNew && (
                <div className="absolute -top-2 -right-2">
                    <Badge className="bg-emerald-600 hover:bg-emerald-700">
                        <Sparkles className="h-3 w-3 mr-1" />
                        New
                    </Badge>
                </div>
            )}
            
            <div className="flex items-start space-x-4">
                {Icon && (
                    <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                        <Icon className="h-6 w-6 text-emerald-700" />
                    </div>
                )}
                
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        {description}
                    </p>
                    
                    {actions.length > 0 && (
                        <div className="flex space-x-2">
                            {actions.map((action, index) => (
                                <Button 
                                    key={index}
                                    variant={index === 0 ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={action.onClick}
                                >
                                    {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                                    {action.label}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}