/**
 * Progressive Form Enhancement Utilities
 * 
 * Features:
 * - Autosave with debouncing
 * - Field-level validation
 * - Optimistic updates
 * - Form state management
 * - Undo/redo functionality
 */

import React from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { validateData } from '@/utils/validation';
import { announceSuccess, announceError } from '@/utils/accessibility';

/**
 * Autosave hook with debouncing
 */
export function useAutosave(onSave, options = {}) {
    const {
        delay = 2000,
        enabled = true,
        onSuccess = null,
        onError = null,
    } = options;

    const [isSaving, setIsSaving] = React.useState(false);
    const [lastSaved, setLastSaved] = React.useState(null);
    const [error, setError] = React.useState(null);

    const saveData = React.useCallback(async (data) => {
        if (!enabled || !data) return;

        setIsSaving(true);
        setError(null);

        try {
            await onSave(data);
            setLastSaved(new Date());
            onSuccess?.();
            announceSuccess('Changes saved automatically');
        } catch (err) {
            setError(err);
            onError?.(err);
            announceError('Failed to save changes');
            console.error('Autosave error:', err);
        } finally {
            setIsSaving(false);
        }
    }, [onSave, enabled, onSuccess, onError]);

    const debouncedSave = useDebounce(saveData, delay);

    return {
        save: debouncedSave,
        isSaving,
        lastSaved,
        error,
    };
}

/**
 * Enhanced form state management with validation
 */
export function useFormState(initialValues, schema, options = {}) {
    const {
        validateOnChange = true,
        validateOnBlur = true,
        onSubmit = null,
        autosave = false,
        autosaveDelay = 2000,
    } = options;

    const [values, setValues] = React.useState(initialValues);
    const [errors, setErrors] = React.useState({});
    const [touched, setTouched] = React.useState({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isDirty, setIsDirty] = React.useState(false);

    // Autosave
    const { save: autosaveData, isSaving, lastSaved } = useAutosave(
        async (data) => {
            if (autosave && onSubmit) {
                await onSubmit(data);
            }
        },
        {
            delay: autosaveDelay,
            enabled: autosave && isDirty,
        }
    );

    // Validate single field
    const validateField = React.useCallback((name, value) => {
        if (!schema) return null;

        try {
            const fieldSchema = schema.pick({ [name]: true });
            fieldSchema.parse({ [name]: value });
            return null;
        } catch (error) {
            return error.errors[0]?.message || 'Invalid value';
        }
    }, [schema]);

    // Validate all fields
    const validateForm = React.useCallback(() => {
        if (!schema) return { isValid: true, errors: {} };

        const result = validateData(schema, values);
        
        if (!result.success) {
            setErrors(result.errors);
            return { isValid: false, errors: result.errors };
        }

        setErrors({});
        return { isValid: true, errors: {} };
    }, [schema, values]);

    // Handle field change
    const handleChange = React.useCallback((name, value) => {
        setValues(prev => {
            const newValues = { ...prev, [name]: value };
            
            // Trigger autosave
            if (autosave) {
                autosaveData(newValues);
            }

            return newValues;
        });

        setIsDirty(true);

        // Validate on change if enabled
        if (validateOnChange && touched[name]) {
            const error = validateField(name, value);
            setErrors(prev => ({
                ...prev,
                [name]: error,
            }));
        }
    }, [validateOnChange, touched, validateField, autosave, autosaveData]);

    // Handle field blur
    const handleBlur = React.useCallback((name) => {
        setTouched(prev => ({ ...prev, [name]: true }));

        // Validate on blur if enabled
        if (validateOnBlur) {
            const error = validateField(name, values[name]);
            setErrors(prev => ({
                ...prev,
                [name]: error,
            }));
        }
    }, [validateOnBlur, validateField, values]);

    // Handle form submit
    const handleSubmit = React.useCallback(async (e) => {
        if (e) {
            e.preventDefault();
        }

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);

        // Validate form
        const { isValid, errors: validationErrors } = validateForm();

        if (!isValid) {
            announceError('Please fix the errors in the form');
            return { success: false, errors: validationErrors };
        }

        if (!onSubmit) {
            return { success: true, data: values };
        }

        setIsSubmitting(true);

        try {
            const result = await onSubmit(values);
            setIsDirty(false);
            announceSuccess('Form submitted successfully');
            return { success: true, data: result };
        } catch (error) {
            const errorMessage = error.message || 'Failed to submit form';
            announceError(errorMessage);
            return { success: false, error };
        } finally {
            setIsSubmitting(false);
        }
    }, [values, validateForm, onSubmit]);

    // Reset form
    const reset = React.useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsDirty(false);
    }, [initialValues]);

    // Set field value programmatically
    const setFieldValue = React.useCallback((name, value) => {
        handleChange(name, value);
    }, [handleChange]);

    // Set field error programmatically
    const setFieldError = React.useCallback((name, error) => {
        setErrors(prev => ({
            ...prev,
            [name]: error,
        }));
    }, []);

    // Set multiple values at once
    const setFieldValues = React.useCallback((newValues) => {
        setValues(prev => ({ ...prev, ...newValues }));
        setIsDirty(true);
    }, []);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        isDirty,
        isSaving,
        lastSaved,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        setFieldValue,
        setFieldError,
        setFieldValues,
        validateForm,
        validateField,
    };
}

