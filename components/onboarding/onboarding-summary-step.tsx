"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Palette, Package } from "lucide-react";

type BrandData = {
  name: string;
  description: string;
  industry: string;
  primaryColor: string;
  secondaryColor: string;
};

type ProductData = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
};

interface OnboardingSummaryStepProps {
  brandData: BrandData;
  productsData: ProductData[];
}

export function OnboardingSummaryStep({
  brandData,
  productsData,
}: OnboardingSummaryStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Ready to Create Your Brand</h3>
          <p className="text-sm text-muted-foreground">
            Review your information before we set everything up
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Brand Information</h4>
        </div>

        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Brand Name</dt>
            <dd className="text-base font-semibold">{brandData.name}</dd>
          </div>

          {brandData.description && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Description</dt>
              <dd className="text-sm">{brandData.description}</dd>
            </div>
          )}

          <div>
            <dt className="text-sm font-medium text-muted-foreground">Industry</dt>
            <dd className="text-sm">{brandData.industry}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-2">Brand Colors</dt>
            <dd className="flex gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: brandData.primaryColor }}
                />
                <span className="text-sm font-mono">{brandData.primaryColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: brandData.secondaryColor }}
                />
                <span className="text-sm font-mono">{brandData.secondaryColor}</span>
              </div>
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Products</h4>
        </div>

        {productsData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No products added yet. You can add them later from your dashboard.
          </p>
        ) : (
          <div className="space-y-4">
            {productsData.map((product, index) => (
              <div key={product.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-semibold">{product.name || "Untitled Product"}</h5>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {product.description}
                        </p>
                      )}
                    </div>
                    {product.category && (
                      <Badge variant="outline">{product.category}</Badge>
                    )}
                  </div>

                  {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 text-sm">
        <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
          What happens next?
        </p>
        <p className="text-blue-700 dark:text-blue-300">
          We&apos;ll create your brand workspace where you can manage products, create guidelines,
          and generate design assets. You&apos;ll be redirected to your brand dashboard.
        </p>
      </div>
    </div>
  );
}
