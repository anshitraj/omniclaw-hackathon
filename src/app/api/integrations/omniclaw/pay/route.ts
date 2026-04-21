// POST /api/integrations/omniclaw/pay — OmniClaw payment execution
import { NextResponse } from 'next/server';
import { isOmniClawConfigured, executePayment } from '@/lib/integrations/omniclaw/client';
import { DEMO_SERVICES, generateDemoPolicyResult } from '@/lib/demo/data';

export async function POST(req: Request) {
  if (!isOmniClawConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'OmniClaw integration not configured. Set CIRCLE_API_KEY for SDK mode or OMNICLAW_API_URL for server mode.',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }

  const body = await req.json();
  const service = DEMO_SERVICES.find((s) => s.id === body.serviceId);

  if (!service) {
    return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
  }

  try {
    const policyResult = generateDemoPolicyResult(service);
    const receipt = await executePayment(service, policyResult, body.idempotencyKey || `oc_${Date.now()}`);
    return NextResponse.json({ success: true, data: receipt, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error), timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
