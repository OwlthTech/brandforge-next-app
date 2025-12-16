"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useSetBreadcrumbs } from "@/components/layout/breadcrumb-context";
import { LoadingState, ErrorState } from "@/components/common";
import {
  BrandDashboardHeader,
  BrandProductsSection,
  BrandAssetsSection,
  BrandGuidelinesSection,
} from "@/components/brand";
import type { Brand, Product, Asset, Guideline } from "@/lib/db/schema";

import { useAuth } from "@/lib/auth";

export default function BrandDashboardPage() {
  const params = useParams();
  const brandId = params.brandId as string;
  const { organizationId } = useAuth();

  const [brand, setBrand] = React.useState<Brand | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [guidelines, setGuidelines] = React.useState<Guideline[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Set breadcrumbs - update when brand loads
  useSetBreadcrumbs([
    { label: "Brands", href: "/brands" },
    { label: brand?.name || "Loading..." }
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

      // Fetch products
      const productsResponse = await fetch(`/api/products?brandId=${brandId}`);
      const { products: fetchedProducts } = await productsResponse.json();
      setProducts(fetchedProducts);

      // Fetch assets
      const assetsResponse = await fetch(`/api/assets?brandId=${brandId}`);
      const { assets: fetchedAssets } = await assetsResponse.json();
      setAssets(fetchedAssets);

      // Fetch guidelines
      const guidelinesResponse = await fetch(`/api/guidelines?brandId=${brandId}&type=brand`);
      const { guidelines: fetchedGuidelines } = await guidelinesResponse.json();
      setGuidelines(fetchedGuidelines);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load brand");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (brandId) {
      fetchData();
    }
  }, [brandId, organizationId]);

  if (isLoading) {
    return <LoadingState message="Loading brand dashboard..." />;
  }

  if (error || !brand) {
    return (
      <ErrorState
        title="Failed to load brand"
        message={error || "Brand not found"}
        onRetry={fetchData}
      />
    );
  }

  return (
    <div className="space-y-6">
      <BrandDashboardHeader brand={brand} onUpdate={fetchData} />

      <div className="grid gap-6">
        <BrandProductsSection
          brandId={brandId}
          products={products}
          onUpdate={fetchData}
        />

        <BrandAssetsSection
          brandId={brandId}
          assets={assets}
          onUpdate={fetchData}
        />

        <BrandGuidelinesSection
          brandId={brandId}
          guidelines={guidelines}
          onUpdate={fetchData}
        />
      </div>
    </div>
  );
}
