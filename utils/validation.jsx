// Comprehensive input validation and security utilities
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    let sanitized = input.replace(/[<>]/g, ''); // Remove potential HTML tags

    // Remove javascript: protocols (repeat for full sanitization)
    let prev;
    do {
        prev = sanitized;
        sanitized = sanitized.replace(/javascript:/gi, '');
    } while (sanitized !== prev);

    // Remove event handlers (repeat for full sanitization)
    do {
        prev = sanitized;
        sanitized = sanitized.replace(/on\w+=/gi, '');
    } while (sanitized !== prev);

    return sanitized.trim();
};

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validateCurrency = (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num >= 0 && num <= 1000000; // Max $1M
};

export const validateDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const maxFutureDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000 * 10)); // 10 years
    
    return !isNaN(date.getTime()) && 
           date >= new Date('2020-01-01') && 
           date <= maxFutureDate;
};

export const validateTransaction = (transaction) => {
    const errors = {};
    
    if (!transaction.title?.trim()) {
        errors.title = 'Transaction description is required';
    } else if (transaction.title.length > 200) {
        errors.title = 'Description must be less than 200 characters';
    }
    
    if (!validateCurrency(transaction.amount)) {
        errors.amount = 'Valid amount between $0 and $1,000,000 is required';
    }
    
    if (!transaction.category) {
        errors.category = 'Category is required';
    }
    
    if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
        errors.type = 'Valid transaction type is required';
    }
    
    if (!validateDate(transaction.date)) {
        errors.date = 'Valid date is required';
    }
    
    if (transaction.notes && transaction.notes.length > 500) {
        errors.notes = 'Notes must be less than 500 characters';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateShift = (shift, existingShifts = []) => {
    const errors = {};
    
    if (!shift.title?.trim()) {
        errors.title = 'Shift title is required';
    }
    
    if (!validateDate(shift.start_datetime)) {
        errors.start_datetime = 'Valid start date/time is required';
    }
    
    if (!validateDate(shift.end_datetime)) {
        errors.end_datetime = 'Valid end date/time is required';
    }
    
    if (new Date(shift.start_datetime) >= new Date(shift.end_datetime)) {
        errors.end_datetime = 'End time must be after start time';
    }
    
    const hours = shift.scheduled_hours || 0;
    if (hours < 0 || hours > 24) {
        errors.scheduled_hours = 'Hours must be between 0 and 24';
    }
    
    // BUG-002 FIX: Check for shift overlaps
    if (existingShifts && existingShifts.length > 0) {
        const startTime = new Date(shift.start_datetime).getTime();
        const endTime = new Date(shift.end_datetime).getTime();
        
        const overlappingShift = existingShifts.find(existingShift => {
            // Skip comparing with itself
            if (shift.id && existingShift.id === shift.id) return false;
            
            const existingStart = new Date(existingShift.start_datetime).getTime();
            const existingEnd = new Date(existingShift.end_datetime).getTime();
            
            // Check if times overlap
            return (
                (startTime >= existingStart && startTime < existingEnd) ||
                (endTime > existingStart && endTime <= existingEnd) ||
                (startTime <= existingStart && endTime >= existingEnd)
            );
        });
        
        if (overlappingShift) {
            errors.overlap = `Shift overlaps with existing shift: ${overlappingShift.title}`;
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateGoal = (goal) => {
    const errors = {};
    
    if (!goal.title?.trim()) {
        errors.title = 'Goal title is required';
    }
    
    if (!validateCurrency(goal.target_amount) || goal.target_amount <= 0) {
        errors.target_amount = 'Valid target amount greater than $0 is required';
    }
    
    if (goal.current_amount < 0 || goal.current_amount > goal.target_amount) {
        errors.current_amount = 'Current amount must be between $0 and target amount';
    }
    
    if (!validateDate(goal.target_date)) {
        errors.target_date = 'Valid target date is required';
    }
    
    if (new Date(goal.target_date) <= new Date()) {
        errors.target_date = 'Target date must be in the future';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateBudget = (budget) => {
    const errors = {};
    
    if (!budget.category) {
        errors.category = 'Budget category is required';
    }
    
    if (!validateCurrency(budget.monthly_limit) || budget.monthly_limit <= 0) {
        errors.monthly_limit = 'Valid monthly limit greater than $0 is required';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Rate limiting for API calls
export class RateLimiter {
    constructor(maxRequests = 100, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }
    
    isAllowed(identifier) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        if (!this.requests.has(identifier)) {
            this.requests.set(identifier, []);
        }
        
        const userRequests = this.requests.get(identifier);
        const recentRequests = userRequests.filter(time => time > windowStart);
        
        if (recentRequests.length >= this.maxRequests) {
            return false;
        }
        
        recentRequests.push(now);
        this.requests.set(identifier, recentRequests);
        return true;
    }
}

/**
 * Generic data validation function using Zod schemas
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {any} data - Data to validate
 * @returns {{success: boolean, data?: any, errors?: Record<string, string>}} Validation result
 */
export const validateData = (schema, data) => {
    try {
        const result = schema.safeParse(data);
        
        if (!result.success) {
            // Convert Zod errors to field-level error object
            const errors = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path.join('.');
                errors[field] = issue.message;
            });
            
            return {
                success: false,
                errors,
            };
        }
        
        return {
            success: true,
            data: result.data,
        };
    } catch (error) {
        return {
            success: false,
            errors: { _form: error.message || 'Validation failed' },
        };
    }
};