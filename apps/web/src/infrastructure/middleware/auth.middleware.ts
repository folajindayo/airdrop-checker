/**
 * Authentication Middleware
 */

import { NextRequest, NextResponse } from 'next/server';

export async function authMiddleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Validate token
    // const decoded = await verifyToken(token);
    // request.user = decoded;
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    );
  }
}


