"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState, ErrorState } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import type { Brand } from "@/lib/db/schema";

export default function NewProductPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = params.brandId as string;

  const [brand, setBrand] = React.useState<Brand | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    category: "",
    tags: "",
  });

  const [rawProductImages, setRawProductImages] = React.useState<File[]>([]);
  const [inspirationImages, setInspirationImages] = React.useState<Array<{ file: File; notes: string }>>([]);

  React.useEffect(() => {
    const fetchBrand = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/brands/${brandId}`);
        if (!response.ok) throw new Error("Brand not found");
        const { brand: fetchedBrand } = await response.json();
        setBrand(fetchedBrand);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Product name is required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          name: formData.name,
          description: formData.description || null,
          category: formData.category || null,
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          metadata: {},
        }),
      });

      if (!response.ok) throw new Error("Failed to create product");

      const { product } = await response.json();

      // Upload raw product images
      if (rawProductImages.length > 0) {
        await Promise.all(
          rawProductImages.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("brandId", brandId);
            formData.append("productId", product.id);
            formData.append("assetType", "raw-product-image");

            const uploadResponse = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (uploadResponse.ok) {
              const { filePath } = await uploadResponse.json();
              
              await fetch("/api/assets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  brandId,
                  productId: product.id,
                  type: "raw-product-image",
                  url: filePath,
                  name: file.name,
                }),
              });
            }
          })
        );
      }

      // Upload inspiration images with notes
      if (inspirationImages.length > 0) {
        await Promise.all(
          inspirationImages.map(async ({ file, notes }) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("brandId", brandId);
            formData.append("productId", product.id);
            formData.append("assetType", "inspiration-image");

            const uploadResponse = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (uploadResponse.ok) {
              const { filePath } = await uploadResponse.json();
              
              await fetch("/api/assets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  brandId,
                  productId: product.id,
                  type: "inspiration-image",
                  url: filePath,
                  name: file.name,
                  notes: notes || null,
                }),
              });
            }
          })
        );
      }

      router.push(`/brands/${brandId}/products/${product.id}`);
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell breadcrumbs={[
        { label: "Brands", href: "/brands" },
        { label: "Loading...", href: `/brands/${brandId}` },
        { label: "New Product" }
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
        { label: "New Product" }
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
    { label: "New Product" },
  ];

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Product</CardTitle>
            <CardDescription>
              Add a new product to {brand.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Cotton T-Shirt, Leather Bag"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe your product"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Apparel, Accessories, Home Goods"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., summer, cotton, casual, eco-friendly"
                />
                <p className="text-xs text-muted-foreground">
                  Add tags to help organize and categorize your product
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="raw-images">Raw Product Images (HD, Non-Creative)</Label>
                <Input
                  id="raw-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setRawProductImages((prev) => [...prev, ...files]);
                  }}
                />
                {rawProductImages.length > 0 && (
                  <div className="space-y-1">
                    {rawProductImages.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-xs p-2 bg-muted rounded">
                        <span className="truncate flex-1">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            setRawProductImages((prev) => prev.filter((_, i) => i !== index));
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload high-quality product photos for reference
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspiration-images">External Inspiration Images</Label>
                <Input
                  id="inspiration-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setInspirationImages((prev) => [
                      ...prev,
                      ...files.map((file) => ({ file, notes: "" })),
                    ]);
                  }}
                />
                {inspirationImages.length > 0 && (
                  <div className="space-y-2">
                    {inspirationImages.map((item, index) => (
                      <div key={index} className="p-3 border rounded space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium truncate flex-1">
                            {item.file.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setInspirationImages((prev) => prev.filter((_, i) => i !== index));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Add notes about this inspiration image..."
                          value={item.notes}
                          onChange={(e) => {
                            setInspirationImages((prev) =>
                              prev.map((img, i) =>
                                i === index ? { ...img, notes: e.target.value } : img
                              )
                            );
                          }}
                          rows={2}
                          className="text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload external images for creative inspiration with notes
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Creating..." : "Create Product"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
