import { NextRequest, NextResponse } from 'next/server';
import { Orchestrator } from '@/lib/agents/Orchestrator';
import { EvaluationResult } from '@/types';
import { evaluateBaseline } from '@/lib/utils/evaluation';

const orchestrator = new Orchestrator();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcripts } = body;

    if (!transcripts || !Array.isArray(transcripts)) {
      return NextResponse.json(
        { error: 'Transcripts array is required' },
        { status: 400 }
      );
    }

    const results: EvaluationResult[] = [];

    for (const transcript of transcripts) {
      // Baseline: Simple one-shot prompt
      const baselineResult = await evaluateBaseline(transcript);
      
      // Agentic solution
      const agenticResult = await orchestrator.processMeeting(transcript);

      const executionReadyBaseline = baselineResult.executionReady;
      const executionReadyAgentic = agenticResult.validItems.length / agenticResult.items.length * 100;

      results.push({
        caseId: transcript.id || `case-${Date.now()}`,
        baseline: {
          executionReady: executionReadyBaseline,
          qualityScore: baselineResult.qualityScore || 2,
          errors: baselineResult.errors || []
        },
        agentic: {
          executionReady: executionReadyAgentic,
          qualityScore: agenticResult.summary.qualityScore,
          errors: []
        },
        improvement: {
          executionReady: executionReadyAgentic - executionReadyBaseline,
          qualityScore: agenticResult.summary.qualityScore - (baselineResult.qualityScore || 2)
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
      summary: {
        totalCases: results.length,
        averageBaseline: results.reduce((sum, r) => sum + r.baseline.executionReady, 0) / results.length,
        averageAgentic: results.reduce((sum, r) => sum + r.agentic.executionReady, 0) / results.length,
        averageImprovement: results.reduce((sum, r) => sum + r.improvement.executionReady, 0) / results.length
      }
    });
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { error: 'Failed to run evaluation' },
      { status: 500 }
    );
  }
}