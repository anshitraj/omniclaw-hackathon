// GET /api/services — Returns seller services
import { NextResponse } from 'next/server';
import { DEMO_SERVICES } from '@/lib/demo/data';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: DEMO_SERVICES,
    timestamp: new Date().toISOString(),
  });
}
