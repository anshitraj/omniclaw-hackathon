// POST /api/demo/inspect — Inspect a selected service
import { NextResponse } from 'next/server';
import { DEMO_SERVICES } from '@/lib/demo/data';

export async function POST(req: Request) {
  const body = await req.json();
  const { serviceId } = body;

  const service = DEMO_SERVICES.find((s) => s.id === serviceId);
  if (!service) {
    return NextResponse.json(
      { success: false, error: 'Service not found', timestamp: new Date().toISOString() },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      serviceId: service.id,
      valid: true,
      requirements: [
        `USDC balance ≥ ${service.price}`,
        'Arc Testnet connectivity',
        'Active paywall clearance',
        'OmniClaw policy authorization',
      ],
      estimatedCost: service.price,
      endpointType: service.endpointType,
      availability: service.availability,
    },
    timestamp: new Date().toISOString(),
  });
}
