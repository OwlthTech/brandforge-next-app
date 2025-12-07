"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

interface RegenerableTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  brandId?: string;
  productId?: string;
  section: string;
  field: string;
  id?: string;
}

export function RegenerableTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  brandId,
  productId,
  section,
  field,
  id,
}: RegenerableTextareaProps) {
  const [isRegenerating, setIsRegenerating] = React.useState(false);

  const handleRegenerate = async () => {
    if (!brandId) return;

    setIsRegenerating(true);
    try {
      const response = await fetch("/api/ai/regenerate-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          productId,
          section,
          field,
          currentValue: value,
        }),
      });

      if (!response.ok) throw new Error("Failed to regenerate");

      const { value: newValue } = await response.json();
      onChange(newValue);
    } catch (error) {
      console.error("Error regenerating field:", error);
      alert("Failed to regenerate this field. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-2 flex flex-col items-end">
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
      {brandId && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="text-sm font-thin leading-loose"
        >
          {isRegenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Regenerate this field
            </>
          )}
        </Button>
      )}
    </div>
  );
}
