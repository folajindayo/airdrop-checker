import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const initialPrice = parseFloat(searchParams.get('initialPrice') || '0');
    const currentPrice = parseFloat(searchParams.get('currentPrice') || '0');

