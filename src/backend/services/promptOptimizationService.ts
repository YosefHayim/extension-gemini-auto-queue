import { GoogleGenAI } from "@google/genai";

import { getPreferredAIKey, hasAnyAIKey } from "@/backend/services/storageService";
import { AIProvider } from "@/backend/types";

import type { AppSettings } from "@/backend/types";

// System prompt for all providers
const SYSTEM_PROMPT = `You are a professional prompt engineer. Your task is to take a simple image generation prompt and expand it to be more precise, descriptive, and high-quality, ensuring it yields better results in models like Midjourney or Gemini. Keep the core intent but add stylistic details, lighting, and composition. Return ONLY the improved prompt text, nothing else.`;

interface OpenAIResponse {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
  error?: {
    message?: string;
  };
}

interface AnthropicResponse {
  content?: {
    type?: string;
    text?: string;
  }[];
  error?: {
    message?: string;
  };
}

/**
 * Check if any AI API key is configured
 */
export function hasConfiguredAIProvider(settings: AppSettings): boolean {
  return hasAnyAIKey(settings);
}

/**
 * Improve prompt using Google Gemini
 */
async function improvePromptWithGemini(text: string, apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `${SYSTEM_PROMPT}\n\nInput: "${text}"`,
  });

  return response.text ?? text;
}

/**
 * Improve prompt using OpenAI
 */
async function improvePromptWithOpenAI(text: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Input: "${text}"` },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({
      error: { message: "Unknown error" },
    }))) as OpenAIResponse;
    const statusText = String(response.status);
    throw new Error(error.error?.message ?? `OpenAI API error: ${statusText}`);
  }

  const data = (await response.json()) as OpenAIResponse;
  return data.choices?.[0]?.message?.content?.trim() ?? text;
}

/**
 * Improve prompt using Anthropic Claude
 */
async function improvePromptWithAnthropic(text: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-latest",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Input: "${text}"` }],
    }),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({
      error: { message: "Unknown error" },
    }))) as AnthropicResponse;
    const statusText = String(response.status);
    throw new Error(error.error?.message ?? `Anthropic API error: ${statusText}`);
  }

  const data = (await response.json()) as AnthropicResponse;
  const content = data.content?.[0];
  if (content?.type === "text") {
    return content.text?.trim() ?? text;
  }
  return text;
}

/**
 * Improve a prompt using the configured AI provider
 * @param text - Original prompt text
 * @param settings - Application settings containing API keys and preferences
 * @returns Improved prompt text
 */
export async function improvePrompt(text: string, settings: AppSettings): Promise<string> {
  const providerConfig = getPreferredAIKey(settings);

  if (!providerConfig) {
    throw new Error(
      "No AI API key configured. Please set up an API key in Settings to use prompt optimization."
    );
  }

  const { provider, key } = providerConfig;

  try {
    switch (provider) {
      case AIProvider.GEMINI:
        return await improvePromptWithGemini(text, key);
      case AIProvider.OPENAI:
        return await improvePromptWithOpenAI(text, key);
      case AIProvider.ANTHROPIC:
        return await improvePromptWithAnthropic(text, key);
      default: {
        const exhaustiveCheck: never = provider;
        throw new Error(`Unsupported AI provider: ${String(exhaustiveCheck)}`);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("quota") || errorMessage.includes("rate")) {
      throw new Error(`${String(provider)} API quota exceeded. Please try again later.`);
    }

    if (
      errorMessage.includes("invalid") ||
      errorMessage.includes("Invalid") ||
      errorMessage.includes("401")
    ) {
      throw new Error(`Invalid ${String(provider)} API key. Please check your settings.`);
    }

    throw error;
  }
}

/**
 * Validate an API key by making a simple test request
 * @param provider - The AI provider to validate
 * @param apiKey - The API key to validate
 * @returns boolean indicating if the API key works
 */
export async function validateApiKey(provider: AIProvider, apiKey: string): Promise<boolean> {
  if (!apiKey) {
    return false;
  }

  try {
    switch (provider) {
      case AIProvider.GEMINI: {
        const ai = new GoogleGenAI({ apiKey });
        await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: 'Say "ok"',
        });
        return true;
      }
      case AIProvider.OPENAI: {
        const response = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        return response.ok;
      }
      case AIProvider.ANTHROPIC: {
        // Anthropic doesn't have a simple validation endpoint, so we make a minimal request
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-3-5-haiku-latest",
            max_tokens: 10,
            messages: [{ role: "user", content: "Hi" }],
          }),
        });
        return response.ok;
      }
      default:
        return false;
    }
  } catch {
    return false;
  }
}
