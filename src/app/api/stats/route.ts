import { NextResponse } from 'next/server';
import { getTokenTracker } from '@/lib/utils/openai';

export async function GET() {
  try {
    const tracker = getTokenTracker();
    const stats = tracker.getStats();
    
    return NextResponse.json({
      requests: stats.requests,
      totalTokens: stats.totalTokens,
      inputTokens: stats.inputTokens,
      outputTokens: stats.outputTokens,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { 
        requests: 0, 
        totalTokens: 0, 
        inputTokens: 0, 
        outputTokens: 0,
        error: 'Failed to get stats'
      },
      { status: 500 }
    );
  }
}