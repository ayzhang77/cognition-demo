import { Injectable, inject } from '@angular/core';
import { Payment, Refund, RefundAction, RefundAuditEvent } from '../types/refund';
import { User } from '../types/user';
import {
  RefundAuthorizationError,
  assertCanRefundAmount,
  assertCanRejectRefund
} from '../lib/refund-authz';
import { AuthService } from './auth-service';
import { MOCK_PAYMENTS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class RefundService {
  private readonly authService = inject(AuthService);
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

  async requestRefund(paymentId: string, amount: number, reason: string): Promise<Refund> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const actor = this.requireActor();

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

  async processRefundAction(refundId: string, action: RefundAction, reason: string): Promise<Refund> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const actor = this.requireActor();

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
      case 'approve': {
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
      }
      case 'reject':
        refund.status = 'rejected';
        // Restore refundable amount
        payment.refundableAmount += refund.amount;
        break;
    }

    refund.auditHistory.push(auditEvent);

    return refund;
  }

  /**
   * Identity is resolved here rather than accepted from callers. Until this app
   * is backed by a real API these checks still run in the browser, so they must
   * be re-enforced server-side (as the Next.js refunds API does) before launch.
   */
  private requireActor(): User {
    const actor = this.authService.getCurrentUser();
    if (!actor) {
      throw new RefundAuthorizationError('Authentication required');
    }
    return actor;
  }

  private calculateRefundRisk(payment: Payment, amount: number): 'low' | 'medium' | 'high' {
    if (amount > 1000) return 'high';
    if (amount > 500) return 'medium';
    if (payment.refundHistory.length > 2) return 'medium';
    return 'low';
  }
}
