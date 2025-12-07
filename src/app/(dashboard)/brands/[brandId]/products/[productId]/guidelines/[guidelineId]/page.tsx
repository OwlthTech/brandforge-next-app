"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState, ErrorState } from "@/components/common";
import { GuidelineEditor, GuidelineHistoryTimeline } from "@/components/guidelines";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import type { Brand, Product, Guideline, GuidelineHistory } from "@/lib/db/schema";
import type { ProductGuidelineSections } from "@/types/guideline";

export default function ProductGuidelineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = params.brandId as string;
  const productId = params.productId as string;
  const guidelineId = params.guidelineId as string;

  const [brand, setBrand] = React.useState<Brand | null>(null);
  const [product, setProduct] = React.useState<Product | null>(null);
  const [guideline, setGuideline] = React.useState<Guideline | null>(null);
  const [history, setHistory] = React.useState<GuidelineHistory[]>([]);
  const [content, setContent] = React.useState<ProductGuidelineSections>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandResponse, productResponse, guidelineResponse] = await Promise.all([
          fetch(`/api/brands/${brandId}`),
          fetch(`/api/products/${productId}`),
          fetch(`/api/guidelines/${guidelineId}`),
        ]);

        if (!brandResponse.ok || !productResponse.ok || !guidelineResponse.ok) {
          throw new Error("Failed to load data");
        }

        const { brand: fetchedBrand } = await brandResponse.json();
        const { product: fetchedProduct } = await productResponse.json();
        const { guideline: fetchedGuideline } = await guidelineResponse.json();

        setBrand(fetchedBrand);
        setProduct(fetchedProduct);
        setGuideline(fetchedGuideline);
        setContent(fetchedGuideline.content as ProductGuidelineSections);

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

    if (brandId && productId && guidelineId) {
      fetchData();
    }
  }, [brandId, productId, guidelineId]);

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

  if (isLoading) {
    return (
      <AppShell breadcrumbs={[
        { label: "Brands", href: "/brands" },
        { label: "Loading...", href: `/brands/${brandId}` },
        { label: "Products" },
        { label: "Loading...", href: `/brands/${brandId}/products/${productId}` },
        { label: "Guidelines" }
      ]}>
        <LoadingState message="Loading guideline..." />
      </AppShell>
    );
  }

  if (error || !brand || !product || !guideline) {
    return (
      <AppShell breadcrumbs={[
        { label: "Brands", href: "/brands" },
        { label: "Error" },
        { label: "Products" },
        { label: "Error" },
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
    { label: "Products", href: `/brands/${brandId}` },
    { label: product.name, href: `/brands/${brandId}/products/${productId}` },
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
                Version {guideline.version} • Last updated {new Date(guideline.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge variant={guideline.status === "final" ? "default" : "secondary"}>
            {guideline.status}
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="editor" className="space-y-4">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="history">Version History</TabsTrigger>
          </TabsList>

          <TabsContent value="editor">
            <GuidelineEditor
              type="product"
              content={content}
              onChange={setContent}
              onSave={handleSave}
              isSaving={isSaving}
              brandId={brandId}
              productId={productId}
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
