import { ActionItem, EnrichmentResult } from '@/types';
import { CompanyKnowledge } from '../skills/CompanyKnowledge';
import { PMToolIntegration } from '../skills/PMToolIntegration';
import { getOpenAIClient } from '../utils/openai';

export class EnricherAgent {
  private openai = getOpenAIClient();
  private companyKnowledge = new CompanyKnowledge();
  private pmTool = new PMToolIntegration();

  async enrich(item: ActionItem): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {
      itemId: item.id,
      relatedTasks: []
    };

    try {
      // Check for duplicates in project management tool
      const duplicates = await this.pmTool.findSimilarTasks(item.task);
      if (duplicates.length > 0) {
        result.isDuplicate = true;
        result.duplicateTaskId = duplicates[0].id;
        result.relatedTasks = duplicates.map(d => d.id);
      }

      // Suggest owner based on company knowledge
      if (!item.owner) {
        const suggestedOwner = await this.companyKnowledge.suggestOwner(item.task);
        if (suggestedOwner) {
          result.suggestedOwner = suggestedOwner;
        }
      }

      // Suggest deadline if missing
      if (!item.deadline) {
        const suggestedDeadline = await this.companyKnowledge.suggestDeadline(item.task);
        if (suggestedDeadline) {
          result.suggestedDeadline = suggestedDeadline;
        }
      }

      return result;
    } catch (error) {
      console.error('EnricherAgent error:', error);
      return result;
    }
  }
}