export interface ActionItem {
  id: string;
  task: string;
  owner?: string;
  deliverable?: string;
  deadline?: string;
  context?: string;
  confidence: number; // 0-1
  status: 'extracted' | 'validated' | 'enriched' | 'ready' | 'needs_clarification';
}

export interface ValidationIssue {
  field: 'owner' | 'deliverable' | 'deadline' | 'clarity';
  message: string;
  suggestion: string;
}

export interface ValidationResult {
  itemId: string;
  isValid: boolean;
  issues: ValidationIssue[];
  qualityScore: number; // 1-5
  suggestions: string[];
}

export interface EnrichmentResult {
  itemId: string;
  suggestedOwner?: string;
  suggestedDeadline?: string;
  relatedTasks?: string[];
  isDuplicate?: boolean;
  duplicateTaskId?: string;
}

export interface ProcessedMeeting {
  id: string;
  transcript: string;
  items: ActionItem[];
  validItems: ActionItem[];
  needsClarification: ActionItem[];
  validationResults: ValidationResult[];
  enrichmentResults: EnrichmentResult[];
  summary: {
    total: number;
    valid: number;
    needsClarification: number;
    duplicatesFound: number;
    qualityScore: number; // Average
  };
  processingTime: number; // ms
}

export interface EvaluationResult {
  caseId: string;
  baseline: {
    executionReady: number; // percentage
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
}