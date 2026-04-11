import { execSync } from "node:child_process";
import { logger } from "./logger.js";
import type { ValidationResult } from "./types.js";

function runCommand(command: string, cwd: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(command, {
      cwd,
      encoding: "utf-8",
      timeout: 120_000,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { stdout, stderr: "", exitCode: 0 };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? "",
      exitCode: e.status ?? 1,
    };
  }
}

export async function validate(projectPath: string): Promise<ValidationResult> {
  const errors: string[] = [];
  const outputParts: string[] = [];

  // 1. Type-check
  logger.info("Running tsc --noEmit...");
  const tsc = runCommand("npx tsc --noEmit", projectPath);
  outputParts.push("=== tsc --noEmit ===", tsc.stdout, tsc.stderr);

  if (tsc.exitCode !== 0) {
    const combined = (tsc.stdout + "\n" + tsc.stderr).trim();
    for (const line of combined.split("\n")) {
      if (line.includes("error TS")) {
        errors.push(line);
      }
    }
    if (errors.length === 0 && combined.length > 0) {
      errors.push(combined);
    }
    logger.error(`TypeScript check failed with ${errors.length} error(s)`);
  } else {
    logger.success("TypeScript check passed");
  }

  // 2. Tests (use npx vitest run to ensure single-run, no watch mode)
  logger.info("Running vitest run...");
  const test = runCommand("npx vitest run --reporter=verbose", projectPath);
  outputParts.push("=== npm run test ===", test.stdout, test.stderr);

  if (test.exitCode !== 0) {
    const combined = (test.stdout + "\n" + test.stderr).trim();
    const testErrors: string[] = [];
    for (const line of combined.split("\n")) {
      if (
        line.includes("FAIL") ||
        line.includes("Error:") ||
        line.includes("expected") ||
        line.includes("AssertionError") ||
        line.includes("TypeError") ||
        line.includes("ReferenceError") ||
        line.includes("Cannot find")
      ) {
        testErrors.push(line.trim());
      }
    }
    if (testErrors.length > 0) {
      errors.push(...testErrors);
    } else {
      errors.push("Test run failed (see raw output for details)");
    }
    logger.error("Test run failed");
  } else {
    logger.success("Tests passed");
  }

  const rawOutput = outputParts.join("\n");
  const passed = errors.length === 0;

  return { passed, errors, rawOutput };
}
