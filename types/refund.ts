export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processed' | 'failed';
export type RefundRisk = 'low' | 'medium' | 'high';

export interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  transactionId: string;
  paymentDate: Date;
  status: 'completed' | 'failed' | 'refunded';
  refundableAmount: number;
  refundHistory: Refund[];
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  status: RefundStatus;
  requestedBy: string;
  requestedAt: Date;
  processedAt?: Date;
  reason: string;
  risk: RefundRisk;
  notes?: string;
  auditHistory: RefundAuditEvent[];
}

export interface RefundAuditEvent {
  id: string;
  action: 'requested' | 'approved' | 'rejected' | 'processed' | 'escalated';
  userId: string;
  userName: string;
  timestamp: Date;
  amount: number;
  reason?: string;
  details?: Record<string, any>;
}

export type RefundAction = 'approve' | 'reject';
