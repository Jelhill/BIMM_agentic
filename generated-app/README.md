# BIMM — Agentic Code Generation CLI

An AI-powered CLI agent that reads a plain-text feature specification and autonomously generates a complete, working React + TypeScript application. The agent decomposes the spec into an ordered task plan, generates code for each task using a configurable LLM provider (Anthropic Claude or OpenAI GPT-4o), validates the output with TypeScript and test runners, and auto-fixes errors in a multi-pass retry loop (up to 3 attempts). Built as a 5-phase project demonstrating agentic LLM architecture.

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
│ LLM to   │     │ tasks in  │     │ + vitest  │     │ file  │
│ make     │     │ dep order,│     │ in the    │     │ + err │
│ task     │     │ passes    │     │ generated │     │ to    │
│ list     │     │ dep file  │     │ app dir   │     │ LLM  │
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
| **LLM** | `agent/src/llm.ts` | Unified LLM calling layer. Reads `LLM_PROVIDER` from env to dispatch to Anthropic (`claude-sonnet-4-20250514`) or OpenAI (`gpt-4o`). Extensible — add new providers by handling additional cases. |
| **Planner** | `agent/src/planner.ts` | Sends the spec to the LLM and instructs it to return a JSON array of tasks, each with `id`, `title`, `description`, `dependsOn[]`, and `outputFile`. |
| **Generator** | `agent/src/generator.ts` | Copies the boilerplate into `/generated-app`, topologically sorts tasks by dependencies, then generates each file by calling the LLM with the task description and the contents of dependency files as context. |
| **Validator** | `agent/src/validator.ts` | Runs `tsc --noEmit` and `vitest run` in the generated app directory. Parses error output and returns a structured `{ passed, errors[], rawOutput }` result. |
| **Fixer** | `agent/src/fixer.ts` | For each file mentioned in validation errors, sends the file content + errors to the LLM with a "fix this file" prompt. Overwrites the file with the corrected version. The fix loop runs up to 3 passes, re-validating after each pass. |

### Context Management

- Only **dependency files** are passed as context to the generator (not all previously generated files), preventing token bloat
- Files over **200 lines** are truncated with a `// ...truncated` note
- The fixer receives only errors relevant to the specific file being fixed

## How to Run

### Prerequisites

- Node.js 18+
- An Anthropic API key **or** an OpenAI API key (depending on which provider you choose)

### Setup

```bash
# 1. Clone the repo and install boilerplate dependencies
npm install

# 2. Set up the agent
cd agent
npm install
cp .env.example .env
# Edit .env — add your API key(s) and set LLM_PROVIDER (anthropic or openai)

# 3. Run the agent (from the agent/ directory)
npm run generate

# Or with a custom spec file:
npm run dev -- --spec ./my-other-spec.txt

# NOTE: Steps 2-3 must be run from inside the agent/ directory.
# The agent will generate output into ../generated-app relative to agent/.
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
| `LLM_PROVIDER` | LLM provider to use: `anthropic` (default) or `openai` |
| `ANTHROPIC_API_KEY` | Your Anthropic API key (required when `LLM_PROVIDER=anthropic`) |
| `OPENAI_API_KEY` | Your OpenAI API key (required when `LLM_PROVIDER=openai`) |

## LLM Choices

### Multi-Provider Support

The agent dynamically supports multiple LLM providers via the `LLM_PROVIDER` environment variable. All LLM calls go through a single `callLLM()` function in `agent/src/llm.ts`, making it straightforward to add new providers — just handle an additional case in that function.

| Provider | Model | Set via |
|----------|-------|---------|
| **Anthropic** (default) | `claude-sonnet-4-20250514` | `LLM_PROVIDER=anthropic` |
| **OpenAI** | `gpt-4o` | `LLM_PROVIDER=openai` |

### Why Claude as Default

Claude excels at following structured output instructions (e.g., "respond with ONLY JSON, no markdown") which is critical for an agentic code generation pipeline where responses must be machine-parseable. Its large context window (200k tokens) also supports passing multiple dependency files as context without truncation in most cases.

### Model Selection (Anthropic)

When using Anthropic, the agent uses **`claude-sonnet-4-20250514`**. Sonnet was chosen as the best balance of:

- **Quality**: Produces correct, well-structured React/TypeScript code with proper imports and type safety
- **Speed**: Significantly faster than Opus, which matters when making 20+ sequential API calls per run
- **Cost**: ~$3/M input, $15/M output tokens — roughly 10x cheaper than Opus per run

Opus would produce marginally better code but at 10x the cost and 3-4x the latency, making the validate-fix loop impractical.

## Tradeoffs & Improvements

### Current Tradeoffs

- **No cross-file awareness in fixer**: The fixer sees one file at a time. If file A imports from file B incorrectly, the fixer can only fix A's code, not coordinate changes across both
- **Planner non-determinism**: Each run produces a different task plan. The number and granularity of tasks varies, which affects downstream code quality
- **Generated package.json**: The generator may produce a package.json with different dependency versions than the boilerplate, requiring manual reconciliation

### What I'd Improve With More Time

- **Cross-file fixer**: Pass all failing files + their errors in a single LLM call for coordinated fixes
- **Structured output**: Use provider-native JSON modes (Claude's tool_use, OpenAI's response_format) instead of free-text with "respond only in JSON" instructions
- **Incremental generation**: Skip re-generating files that already pass validation
- **Caching**: Cache LLM responses by task hash to avoid re-generating identical tasks across runs
- **Parallel generation**: Generate independent tasks (those with no shared dependencies) concurrently
- **Pinned task plan**: Allow saving/loading a task plan to ensure deterministic generation across runs

## Approximate Cost Per Run

| Phase | API Calls | Avg Input Tokens | Avg Output Tokens | Estimated Cost (Claude) |
|-------|-----------|-----------------|-------------------|-------------------------|
| Planner | 1 | ~2,000 | ~2,500 | $0.04 |
| Generator | ~18-20 | ~1,500 avg | ~3,000 avg | $1.00 |
| Fixer | 1-9 (up to 3 passes) | ~2,000 avg | ~3,000 avg | $0.15-$0.45 |
| **Total** | **~22-30** | | | **~$1.20-$1.50** |

Costs based on `claude-sonnet-4-20250514` pricing: $3/M input tokens, $15/M output tokens. Actual costs vary by run due to non-deterministic planning. OpenAI costs will differ based on `gpt-4o` pricing.

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
│       ├── llm.ts         ← unified LLM calling layer
│       ├── planner.ts     ← spec → task list
│       ├── generator.ts   ← task list → generated code
│       ├── validator.ts   ← tsc + vitest runner
│       ├── fixer.ts       ← error → fixed code
│       ├── logger.ts      ← chalk-based logging
│       └── types.ts       ← shared TypeScript types
└── generated-app/         ← output (gitignored)
```
