import { NextResponse } from 'next/server';
import { getAllSpots } from '@/lib/spots';

// GET /api/spots — public, no auth required
export async function GET() {
  const spots = await getAllSpots();
  return NextResponse.json(spots);
}