/**
 * Field component with validation
 */
export function FormField({
    name,
    label,
    type = 'text',
    value,
    error,
    touched,
    required = false,
    disabled = false,
    placeholder,
    onChange,
    onBlur,
    className = '',
    ...props
}) {
    const fieldId = `field-${name}`;
    const errorId = `error-${name}`;
    const hasError = touched && error;

    return (
        <div className={`form-field ${className}`}>
            {label && (
                <label
                    htmlFor={fieldId}
                    className="block text-sm font-medium mb-1"
                >
                    {label}
                    {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
                </label>
            )}
            <input
                id={fieldId}
                name={name}
                type={type}
                value={value || ''}
                onChange={(e) => onChange(name, e.target.value)}
                onBlur={() => onBlur(name)}
                disabled={disabled}
                placeholder={placeholder}
                aria-invalid={hasError ? 'true' : 'false'}
                aria-describedby={hasError ? errorId : undefined}
                aria-required={required ? 'true' : 'false'}
                className={`w-full px-3 py-2 border rounded-md ${
                    hasError ? 'border-destructive' : 'border-input'
                }`}
                {...props}
            />
            {hasError && (
                <p
                    id={errorId}
                    className="mt-1 text-sm text-destructive"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

/**
 * Optimistic update hook
 */
export function useOptimisticUpdate(mutationFn, options = {}) {
    const {
        onSuccess = null,
        onError = null,
        rollbackOnError = true,
    } = options;

    const [optimisticData, setOptimisticData] = React.useState(null);
    const [isOptimistic, setIsOptimistic] = React.useState(false);
    const [error, setError] = React.useState(null);
    const previousDataRef = React.useRef(null);

    const mutate = React.useCallback(async (data, optimisticUpdate) => {
        // Store previous data for rollback
        previousDataRef.current = data;

        // Apply optimistic update immediately
        if (optimisticUpdate) {
            setOptimisticData(optimisticUpdate);
            setIsOptimistic(true);
        }

        try {
            // Perform actual mutation
            const result = await mutationFn(optimisticUpdate || data);
            
            // Update with real data
            setOptimisticData(null);
            setIsOptimistic(false);
            setError(null);
            
            onSuccess?.(result);
            return { success: true, data: result };
        } catch (err) {
            // Rollback on error
            if (rollbackOnError && previousDataRef.current) {
                setOptimisticData(previousDataRef.current);
                setTimeout(() => {
                    setOptimisticData(null);
                    setIsOptimistic(false);
                }, 100);
            } else {
                setOptimisticData(null);
                setIsOptimistic(false);
            }
            
            setError(err);
            onError?.(err);
            return { success: false, error: err };
        }
    }, [mutationFn, onSuccess, onError, rollbackOnError]);

    return {
        mutate,
        optimisticData,
        isOptimistic,
        error,
    };
}

/**
 * Form history (undo/redo) hook
 */
export function useFormHistory(initialValue, options = {}) {
    const { maxHistorySize = 50 } = options;

    const [history, setHistory] = React.useState([initialValue]);
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const currentValue = history[currentIndex];
    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    const pushValue = React.useCallback((value) => {
        setHistory(prev => {
            // Remove any future history if we're not at the end
            const newHistory = prev.slice(0, currentIndex + 1);
            
            // Add new value
            newHistory.push(value);
            
            // Limit history size
            if (newHistory.length > maxHistorySize) {
                newHistory.shift();
                setCurrentIndex(prev => Math.max(0, prev - 1));
            }
            
            return newHistory;
        });
        
        setCurrentIndex(prev => Math.min(prev + 1, history.length));
    }, [currentIndex, maxHistorySize, history.length]);

    const undo = React.useCallback(() => {
        if (canUndo) {
            setCurrentIndex(prev => prev - 1);
            announceSuccess('Undo applied');
        }
    }, [canUndo]);

    const redo = React.useCallback(() => {
        if (canRedo) {
            setCurrentIndex(prev => prev + 1);
            announceSuccess('Redo applied');
        }
    }, [canRedo]);

    const clear = React.useCallback(() => {
        setHistory([initialValue]);
        setCurrentIndex(0);
    }, [initialValue]);

    return {
        value: currentValue,
        pushValue,
        undo,
        redo,
        canUndo,
        canRedo,
        clear,
    };
}

/**
 * Multi-step form hook
 */
export function useMultiStepForm(steps, options = {}) {
    const {
        initialStep = 0,
        onStepChange = null,
        onComplete = null,
    } = options;

    const [currentStep, setCurrentStep] = React.useState(initialStep);
    const [completedSteps, setCompletedSteps] = React.useState(new Set());
    const [stepData, setStepData] = React.useState({});

    const totalSteps = steps.length;
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const goToStep = React.useCallback((stepIndex) => {
        if (stepIndex >= 0 && stepIndex < totalSteps) {
            setCurrentStep(stepIndex);
            onStepChange?.(stepIndex);
            announceSuccess(`Step ${stepIndex + 1} of ${totalSteps}`);
        }
    }, [totalSteps, onStepChange]);

    const nextStep = React.useCallback(() => {
        if (!isLastStep) {
            setCompletedSteps(prev => new Set([...prev, currentStep]));
            goToStep(currentStep + 1);
        }
    }, [currentStep, isLastStep, goToStep]);

    const previousStep = React.useCallback(() => {
        if (!isFirstStep) {
            goToStep(currentStep - 1);
        }
    }, [currentStep, isFirstStep, goToStep]);

    const updateStepData = React.useCallback((data) => {
        setStepData(prev => ({
            ...prev,
            [currentStep]: data,
        }));
    }, [currentStep]);

    const completeForm = React.useCallback(async () => {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
        
        if (onComplete) {
            await onComplete(stepData);
        }
        
        announceSuccess('Form completed successfully');
    }, [currentStep, stepData, onComplete]);

    const reset = React.useCallback(() => {
        setCurrentStep(initialStep);
        setCompletedSteps(new Set());
        setStepData({});
    }, [initialStep]);

    return {
        currentStep,
        totalSteps,
        isFirstStep,
        isLastStep,
        progress,
        completedSteps,
        stepData,
        currentStepData: stepData[currentStep],
        goToStep,
        nextStep,
        previousStep,
        updateStepData,
        completeForm,
        reset,
    };
}

/**
 * Form field array hook (for dynamic form fields)
 */
export function useFieldArray(name, initialValues = []) {
    const [fields, setFields] = React.useState(initialValues);

    const append = React.useCallback((value) => {
        setFields(prev => [...prev, value]);
        announceSuccess(`Added new ${name}`);
    }, [name]);

    const prepend = React.useCallback((value) => {
        setFields(prev => [value, ...prev]);
        announceSuccess(`Added new ${name} at the beginning`);
    }, [name]);

    const remove = React.useCallback((index) => {
        setFields(prev => prev.filter((_, i) => i !== index));
        announceSuccess(`Removed ${name}`);
    }, [name]);

    const insert = React.useCallback((index, value) => {
        setFields(prev => {
            const newFields = [...prev];
            newFields.splice(index, 0, value);
            return newFields;
        });
        announceSuccess(`Inserted ${name}`);
    }, [name]);

    const update = React.useCallback((index, value) => {
        setFields(prev => {
            const newFields = [...prev];
            newFields[index] = value;
            return newFields;
        });
    }, []);

    const move = React.useCallback((fromIndex, toIndex) => {
        setFields(prev => {
            const newFields = [...prev];
            const [removed] = newFields.splice(fromIndex, 1);
            newFields.splice(toIndex, 0, removed);
            return newFields;
        });
        announceSuccess(`Moved ${name}`);
    }, [name]);

    const swap = React.useCallback((indexA, indexB) => {
        setFields(prev => {
            const newFields = [...prev];
            [newFields[indexA], newFields[indexB]] = [newFields[indexB], newFields[indexA]];
            return newFields;
        });
    }, []);

    const reset = React.useCallback(() => {
        setFields(initialValues);
    }, [initialValues]);

    return {
        fields,
        append,
        prepend,
        remove,
        insert,
        update,
        move,
        swap,
        reset,
    };
}

/**
 * Export all utilities
 */
export default {
    useAutosave,
    useFormState,
    FormField,
    useOptimisticUpdate,
    useFormHistory,
    useMultiStepForm,
    useFieldArray,
};
