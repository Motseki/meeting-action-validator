/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import { ComparisonChart } from '@/components/ComparisonChart';
import type { EvaluationResult } from '@/types';

export default function EvaluatePage() {
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const runEvaluation = async () => {
    setIsLoading(true);
    try {
      // Test transcripts
      const testCases = [
        { id: 'case-1', text: 'Sarah: We need to fix the login bug. Mike: I\'ll handle it.' },
        { id: 'case-2', text: 'We should update the docs. Someone should do it. Also, the client wants a demo.' },
        { id: 'case-3', text: 'Team: The database is slow. John: I\'ll optimize it. Lisa: I\'ll update the UI.' },
        { id: 'case-4', text: 'Meeting: Need to deploy by Friday. Devs: We\'ll work on it.' },
        { id: 'case-5', text: 'Client meeting: They want a new feature. PM: I\'ll write the spec. Team: We\'ll estimate it.' },
      ];

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcripts: testCases })
      });

      const data = await response.json();
      setResults(data.data);
      setSummary(data.summary);
    } catch (error) {
      console.error('Evaluation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Evaluation Results</h1>
        <p className="text-gray-600 mt-1">
          Compare baseline vs agentic solution performance
        </p>
      </div>
      
      <button
        onClick={runEvaluation}
        disabled={isLoading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Running Evaluation...
          </span>
        ) : (
          '🚀 Run Evaluation'
        )}
      </button>

      {summary && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Baseline Average</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {summary.averageBaseline.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">Simple one-shot prompt</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200 bg-green-50/30">
            <p className="text-sm text-gray-500 font-medium">Agentic Average</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {summary.averageAgentic.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">Multi-agent workflow</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200 bg-blue-50/30">
            <p className="text-sm text-gray-500 font-medium">Improvement</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              +{summary.averageImprovement.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">Overall gain</p>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-8">
          {/* Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Performance Comparison</h3>
            <ComparisonChart results={results} />
          </div>
          
          {/* Detailed Results */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Detailed Results</h3>
            <div className="space-y-2">
              {results.map((r, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <span className="font-medium text-gray-700">{r.caseId}</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm">
                        <span className="text-gray-500">Baseline:</span>
                        <span className="ml-1 font-medium">{r.baseline.executionReady.toFixed(0)}%</span>
                      </span>
                      <span className="text-gray-300">→</span>
                      <span className="text-sm">
                        <span className="text-gray-500">Agentic:</span>
                        <span className="ml-1 font-medium text-green-600">{r.agentic.executionReady.toFixed(0)}%</span>
                      </span>
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        +{r.improvement.executionReady.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2">Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total Cases</p>
                <p className="font-semibold">{summary?.totalCases || results.length}</p>
              </div>
              <div>
                <p className="text-gray-500">Avg Baseline</p>
                <p className="font-semibold">{summary?.averageBaseline.toFixed(1) || 0}%</p>
              </div>
              <div>
                <p className="text-gray-500">Avg Agentic</p>
                <p className="font-semibold text-green-600">{summary?.averageAgentic.toFixed(1) || 0}%</p>
              </div>
              <div>
                <p className="text-gray-500">Total Improvement</p>
                <p className="font-semibold text-blue-600">+{summary?.averageImprovement.toFixed(1) || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!results.length && !isLoading && (
        <div className="mt-8 text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">Click "Run Evaluation" to see results</p>
          <p className="text-sm text-gray-400 mt-1">This will test 5 sample transcripts</p>
        </div>
      )}
    </div>
  );
}