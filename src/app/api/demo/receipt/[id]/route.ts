// GET /api/demo/receipt/[id] — Get receipt by ID
import { NextResponse } from 'next/server';
import { DEMO_SERVICES, generateDemoReceipt } from '@/lib/demo/data';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // In demo mode, generate a receipt for the first service as fallback
  const service = DEMO_SERVICES[0];
  const receipt = generateDemoReceipt(service);
  receipt.id = id;

  return NextResponse.json({
    success: true,
    data: receipt,
    timestamp: new Date().toISOString(),
  });
}
