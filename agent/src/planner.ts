import Anthropic from "@anthropic-ai/sdk";
import { logger } from "./logger.js";
import type { Task } from "./types.js";

const PLANNER_SYSTEM_PROMPT = `You are a software project planner. Given a feature spec, decompose it into an ordered list of implementation tasks.

Respond ONLY with a JSON array. No markdown, no code fences, no preamble, no explanation.

Each task object must have exactly these fields:
- "id": a short unique string (e.g. "task-1", "task-2")
- "title": a brief title for the task
- "description": a detailed description of what to implement
- "dependsOn": an array of task ids that must be completed before this task (empty array if none)
- "outputFile": the relative file path this task will create or modify (e.g. "src/hooks/useCars.ts")

Order tasks so dependencies come first. Be specific about file paths and implementation details.

IMPORTANT CONSTRAINTS for outputFile paths:
- Files containing JSX (components, test files that render components) MUST use .tsx extension.
- Pure TypeScript files (types, hooks with no JSX, utilities) use .ts extension.
- Test files that use <Component /> or render() MUST be .tsx, not .ts.
- Use the "@/" import alias for src/ imports in descriptions.
- The boilerplate already provides: src/main.tsx, src/test-setup.ts, src/mocks/browser.ts, src/mocks/server.ts, src/mocks/handlers.ts, src/mocks/data.ts, src/graphql/queries.ts, src/types.ts, src/App.tsx, vitest.config.ts, tsconfig.json.
- Do NOT create tasks for files that the boilerplate already provides UNLESS the spec requires modifying them.
- Always include tasks to modify these boilerplate files to match the spec: src/types.ts, src/graphql/queries.ts, src/mocks/handlers.ts, src/mocks/data.ts, src/App.tsx.

TECHNOLOGY STACK (include in task descriptions):
- Vitest for testing (vi.mock, vi.fn — NOT jest)
- MUI v6 Grid2 with size prop — NOT Grid with xs/md props
- MSW v2 (HttpResponse.json, graphql.query/mutation)
- Apollo Client with MockedProvider for test mocking`;

export async function planTasks(spec: string): Promise<Task[]> {
  const client = new Anthropic();

  logger.info("Sending spec to Claude for task planning...");

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Here is the application spec to decompose into tasks:\n\n${spec}`,
      },
    ],
    system: PLANNER_SYSTEM_PROMPT,
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude API");
  }

  const rawText = content.text.trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    logger.error("Failed to parse Claude response as JSON:");
    logger.error(rawText);
    throw new Error("Claude did not return valid JSON");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Claude response is not an array");
  }

  const tasks: Task[] = parsed.map((item: Record<string, unknown>) => ({
    id: String(item.id),
    title: String(item.title),
    description: String(item.description),
    dependsOn: Array.isArray(item.dependsOn)
      ? item.dependsOn.map(String)
      : [],
    outputFile: String(item.outputFile),
    status: "pending" as const,
  }));

  logger.success(`Planned ${tasks.length} tasks`);
  return tasks;
}
