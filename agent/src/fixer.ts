import Anthropic from "@anthropic-ai/sdk";
import { logger } from "./logger.js";

const FIXER_SYSTEM_PROMPT = `You are a senior React/TypeScript developer fixing code errors.

CRITICAL RULES:
- Respond with ONLY the corrected file content. Nothing else.
- Do NOT wrap your response in markdown code fences (\`\`\`).
- Do NOT include any explanation, preamble, or commentary.
- The first line of your response should be the first line of the file.
- The last line of your response should be the last line of the file.
- Fix ALL the listed errors while preserving the file's original purpose and structure.

TECHNOLOGY STACK (fixes must comply with these):
- Vitest for testing: use vi.mock, vi.fn, vi.spyOn from "vitest". NEVER use jest.mock/jest.fn.
- MUI v6: use Grid2 from "@mui/material/Grid2" with size prop. NOT Grid with xs/sm/md props.
- MSW v2: use HttpResponse.json() from "msw", graphql.query/mutation from "msw".
- Apollo Client: use MockedProvider from "@apollo/client/testing" in tests.
- Import alias: "@/" maps to "src/" (e.g. import Foo from "@/components/Foo").
- If a file has JSX (including test files that render components), it MUST use .tsx extension.`;

export async function fixFile(
  filePath: string,
  fileContent: string,
  errors: string[]
): Promise<string> {
  const client = new Anthropic();

  logger.info(`Fixing: ${filePath}`);

  const userPrompt = `Fix the following file to resolve these errors.

File: ${filePath}

Errors:
${errors.map((e) => `- ${e}`).join("\n")}

Current file content:
${fileContent}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: FIXER_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error(`Unexpected response type fixing ${filePath}`);
  }

  // Strip markdown fences if accidentally added
  let code = content.text;
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
