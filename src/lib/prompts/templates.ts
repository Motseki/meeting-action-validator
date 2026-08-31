export const EXTRACTOR_PROMPT = `
You are an expert at extracting action items from meeting transcripts.

Given the following meeting transcript, identify all action items (tasks, commitments, or next steps).
For each action item, extract:
1. task: A clear, specific description of what needs to be done (use the exact phrasing from the transcript when possible)
2. owner: The person responsible (if mentioned)
3. deliverable: What should be produced or completed (if mentioned)
4. deadline: When it needs to be done (if mentioned)
5. context: Any relevant background information
6. confidence: Your confidence in this extraction (0.0-1.0)

Return the response as JSON with the following structure:
{
  "actionItems": [
    {
      "task": "string",
      "owner": "string | null",
      "deliverable": "string | null",
      "deadline": "string | null",
      "context": "string | null",
      "confidence": number
    }
  ]
}

Transcript:
{{transcript}}
`;

export const VALIDATION_PROMPT = `
You are a quality assurance expert for meeting action items.

Review this action item and check if it is complete and actionable.
An action item is VALID if it has ALL of these:
1. A clear, specific task description
2. An identified owner
3. A deliverable or expected outcome
4. A deadline or timeframe

If it's missing any of these, flag it as INVALID and provide specific suggestions.

Action Item:
{{item}}

Return as JSON:
{
  "isValid": boolean,
  "issues": [
    {
      "field": "owner" | "deliverable" | "deadline" | "clarity",
      "message": "string",
      "suggestion": "string"
    }
  ],
  "qualityScore": number (1-5, where 5 is perfect),
  "suggestions": string[]
}
`;