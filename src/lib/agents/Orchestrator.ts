import { ExtractorAgent } from './ExtractorAgent';
import { ValidatorAgent } from './ValidatorAgent';
import { EnricherAgent } from './EnricherAgent';
import type { ActionItem, ProcessedMeeting, ValidationResult } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class Orchestrator {
  private extractor: ExtractorAgent;
  private validator: ValidatorAgent;
  private enricher: EnricherAgent;

  constructor() {
    console.log('🔧 Orchestrator: Initializing...');
    try {
      this.extractor = new ExtractorAgent();
      this.validator = new ValidatorAgent();
      this.enricher = new EnricherAgent();
      console.log('✅ Orchestrator: Initialized successfully');
    } catch (error) {
      console.error('❌ Orchestrator: Failed to initialize:', error);
      throw error;
    }
  }

  async processMeeting(transcript: string): Promise<ProcessedMeeting> {
    console.log('🚀 Orchestrator: Starting processMeeting');
    console.log(`📝 Transcript length: ${transcript.length} characters`);
    
    const startTime = Date.now();

    try {
      // Step 1: Extract
      console.log('📝 Step 1: Extracting action items...');
      let items: ActionItem[] = [];
      try {
        items = await this.extractor.extract(transcript);
        console.log(`✅ Extracted ${items.length} action items`);
      } catch (error) {
        console.error('❌ Extraction failed:', error);
        items = [];
      }

      if (items.length === 0) {
        console.log('⚠️ No items found, returning empty result');
        return this.createEmptyResult(transcript, startTime);
      }

      // Step 2: Validate
      console.log('🔍 Step 2: Validating items...');
      let validationResults: ValidationResult[] = [];
      try {
        validationResults = await this.validator.validateBatch(items);
        console.log(`✅ Validated ${validationResults.length} items`);
      } catch (error) {
        console.error('❌ Validation failed:', error);
        validationResults = items.map(item => ({
          itemId: item.id,
          isValid: false,
          issues: [{
            field: 'clarity',
            message: 'Validation failed',
            suggestion: 'Please review manually'
          }],
          qualityScore: 1,
          suggestions: ['Manual review required']
        }));
      }

      // Step 3: Enrich
      console.log('🔧 Step 3: Enriching items...');
      const { enrichedItems, enrichmentResults } = await this.enrichItems(items, validationResults);
      console.log(`✅ Enriched ${enrichedItems.length} items`);

      const validItems = enrichedItems.filter(item => item.status === 'enriched');
      const needsClarification = enrichedItems.filter(item => item.status === 'needs_clarification');

      const result: ProcessedMeeting = {
        id: uuidv4(),
        transcript,
        items: enrichedItems,
        validItems,
        needsClarification,
        validationResults,
        enrichmentResults,
        summary: {
          total: items.length,
          valid: validItems.length,
          needsClarification: needsClarification.length,
          duplicatesFound: enrichmentResults.filter(r => r.isDuplicate).length,
          qualityScore: this.calculateQualityScore(validationResults)
        },
        processingTime: Date.now() - startTime
      };

      console.log(`✅ Orchestrator: Complete in ${result.processingTime}ms`);
      return result;
    } catch (error) {
      console.error('❌ Orchestrator: Fatal error:', error);
      return this.createEmptyResult(transcript, startTime, error as Error);
    }
  }

  private async enrichItems(
    items: ActionItem[],
    validationResults: ValidationResult[]
  ): Promise<{ enrichedItems: ActionItem[]; enrichmentResults: any[] }> {
    const enrichmentResults: any[] = [];
    const enrichedItems: ActionItem[] = [];

    for (const item of items) {
      const validation = validationResults.find(v => v.itemId === item.id);
      
      if (validation && validation.isValid) {
        try {
          const enrichment = await this.enricher.enrich(item);
          enrichmentResults.push(enrichment);
          
          enrichedItems.push({
            ...item,
            owner: enrichment.suggestedOwner || item.owner,
            deadline: enrichment.suggestedDeadline || item.deadline,
            status: 'enriched'
          });
        } catch (error) {
          console.error(`Error enriching item ${item.id}:`, error);
          enrichedItems.push({
            ...item,
            status: 'needs_clarification'
          });
        }
      } else {
        enrichedItems.push({
          ...item,
          status: 'needs_clarification'
        });
      }
    }

    return { enrichedItems, enrichmentResults };
  }

  private calculateQualityScore(validationResults: ValidationResult[]): number {
    if (validationResults.length === 0) return 0;
    const total = validationResults.reduce((sum, r) => sum + r.qualityScore, 0);
    return Math.round((total / validationResults.length) * 10) / 10;
  }

  private createEmptyResult(transcript: string, startTime: number, error?: Error): ProcessedMeeting {
    console.log('📦 Creating empty result');
    return {
      id: uuidv4(),
      transcript,
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
      processingTime: Date.now() - startTime
    };
  }
}