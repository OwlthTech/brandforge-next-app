"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common";
import { FileText, Plus, Sparkles, Trash2 } from "lucide-react";
import type { Guideline } from "@/lib/db/schema";

interface BrandGuidelinesSectionProps {
  brandId: string;
  guidelines: Guideline[];
  onUpdate: () => void;
}

export function BrandGuidelinesSection({
  brandId,
  guidelines,
  onUpdate,
}: BrandGuidelinesSectionProps) {
  const brandGuidelines = guidelines.filter((g) => g.type === "brand");

  const handleDelete = async (e: React.MouseEvent, guidelineId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this guideline?")) {
      return;
    }

    try {
      const response = await fetch(`/api/guidelines/${guidelineId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete guideline");

      onUpdate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete guideline");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Brand Guidelines</CardTitle>
            <CardDescription>
              AI-generated brand guidelines and style guides
            </CardDescription>
          </div>
          <Button asChild size="sm">
            <Link href={`/brands/${brandId}/guidelines/generate`}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Guidelines
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {brandGuidelines.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No guidelines yet"
            description="Generate AI-powered brand guidelines based on your brand assets and products"
            action={{
              label: "Generate Guidelines",
              href: `/brands/${brandId}/guidelines/generate`,
            }}
          />
        ) : (
          <div className="space-y-3">
            {brandGuidelines.map((guideline) => (
              <div key={guideline.id} className="relative group">
                <Link
                  href={`/brands/${brandId}/guidelines/${guideline.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{guideline.title}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            Version {guideline.version} \u2022 Updated{" "}
                            {new Date(guideline.updatedAt).toLocaleString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={guideline.status === "final" ? "default" : "secondary"}>
                            {guideline.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleDelete(e, guideline.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
