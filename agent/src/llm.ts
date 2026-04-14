import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { LLMProvider } from "./types.js";

export async function callLLM(prompt: string): Promise<string> {
  const provider = (process.env.LLM_PROVIDER ?? "anthropic") as LLMProvider;

  if (provider === "anthropic") {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Anthropic API");
    }
    return content.text;
  }

  if (provider === "openai") {
    const client = new OpenAI();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error("Unexpected response type from OpenAI API");
    }
    return text;
  }

  throw new Error(`Unknown LLM_PROVIDER: "${provider}". Supported values: "anthropic", "openai".`);
}
