import { NextResponse } from 'next/server';
import { getWalletSummaryForActor } from '@/lib/integrations/circle/wallet-utils';

export async function GET() {
  const summary = await getWalletSummaryForActor('seller');
  return NextResponse.json({
    success: true,
    data: {
      actor: 'seller',
      address: summary.address,
      walletId: summary.walletId,
      usdcBalance: summary.usdcBalance,
      eurcBalance: summary.eurcBalance,
      blockchain: summary.blockchain,
      status: summary.status,
      recentTxCount: summary.recentTxCount,
      configured: summary.configured,
      connected: summary.connected,
      lastUpdated: summary.lastUpdated,
      warnings: summary.warnings || [],
    },
    timestamp: new Date().toISOString(),
  });
}
