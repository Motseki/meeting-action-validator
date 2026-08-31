import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

/**
 * Get or create the OpenAI client instance (singleton pattern)
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    openaiClient = new OpenAI({
      apiKey,
      maxRetries: 3,
      timeout: 60000,
    });
  }
  return openaiClient;
}

/**
 * Token usage tracker for monitoring API usage
 * Helps stay within free tier limits
 */
export class TokenTracker {
  private totalInputTokens = 0;
  private totalOutputTokens = 0;
  private totalTokens = 0;
  private requests = 0;

  track(usage: OpenAI.Completions.CompletionUsage) {
    this.totalInputTokens += usage.prompt_tokens;
    this.totalOutputTokens += usage.completion_tokens;
    this.totalTokens += usage.total_tokens;
    this.requests++;
  }

  getStats() {
    return {
      requests: this.requests,
      inputTokens: this.totalInputTokens,
      outputTokens: this.totalOutputTokens,
      totalTokens: this.totalTokens,
    };
  }

  reset() {
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
    this.totalTokens = 0;
    this.requests = 0;
  }

  getRemainingTokens(): number {
    const FREE_TIER_LIMIT = 250000; // 250K tokens per day for GPT-4
    return Math.max(0, FREE_TIER_LIMIT - this.totalTokens);
  }

  isNearLimit(): boolean {
    return this.getRemainingTokens() < 10000; // Less than 10K tokens remaining
  }
}

let tokenTracker: TokenTracker | null = null;

/**
 * Get the singleton token tracker instance
 */
export function getTokenTracker(): TokenTracker {
  if (!tokenTracker) {
    tokenTracker = new TokenTracker();
  }
  return tokenTracker;
}

/**
 * Create a new OpenAI client with custom configuration
 */
export function createCustomClient(apiKey?: string, baseURL?: string): OpenAI {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OpenAI API key is required');
  }

  return new OpenAI({
    apiKey: key,
    baseURL: baseURL || undefined,
    maxRetries: 3,
    timeout: 60000,
  });
}

/**
 * Helper function to estimate token count
 * (rough estimate - 1 token ≈ 4 characters for English text)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Check if we can make a request without exceeding the free tier limit
 */
export function canMakeRequest(estimatedTokens: number): boolean {
  const tracker = getTokenTracker();
  return tracker.getRemainingTokens() >= estimatedTokens;
}