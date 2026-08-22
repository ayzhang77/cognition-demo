import { Payment, Refund, RefundAction } from '../types/refund';
import { User } from '../types/user';

export interface PaymentFilters {
  search?: string;
  refundStatus?: string;
  minAmount?: number;
  maxAmount?: number;
  risk?: string;
}

async function readError(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null);
  return typeof body?.error === 'string' ? body.error : fallback;
}

function revivePayment(payment: Payment): Payment {
  return {
    ...payment,
    paymentDate: new Date(payment.paymentDate),
    refundHistory: payment.refundHistory.map(reviveRefund)
  };
}

function reviveRefund(refund: Refund): Refund {
  return {
    ...refund,
    requestedAt: new Date(refund.requestedAt),
    processedAt: refund.processedAt ? new Date(refund.processedAt) : undefined,
    auditHistory: refund.auditHistory.map(event => ({
      ...event,
      timestamp: new Date(event.timestamp)
    }))
  };
}

export async function getPayments(filters: PaymentFilters = {}): Promise<Payment[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  const response = await fetch(`/api/payments?${params.toString()}`);
  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to load payments'));
  }

  const body = await response.json();
  return (body.payments as Payment[]).map(revivePayment);
}

export async function requestRefund(paymentId: string, amount: number, reason: string): Promise<Refund> {
  const response = await fetch('/api/refunds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId, amount, reason })
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to request refund'));
  }

  return reviveRefund((await response.json()).refund);
}

export async function processRefundAction(
  refundId: string,
  action: RefundAction,
  reason: string
): Promise<Refund> {
  const response = await fetch(`/api/refunds/${encodeURIComponent(refundId)}/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, reason })
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to process action'));
  }

  return reviveRefund((await response.json()).refund);
}

export async function startSession(userId: string): Promise<User | null> {
  const response = await fetch('/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to start session'));
  }

  return (await response.json()).user ?? null;
}
