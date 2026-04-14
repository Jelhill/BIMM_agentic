import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { callLLM } from "./llm.js";
import { logger } from "./logger.js";

const FIXER_SYSTEM_PROMPT = `You are a senior React/TypeScript developer fixing code errors.

CRITICAL RULES:
- Respond with ONLY the corrected file content. Nothing else.
- Do NOT wrap your response in markdown code fences (\`\`\`).
- Do NOT include any explanation, preamble, or commentary.
- The first line of your response should be the first line of the file.
- The last line of your response should be the last line of the file.
- Fix ALL the listed errors while preserving the file's original purpose and structure.
- When errors involve mismatches with other files (wrong imports, wrong types), use the related file contents provided to ensure compatibility.

TECHNOLOGY STACK (fixes must comply with these):
- Vitest for testing: use vi.mock, vi.fn, vi.spyOn from "vitest". NEVER use jest.mock/jest.fn.
- MUI v6: use Grid2 from "@mui/material/Grid2" with size prop. NOT Grid with xs/sm/md props.
- MSW v2: use HttpResponse.json() from "msw", graphql.query/mutation from "msw".
- Apollo Client: use MockedProvider from "@apollo/client/testing" in tests.
- Import alias: "@/" maps to "src/" (e.g. import Foo from "@/components/Foo").
- If a file has JSX (including test files that render components), it MUST use .tsx extension.`;

/**
 * Extract import paths from a file's content and resolve them to actual files.
 * Returns the content of related files so the fixer has cross-file context.
 */
function gatherRelatedFileContext(
  filePath: string,
  fileContent: string,
  projectPath: string
): string {
  const contextParts: string[] = [];
  const importRegex = /from\s+["'](@\/[^"']+|\.\.?\/[^"']+)["']/g;
  const seen = new Set<string>();

  for (const match of fileContent.matchAll(importRegex)) {
    let importPath = match[1];

    if (importPath.startsWith("@/")) {
      importPath = "src/" + importPath.slice(2);
    }

    const extensions = ["", ".ts", ".tsx", ".js", ".jsx"];
    for (const ext of extensions) {
      const candidate = join(projectPath, importPath + ext);
      if (!seen.has(candidate) && existsSync(candidate)) {
        seen.add(candidate);
        const content = readFileSync(candidate, "utf-8");
        const lines = content.split("\n");
        const truncated =
          lines.length > 150
            ? lines.slice(0, 150).join("\n") + "\n// ...truncated"
            : content;
        const relPath = candidate.slice(projectPath.length + 1);
        contextParts.push(
          `--- Related file: ${relPath} ---\n${truncated}\n--- End of ${relPath} ---`
        );
        break;
      }
    }
  }

  return contextParts.join("\n\n");
}

export async function fixFile(
  filePath: string,
  fileContent: string,
  errors: string[],
  projectPath?: string
): Promise<string> {
  logger.info(`Fixing: ${filePath}`);

  let relatedContext = "";
  if (projectPath) {
    relatedContext = gatherRelatedFileContext(filePath, fileContent, projectPath);
  }

  let userPrompt = `${FIXER_SYSTEM_PROMPT}\n\nFix the following file to resolve these errors.

File: ${filePath}

Errors:
${errors.map((e) => `- ${e}`).join("\n")}

Current file content:
${fileContent}`;

  if (relatedContext) {
    userPrompt += `\n\nHere are the related files this file imports (use these to ensure correct types, exports, and interfaces):\n\n${relatedContext}`;
  }

  const response = await callLLM(userPrompt);

  let code = response;
  if (code.startsWith("```")) {
    const lines = code.split("\n");
    lines.shift();
    if (lines[lines.length - 1]?.trim() === "```") {
      lines.pop();
    }
    code = lines.join("\n");
  }

  logger.success(`Fixed: ${filePath}`);
  return code;
}
