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
import { FileText, Sparkles } from "lucide-react";
import type { Guideline } from "@/lib/db/schema";

interface ProductGuidelinesSectionProps {
  brandId: string;
  productId: string;
  guidelines: Guideline[];
  onUpdate: () => void;
}

export function ProductGuidelinesSection({
  brandId,
  productId,
  guidelines,
  onUpdate,
}: ProductGuidelinesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Product Guidelines</CardTitle>
            <CardDescription>
              AI-generated product design guidelines and briefs
            </CardDescription>
          </div>
          <Button asChild size="sm">
            <Link href={`/brands/${brandId}/products/${productId}/guidelines/generate`}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Guidelines
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {guidelines.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No guidelines yet"
            description="Generate AI-powered product guidelines based on brand identity and product details"
            action={{
              label: "Generate Guidelines",
              href: `/brands/${brandId}/products/${productId}/guidelines/generate`,
            }}
          />
        ) : (
          <div className="space-y-3">
            {guidelines.map((guideline) => (
              <Link
                key={guideline.id}
                href={`/brands/${brandId}/products/${productId}/guidelines/${guideline.id}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{guideline.title}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          Version {guideline.version} • Updated{" "}
                          {new Date(guideline.updatedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant={guideline.status === "final" ? "default" : "secondary"}>
                        {guideline.status}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
