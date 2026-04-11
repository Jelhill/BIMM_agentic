# BIMM — Agentic Code Generation CLI

An AI-powered CLI agent that reads a plain-text feature specification and autonomously generates a complete, working React + TypeScript application. The agent decomposes the spec into an ordered task plan, generates code for each task using Claude, validates the output with TypeScript and test runners, and auto-fixes errors in a retry loop. Built as a 5-phase project demonstrating agentic LLM architecture.

## Agent Architecture

The agent is composed of four modules that run sequentially in a pipeline:

```
spec.txt
   │
   ▼
┌──────────┐     ┌───────────┐     ┌───────────┐     ┌───────┐
│ Planner  │────▶│ Generator │────▶│ Validator │────▶│ Fixer │
│          │     │           │     │           │     │       │
│ Calls    │     │ Iterates  │     │ Runs tsc  │     │ Sends │
│ Claude   │     │ tasks in  │     │ + vitest  │     │ file  │
│ to make  │     │ dep order,│     │ in the    │     │ + err │
│ task     │     │ passes    │     │ generated │     │ to    │
│ list     │     │ dep file  │     │ app dir   │     │Claude │
│          │     │ context   │     │           │     │       │
└──────────┘     └───────────┘     └─────┬─────┘     └───┬───┘
                                         │               │
                                         │  if errors     │
                                         │◀───────────────┘
                                         │
                                         ▼
                                   ┌───────────┐
                                   │ Validator  │
                                   │ (retry)    │
                                   └───────────┘
                                         │
                                         ▼
                                   Pass / Fail
```

### Module Details

| Module | File | Responsibility |
|--------|------|----------------|
| **Planner** | `agent/src/planner.ts` | Sends the spec to Claude and instructs it to return a JSON array of tasks, each with `id`, `title`, `description`, `dependsOn[]`, and `outputFile`. |
| **Generator** | `agent/src/generator.ts` | Copies the boilerplate into `/generated-app`, topologically sorts tasks by dependencies, then generates each file by calling Claude with the task description and the contents of dependency files as context. |
| **Validator** | `agent/src/validator.ts` | Runs `tsc --noEmit` and `vitest run` in the generated app directory. Parses error output and returns a structured `{ passed, errors[], rawOutput }` result. |
| **Fixer** | `agent/src/fixer.ts` | For each file mentioned in validation errors, sends the file content + errors to Claude with a "fix this file" prompt. Overwrites the file with the corrected version. |

### Context Management

- Only **dependency files** are passed as context to the generator (not all previously generated files), preventing token bloat
- Files over **200 lines** are truncated with a `// ...truncated` note
- The fixer receives only errors relevant to the specific file being fixed

## How to Run

### Prerequisites

- Node.js 18+
- An Anthropic API key

### Setup

```bash
# 1. Clone the repo and install boilerplate dependencies
npm install

# 2. Set up the agent
cd agent
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 3. Build and run the agent
npx tsc && node dist/index.js --spec ./spec.txt
```

The agent will:
1. Plan tasks from `spec.txt`
2. Generate code into `/generated-app`
3. Install dependencies in the generated app
4. Validate (tsc + tests)
5. Fix any errors and re-validate

### Verify the generated app

```bash
cd ../generated-app
npm install
npm run dev       # starts Vite dev server
npm run test      # runs vitest
npm run typecheck # runs tsc --noEmit
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (required) |

## LLM Choices

### Why Claude

Claude excels at following structured output instructions (e.g., "respond with ONLY JSON, no markdown") which is critical for an agentic code generation pipeline where responses must be machine-parseable. Its large context window (200k tokens) also supports passing multiple dependency files as context without truncation in most cases.

### Model Selection

The agent uses **`claude-sonnet-4-20250514`** for all API calls (planning, generation, fixing). Sonnet was chosen as the best balance of:

- **Quality**: Produces correct, well-structured React/TypeScript code with proper imports and type safety
- **Speed**: Significantly faster than Opus, which matters when making 20+ sequential API calls per run
- **Cost**: ~$3/M input, $15/M output tokens — roughly 10x cheaper than Opus per run

Opus would produce marginally better code but at 10x the cost and 3-4x the latency, making the validate-fix loop impractical.

## Tradeoffs & Improvements

### Current Tradeoffs

- **Single retry**: The fixer only gets one pass. Some multi-file errors (e.g., mismatched imports across files) can't be fixed by patching individual files in isolation
- **No cross-file awareness in fixer**: The fixer sees one file at a time. If file A imports from file B incorrectly, the fixer can only fix A's code, not coordinate changes across both
- **Planner non-determinism**: Each run produces a different task plan. The number and granularity of tasks varies, which affects downstream code quality
- **Generated package.json**: The generator may produce a package.json with different dependency versions than the boilerplate, requiring manual reconciliation

### What I'd Improve With More Time

- **Multi-pass fix loop**: Allow 2-3 retry rounds instead of 1, with diminishing returns detection
- **Cross-file fixer**: Pass all failing files + their errors in a single Claude call for coordinated fixes
- **Structured output**: Use Claude's tool_use/JSON mode instead of free-text with "respond only in JSON" instructions
- **Incremental generation**: Skip re-generating files that already pass validation
- **Caching**: Cache Claude responses by task hash to avoid re-generating identical tasks across runs
- **Parallel generation**: Generate independent tasks (those with no shared dependencies) concurrently
- **Pinned task plan**: Allow saving/loading a task plan to ensure deterministic generation across runs

## Approximate Cost Per Run

| Phase | API Calls | Avg Input Tokens | Avg Output Tokens | Estimated Cost |
|-------|-----------|-----------------|-------------------|----------------|
| Planner | 1 | ~2,000 | ~2,500 | $0.04 |
| Generator | ~18-20 | ~1,500 avg | ~3,000 avg | $1.00 |
| Fixer | 1-3 | ~2,000 avg | ~3,000 avg | $0.15 |
| **Total** | **~22** | | | **~$1.20** |

Costs based on `claude-sonnet-4-20250514` pricing: $3/M input tokens, $15/M output tokens. Actual costs vary by run due to non-deterministic planning.

## Project Structure

```
BIMM/
├── README.md              ← you are here
├── .env.example           ← API key template
├── package.json           ← boilerplate (React + Vite)
├── src/                   ← boilerplate source
├── agent/                 ← the agentic CLI tool
│   ├── package.json
│   ├── tsconfig.json
│   ├── spec.txt           ← feature specification
│   ├── .env               ← your API key (gitignored)
│   ├── .env.example
│   └── src/
│       ├── index.ts       ← CLI entrypoint (orchestrator)
│       ├── planner.ts     ← spec → task list
│       ├── generator.ts   ← task list → generated code
│       ├── validator.ts   ← tsc + vitest runner
│       ├── fixer.ts       ← error → fixed code
│       ├── logger.ts      ← chalk-based logging
│       └── types.ts       ← shared TypeScript types
└── generated-app/         ← output (gitignored)
```
