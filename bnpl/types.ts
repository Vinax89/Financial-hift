/**
 * @fileoverview TypeScript type definitions for BNPL components
 */

export interface BNPLPlan {
  id?: string | number;
  name?: string;
  provider?: string;
  merchant?: string;
  total_amount?: number;
  principal_amount?: number;
  installment_amount?: number;
  total_installments?: number;
  remaining_installments?: number;
  first_payment_date?: string | Date;
  next_payment_date?: string | Date;
  next_due_date?: string | Date;
  payment_frequency?: string;
  status?: string;
  created_at?: string | Date;
  notes?: string;
}

// Form data type for internal form state (uses strings for number inputs)
export interface BNPLPlanFormData {
  id?: string | number;
  name?: string;
  provider?: string;
  merchant?: string;
  total_amount?: string | number;
  principal_amount?: string | number;
  installment_amount?: string | number;
  total_installments?: string | number;
  remaining_installments?: string | number;
  first_payment_date?: string | Date;
  next_payment_date?: string | Date;
  next_due_date?: string | Date;
  payment_frequency?: string;
  status?: string;
  created_at?: string | Date;
  notes?: string;
}

export interface BNPLPlanFormProps {
  plan?: BNPLPlan | null;
  onSubmit: (data: any) => Promise<void> | void;
  onCancel: () => void;
}

export interface BNPLPlanListProps {
  plans: BNPLPlan[];
  onEdit: (plan: BNPLPlan) => void;
  onMarkPaid: (planId: string | number) => void;
  onDelete: (planId: string | number) => void;
  isLoading?: boolean;
}

export interface BNPLSummaryProps {
  plans: BNPLPlan[];
}
