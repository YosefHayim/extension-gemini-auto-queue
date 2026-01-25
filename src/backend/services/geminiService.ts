import { GoogleGenAI } from "@google/genai";

import { getAIApiKey } from "@/backend/services/storageService";
import { AIProvider } from "@/backend/types";

import type { GeminiModel } from "@/backend/types";

interface GenerateImageOptions {
  prompt: string;
  model: GeminiModel;
  imageBase64s?: string[];
}

interface ImagePart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

interface TextPart {
  text: string;
}

type ContentPart = TextPart | ImagePart;

/**
 * Generate an image using Gemini API
 * @param options - Generation options including prompt, model, and optional reference images
 * @returns Base64 encoded image data URL
 */
export async function generateImage(options: GenerateImageOptions): Promise<string> {
  const { prompt, model, imageBase64s } = options;

  const apiKey = await getAIApiKey(AIProvider.GEMINI);
  if (!apiKey) {
    throw new Error("API Key not configured. Please set your Gemini API key in settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const parts: ContentPart[] = [{ text: prompt }];

    // Add reference images if provided
    if (imageBase64s && imageBase64s.length > 0) {
      imageBase64s.forEach((img) => {
        const base64Data = img.includes(",") ? img.split(",")[1] : img;
        parts.push({
          inlineData: {
            mimeType: "image/png",
            data: base64Data,
          },
        });
      });
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    // Extract image from response
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if ("inlineData" in part && part.inlineData) {
          const { mimeType, data } = part.inlineData;
          return `data:${String(mimeType)};base64,${String(data)}`;
        }
      }
    }

    throw new Error("No image data found in response.");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("Requested entity was not found")) {
      throw new Error("API Key configuration error. Please verify your key.");
    }

    if (errorMessage.includes("quota")) {
      throw new Error("API quota exceeded. Please try again later.");
    }

    throw error;
  }
}

/**
 * Improve a prompt using AI
 * @param text - Original prompt text
 * @returns Improved prompt text
 */
export async function improvePrompt(text: string): Promise<string> {
  const apiKey = await getAIApiKey(AIProvider.GEMINI);
  if (!apiKey) {
    throw new Error("API Key not configured. Please set your Gemini API key in settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `You are a professional prompt engineer. Your task is to take a simple image generation prompt and expand it to be more precise, descriptive, and high-quality, ensuring it yields better results in models like Midjourney or Gemini. Keep the core intent but add stylistic details, lighting, and composition. Return ONLY the improved prompt text. Input: "${text}"`,
    });

    return response.text ?? text;
  } catch {
    return text;
  }
}

/**
 * Check if API key is valid by making a simple test request
 * @returns boolean indicating if the API key works
 */
export async function validateApiKey(): Promise<boolean> {
  const apiKey = await getAIApiKey(AIProvider.GEMINI);
  if (!apiKey) {
    return false;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: 'Say "ok"',
    });
    return true;
  } catch {
    return false;
  }
}
