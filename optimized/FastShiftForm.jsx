import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Textarea } from '@/ui/textarea';
import { Badge } from '@/ui/badge';
import { ThemedButton, ThemedInput } from '../ui/enhanced-components';
import { Clock, MapPin, DollarSign, Calendar, Tag, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import { validateShift } from '../utils/validation';
import { format } from 'date-fns';
import { ErrorMessage, InlineError } from '@/shared/ErrorMessage';
import { logError } from '@/utils/logger';

// Simple field error component
const FieldError = ({ error, className }) => {
    if (!error) return null;
    return <p className={`text-xs text-destructive mt-1 ${className || ''}`}>{error}</p>;
};

// Memoized tag input component
const TagInput = React.memo(({ tags = [], onChange, suggestions = [] }) => {
    const [inputValue, setInputValue] = useState('');

    const addTag = useCallback((tag) => {
        if (tag && !tags.includes(tag)) {
            onChange([...tags, tag]);
        }
        setInputValue('');
    }, [tags, onChange]);

    const removeTag = useCallback((tagToRemove) => {
        onChange(tags.filter(tag => tag !== tagToRemove));
    }, [tags, onChange]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            addTag(inputValue.trim());
        }
    }, [inputValue, addTag]);

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-muted-foreground hover:text-destructive"
                        >
                            ×
                        </button>
                    </Badge>
                ))}
            </div>
            <ThemedInput
                placeholder="Add tags (press Enter)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {suggestions.map(suggestion => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => addTag(suggestion)}
                            className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded text-muted-foreground"
                        >
                            + {suggestion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
});

TagInput.displayName = 'TagInput';

