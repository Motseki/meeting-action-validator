import { getOpenAIClient } from './openai';
import type { ActionItem, ProcessedMeeting } from '@/types';

/**
 * Run a simple baseline evaluation using a single prompt
 * This represents the "naive" approach without any agent improvements
 */
export async function evaluateBaseline(transcript: string): Promise<{
  executionReady: number;
  qualityScore: number;
  errors: string[];
  items: ActionItem[];
}> {
  try {
    const openai = getOpenAIClient();
    
    // Simple one-shot prompt - this is the baseline
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Extract action items from the meeting transcript. List them as a simple bulleted list with task, owner, and deadline if mentioned.'
        },
        {
          role: 'user',
          content: `Extract action items from this transcript:\n\n${transcript}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const content = response.choices[0].message.content || '';
    
    // Parse the baseline results
    const items = parseBaselineItems(content);
    
    // Calculate metrics
    const executionReady = calculateExecutionReady(items);
    const qualityScore = calculateQualityScore(items);
    const errors = validateBaselineItems(items);

    return {
      executionReady,
      qualityScore,
      errors,
      items
    };
  } catch (error) {
    console.error('Baseline evaluation error:', error);
    return {
      executionReady: 0,
      qualityScore: 0,
      errors: ['Failed to run baseline evaluation'],
      items: []
    };
  }
}

/**
 * Parse the baseline output into action items
 */
function parseBaselineItems(content: string): ActionItem[] {
  const lines = content.split('\n').filter(line => line.trim());
  const items: ActionItem[] = [];
  
  let currentTask = '';
  let currentOwner = '';
  let currentDeadline = '';
  
  for (const line of lines) {
    // Look for task patterns
    if (line.match(/^[-•*]/) || line.match(/^\d+\./)) {
      // If we have a previous task, save it
      if (currentTask) {
        items.push({
          id: `baseline-${Date.now()}-${items.length}`,
          task: currentTask,
          owner: currentOwner || undefined,
          deadline: currentDeadline || undefined,
          confidence: 0.5,
          status: 'extracted'
        });
      }
      
      // Start new task
      currentTask = line.replace(/^[-•*\d+\.]\s*/, '').trim();
      currentOwner = '';
      currentDeadline = '';
    } else if (line.toLowerCase().includes('owner:') || line.toLowerCase().includes('assigned to:')) {
      currentOwner = line.split(/owner:|assigned to:/i)[1]?.trim() || '';
    } else if (line.toLowerCase().includes('deadline:') || line.toLowerCase().includes('due:')) {
      currentDeadline = line.split(/deadline:|due:/i)[1]?.trim() || '';
    } else if (currentTask && line.trim()) {
      // Append to current task
      currentTask += ' ' + line.trim();
    }
  }
  
  // Add the last task
  if (currentTask) {
    items.push({
      id: `baseline-${Date.now()}-${items.length}`,
      task: currentTask,
      owner: currentOwner || undefined,
      deadline: currentDeadline || undefined,
      confidence: 0.5,
      status: 'extracted'
    });
  }
  
  return items;
}

/**
 * Calculate what percentage of items are "execution ready"
 * An item is execution ready if it has task, owner, and deadline
 */
function calculateExecutionReady(items: ActionItem[]): number {
  if (items.length === 0) return 0;
  
  const readyCount = items.filter(item => {
    return item.task.length > 5 && item.owner && item.owner.length > 0 && item.deadline && item.deadline.length > 0;
  }).length;
  
  return Math.round((readyCount / items.length) * 100);
}

/**
 * Calculate a quality score (1-5) based on completeness
 */
function calculateQualityScore(items: ActionItem[]): number {
  if (items.length === 0) return 1;
  
  let totalScore = 0;
  
  for (const item of items) {
    let score = 1;
    
    // Task clarity
    if (item.task.length > 10) score += 0.5;
    if (item.task.length > 20) score += 0.5;
    
    // Owner
    if (item.owner) score += 1;
    
    // Deadline
    if (item.deadline) score += 1;
    
    // Confidence
    if (item.confidence && item.confidence > 0.7) score += 0.5;
    if (item.confidence && item.confidence > 0.9) score += 0.5;
    
    totalScore += Math.min(score, 5); // Cap at 5
  }
  
  return Math.round((totalScore / items.length) * 10) / 10;
}

/**
 * Validate baseline items and return any errors
 */
function validateBaselineItems(items: ActionItem[]): string[] {
  const errors: string[] = [];
  
  if (items.length === 0) {
    errors.push('No action items extracted');
    return errors;
  }
  
  for (const item of items) {
    if (!item.task || item.task.length < 3) {
      errors.push('Task description too short or missing');
    }
  }
  
  return errors;
}

/**
 * Run a full evaluation comparing baseline vs agentic solution
 */
export async function runFullEvaluation(
  testCases: { id: string; transcript: string }[],
  agenticProcessor: (transcript: string) => Promise<ProcessedMeeting>
): Promise<{
  results: {
    caseId: string;
    baseline: {
      executionReady: number;
      qualityScore: number;
      errors: string[];
    };
    agentic: {
      executionReady: number;
      qualityScore: number;
      errors: string[];
    };
    improvement: {
      executionReady: number;
      qualityScore: number;
    };
  }[];
  summary: {
    totalCases: number;
    averageBaseline: number;
    averageAgentic: number;
    averageImprovement: number;
    totalImprovement: number;
  };
}> {
  const results = [];
  
  for (const testCase of testCases) {
    // Run baseline
    const baseline = await evaluateBaseline(testCase.transcript);
    
    // Run agentic solution
    let agentic: ProcessedMeeting;
    try {
      agentic = await agenticProcessor(testCase.transcript);
    } catch (error) {
      agentic = {
        id: `error-${Date.now()}`,
        transcript: testCase.transcript,
        items: [],
        validItems: [],
        needsClarification: [],
        validationResults: [],
        enrichmentResults: [],
        summary: {
          total: 0,
          valid: 0,
          needsClarification: 0,
          duplicatesFound: 0,
          qualityScore: 0
        },
        processingTime: 0
      };
    }
    
    const agenticReady = agentic.summary.total > 0 
      ? (agentic.summary.valid / agentic.summary.total) * 100 
      : 0;
    
    results.push({
      caseId: testCase.id,
      baseline: {
        executionReady: baseline.executionReady,
        qualityScore: baseline.qualityScore,
        errors: baseline.errors
      },
      agentic: {
        executionReady: agenticReady,
        qualityScore: agentic.summary.qualityScore,
        errors: agentic.items.length === 0 ? ['No items extracted'] : []
      },
      improvement: {
        executionReady: agenticReady - baseline.executionReady,
        qualityScore: agentic.summary.qualityScore - baseline.qualityScore
      }
    });
  }
  
  // Calculate summary
  const totalCases = results.length;
  const averageBaseline = results.reduce((sum, r) => sum + r.baseline.executionReady, 0) / totalCases;
  const averageAgentic = results.reduce((sum, r) => sum + r.agentic.executionReady, 0) / totalCases;
  const totalImprovement = results.reduce((sum, r) => sum + r.improvement.executionReady, 0);
  
  return {
    results,
    summary: {
      totalCases,
      averageBaseline: Math.round(averageBaseline * 10) / 10,
      averageAgentic: Math.round(averageAgentic * 10) / 10,
      averageImprovement: Math.round((averageAgentic - averageBaseline) * 10) / 10,
      totalImprovement: Math.round(totalImprovement * 10) / 10
    }
  };
}

/**
 * Generate a markdown report from evaluation results
 */
export function generateEvaluationReport(
  results: any[],
  summary: any
): string {
  let report = '# Evaluation Report\n\n';
  
  report += '## Summary\n\n';
  report += `| Metric | Value |\n`;
  report += `|--------|-------|\n`;
  report += `| Total Test Cases | ${summary.totalCases} |\n`;
  report += `| Average Baseline Execution Ready | ${summary.averageBaseline}% |\n`;
  report += `| Average Agentic Execution Ready | ${summary.averageAgentic}% |\n`;
  report += `| Average Improvement | +${summary.averageImprovement}% |\n`;
  report += `| Total Improvement | +${summary.totalImprovement}% |\n\n`;
  
  report += '## Detailed Results\n\n';
  report += `| Case | Baseline | Agentic | Improvement |\n`;
  report += `|------|----------|---------|-------------|\n`;
  
  for (const result of results) {
    report += `| ${result.caseId} | ${result.baseline.executionReady}% | ${result.agentic.executionReady}% | +${result.improvement.executionReady}% |\n`;
  }
  
  report += '\n## Changelog\n\n';
  report += '### Baseline\n';
  report += 'Simple one-shot prompt extraction\n\n';
  report += '### Iteration 1\n';
  report += 'Added structured extraction with specific fields\n\n';
  report += '### Iteration 2\n';
  report += 'Added verification step for completeness\n\n';
  report += '### Iteration 3\n';
  report += 'Added enrichment with owner suggestions and duplicate detection\n\n';
  report += '### Final\n';
  report += `Achieved ${summary.averageAgentic}% execution-ready items\n`;
  
  return report;
}