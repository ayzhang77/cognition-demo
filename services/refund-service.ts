import { Payment, Refund, RefundAction, RefundAuditEvent } from '../types/refund';
import { User } from '../types/user';
import {
  RefundAuthorizationError,
  assertCanRefundAmount,
  assertCanRejectRefund,
  canRefundAmount
} from '../lib/refund-authz';
import { MOCK_PAYMENTS } from './mock-data';

class RefundService {
  private payments: Payment[] = [...MOCK_PAYMENTS];

  async getPayments(filters?: {
    search?: string;
    refundStatus?: string;
    minAmount?: number;
    maxAmount?: number;
    risk?: string;
  }): Promise<Payment[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = this.payments;

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.customerName.toLowerCase().includes(search) ||
        p.customerEmail.toLowerCase().includes(search) ||
        p.id.toLowerCase().includes(search) ||
        p.transactionId.toLowerCase().includes(search)
      );
    }

    if (filters?.refundStatus) {
      filtered = filtered.filter(p => 
        p.refundHistory.some(r => r.status === filters.refundStatus)
      );
    }

    if (filters?.minAmount !== undefined) {
      filtered = filtered.filter(p => p.amount >= filters.minAmount!);
    }

    if (filters?.maxAmount !== undefined) {
      filtered = filtered.filter(p => p.amount <= filters.maxAmount!);
    }

    if (filters?.risk) {
      filtered = filtered.filter(p => 
        p.refundHistory.some(r => r.risk === filters.risk) || 
        (p.amount > 1000 && filters.risk === 'high') ||
        (p.amount > 500 && p.amount <= 1000 && filters.risk === 'medium')
      );
    }

    return filtered.sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime());
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.payments.find(p => p.id === id) || null;
  }

  async requestRefund(
    paymentId: string,
    amount: number,
    actor: User,
    reason: string
  ): Promise<Refund> {
    await new Promise(resolve => setTimeout(resolve, 400));

    if (!actor) {
      throw new RefundAuthorizationError('Authentication required');
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Refund amount must be a positive number');
    }

    assertCanRefundAmount(actor.role, amount);

    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (amount > payment.refundableAmount) {
      throw new Error('Refund amount exceeds refundable amount');
    }

    // Calculate risk based on amount and history
    const risk = this.calculateRefundRisk(payment, amount);

    const refund: Refund = {
      id: `REF-${Date.now()}`,
      paymentId,
      amount,
      status: 'pending',
      requestedBy: actor.id,
      requestedAt: new Date(),
      reason,
      risk,
      auditHistory: [
        {
          id: `AUDIT-${Date.now()}`,
          action: 'requested',
          userId: actor.id,
          userName: actor.name,
          timestamp: new Date(),
          amount,
          reason
        }
      ]
    };

    payment.refundHistory.push(refund);
    payment.refundableAmount -= amount;

    return refund;
  }

  async processRefundAction(
    refundId: string,
    action: RefundAction,
    actor: User,
    reason: string
  ): Promise<Refund> {
    await new Promise(resolve => setTimeout(resolve, 400));

    if (!actor) {
      throw new RefundAuthorizationError('Authentication required');
    }

    const payment = this.payments.find(p => 
      p.refundHistory.some(r => r.id === refundId)
    );

    if (!payment) {
      throw new Error('Refund not found');
    }

    const refund = payment.refundHistory.find(r => r.id === refundId);
    if (!refund) {
      throw new Error('Refund not found');
    }

    if (refund.status !== 'pending') {
      throw new Error('Refund is no longer pending');
    }

    if (action === 'approve') {
      assertCanRefundAmount(actor.role, refund.amount);
    } else {
      assertCanRejectRefund(actor.role);
    }

    const auditEvent: RefundAuditEvent = {
      id: `AUDIT-${Date.now()}`,
      action: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action,
      userId: actor.id,
      userName: actor.name,
      timestamp: new Date(),
      amount: refund.amount,
      reason
    };

    switch (action) {
      case 'approve':
        refund.status = 'approved';
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 500));
        refund.status = 'processed';
        refund.processedAt = new Date();
        
        const processedEvent: RefundAuditEvent = {
          id: `AUDIT-${Date.now() + 1}`,
          action: 'processed',
          userId: actor.id,
          userName: actor.name,
          timestamp: new Date(),
          amount: refund.amount,
          reason
        };
        refund.auditHistory.push(processedEvent);
        break;
      case 'reject':
        refund.status = 'rejected';
        // Restore refundable amount
        payment.refundableAmount += refund.amount;
        break;
    }

    refund.auditHistory.push(auditEvent);

    return refund;
  }

  canRefundAmount(userRole: User['role'], amount: number): boolean {
    return canRefundAmount(userRole, amount);
  }

  private calculateRefundRisk(payment: Payment, amount: number): 'low' | 'medium' | 'high' {
    if (amount > 1000) return 'high';
    if (amount > 500) return 'medium';
    if (payment.refundHistory.length > 2) return 'medium';
    return 'low';
  }
}

// The mock data store must be shared across route bundles so refunds created by
// one API route are visible to the others.
const globalForRefunds = globalThis as typeof globalThis & {
  __refundService?: RefundService;
};

export const refundService = globalForRefunds.__refundService ?? new RefundService();
globalForRefunds.__refundService = refundService;
