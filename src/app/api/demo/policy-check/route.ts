// POST /api/demo/policy-check — Policy engine check
import { NextResponse } from 'next/server';
import { DEMO_SERVICES, generateDemoPolicyResult } from '@/lib/demo/data';

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

  const result = generateDemoPolicyResult(service);

  return NextResponse.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
  });
}
