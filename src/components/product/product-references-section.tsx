"use client";

import * as React from "react";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common";
import { Image, Upload, Trash2 } from "lucide-react";
import type { Asset } from "@/lib/db/schema";

interface ProductReferencesSectionProps {
  brandId: string;
  productId: string;
  assets: Asset[];
  onUpdate: () => void;
}

type ReferenceSubtype = "banner" | "marketplace" | "social" | "icon" | "custom";

export function ProductReferencesSection({ brandId, productId, assets, onUpdate }: ProductReferencesSectionProps) {
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [uploadForm, setUploadForm] = React.useState({
    subtype: "marketplace" as ReferenceSubtype,
    file: null as File | null,
    altText: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file) return;

    setIsLoading(true);
    try {
      // Upload file to server
      const formData = new FormData();
      formData.append("file", uploadForm.file);
      formData.append("brandId", brandId);
      formData.append("productId", productId);
      formData.append("assetType", "design-reference");
      formData.append("subtype", uploadForm.subtype);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload file");

      const { filePath, size, mimeType } = await uploadResponse.json();

      // Create asset record in database
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          productId,
          type: "design-reference",
          subtype: uploadForm.subtype,
          filePath,
          altText: uploadForm.altText || null,
          metadata: {
            originalName: uploadForm.file.name,
            size,
            mimeType,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to upload reference");

      setIsUploadOpen(false);
      setUploadForm({ subtype: "marketplace", file: null, altText: "" });
      onUpdate();
    } catch (error) {
      console.error("Error uploading reference:", error);
      alert("Failed to upload reference");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this reference?")) return;

    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete reference");

      onUpdate();
    } catch (error) {
      console.error("Error deleting reference:", error);
      alert("Failed to delete reference");
    }
  };

  const referenceAssets = assets.filter(a => a.type === "design-reference");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Design References</CardTitle>
            <CardDescription>
              Reference images for marketplace listings, social media, and promotional materials
            </CardDescription>
          </div>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Add Reference
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Design Reference</DialogTitle>
                <DialogDescription>
                  Add inspiration or reference images for this product
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subtype">Reference Type</Label>
                  <Select
                    value={uploadForm.subtype}
                    onValueChange={(value) =>
                      setUploadForm({ ...uploadForm, subtype: value as ReferenceSubtype })
                    }
                  >
                    <SelectTrigger id="subtype">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketplace">Marketplace Listing</SelectItem>
                      <SelectItem value="banner">Banner/Header</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="icon">Icon/Logo</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {uploadForm.file && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {uploadForm.file.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altText">Description/Notes (Optional)</Label>
                  <Input
                    id="altText"
                    value={uploadForm.altText}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, altText: e.target.value })
                    }
                    placeholder="Add notes about this reference"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsUploadOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isLoading || !uploadForm.file}
                >
                  {isLoading ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {referenceAssets.length === 0 ? (
          <EmptyState
            icon={Image}
            title="No design references yet"
            description="Upload reference images to guide AI-generated product assets"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {referenceAssets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden">
                <div className="aspect-square bg-muted flex items-center justify-center relative">
                  <NextImage
                    src={asset.filePath}
                    alt={asset.altText || "Design reference"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {asset.subtype && (
                        <Badge variant="secondary" className="text-xs">
                          {asset.subtype}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(asset.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {asset.altText && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {asset.altText}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
