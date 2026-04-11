import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Command } from "commander";
import dotenv from "dotenv";
import { generateCode } from "./generator.js";
import { logger } from "./logger.js";
import { planTasks } from "./planner.js";

dotenv.config();

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
    // Agent runs from /agent, boilerplate is parent dir (BIMM root)
    const boilerplatePath = resolve(process.cwd(), "..");
    const outputPath = resolve(process.cwd(), "../generated-app");
    await generateCode(tasks, boilerplatePath, outputPath);
  });

program.parse();
