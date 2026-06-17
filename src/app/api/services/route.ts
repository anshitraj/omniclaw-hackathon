// GET /api/services — Returns seller services
import { NextResponse } from 'next/server';
import { SERVICE_CATALOG } from '@/lib/seed/data';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: SERVICE_CATALOG,
    timestamp: new Date().toISOString(),
  });
}
