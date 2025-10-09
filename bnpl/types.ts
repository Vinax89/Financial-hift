/**
 * @fileoverview TypeScript type definitions for BNPL components
 */

export interface BNPLPlan {
  id: string | number;
  name: string;
  provider: 'klarna' | 'afterpay' | 'affirm' | 'paypal' | 'sezzle' | 'quadpay' | 'other';
  merchant?: string;
  total_amount: number;
  principal_amount?: number;
  installment_amount: number;
  total_installments: number;
  remaining_installments: number;
  first_payment_date?: string | Date;
  next_payment_date: string | Date;
  next_due_date?: string | Date;
  payment_frequency?: 'weekly' | 'biweekly' | 'monthly';
  status: 'active' | 'paid' | 'overdue' | 'cancelled';
  created_at?: string | Date;
  notes?: string;
}

export interface BNPLPlanFormProps {
  plan: BNPLPlan | null;
  onSubmit: (data: BNPLPlan) => Promise<void> | void;
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
