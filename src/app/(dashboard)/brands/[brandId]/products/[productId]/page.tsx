"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useSetBreadcrumbs } from "@/components/layout/breadcrumb-context";
import { LoadingState, ErrorState } from "@/components/common";
import {
  ProductDashboardHeader,
  ProductAssetsSection,
  ProductReferencesSection,
  ProductGuidelinesSection,
} from "@/components/product";
import type { Brand, Product, Asset, Guideline } from "@/lib/db/schema";

export default function ProductDashboardPage() {
  const params = useParams();
  const brandId = params.brandId as string;
  const productId = params.productId as string;

  const [brand, setBrand] = React.useState<Brand | null>(null);
  const [product, setProduct] = React.useState<Product | null>(null);
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [guidelines, setGuidelines] = React.useState<Guideline[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Set breadcrumbs - update when brand/product loads
  useSetBreadcrumbs([
    { label: "Brands", href: "/brands" },
    { label: brand?.name || "Loading...", href: `/brands/${brandId}` },
    { label: product?.name || "Loading..." }
  ]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch brand
      const brandResponse = await fetch(`/api/brands/${brandId}`);
      if (!brandResponse.ok) throw new Error("Brand not found");
      const { brand: fetchedBrand } = await brandResponse.json();
      setBrand(fetchedBrand);

      // Fetch product
      const productResponse = await fetch(`/api/products/${productId}`);
      if (!productResponse.ok) throw new Error("Product not found");
      const { product: fetchedProduct } = await productResponse.json();
      setProduct(fetchedProduct);

      // Fetch assets
      const assetsResponse = await fetch(`/api/assets?productId=${productId}`);
      const { assets: fetchedAssets } = await assetsResponse.json();
      setAssets(fetchedAssets);

      // Fetch guidelines
      const guidelinesResponse = await fetch(`/api/guidelines?brandId=${brandId}&productId=${productId}`);
      const { guidelines: fetchedGuidelines } = await guidelinesResponse.json();
      setGuidelines(fetchedGuidelines);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (brandId && productId) {
      fetchData();
    }
  }, [brandId, productId]);

  if (isLoading) {
    return <LoadingState message="Loading product dashboard..." />;
  }

  if (error || !brand || !product) {
    return (
      <ErrorState
        title="Failed to load product"
        message={error || "Product not found"}
        onRetry={fetchData}
      />
    );
  }

  const productAssets = assets.filter(a =>
    a.type === "product-image" || a.type === "design-reference"
  );
  const referenceAssets = assets.filter(a => a.type === "design-reference");
  const productGuidelines = guidelines.filter(g => g.productId === productId);

  return (
    <div className="space-y-6">
      <ProductDashboardHeader
        brandId={brandId}
        product={product}
        onUpdate={fetchData}
      />

      <div className="grid gap-6">
        <ProductAssetsSection
          brandId={brandId}
          productId={productId}
          assets={productAssets}
          onUpdate={fetchData}
        />

        <ProductReferencesSection
          brandId={brandId}
          productId={productId}
          assets={referenceAssets}
          onUpdate={fetchData}
        />

        <ProductGuidelinesSection
          brandId={brandId}
          productId={productId}
          guidelines={productGuidelines}
          onUpdate={fetchData}
        />
      </div>
    </div>
  );
}
