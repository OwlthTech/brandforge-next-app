import { initAIClient } from "@/lib/ai/client";
import { generateText } from "ai";

export async function POST(request: Request) {
  try {
    // Get request body
    const body = await request.json();
    const { prompt = "Say hello and describe what BrandForge is in 2 sentences." } = body;

    // Initialize AI client
    const model = initAIClient();

    // Generate text
    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
    });

    return Response.json({
      success: true,
      prompt,
      response: result.text,
      usage: {
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return Response.json(
      {
        success: false,
        error: errorMessage,
        message: "Failed to generate text. Ensure AI_PROVIDER and API key are configured.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    message: "AI SDK Test Endpoint",
    instructions: "Send a POST request with { prompt: 'your prompt' } to test the AI SDK",
    example: {
      prompt: "What is BrandForge?",
    },
  });
}
