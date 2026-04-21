import { NextResponse } from 'next/server';
import { getCombinedWalletOverview } from '@/lib/integrations/circle/client';

export async function GET() {
  const overview = await getCombinedWalletOverview();
  const buyer = overview.buyer;

  return NextResponse.json({
    connected: buyer.connected,
    address: buyer.address,
    addressShort: buyer.addressShort,
    walletId: buyer.walletId,
    balance: buyer.usdcBalance.toFixed(2),
    eurcBalance: buyer.eurcBalance.toFixed(2),
    currency: 'USDC',
    network: buyer.blockchain,
    architecture: overview.architecture,
  });
}
