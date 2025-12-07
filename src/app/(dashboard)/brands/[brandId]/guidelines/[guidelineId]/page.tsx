"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState, ErrorState } from "@/components/common";
import { GuidelineEditor, GuidelineHistoryTimeline } from "@/components/guidelines";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trash2 } from "lucide-react";
import type { Brand, Guideline, GuidelineHistory } from "@/lib/db/schema";
import type { BrandGuidelineSections } from "@/types/guideline";

export default function BrandGuidelineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = params.brandId as string;
  const guidelineId = params.guidelineId as string;

  const [brand, setBrand] = React.useState<Brand | null>(null);
  const [guideline, setGuideline] = React.useState<Guideline | null>(null);
  const [history, setHistory] = React.useState<GuidelineHistory[]>([]);
  const [content, setContent] = React.useState<BrandGuidelineSections>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandResponse, guidelineResponse] = await Promise.all([
          fetch(`/api/brands/${brandId}`),
          fetch(`/api/guidelines/${guidelineId}`),
        ]);

        if (!brandResponse.ok) throw new Error("Brand not found");
        if (!guidelineResponse.ok) throw new Error("Guideline not found");

        const { brand: fetchedBrand } = await brandResponse.json();
        const { guideline: fetchedGuideline } = await guidelineResponse.json();

        setBrand(fetchedBrand);
        setGuideline(fetchedGuideline);
        setContent(fetchedGuideline.content as BrandGuidelineSections);

        // Fetch history
        const historyResponse = await fetch(`/api/guidelines/${guidelineId}/history`);
        if (historyResponse.ok) {
          const { history: fetchedHistory } = await historyResponse.json();
          setHistory(fetchedHistory);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    if (brandId && guidelineId) {
      fetchData();
    }
  }, [brandId, guidelineId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/guidelines/${guidelineId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to save guideline");

      const { guideline: updatedGuideline } = await response.json();
      setGuideline(updatedGuideline);
      alert("Guideline saved successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save guideline");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this guideline? This will also delete all version history.")) {
      return;
    }

    try {
      const response = await fetch(`/api/guidelines/${guidelineId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete guideline");

      router.push(`/brands/${brandId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete guideline");
    }
  };

  if (isLoading) {
    return (
      <AppShell breadcrumbs={[
        { label: "Brands", href: "/brands" },
        { label: "Loading...", href: `/brands/${brandId}` },
        { label: "Guidelines" }
      ]}>
        <LoadingState message="Loading guideline..." />
      </AppShell>
    );
  }

  if (error || !brand || !guideline) {
    return (
      <AppShell breadcrumbs={[
        { label: "Brands", href: "/brands" },
        { label: "Error", href: `/brands/${brandId}` },
        { label: "Guidelines" }
      ]}>
        <ErrorState
          title="Failed to load guideline"
          message={error || "Guideline not found"}
          onRetry={() => window.location.reload()}
        />
      </AppShell>
    );
  }

  const breadcrumbs = [
    { label: "Brands", href: "/brands" },
    { label: brand.name, href: `/brands/${brandId}` },
    { label: guideline.title },
  ];

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{guideline.title}</h1>
              <p className="text-muted-foreground">
                Version {guideline.version} • Last updated {new Date(guideline.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={guideline.status === "final" ? "default" : "secondary"}>
              {guideline.status}
            </Badge>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="editor" className="space-y-4">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="history">Version History</TabsTrigger>
          </TabsList>

          <TabsContent value="editor">
            <GuidelineEditor
              type="brand"
              content={content}
              onChange={setContent}
              onSave={handleSave}
              isSaving={isSaving}
              brandId={brandId}
            />
          </TabsContent>

          <TabsContent value="history">
            <GuidelineHistoryTimeline history={history} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
