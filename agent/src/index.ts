import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { Command } from "commander";
import dotenv from "dotenv";
import { fixFile } from "./fixer.js";
import { generateCode } from "./generator.js";
import { logger } from "./logger.js";
import { planTasks } from "./planner.js";
import { validate } from "./validator.js";

dotenv.config();

/**
 * Extract unique file paths from error messages.
 * TypeScript errors look like: "src/components/Foo.tsx(12,5): error TS2345: ..."
 * Test errors may mention file paths in various formats.
 */
function extractFailingFiles(errors: string[], projectPath: string): string[] {
  const files = new Set<string>();

  for (const error of errors) {
    // Match TypeScript error format: path(line,col): error TS...
    const tsMatch = error.match(/^(.+?)\(\d+,\d+\):\s*error\s+TS/);
    if (tsMatch) {
      const filePath = join(projectPath, tsMatch[1]);
      if (existsSync(filePath)) {
        files.add(filePath);
      }
      continue;
    }

    // Match common path patterns in error output (src/..., ./, etc.)
    const pathMatch = error.match(/(?:^|\s)(src\/\S+\.(?:ts|tsx|js|jsx))/);
    if (pathMatch) {
      const filePath = join(projectPath, pathMatch[1]);
      if (existsSync(filePath)) {
        files.add(filePath);
      }
    }
  }

  return [...files];
}

/**
 * Get errors relevant to a specific file.
 */
function getErrorsForFile(filePath: string, allErrors: string[]): string[] {
  const relativeParts = filePath.split("/");
  // Try matching by filename or relative path segments
  return allErrors.filter((e) =>
    relativeParts.some((part) => part.endsWith(".ts") || part.endsWith(".tsx")
      ? e.includes(part)
      : false
    ) || e.includes(filePath)
  );
}

const program = new Command();

program
  .name("bimm-agent")
  .description("Agentic CLI tool for code generation and validation")
  .requiredOption("--spec <filepath>", "Path to the spec file")
  .action(async (options: { spec: string }) => {
    const specPath = resolve(options.spec);
    logger.info(`Agent starting with spec: ${specPath}`);

    let specContent: string;
    try {
      specContent = readFileSync(specPath, "utf-8");
    } catch {
      logger.error(`Could not read spec file: ${specPath}`);
      process.exit(1);
    }

    // Phase 2: Planning
    const tasks = await planTasks(specContent);

    console.log("\n" + "=".repeat(60));
    logger.success("Task Plan");
    console.log("=".repeat(60) + "\n");

    for (const task of tasks) {
      const deps =
        task.dependsOn.length > 0
          ? ` (depends on: ${task.dependsOn.join(", ")})`
          : "";
      console.log(`  [${task.id}] ${task.title}${deps}`);
      console.log(`        File: ${task.outputFile}`);
      console.log(`        ${task.description}\n`);
    }

    // Phase 3: Code generation
    const boilerplatePath = resolve(process.cwd(), "..");
    const outputPath = resolve(process.cwd(), "../generated-app");
    await generateCode(tasks, boilerplatePath, outputPath);

    // Phase 4: Validation + retry
    console.log("\n" + "=".repeat(60));
    logger.info("Validation — Pass 1");
    console.log("=".repeat(60) + "\n");

    // Install deps in generated app first
    logger.info("Installing dependencies in generated app...");
    const { execSync } = await import("node:child_process");
    try {
      execSync("npm install", {
        cwd: outputPath,
        encoding: "utf-8",
        timeout: 120_000,
        stdio: ["pipe", "pipe", "pipe"],
      });
      logger.success("Dependencies installed");
    } catch {
      logger.error("Failed to install dependencies — continuing with validation");
    }

    let result = await validate(outputPath);

    if (result.passed) {
      console.log("\n" + "=".repeat(60));
      logger.success("All checks passed on first attempt!");
      console.log("=".repeat(60));
      return;
    }

    // Fix failing files
    console.log("\n" + "=".repeat(60));
    logger.info("Fixing errors...");
    console.log("=".repeat(60) + "\n");

    logger.error(`Found ${result.errors.length} error(s):`);
    for (const err of result.errors.slice(0, 20)) {
      console.log(`    ${err}`);
    }

    const failingFiles = extractFailingFiles(result.errors, outputPath);

    if (failingFiles.length === 0) {
      logger.error("Could not identify specific files to fix from error output");
      logger.error("Raw output (last 50 lines):");
      const rawLines = result.rawOutput.split("\n");
      for (const line of rawLines.slice(-50)) {
        console.log(`    ${line}`);
      }
    } else {
      logger.info(`Identified ${failingFiles.length} file(s) to fix`);

      for (const filePath of failingFiles) {
        const fileContent = readFileSync(filePath, "utf-8");
        const fileErrors = getErrorsForFile(filePath, result.errors);

        // If no specific errors matched, pass all errors as context
        const errorsToSend = fileErrors.length > 0 ? fileErrors : result.errors;
        const fixed = await fixFile(filePath, fileContent, errorsToSend);
        writeFileSync(filePath, fixed, "utf-8");
      }

      // Retry validation
      console.log("\n" + "=".repeat(60));
      logger.info("Validation — Pass 2 (after fixes)");
      console.log("=".repeat(60) + "\n");

      result = await validate(outputPath);
    }

    // Final result
    console.log("\n" + "=".repeat(60));
    if (result.passed) {
      logger.success("All checks passed after fixes!");
    } else {
      logger.error(`Validation still failing with ${result.errors.length} error(s)`);
      for (const err of result.errors.slice(0, 20)) {
        console.log(`    ${err}`);
      }
    }
    console.log("=".repeat(60));
  });

program.parse();
