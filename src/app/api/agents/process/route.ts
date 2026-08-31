// src/app/api/agents/process/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Orchestrator } from '@/lib/agents/Orchestrator';

const orchestrator = new Orchestrator();

export async function POST(request: NextRequest) {
  try {
    // Log the request
    console.log('📥 Received request to /api/agents/process');
    
    const body = await request.json();
    const { transcript } = body;

    console.log(`📝 Transcript length: ${transcript?.length || 0} characters`);

    if (!transcript || typeof transcript !== 'string') {
      console.error('❌ Error: Invalid transcript');
      return NextResponse.json(
        { error: 'Transcript is required and must be a string' },
        { status: 400 }
      );
    }

    if (transcript.length < 10) {
      console.error('❌ Error: Transcript too short');
      return NextResponse.json(
        { error: 'Transcript is too short. Please provide more content.' },
        { status: 400 }
      );
    }

    console.log('🔄 Processing meeting with Orchestrator...');
    const result = await orchestrator.processMeeting(transcript);
    
    console.log('✅ Processing complete!');
    console.log(`📊 Found ${result.summary.total} items, ${result.summary.valid} valid`);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Process error:', error);
    console.error('Error stack:', error.stack);
    
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        error: 'Failed to process meeting transcript',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}