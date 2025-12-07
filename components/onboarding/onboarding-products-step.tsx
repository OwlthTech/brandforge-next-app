"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Package } from "lucide-react";

type ProductData = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
};

interface OnboardingProductsStepProps {
  data: ProductData[];
  onChange: (data: ProductData[]) => void;
}

export function OnboardingProductsStep({ data, onChange }: OnboardingProductsStepProps) {
  const [currentTag, setCurrentTag] = React.useState("");

  const addProduct = () => {
    const newProduct: ProductData = {
      id: `product-${Date.now()}`,
      name: "",
      description: "",
      category: "",
      tags: [],
    };
    onChange([...data, newProduct]);
  };

  const removeProduct = (id: string) => {
    onChange(data.filter((p) => p.id !== id));
  };

  const updateProduct = (id: string, field: keyof ProductData, value: string | string[]) => {
    onChange(
      data.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addTag = (productId: string) => {
    if (!currentTag.trim()) return;

    const product = data.find((p) => p.id === productId);
    if (!product) return;

    if (!product.tags.includes(currentTag.trim())) {
      updateProduct(productId, "tags", [...product.tags, currentTag.trim()]);
    }
    setCurrentTag("");
  };

  const removeTag = (productId: string, tag: string) => {
    const product = data.find((p) => p.id === productId);
    if (!product) return;

    updateProduct(
      productId,
      "tags",
      product.tags.filter((t) => t !== tag)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-full bg-primary/10 p-3">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Your Products</h3>
          <p className="text-sm text-muted-foreground">
            Add your initial products (you can add more later)
          </p>
        </div>
        <Button onClick={addProduct} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {data.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-muted p-3">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-semibold mb-2">No products yet</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first product to get started
              </p>
              <Button onClick={addProduct} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Product
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((product, index) => (
            <Card key={product.id} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="font-semibold">Product {index + 1}</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProduct(product.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`product-name-${product.id}`}>Product Name</Label>
                  <Input
                    id={`product-name-${product.id}`}
                    placeholder="e.g., Premium Widget"
                    value={product.name}
                    onChange={(e) => updateProduct(product.id, "name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`product-desc-${product.id}`}>Description</Label>
                  <Textarea
                    id={`product-desc-${product.id}`}
                    placeholder="Brief description of the product..."
                    value={product.description}
                    onChange={(e) => updateProduct(product.id, "description", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`product-category-${product.id}`}>Category</Label>
                    <Input
                      id={`product-category-${product.id}`}
                      placeholder="e.g., Electronics"
                      value={product.category}
                      onChange={(e) => updateProduct(product.id, "category", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`product-tags-${product.id}`}>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`product-tags-${product.id}`}
                        placeholder="Add tag..."
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag(product.id);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addTag(product.id)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(product.id, tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {data.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          You can skip products for now and add them later from your dashboard
        </p>
      )}
    </div>
  );
}
