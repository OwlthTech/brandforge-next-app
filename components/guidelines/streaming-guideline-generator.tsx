"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";

interface StreamingGuidelineGeneratorProps {
  brandId: string;
  onGenerated: (guidelines: any) => void;
}

export function StreamingGuidelineGenerator({ brandId, onGenerated }: StreamingGuidelineGeneratorProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    setIsStreaming(true);
    setStreamedText("");
    setProgress(0);

    try {
      const response = await fetch(`/api/ai/stream-brand-guideline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      });

      if (!response.ok) {
        throw new Error("Stream failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      let accumulatedText = "";
      let progressValue = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedText += chunk;
        setStreamedText(accumulatedText);

        // Simulate progress (estimate based on expected length)
        progressValue = Math.min(95, progressValue + 2);
        setProgress(progressValue);
      }

      setProgress(100);

      // Try to parse the completed JSON
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = accumulatedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, accumulatedText];
        const jsonText = jsonMatch[1] || accumulatedText;
        const guidelines = JSON.parse(jsonText.trim());
        onGenerated(guidelines);
      } catch (err) {
        console.error("Failed to parse streamed guidelines:", err);
        // Even if parsing fails, show the user what was streamed
      }
    } catch (error) {
      console.error("Streaming error:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Generate with Streaming
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGenerate}
          disabled={isStreaming}
          className="w-full"
        >
          {isStreaming ? "Generating..." : "Generate Brand Guidelines"}
        </Button>

        {isStreaming && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">
              Progress: {progress}%
            </p>
          </div>
        )}

        {streamedText && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Generated Content:</h3>
            <pre className="text-xs whitespace-pre-wrap font-mono overflow-auto max-h-96">
              {streamedText}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
