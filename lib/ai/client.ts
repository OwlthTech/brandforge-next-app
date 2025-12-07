import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Initialize AI SDK providers based on environment variables
 * Supports OpenAI, Anthropic (Claude), and Google Gemini models
 */

type AIProvider = "openai" | "anthropic" | "google";

const getProvider = (provider: AIProvider) => {
  switch (provider) {
    case "openai":
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY environment variable is not set");
      }
      return createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

    case "anthropic":
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error("ANTHROPIC_API_KEY environment variable is not set");
      }
      return createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

    case "google":
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new Error("GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set");
      }
      return createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      });

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
};

/**
 * Get the configured AI provider based on environment
 * Defaults to OpenAI if AI_PROVIDER is not specified
 */
export const getAIProvider = () => {
  const provider = (process.env.AI_PROVIDER || "openai") as AIProvider;
  return getProvider(provider);
};

/**
 * Get the model ID from environment or use defaults
 */
export const getModelId = (): string => {
  const provider = (process.env.AI_PROVIDER || "openai") as AIProvider;

  switch (provider) {
    case "openai":
      return process.env.AI_MODEL || "gpt-4-turbo";
    case "anthropic":
      return process.env.AI_MODEL || "claude-3-sonnet-20240229";
    case "google":
      return process.env.AI_MODEL || "gemini-1.5-pro";
    default:
      return "gpt-4-turbo";
  }
};

/**
 * Initialize AI client for use in server-side operations
 * This is a convenience wrapper to get a configured model
 */
export const initAIClient = () => {
  const provider = getAIProvider();
  const modelId = getModelId();
  return provider.languageModel(modelId);
};

export default initAIClient;
