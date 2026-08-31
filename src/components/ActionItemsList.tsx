'use client';

import type { ActionItem, ValidationResult, EnrichmentResult } from '@/types';

interface ActionItemsListProps {
  items: ActionItem[];
  validations: ValidationResult[];
  enrichments: EnrichmentResult[];
}

export default function ActionItemsList({ items, validations, enrichments }: ActionItemsListProps) {
  const getValidation = (itemId: string) => validations.find(v => v.itemId === itemId);
  const getEnrichment = (itemId: string) => enrichments.find(e => e.itemId === itemId);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
        <p className="text-lg text-gray-500">No action items found</p>
        <p className="text-sm text-gray-400 mt-1">Try a different meeting transcript</p>
      </div>
    );
  }

  const validCount = items.filter(i => i.status === 'enriched').length;
  const needsReviewCount = items.filter(i => i.status === 'needs_clarification').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="text-lg font-semibold">Action Items</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
            ✅ Ready: {validCount}
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
            ⚠️ Needs Review: {needsReviewCount}
          </span>
        </div>
      </div>

      {items.map((item) => {
        const validation = getValidation(item.id);
        const enrichment = getEnrichment(item.id);
        const isValid = validation?.isValid || false;

        return (
          <div
            key={item.id}
            className={`bg-white rounded-lg shadow-sm border p-4 transition-all ${
              isValid ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-yellow-500'
            }`}
          >
            <div className="flex flex-wrap justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{item.task}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.owner && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      👤 {item.owner}
                    </span>
                  )}
                  {item.deliverable && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      📦 {item.deliverable}
                    </span>
                  )}
                  {item.deadline && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      📅 {item.deadline}
                    </span>
                  )}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    Confidence: {Math.round((item.confidence || 0) * 100)}%
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                isValid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isValid ? '✅ Ready' : '⚠️ Needs Work'}
              </span>
            </div>

            {!isValid && validation?.issues && validation.issues.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  Missing Information:
                </p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {validation.issues.map((issue, idx) => (
                    <li key={idx} className="flex flex-col">
                      <span>
                        <span className="font-medium">{issue.field}:</span> {issue.message}
                      </span>
                      <span className="text-xs text-yellow-600 mt-0.5">
                        💡 {issue.suggestion}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {enrichment?.isDuplicate && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                ⚠️ Similar task already exists: {enrichment.duplicateTaskId}
              </div>
            )}

            {enrichment?.suggestedOwner && !item.owner && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                💡 Suggested owner: {enrichment.suggestedOwner}
              </div>
            )}

            {enrichment?.suggestedDeadline && !item.deadline && (
              <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                💡 Suggested deadline: {enrichment.suggestedDeadline}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}