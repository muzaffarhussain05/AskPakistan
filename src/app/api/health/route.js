import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function GET() {
  let dbStatus = 'disconnected';
  try {
    const db = await getDb();
    if (db) {
      dbStatus = 'connected';
    }
  } catch {
    dbStatus = 'error';
  }

  return NextResponse.json({
    status: 'ok',
    app: 'Ask Pakistan',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    llmProvider: process.env.LLM_PROVIDER || 'gemini',
    version: '1.0.0'
  });
}
