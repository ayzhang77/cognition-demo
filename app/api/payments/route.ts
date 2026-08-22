import { NextResponse } from 'next/server';
import { refundService } from '@/services/refund-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const minAmount = params.get('minAmount');
  const maxAmount = params.get('maxAmount');

  const payments = await refundService.getPayments({
    search: params.get('search') || undefined,
    refundStatus: params.get('refundStatus') || undefined,
    minAmount: minAmount ? parseFloat(minAmount) : undefined,
    maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
    risk: params.get('risk') || undefined
  });

  return NextResponse.json({ payments });
}
