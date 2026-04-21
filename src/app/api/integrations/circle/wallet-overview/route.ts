import { NextResponse } from 'next/server';
import { getCombinedWalletOverview } from '@/lib/integrations/circle/client';

export async function GET() {
  const overview = await getCombinedWalletOverview();
  return NextResponse.json({
    success: true,
    data: overview,
    timestamp: new Date().toISOString(),
  });
}
