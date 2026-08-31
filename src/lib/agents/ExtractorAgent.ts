import OpenAI from 'openai';
import { getOpenAIClient } from '../utils/openai';
import type { ActionItem } from '@/types';

export class ExtractorAgent {
  private openai: OpenAI;

  constructor() {
    console.log('🔧 ExtractorAgent: Initializing...');
    try {
      this.openai = getOpenAIClient();
      console.log('✅ ExtractorAgent: Initialized successfully');
    } catch (error) {
      console.error('❌ ExtractorAgent: Failed to initialize:', error);
      throw error;
    }
  }

  async extract(transcript: string): Promise<ActionItem[]> {
    console.log('📝 ExtractorAgent: Starting extraction');
    console.log(`📝 Transcript length: ${transcript.length} characters`);
    console.log(`📝 Transcript preview: ${transcript.substring(0, 200)}...`);
    
    try {
      const prompt = `
You are an expert at extracting action items from meeting transcripts.

Extract action items from this meeting transcript. Return ONLY valid JSON with this exact format:
{
  "actionItems": [
    {
      "task": "Clear task description",
      "owner": "Person responsible or null",
      "deliverable": "What should be produced or null",
      "deadline": "When it's due or null",
      "confidence": 0.8
    }
  ]
}

Transcript:
${transcript}
`;

      console.log('📤 Sending request to OpenAI...');
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at extracting action items. Return ONLY valid JSON. If no action items are found, return {"actionItems": []}.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      console.log('📥 Received response from OpenAI');
      const content = response.choices[0].message.content;
      
      console.log(`📄 Full response: ${content}`);

      if (!content) {
        console.warn('⚠️ No content returned');
        return [];
      }

      // Parse JSON with better error handling
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', parseError);
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('❌ Failed to parse extracted JSON:', e);
            return [];
          }
        } else {
          console.error('❌ No JSON found in response');
          return [];
        }
      }

      const items = parsed.actionItems || [];
      console.log(`✅ Extracted ${items.length} action items`);
      
      if (items.length === 0) {
        console.log('⚠️ No action items found in the transcript');
        console.log('📄 Check if the transcript contains meeting content');
      }

      return items.map((item: any, index: number) => ({
        id: `item-${Date.now()}-${index}`,
        task: item.task || 'Untitled task',
        owner: item.owner || undefined,
        deliverable: item.deliverable || undefined,
        deadline: item.deadline || undefined,
        context: item.context || undefined,
        confidence: item.confidence || 0.5,
        status: 'extracted' as const
      }));
    } catch (error: any) {
      console.error('❌ ExtractorAgent error:', error);
      console.error('Error message:', error.message);
      if (error.response) {
        console.error('API Response:', error.response.data);
      }
      return [];
    }
  }
}