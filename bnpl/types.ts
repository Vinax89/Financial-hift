/**
 * TypeScript type definitions for BNPL (Buy Now Pay Later) components
 * 
 * @remarks
 * This module provides type definitions for managing Buy Now Pay Later payment plans,
 * including interfaces for plans, form data, and component props.
 * 
 * @packageDocumentation
 */

/**
 * Represents a Buy Now Pay Later payment plan
 * 
 * @remarks
 * This interface defines the structure of a BNPL plan, including payment details,
 * installment information, and plan status. All fields are optional to support
 * partial data during form editing and creation.
 * 
 * @example
 * ```typescript
 * const plan: BNPLPlan = {
 *   id: '123',
 *   provider: 'klarna',
 *   merchant: 'Amazon',
 *   installment_amount: 25.00,
 *   total_installments: 4,
 *   remaining_installments: 2,
 *   status: 'active'
 * };
 * ```
 * 
 * @public
 */
export interface BNPLPlan {
  /** Unique identifier for the plan */
  id?: string | number;
  
  /** Display name for the plan */
  name?: string;
  
  /** BNPL service provider (e.g., 'klarna', 'afterpay', 'affirm') */
  provider?: string;
  
  /** Store or merchant name where purchase was made */
  merchant?: string;
  
  /** Total purchase amount */
  total_amount?: number;
  
  /** Principal amount (original purchase price before fees) */
  principal_amount?: number;
  
  /** Amount due per installment payment */
  installment_amount?: number;
  
  /** Total number of installment payments */
  total_installments?: number;
  
  /** Number of installments remaining to be paid */
  remaining_installments?: number;
  
  /** Date of the first payment */
  first_payment_date?: string | Date;
  
  /** Date of the next scheduled payment */
  next_payment_date?: string | Date;
  
  /** Next due date for payment */
  next_due_date?: string | Date;
  
  /** Payment frequency (e.g., 'weekly', 'biweekly', 'monthly') */
  payment_frequency?: string;
  
  /** Current status of the plan (e.g., 'active', 'paid', 'overdue', 'cancelled') */
  status?: string;
  
  /** Timestamp when the plan was created */
  created_at?: string | Date;
  
  /** Additional notes or comments about the plan */
  notes?: string;
}

/**
 * Form data type for internal form state
 * 
 * @remarks
 * This interface is used for managing form state where numeric inputs are initially
 * captured as strings (from HTML input elements) before being converted to numbers
 * on form submission. This approach simplifies form validation and handles empty inputs.
 * 
 * @example
 * ```typescript
 * const [formData, setFormData] = useState<BNPLPlanFormData>({
 *   provider: '',
 *   installment_amount: '',  // String initially
 *   total_installments: 4,   // Can be number or string
 *   status: 'active'
 * });
 * ```
 * 
 * @see {@link BNPLPlan} - The target interface after form submission and type conversion
 * @public
 */
export interface BNPLPlanFormData {
  /** Unique identifier for the plan */
  id?: string | number;
  
  /** Display name for the plan */
  name?: string;
  
  /** BNPL service provider */
  provider?: string;
  
  /** Store or merchant name */
  merchant?: string;
  
  /** Total amount (string from input or converted number) */
  total_amount?: string | number;
  
  /** Principal amount (string from input or converted number) */
  principal_amount?: string | number;
  
  /** Installment amount (string from input or converted number) */
  installment_amount?: string | number;
  
  /** Total installments (string from input or converted number) */
  total_installments?: string | number;
  
  /** Remaining installments (string from input or converted number) */
  remaining_installments?: string | number;
  
  /** First payment date */
  first_payment_date?: string | Date;
  
  /** Next scheduled payment date */
  next_payment_date?: string | Date;
  
  /** Next due date */
  next_due_date?: string | Date;
  
  /** Payment frequency */
  payment_frequency?: string;
  
  /** Plan status */
  status?: string;
  
  /** Creation timestamp */
  created_at?: string | Date;
  
  /** Additional notes */
  notes?: string;
}

/**
 * Props for the BNPLPlanForm component
 * 
 * @remarks
 * Defines the properties accepted by the BNPL plan form component,
 * including handlers for form submission and cancellation.
 * 
 * @public
 */
export interface BNPLPlanFormProps {
  /** Existing plan to edit, or null/undefined for creating a new plan */
  plan?: BNPLPlan | null;
  
  /** Callback function invoked when the form is submitted with valid data */
  onSubmit: (data: any) => Promise<void> | void;
  
  /** Callback function invoked when the user cancels form editing */
  onCancel: () => void;
}

/**
 * Props for the BNPLPlanList component
 * 
 * @remarks
 * Defines the properties for displaying a list of BNPL plans with
 * action handlers for editing, marking as paid, and deleting plans.
 * 
 * @public
 */
export interface BNPLPlanListProps {
  /** Array of BNPL plans to display */
  plans: BNPLPlan[];
  
  /** Callback invoked when user clicks edit on a plan */
  onEdit: (plan: BNPLPlan) => void;
  
  /** Callback invoked when user marks a plan as paid */
  onMarkPaid: (planId: string | number) => void;
  
  /** Callback invoked when user deletes a plan */
  onDelete: (planId: string | number) => void;
  
  /** Optional loading state indicator */
  isLoading?: boolean;
}

/**
 * Props for the BNPLSummary component
 * 
 * @remarks
 * Defines the properties for displaying a summary view of BNPL plans,
 * including totals, upcoming payments, and overall status.
 * 
 * @public
 */
export interface BNPLSummaryProps {
  /** Array of BNPL plans to summarize */
  plans: BNPLPlan[];
}
