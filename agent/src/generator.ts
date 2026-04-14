import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { callLLM } from "./llm.js";
import { logger } from "./logger.js";
import type { Task } from "./types.js";

const MAX_CONTEXT_LINES = 200;

const GENERATOR_SYSTEM_PROMPT = `You are a senior React/TypeScript developer. You generate production-quality code files.

CRITICAL RULES:
- Respond with ONLY the raw file content. Nothing else.
- Do NOT wrap your response in markdown code fences (\`\`\`).
- Do NOT include any explanation, preamble, or commentary.
- The first line of your response should be the first line of the file (e.g. an import statement).
- The last line of your response should be the last line of the file.

TECHNOLOGY STACK (you MUST follow these):
- React 18+ with TypeScript
- Vite as the build tool
- MUI v6 (Material UI): Use Grid2 from "@mui/material/Grid2" with size prop (e.g. <Grid2 size={{ xs: 12, md: 6 }}>), NOT the deprecated Grid with xs/sm/md props.
- Apollo Client for GraphQL
- MSW v2 for mocking: Use "msw/browser" for setupWorker, "msw/node" for setupServer. Handlers use graphql.query()/graphql.mutation() returning HttpResponse.json().
- Vitest + React Testing Library for tests: Use "vi.mock", "vi.fn", "vi.spyOn" from "vitest". NEVER use jest.mock/jest.fn/jest.spyOn.
- Files containing JSX (including tests with <Component />) MUST use .tsx extension, NOT .ts.
- Import path alias: "@/" maps to "src/" (e.g. import { GET_MOVIES } from "@/graphql/queries").
- For test files: import { describe, it, expect, vi, beforeEach } from "vitest".
- Test setup file is at "src/test-setup.ts" which sets up @testing-library/jest-dom/vitest matchers and MSW server.`;

/**
 * Build a manifest of all previously generated src/ files with their export signatures.
 * This gives the LLM accurate import paths so it doesn't have to guess.
 */
function buildFileManifest(outputPath: string): string {
  const srcDir = join(outputPath, "src");
  if (!existsSync(srcDir)) return "";

  const entries: string[] = [];

  function scan(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== "__tests__") {
        scan(fullPath);
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
        const relativePath = fullPath.slice(outputPath.length + 1);
        const aliasPath = "@/" + relativePath.slice(4).replace(/\.(ts|tsx)$/, "");
        const content = readFileSync(fullPath, "utf-8");

        const exports: string[] = [];
        for (const match of content.matchAll(/export\s+(?:const|function|class|interface|type|enum)\s+(\w+)/g)) {
          exports.push(match[1]);
        }
        if (content.includes("export default")) {
          exports.push("default");
        }

        if (exports.length > 0) {
          entries.push(`  ${aliasPath} — exports: ${exports.join(", ")}`);
        }
      }
    }
  }

  scan(srcDir);
  return entries.length > 0
    ? "Available project files (use these EXACT import paths):\n" + entries.join("\n")
    : "";
}

function topologicalSort(tasks: Task[]): Task[] {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const visited = new Set<string>();
  const sorted: Task[] = [];

  function visit(id: string): void {
    if (visited.has(id)) return;
    visited.add(id);
    const task = taskMap.get(id);
    if (!task) return;
    for (const depId of task.dependsOn) {
      visit(depId);
    }
    sorted.push(task);
  }

  for (const task of tasks) {
    visit(task.id);
  }

  return sorted;
}

function truncateContent(content: string): string {
  const lines = content.split("\n");
  if (lines.length <= MAX_CONTEXT_LINES) return content;
  return lines.slice(0, MAX_CONTEXT_LINES).join("\n") + "\n// ...truncated";
}

/**
 * Collect all transitive dependency IDs for a task (breadth-first).
 */
function getTransitiveDeps(task: Task, taskMap: Map<string, Task>): string[] {
  const visited = new Set<string>();
  const queue = [...task.dependsOn];

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const dep = taskMap.get(id);
    if (dep) {
      for (const parentId of dep.dependsOn) {
        queue.push(parentId);
      }
    }
  }

  return [...visited];
}

function gatherDependencyContext(
  task: Task,
  taskMap: Map<string, Task>,
  outputPath: string
): string {
  const contextParts: string[] = [];
  const allDepIds = getTransitiveDeps(task, taskMap);

  for (const depId of allDepIds) {
    const depTask = taskMap.get(depId);
    if (!depTask) continue;

    const filePath = join(outputPath, depTask.outputFile);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, "utf-8");
    const truncated = truncateContent(content);
    contextParts.push(
      `--- File: ${depTask.outputFile} ---\n${truncated}\n--- End of ${depTask.outputFile} ---`
    );
  }

  return contextParts.join("\n\n");
}

export async function generateCode(
  tasks: Task[],
  boilerplatePath: string,
  outputPath: string
): Promise<void> {
  if (existsSync(outputPath)) {
    logger.info("Output directory already exists, overwriting...");
  }
  mkdirSync(outputPath, { recursive: true });

  const skip = new Set(["node_modules", ".git", "agent", "generated-app", "generated-app2"]);
  for (const entry of readdirSync(boilerplatePath)) {
    if (skip.has(entry) || entry.startsWith("generated-")) continue;
    const src = join(boilerplatePath, entry);
    const dest = join(outputPath, entry);
    cpSync(src, dest, { recursive: true });
  }
  logger.success(`Copied boilerplate to ${outputPath}`);

  const boilerplateExamples = [
    join(outputPath, "src/components/Example.tsx"),
    join(outputPath, "src/__tests__/Example.test.tsx"),
  ];
  for (const exFile of boilerplateExamples) {
    if (existsSync(exFile)) {
      rmSync(exFile);
      logger.info(`Removed boilerplate file: ${exFile}`);
    }
  }
  const testsDir = join(outputPath, "src/__tests__");
  if (existsSync(testsDir) && readdirSync(testsDir).length === 0) {
    rmSync(testsDir, { recursive: true });
  }

  const sorted = topologicalSort(tasks);
  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  logger.info(`Generating code for ${sorted.length} tasks...\n`);

  for (let i = 0; i < sorted.length; i++) {
    const task = sorted[i];
    const progress = `[${i + 1}/${sorted.length}]`;

    logger.info(`${progress} Generating: ${task.title}`);
    logger.info(`        -> ${task.outputFile}`);

    const context = gatherDependencyContext(task, taskMap, outputPath);
    const manifest = buildFileManifest(outputPath);

    let userPrompt = `Generate the file: ${task.outputFile}\n\n`;
    userPrompt += `Task: ${task.title}\n`;
    userPrompt += `Description: ${task.description}\n`;

    if (manifest) {
      userPrompt += `\n${manifest}\n\nIMPORTANT: Use the EXACT import paths listed above. Do NOT invent or guess import paths.\n`;
    }

    if (context) {
      userPrompt += `\nHere are the dependency files you should reference:\n\n${context}`;
    }

    const fullPrompt = `${GENERATOR_SYSTEM_PROMPT}\n\n${userPrompt}`;
    const response = await callLLM(fullPrompt);

    let code = response;
    if (code.startsWith("```")) {
      const lines = code.split("\n");
      lines.shift();
      if (lines[lines.length - 1]?.trim() === "```") {
        lines.pop();
      }
      code = lines.join("\n");
    }

    const outFile = join(outputPath, task.outputFile);
    mkdirSync(dirname(outFile), { recursive: true });
    writeFileSync(outFile, code, "utf-8");

    logger.success(`${progress} Written: ${task.outputFile}`);
  }

  logger.success(`\nCode generation complete. Output: ${outputPath}`);
}
