'use client';

import { useState } from 'react';
import MeetingInput from '@/components/MeetingInput';
import ActionItemsList from '@/components/ActionItemsList';
import TokenUsage from '@/components/TokenUsage';
import type { ProcessedMeeting } from '@/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProcessedMeeting | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async (transcript: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/agents/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process meeting');
      }

      const data = await response.json();
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with better contrast */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Meeting Action Item Validator
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Transform vague meeting notes into clear, actionable tasks
        </p>
      </div>

      <MeetingInput onProcess={handleProcess} isLoading={isLoading} />

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.summary.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-green-200 dark:border-green-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Ready for Execution</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {result.summary.valid}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Quality Score</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {result.summary.qualityScore}/5
              </p>
            </div>
          </div>

          <ActionItemsList 
            items={result.items}
            validations={result.validationResults}
            enrichments={result.enrichmentResults}
          />
        </div>
      )}

      <TokenUsage />
    </div>
  );
}