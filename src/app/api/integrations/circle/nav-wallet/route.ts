import { NextResponse } from 'next/server';
import { getWalletSummaryForActor } from '@/lib/integrations/circle/wallet-utils';

export async function GET() {
  const buyer = await getWalletSummaryForActor('buyer');

  return NextResponse.json({
    connected: buyer.connected,
    address: buyer.address,
    addressShort: buyer.addressShort,
    walletId: buyer.walletId,
    balance: buyer.usdcBalance.toFixed(2),
    currency: 'USDC',
    network: buyer.blockchain,
    warnings: buyer.warnings || [],
  });
}
