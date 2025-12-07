"use client";

import * as React from "react";
import { useChat, type Message } from "ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles } from "lucide-react";

interface ChatGuidelineGeneratorProps {
  brandId: string;
  onGenerated: (guidelines: Record<string, unknown>) => void;
}

export function ChatGuidelineGenerator({ brandId, onGenerated }: ChatGuidelineGeneratorProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/ai/chat-brand-guideline",
    body: { brandId },
    onFinish: (message: Message) => {
      try {
        const jsonMatch = message.content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, message.content];
        const jsonText = jsonMatch[1] || message.content;
        const guidelines = JSON.parse(jsonText.trim());
        onGenerated(guidelines);
      } catch (err) {
        console.error("Failed to parse guidelines:", err);
      }
    },
  });

  const quickPrompts = [
    "Generate complete brand guidelines",
    "Focus on brand story and voice",
    "Create visual identity guidelines",
    "Generate typography and color palette",
  ];

  const sendQuickPrompt = (prompt: string) => {
    handleSubmit(new Event("submit") as any, { options: { body: { message: prompt } } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Guideline Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Ask the AI to generate specific parts of your brand guidelines or request a complete set:
            </p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => sendQuickPrompt(prompt)}
                  disabled={isLoading}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <ScrollArea className="h-96">
            <div className="space-y-4 pr-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask for specific guidelines..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
