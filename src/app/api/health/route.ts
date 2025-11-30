import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongoClient';

export async function GET() {
  // Always return 200 - the app is healthy if it can respond
  // Database connection status is informational, not a health failure
  try {
    const db = await getDb();
    await db.command({ ping: 1 });

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    // App is still healthy even if DB is disconnected
    // Return 200 but indicate DB status
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      warning: error instanceof Error ? error.message : 'Database connection failed',
    });
  }
}

