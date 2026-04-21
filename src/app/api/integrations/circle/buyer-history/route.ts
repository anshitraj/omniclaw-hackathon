import { NextResponse } from 'next/server';
import { getBuyerWalletHistory } from '@/lib/integrations/circle/buyer-client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number.parseInt(searchParams.get('limit') || '20', 10);
  const history = await getBuyerWalletHistory(Number.isFinite(limit) ? limit : 20);

  return NextResponse.json({
    success: true,
    data: history.map((item) => ({
      txHash: item.txHash,
      token: item.token,
      amount: item.amount,
      direction: item.direction,
      status: item.status,
      timestamp: item.timestamp,
      explorerUrl: item.explorerUrl,
    })),
    timestamp: new Date().toISOString(),
  });
}
