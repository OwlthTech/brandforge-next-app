"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/common";
import { ProductsDataTable } from "@/components/product";
import { Package, Plus } from "lucide-react";
import type { Product } from "@/lib/db/schema";

interface BrandProductsSectionProps {
  brandId: string;
  products: Product[];
  onUpdate: () => void;
}

export function BrandProductsSection({ brandId, products, onUpdate }: BrandProductsSectionProps) {
  const router = useRouter();

  const handleProductClick = (productId: string) => {
    router.push(`/brands/${brandId}/products/${productId}`);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate();
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const handleBulkDelete = async (productIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${productIds.length} products?`)) return;

    try {
      await Promise.all(
        productIds.map((id) =>
          fetch(`/api/products/${id}`, { method: "DELETE" })
        )
      );
      onUpdate();
    } catch (error) {
      console.error("Error deleting products:", error);
      alert("Failed to delete some products");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage products for this brand
            </CardDescription>
          </div>
          <Button asChild size="sm">
            <Link href={`/brands/${brandId}/products/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Add your first product to start managing product-specific assets and guidelines"
            action={{
              label: "Add Product",
              href: `/brands/${brandId}/products/new`,
            }}
          />
        ) : (
          <ProductsDataTable
            products={products.map((p) => ({
              id: p.id,
              name: p.name,
              description: p.description || "",
              category: p.category || "",
              tags: (p.tags as string[]) || [],
              thumbnailUrl: undefined, // Will be enhanced in next task
            }))}
            onDelete={handleDelete}
            onBulkDelete={handleBulkDelete}
            onProductClick={handleProductClick}
          />
        )}
      </CardContent>
    </Card>
  );
}
