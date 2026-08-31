import { ActionItem, ValidationResult, ValidationIssue } from '@/types';
import { VALIDATION_PROMPT } from '../prompts/templates';
import { getOpenAIClient } from '../utils/openai';
import OpenAI from 'openai';

export class ValidatorAgent {
  private openai: OpenAI;

  constructor() {
    this.openai = getOpenAIClient();
  }

  async validate(item: ActionItem): Promise<ValidationResult> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a quality assurance expert for meeting action items.'
          },
          {
            role: 'user',
            content: VALIDATION_PROMPT.replace('{{item}}', JSON.stringify(item, null, 2))
          }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content returned');
      
      const parsed = JSON.parse(content);
      
      return {
        itemId: item.id,
        isValid: parsed.isValid,
        issues: parsed.issues.map((issue: any) => ({
          field: issue.field,
          message: issue.message,
          suggestion: issue.suggestion
        })),
        qualityScore: parsed.qualityScore || 3,
        suggestions: parsed.suggestions || []
      };
    } catch (error) {
      console.error('ValidatorAgent error:', error);
      // Return a safe default
      return {
        itemId: item.id,
        isValid: false,
        issues: [{
          field: 'clarity',
          message: 'Validation failed, please review manually',
          suggestion: 'Check if this item is complete and actionable'
        }],
        qualityScore: 1,
        suggestions: ['Manual review required']
      };
    }
  }

  async validateBatch(items: ActionItem[]): Promise<ValidationResult[]> {
    const results = await Promise.all(items.map(item => this.validate(item)));
    return results;
  }
}