export interface Task {
  id: string;
  description: string;
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
