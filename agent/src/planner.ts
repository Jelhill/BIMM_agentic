import { callLLM } from "./llm.js";
import { logger } from "./logger.js";
import type { Task } from "./types.js";

const PLANNER_SYSTEM_PROMPT = `You are a software project planner. Given a feature spec, decompose it into an ordered list of implementation tasks.

Respond ONLY with a JSON array. No markdown, no code fences, no preamble, no explanation.

Each task object must have exactly these fields:
- "id": a short unique string (e.g. "task-1", "task-2")
- "title": a brief title for the task
- "description": a detailed description of what to implement
- "dependsOn": an array of task ids that must be completed before this task (empty array if none)
- "outputFile": the relative file path this task will create or modify (e.g. "src/hooks/useCars.ts")

Order tasks so dependencies come first. Be specific about file paths and implementation details.

IMPORTANT CONSTRAINTS for outputFile paths:
- Files containing JSX (components, test files that render components) MUST use .tsx extension.
- Pure TypeScript files (types, hooks with no JSX, utilities) use .ts extension.
- Test files that use <Component /> or render() MUST be .tsx, not .ts.
- Use the "@/" import alias for src/ imports in descriptions.
- The boilerplate already provides: src/main.tsx, src/test-setup.ts, src/mocks/browser.ts, src/mocks/server.ts, src/mocks/handlers.ts, src/mocks/data.ts, src/graphql/queries.ts, src/types.ts, src/App.tsx, vitest.config.ts, tsconfig.json.
- Do NOT create tasks for files that the boilerplate already provides UNLESS the spec requires modifying them.
- Always include tasks to modify these boilerplate files to match the spec: src/types.ts, src/graphql/queries.ts, src/mocks/handlers.ts, src/mocks/data.ts, src/App.tsx.

TECHNOLOGY STACK (include in task descriptions):
- Vitest for testing (vi.mock, vi.fn — NOT jest)
- MUI v6 Grid2 with size prop — NOT Grid with xs/md props
- MSW v2 (HttpResponse.json, graphql.query/mutation)
- Apollo Client with MockedProvider for test mocking

EXAMPLE — for a spec describing a "Movie Library" app with list, add, and detail views:

[
  {
    "id": "task-1",
    "title": "Define Movie types",
    "description": "Update src/types.ts to export a Movie interface with fields: id (string), title (string), director (string), genre (string), year (number), rating (number), watched (boolean), poster (string). Also export a MovieInput type omitting id.",
    "dependsOn": [],
    "outputFile": "src/types.ts"
  },
  {
    "id": "task-2",
    "title": "Define GraphQL queries and mutations",
    "description": "Update src/graphql/queries.ts with GET_MOVIES (query returning movies array), GET_MOVIE (query by id), and ADD_MOVIE (mutation accepting MovieInput). Use gql from @apollo/client.",
    "dependsOn": ["task-1"],
    "outputFile": "src/graphql/queries.ts"
  },
  {
    "id": "task-3",
    "title": "Set up mock data",
    "description": "Update src/mocks/data.ts to export a mockMovies array with 4-5 sample Movie objects matching the Movie interface.",
    "dependsOn": ["task-1"],
    "outputFile": "src/mocks/data.ts"
  },
  {
    "id": "task-4",
    "title": "Set up MSW handlers",
    "description": "Update src/mocks/handlers.ts with graphql.query('GetMovies') and graphql.mutation('AddMovie') handlers using HttpResponse.json() from MSW v2. Import mock data from @/mocks/data.",
    "dependsOn": ["task-2", "task-3"],
    "outputFile": "src/mocks/handlers.ts"
  },
  {
    "id": "task-5",
    "title": "Create useMovies hook",
    "description": "Create a custom hook using Apollo Client useQuery(GET_MOVIES) and useMutation(ADD_MOVIE). Return { movies, loading, error, addMovie, refetch }. Pure TS, no JSX.",
    "dependsOn": ["task-2"],
    "outputFile": "src/hooks/useMovies.ts"
  },
  {
    "id": "task-6",
    "title": "Create MovieCard component",
    "description": "Create a card component displaying movie poster, title, director, genre, year, and rating. Use MUI Card, CardMedia, CardContent, Typography, and Chip. Must use .tsx extension.",
    "dependsOn": ["task-1"],
    "outputFile": "src/components/MovieCard.tsx"
  },
  {
    "id": "task-7",
    "title": "Create MoviesList component",
    "description": "Create a grid layout using MUI Grid2 with size prop to display MovieCard components. Include loading spinner (CircularProgress) and error alert. Uses useMovies hook.",
    "dependsOn": ["task-5", "task-6"],
    "outputFile": "src/components/MoviesList.tsx"
  },
  {
    "id": "task-8",
    "title": "Update App component",
    "description": "Update src/App.tsx to render MoviesList as the main content with ApolloProvider and ThemeProvider wrapping.",
    "dependsOn": ["task-7"],
    "outputFile": "src/App.tsx"
  },
  {
    "id": "task-9",
    "title": "Test useMovies hook",
    "description": "Write Vitest tests for useMovies hook using MockedProvider from @apollo/client/testing. Test loading state, successful fetch, error handling, and addMovie mutation. Use renderHook from @testing-library/react. File renders JSX so must be .tsx.",
    "dependsOn": ["task-5"],
    "outputFile": "src/hooks/__tests__/useMovies.test.tsx"
  },
  {
    "id": "task-10",
    "title": "Test MovieCard component",
    "description": "Write Vitest tests for MovieCard using render/screen from @testing-library/react. Verify movie details are displayed. File renders JSX so must be .tsx.",
    "dependsOn": ["task-6"],
    "outputFile": "src/components/__tests__/MovieCard.test.tsx"
  }
]

Use this example as a guide for structure and granularity. Adapt the tasks to fit the actual spec provided.`;

export async function planTasks(spec: string): Promise<Task[]> {
  logger.info("Sending spec to LLM for task planning...");

  const prompt = `${PLANNER_SYSTEM_PROMPT}\n\nHere is the application spec to decompose into tasks:\n\n${spec}`;
  const response = await callLLM(prompt);

  const rawText = response.trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    logger.error("Failed to parse Claude response as JSON:");
    logger.error(rawText);
    throw new Error("Claude did not return valid JSON");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Claude response is not an array");
  }

  const tasks: Task[] = parsed.map((item: Record<string, unknown>) => ({
    id: String(item.id),
    title: String(item.title),
    description: String(item.description),
    dependsOn: Array.isArray(item.dependsOn)
      ? item.dependsOn.map(String)
      : [],
    outputFile: String(item.outputFile),
    status: "pending" as const,
  }));

  logger.success(`Planned ${tasks.length} tasks`);
  return tasks;
}
