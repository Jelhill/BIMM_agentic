export interface Task {
  id: string;
  title: string;
  description: string;
  dependsOn: string[];
  outputFile: string;
  status: "pending" | "in_progress" | "completed" | "failed";
}

export interface AgentConfig {
  specPath: string;
  anthropicApiKey: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
