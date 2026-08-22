import { NextResponse } from 'next/server';
import { RefundAction } from '@/types/refund';
import { RefundAuthorizationError } from '@/lib/refund-authz';
import { getSessionUser } from '@/lib/server/session';
import { refundService } from '@/services/refund-service';

export const dynamic = 'force-dynamic';

const ALLOWED_ACTIONS: RefundAction[] = ['approve', 'reject'];

export async function POST(
  request: Request,
  { params }: { params: { refundId: string } }
) {
  const actor = getSessionUser();
  if (!actor) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action;
  const reason = typeof body?.reason === 'string' ? body.reason.trim() : '';

  if (!ALLOWED_ACTIONS.includes(action) || !reason) {
    return NextResponse.json({ error: 'A valid action and reason are required' }, { status: 400 });
  }

  try {
    const refund = await refundService.processRefundAction(params.refundId, action, actor, reason);
    return NextResponse.json({ refund });
  } catch (error) {
    if (error instanceof RefundAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : 'Failed to process action';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
