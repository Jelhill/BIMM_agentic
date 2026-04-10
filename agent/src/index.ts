import { Command } from "commander";
import dotenv from "dotenv";
import { logger } from "./logger.js";

dotenv.config();

const program = new Command();

program
  .name("bimm-agent")
  .description("Agentic CLI tool for code generation and validation")
  .requiredOption("--spec <filepath>", "Path to the spec file")
  .action((options: { spec: string }) => {
    logger.info(`Agent starting with spec: ${options.spec}`);
  });

program.parse();
