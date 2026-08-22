import { NextResponse } from 'next/server';
import { RefundAuthorizationError } from '@/lib/refund-authz';
import { getSessionUser } from '@/lib/server/session';
import { refundService } from '@/services/refund-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const actor = getSessionUser();
  if (!actor) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const paymentId = body?.paymentId;
  const amount = typeof body?.amount === 'number' ? body.amount : parseFloat(body?.amount);
  const reason = typeof body?.reason === 'string' ? body.reason.trim() : '';

  if (typeof paymentId !== 'string' || !Number.isFinite(amount) || !reason) {
    return NextResponse.json({ error: 'paymentId, amount and reason are required' }, { status: 400 });
  }

  try {
    const refund = await refundService.requestRefund(paymentId, amount, actor, reason);
    return NextResponse.json({ refund }, { status: 201 });
  } catch (error) {
    if (error instanceof RefundAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : 'Failed to request refund';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