export default function FastShiftForm({ shift, onSubmit, onCancel, allShifts = [] }) {
    const [formData, setFormData] = useState(() => ({
        title: shift?.title || '',
        start_datetime: shift?.start_datetime ? shift.start_datetime.slice(0, 16) : '',
        end_datetime: shift?.end_datetime ? shift.end_datetime.slice(0, 16) : '',
        scheduled_hours: shift?.scheduled_hours || 0,
        actual_hours: shift?.actual_hours || shift?.scheduled_hours || 0,
        break_hours: shift?.break_hours || 0,
        location: shift?.location || '',
        department: shift?.department || '',
        shift_type: shift?.shift_type || 'regular',
        status: shift?.status || 'completed',
        tags: shift?.tags || [],
        notes: shift?.notes || '',
        gross_pay: shift?.gross_pay || 0,
        net_pay: shift?.net_pay || 0,
        manager: shift?.manager || '',
        patient_census: shift?.patient_census || null,
        is_mandatory: shift?.is_mandatory || false
    }));

    const [validation, setValidation] = useState({ isValid: true, errors: {} });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Memoized suggestions for tags
    const tagSuggestions = useMemo(() => [
        'night', 'weekend', 'holiday', 'charge', 'call', 'overtime', 'float', 'cancel', 'bonus'
    ], []);

    // Memoized field change handler
    const handleFieldChange = useCallback((field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            
            // Auto-calculate hours if start/end times change
            if (field === 'start_datetime' || field === 'end_datetime') {
                if (newData.start_datetime && newData.end_datetime) {
                    const start = new Date(newData.start_datetime);
                    const end = new Date(newData.end_datetime);
                    const diffHours = (end - start) / (1000 * 60 * 60);
                    
                    if (diffHours > 0) {
                        newData.scheduled_hours = diffHours;
                        if (!prev.actual_hours || prev.actual_hours === prev.scheduled_hours) {
                            newData.actual_hours = diffHours;
                        }
                    }
                }
            }
            
            return newData;
        });
    }, []);

    // Memoized validation with overlap checking
    const validatedData = useMemo(() => {
        // Filter out current shift when editing to avoid self-overlap detection
        const otherShifts = shift 
            ? allShifts.filter(s => s.id !== shift.id)
            : allShifts;
        
        const result = validateShift(formData, otherShifts);
        setValidation(result);
        return result;
    }, [formData, allShifts, shift]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        if (!validatedData.isValid) return;
        
        setIsSubmitting(true);
        try {
            const submitData = {
                ...formData,
                scheduled_hours: parseFloat(formData.scheduled_hours) || 0,
                actual_hours: parseFloat(formData.actual_hours) || 0,
                break_hours: parseFloat(formData.break_hours) || 0,
                gross_pay: parseFloat(formData.gross_pay) || 0,
                net_pay: parseFloat(formData.net_pay) || 0,
                patient_census: formData.patient_census ? parseInt(formData.patient_census) : null,
            };
            
            await onSubmit(submitData);
        } catch (error) {
            logError('Submit error', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validatedData.isValid, onSubmit]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    {shift ? 'Edit Shift' : 'Add New Shift'}
                </h3>
                {!validatedData.isValid && (
                    <InlineError message="Please fix errors below" />
                )}
            </div>

            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Shift Title *</Label>
                    <ThemedInput
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        placeholder="e.g., RN - ICU Day Shift"
                        error={validation.errors.title}
                    />
                    <FieldError error={validation.errors.title} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="shift_type">Shift Type</Label>
                    <Select value={formData.shift_type} onValueChange={(value) => handleFieldChange('shift_type', value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="overtime">Overtime</SelectItem>
                            <SelectItem value="call">On-Call</SelectItem>
                            <SelectItem value="prn">PRN</SelectItem>
                            <SelectItem value="double">Double</SelectItem>
                            <SelectItem value="holiday">Holiday</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Date and Time */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="start_datetime">Start Date & Time *</Label>
                    <ThemedInput
                        id="start_datetime"
                        type="datetime-local"
                        value={formData.start_datetime}
                        onChange={(e) => handleFieldChange('start_datetime', e.target.value)}
                        error={validation.errors.start_datetime}
                    />
                    <FieldError error={validation.errors.start_datetime} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="end_datetime">End Date & Time *</Label>
                    <ThemedInput
                        id="end_datetime"
                        type="datetime-local"
                        value={formData.end_datetime}
                        onChange={(e) => handleFieldChange('end_datetime', e.target.value)}
                        error={validation.errors.end_datetime || validation.errors.overlap}
                    />
                    <FieldError error={validation.errors.end_datetime} />
                </div>
            </div>

            {/* Overlap Warning */}
            {validation.errors.overlap && (
                <ErrorMessage
                    title="Shift Overlap Detected"
                    message={validation.errors.overlap}
                    severity="warning"
                />
            )}

            {/* Hours */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="scheduled_hours">Scheduled Hours</Label>
                    <ThemedInput
                        id="scheduled_hours"
                        type="number"
                        step="0.25"
                        min="0"
                        max="24"
                        value={formData.scheduled_hours}
                        onChange={(e) => handleFieldChange('scheduled_hours', e.target.value)}
                        error={validation.errors.scheduled_hours}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="actual_hours">Actual Hours</Label>
                    <ThemedInput
                        id="actual_hours"
                        type="number"
                        step="0.25"
                        min="0"
                        max="24"
                        value={formData.actual_hours}
                        onChange={(e) => handleFieldChange('actual_hours', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="break_hours">Break Hours</Label>
                    <ThemedInput
                        id="break_hours"
                        type="number"
                        step="0.25"
                        min="0"
                        max="4"
                        value={formData.break_hours}
                        onChange={(e) => handleFieldChange('break_hours', e.target.value)}
                    />
                </div>
            </div>

            {/* Location and Department */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location/Unit
                    </Label>
                    <ThemedInput
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleFieldChange('location', e.target.value)}
                        placeholder="e.g., ICU, ER, Med-Surg"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <ThemedInput
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleFieldChange('department', e.target.value)}
                        placeholder="e.g., Nursing, Respiratory"
                    />
                </div>
            </div>

            {/* Pay Information */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="gross_pay" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Gross Pay
                    </Label>
                    <ThemedInput
                        id="gross_pay"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.gross_pay}
                        onChange={(e) => handleFieldChange('gross_pay', e.target.value)}
                        placeholder="0.00"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="net_pay">Net Pay</Label>
                    <ThemedInput
                        id="net_pay"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.net_pay}
                        onChange={(e) => handleFieldChange('net_pay', e.target.value)}
                        placeholder="0.00"
                    />
                </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
                <Label>Tags</Label>
                <TagInput
                    tags={formData.tags}
                    onChange={(tags) => handleFieldChange('tags', tags)}
                    suggestions={tagSuggestions}
                />
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    placeholder="Additional notes about this shift..."
                    rows={3}
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <ThemedButton 
                    type="submit" 
                    disabled={!validatedData.isValid} 
                    loading={isSubmitting}
                >
                    {shift ? 'Update Shift' : 'Add Shift'}
                </ThemedButton>
            </div>
        </form>
    );
}