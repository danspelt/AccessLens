import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongoClient';

export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    console.error('Readiness check failed:', error instanceof Error ? error.message : 'Database connection failed');
    return NextResponse.json({
      status: 'unavailable',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      warning: 'Database connection unavailable',
    }, { status: 503 });
  }
}

