import chalk from "chalk";

export const logger = {
  info(message: string): void {
    console.log(chalk.blue("ℹ"), message);
  },

  error(message: string): void {
    console.error(chalk.red("✖"), message);
  },

  success(message: string): void {
    console.log(chalk.green("✔"), message);
  },
};
