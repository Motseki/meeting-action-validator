'use client';

import type { EvaluationResult } from '@/types';

interface ComparisonChartProps {
  results: EvaluationResult[];
}

export function ComparisonChart({ results }: ComparisonChartProps) {
  if (!results || results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data to display
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span className="text-xs text-gray-600">Baseline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-600">Agentic</span>
          </div>
        </div>
        <span className="text-xs text-gray-400">Execution Ready (%)</span>
      </div>

      {/* Chart Bars */}
      <div className="space-y-4">
        {results.map((result, idx) => {
          const baselineWidth = Math.min(result.baseline.executionReady, 100);
          const agenticWidth = Math.min(result.agentic.executionReady, 100);
          const improvement = result.improvement.executionReady;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{result.caseId}</span>
                <span className="text-gray-500">
                  <span className="text-gray-400">Baseline:</span> {result.baseline.executionReady.toFixed(0)}% 
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-green-600 font-medium">Agentic:</span> {result.agentic.executionReady.toFixed(0)}%
                  <span className={`ml-2 font-medium ${improvement >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    ({improvement >= 0 ? '+' : ''}{improvement.toFixed(0)}%)
                  </span>
                </span>
              </div>
              <div className="relative">
                {/* Baseline Bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-400 transition-all duration-700 ease-out"
                      style={{ width: `${baselineWidth}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {baselineWidth.toFixed(0)}%
                  </span>
                </div>
                {/* Agentic Bar */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-700 ease-out"
                      style={{ width: `${agenticWidth}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {agenticWidth.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Total Cases</p>
            <p className="font-semibold text-gray-900">{results.length}</p>
          </div>
          <div>
            <p className="text-gray-500">Avg Baseline</p>
            <p className="font-semibold text-gray-900">
              {(results.reduce((sum, r) => sum + r.baseline.executionReady, 0) / results.length).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-gray-500">Avg Agentic</p>
            <p className="font-semibold text-green-600">
              {(results.reduce((sum, r) => sum + r.agentic.executionReady, 0) / results.length).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-gray-500">Avg Improvement</p>
            <p className="font-semibold text-blue-600">
              +{(results.reduce((sum, r) => sum + r.improvement.executionReady, 0) / results.length).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}