"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState, ErrorState, AILoadingState } from "@/components/common";
import { GuidelineEditor } from "@/components/guidelines";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Brand } from "@/lib/db/schema";
import type { BrandGuidelineSections } from "@/types/guideline";

export default function GenerateBrandGuidelinePage() {
  const params = useParams();
  const router = useRouter();
  const brandId = params.brandId as string;

  const [brand, setBrand] = React.useState<Brand | null>(null);
  const [guidelines, setGuidelines] = React.useState<BrandGuidelineSections>({});
  const [title, setTitle] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchBrand = async () => {
      try {
        const response = await fetch(`/api/brands/${brandId}`);
        if (!response.ok) throw new Error("Brand not found");
        const { brand: fetchedBrand } = await response.json();
        setBrand(fetchedBrand);
        setTitle(`${fetchedBrand.name} Brand Guidelines`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load brand");
      } finally {
        setIsLoading(false);
      }
    };

    if (brandId) {
      fetchBrand();
    }
  }, [brandId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-brand-guideline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Failed to generate guidelines");
      }

      const { guidelines: generatedGuidelines } = await response.json();
      setGuidelines(generatedGuidelines);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to generate guidelines");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/guidelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          title: title || `${brand?.name} Brand Guidelines`,
          type: "brand",
          content: guidelines,
          status: "draft",
        }),
      });

      if (!response.ok) throw new Error("Failed to save guidelines");

      const { guideline } = await response.json();
      router.push(`/brands/${brandId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save guidelines");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell breadcrumbs={[
        { label: "Brands", href: "/brands" },
        { label: "Loading...", href: `/brands/${brandId}` },
        { label: "Generate Guidelines" }
      ]}>
        <LoadingState message="Loading..." />
      </AppShell>
    );
  }

  if (error || !brand) {
    return (
      <AppShell breadcrumbs={[
        { label: "Brands", href: "/brands" },
        { label: "Error", href: `/brands/${brandId}` },
        { label: "Generate Guidelines" }
      ]}>
        <ErrorState
          title="Failed to load brand"
          message={error || "Brand not found"}
          onRetry={() => window.location.reload()}
        />
      </AppShell>
    );
  }

  const breadcrumbs = [
    { label: "Brands", href: "/brands" },
    { label: brand.name, href: `/brands/${brandId}` },
    { label: "Generate Guidelines" },
  ];

  const hasContent = Object.keys(guidelines).length > 0;

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {isGenerating && (
          <Card>
            <CardContent className="pt-6">
              <AILoadingState type="brand" />
            </CardContent>
          </Card>
        )}

        {!hasContent && !isGenerating && (
          <Card>
            <CardHeader>
              <CardTitle>Generate Brand Guidelines</CardTitle>
              <CardDescription>
                Use AI to create comprehensive brand guidelines based on your brand information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGenerate} disabled={isGenerating} size="lg">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating Guidelines...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                This will analyze your brand information and create a comprehensive set of guidelines
                including brand story, voice, color palette, typography, logo usage, and imagery standards.
              </p>
            </CardContent>
          </Card>
        )}

        {hasContent && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Guideline Title</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter guideline title"
                  />
                </div>
              </CardContent>
            </Card>
            
            <GuidelineEditor
              type="brand"
              content={guidelines}
              onChange={setGuidelines}
              onSave={handleSave}
              isSaving={isSaving}
              brandId={brandId}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
