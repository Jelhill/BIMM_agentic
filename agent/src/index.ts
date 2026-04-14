import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
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
 * Handles TypeScript errors, vitest FAIL lines, and generic path patterns.
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

    // Match vitest FAIL lines: " FAIL  src/components/Foo.test.tsx"
    const failMatch = error.match(/FAIL\s+(src\/\S+\.(?:ts|tsx))/);
    if (failMatch) {
      const filePath = join(projectPath, failMatch[1]);
      if (existsSync(filePath)) {
        files.add(filePath);
      }
      continue;
    }

    // Match "❯" vitest error location: " ❯ src/hooks/useMovies.test.tsx:15:5"
    const vitestLocMatch = error.match(/❯\s+(src\/\S+\.(?:ts|tsx))(?::\d+)?/);
    if (vitestLocMatch) {
      const filePath = join(projectPath, vitestLocMatch[1]);
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
  // Extract the filename and relative path from src/
  const srcIdx = filePath.indexOf("src/");
  const relativePath = srcIdx >= 0 ? filePath.slice(srcIdx) : filePath;
  const fileName = filePath.split("/").pop() ?? "";

  return allErrors.filter((e) =>
    e.includes(relativePath) || e.includes(fileName)
  );
}

/**
 * Scan the src/ directory for .ts files that contain JSX and rename them to .tsx.
 * This fixes a common issue where Claude generates JSX in .ts files.
 */
function fixTsFilesWithJsx(projectPath: string): void {
  const srcDir = join(projectPath, "src");
  if (!existsSync(srcDir)) return;

  function scanDir(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules") {
        scanDir(fullPath);
      } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
        const content = readFileSync(fullPath, "utf-8");
        // Check for JSX patterns: <Component, </Component>, <>, </>
        if (/<[A-Z][a-zA-Z]*[\s/>]/.test(content) || /<\/>/.test(content) || /render\(/.test(content) && /</.test(content)) {
          const newPath = fullPath.replace(/\.ts$/, ".tsx");
          renameSync(fullPath, newPath);
          logger.info(`Renamed ${entry.name} -> ${entry.name.replace(".ts", ".tsx")} (contains JSX)`);
        }
      }
    }
  }

  scanDir(srcDir);
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

    // Post-generation: fix .ts files containing JSX
    fixTsFilesWithJsx(outputPath);

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

    const MAX_FIX_PASSES = 3;
    let result = await validate(outputPath);

    if (result.passed) {
      console.log("\n" + "=".repeat(60));
      logger.success("All checks passed on first attempt!");
      console.log("=".repeat(60));
      return;
    }

    // Multi-pass fix loop: attempt up to MAX_FIX_PASSES fix iterations
    for (let pass = 1; pass <= MAX_FIX_PASSES; pass++) {
      console.log("\n" + "=".repeat(60));
      logger.info(`Fix pass ${pass}/${MAX_FIX_PASSES}...`);
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
        break;
      }

      logger.info(`Identified ${failingFiles.length} file(s) to fix`);

      for (const filePath of failingFiles) {
        const fileContent = readFileSync(filePath, "utf-8");
        const fileErrors = getErrorsForFile(filePath, result.errors);

        // If no specific errors matched, pass all errors as context
        const errorsToSend = fileErrors.length > 0 ? fileErrors : result.errors;
        const fixed = await fixFile(filePath, fileContent, errorsToSend, outputPath);
        writeFileSync(filePath, fixed, "utf-8");
      }

      // Post-fix: re-check for .ts files with JSX
      fixTsFilesWithJsx(outputPath);

      // Re-validate
      console.log("\n" + "=".repeat(60));
      logger.info(`Validation — Pass ${pass + 1} (after fix pass ${pass})`);
      console.log("=".repeat(60) + "\n");

      result = await validate(outputPath);

      if (result.passed) {
        break;
      }
    }

    // Final result
    console.log("\n" + "=".repeat(60));
    if (result.passed) {
      logger.success("All checks passed after fixes!");
    } else {
      logger.error(`Validation still failing after ${MAX_FIX_PASSES} fix passes with ${result.errors.length} error(s)`);
      for (const err of result.errors.slice(0, 20)) {
        console.log(`    ${err}`);
      }
    }
    console.log("=".repeat(60));
  });

program.parse();
