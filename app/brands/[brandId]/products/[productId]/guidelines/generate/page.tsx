"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState, ErrorState, AILoadingState } from "@/components/common";
import { GuidelineEditor } from "@/components/guidelines/guideline-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import type { Brand, Product } from "@/lib/db/schema";
import type { ProductGuidelineSections } from "@/types/guideline";

export default function GenerateProductGuidelinePage() {
  const params = useParams();
  const router = useRouter();
  const brandId = params.brandId as string;
  const productId = params.productId as string;

  const [brand, setBrand] = React.useState<Brand | null>(null);
  const [product, setProduct] = React.useState<Product | null>(null);
  const [guidelines, setGuidelines] = React.useState<ProductGuidelineSections>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandResponse, productResponse] = await Promise.all([
          fetch(`/api/brands/${brandId}`),
          fetch(`/api/products/${productId}`),
        ]);

        if (!brandResponse.ok || !productResponse.ok) {
          throw new Error("Failed to load data");
        }

        const { brand: fetchedBrand } = await brandResponse.json();
        const { product: fetchedProduct } = await productResponse.json();

        setBrand(fetchedBrand);
        setProduct(fetchedProduct);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    if (brandId && productId) {
      fetchData();
    }
  }, [brandId, productId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-product-guideline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, productId }),
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
          productId,
          title: `${product?.name} Guidelines`,
          type: "product",
          content: guidelines,
          status: "draft",
        }),
      });

      if (!response.ok) throw new Error("Failed to save guidelines");

      const { guideline } = await response.json();
      router.push(`/brands/${brandId}/products/${productId}`);
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
        { label: "Products", href: `/brands/${brandId}` },
        { label: "Loading...", href: `/brands/${brandId}/products/${productId}` },
        { label: "Generate Guidelines" }
      ]}>
        <LoadingState message="Loading..." />
      </AppShell>
    );
  }

  if (error || !brand || !product) {
    return (
      <AppShell breadcrumbs={[
        { label: "Brands", href: "/brands" },
        { label: "Error", href: `/brands/${brandId}` },
        { label: "Products", href: `/brands/${brandId}` },
        { label: "Error", href: `/brands/${brandId}/products/${productId}` },
        { label: "Generate Guidelines" }
      ]}>
        <ErrorState
          title="Failed to load data"
          message={error || "Data not found"}
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
    { label: "Generate Guidelines" },
  ];

  const hasContent = Object.keys(guidelines).length > 0;

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {isGenerating && (
          <Card>
            <CardContent className="pt-6">
              <AILoadingState type="product" />
            </CardContent>
          </Card>
        )}

        {!hasContent && !isGenerating && (
          <Card>
            <CardHeader>
              <CardTitle>Generate Product Guidelines</CardTitle>
              <CardDescription>
                Use AI to create product-specific guidelines based on brand guidelines and product information
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
                This will analyze your product and brand information to create tailored guidelines
                for positioning, messaging, visual standards, marketplace listings, and social media.
              </p>
            </CardContent>
          </Card>
        )}

        {hasContent && (
          <GuidelineEditor
            type="product"
            content={guidelines}
            onChange={setGuidelines}
            onSave={handleSave}
            isSaving={isSaving}
            brandId={brandId}
            productId={productId}
          />
        )}
      </div>
    </AppShell>
  );
}
