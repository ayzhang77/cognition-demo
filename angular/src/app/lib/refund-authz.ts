import { UserRole } from '../types/user';

export const SUPPORT_REFUND_LIMIT = 500;

export class RefundAuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RefundAuthorizationError';
  }
}

// `instanceof` is unreliable here: the class can be loaded from more than one
// bundle of the module graph, so identity checks fail across those copies.
export function isRefundAuthorizationError(error: unknown): error is RefundAuthorizationError {
  return error instanceof Error && error.name === 'RefundAuthorizationError';
}

export function canRefundAmount(role: UserRole, amount: number): boolean {
  if (role === 'admin') return true;
  if (role === 'support') return amount <= SUPPORT_REFUND_LIMIT;
  return false;
}

export function canRejectRefund(role: UserRole): boolean {
  return role === 'admin' || role === 'support';
}

export function assertCanRefundAmount(role: UserRole, amount: number): void {
  if (canRefundAmount(role, amount)) return;

  if (role === 'support') {
    throw new RefundAuthorizationError(
      `Support agents may only refund up to $${SUPPORT_REFUND_LIMIT}. Amounts above $${SUPPORT_REFUND_LIMIT} require Finance admin approval.`
    );
  }

  throw new RefundAuthorizationError('Your role is not permitted to process refunds.');
}

export function assertCanRejectRefund(role: UserRole): void {
  if (!canRejectRefund(role)) {
    throw new RefundAuthorizationError('Your role is not permitted to reject refunds.');
  }
}
