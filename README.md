# Meeting Action Item Validator

Transform vague meeting notes into clear, actionable tasks using AI agents.

## Problem

After every meeting, teams create action items that are often vague, missing owners or deadlines. This leads to dropped tasks and wasted time in follow-up meetings.

## Solution

This tool uses a multi-agent AI system to:

- Extract action items from meeting transcripts
- Validate each item for completeness (owner, deliverable, deadline)
- Enrich items with suggestions for missing information
- Flag items needing clarification

## How It Works


- **Extractor Agent** - Scans the transcript and identifies all potential action items
- **Validator Agent** - Checks each item for owner, deliverable, and deadline
- **Enricher Agent** - Suggests missing owners, deadlines, and detects duplicate tasks

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/meeting-action-validator.git
cd meeting-action-validator
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a .env.local file in the root directory and add your OpenAI API key:
```bash
OPENAI_API_KEY=your-api-key-here
```

### 4. Run the development server
```bash
npm run dev
```
Open http://localhost:3000 to use the app.

src/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── lib/
│   ├── agents/       # AI agents (Extractor, Validator, Enricher)
│   ├── skills/       # Skills (Company knowledge, PM tools)
│   └── prompts/      # AI prompt templates
└── types/            # TypeScript types

Technology
Next.js 14 (App Router)

TypeScript

Tailwind CSS

OpenAI API
