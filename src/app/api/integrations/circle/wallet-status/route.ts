// POST /api/integrations/circle/wallet-status
// Returns wallet connection status or full connection summary.

import { NextResponse } from 'next/server';
import {
  isCircleConfigured,
  getWalletStatus,
  getCircleConnectionSummary,
} from '@/lib/integrations/circle/client';

export async function POST(req: Request) {
  if (!isCircleConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Circle integration not configured. Set CIRCLE_API_KEY in .env.local.',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }

  try {
    const body = await req.json().catch(() => ({}));

    if (body.action === 'summary') {
      const summary = await getCircleConnectionSummary();
      return NextResponse.json({ success: true, data: summary, timestamp: new Date().toISOString() });
    }

    const status = await getWalletStatus(body.walletId);
    return NextResponse.json({ success: true, data: status, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error), timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
