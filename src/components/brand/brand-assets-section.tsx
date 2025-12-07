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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/common";
import { Image, Upload, Trash2, MoreVertical, Eye } from "lucide-react";
import type { Asset } from "@/lib/db/schema";

interface BrandAssetsSectionProps {
  brandId: string;
  assets: Asset[];
  onUpdate: () => void;
}

export function BrandAssetsSection({ brandId, assets, onUpdate }: BrandAssetsSectionProps) {
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [lightboxAsset, setLightboxAsset] = React.useState<Asset | null>(null);
  const [uploadForm, setUploadForm] = React.useState({
    type: "brand-image" as Asset["type"],
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
      formData.append("assetType", uploadForm.type);

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
          type: uploadForm.type,
          filePath,
          altText: uploadForm.altText || null,
          metadata: {
            originalName: uploadForm.file.name,
            size,
            mimeType,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to upload asset");

      setIsUploadOpen(false);
      setUploadForm({ type: "brand-image", file: null, altText: "" });
      onUpdate();
    } catch (error) {
      console.error("Error uploading asset:", error);
      alert("Failed to upload asset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;

    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete asset");

      onUpdate();
    } catch (error) {
      console.error("Error deleting asset:", error);
      alert("Failed to delete asset");
    }
  };

  const brandAssets = assets.filter((a) => !a.productId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Brand Assets</CardTitle>
            <CardDescription>
              Logos, brand imagery, and other brand-level assets
            </CardDescription>
          </div>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Asset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Brand Asset</DialogTitle>
                <DialogDescription>
                  Add a new asset to your brand library
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Asset Type</Label>
                  <Select
                    value={uploadForm.type}
                    onValueChange={(value) =>
                      setUploadForm({ ...uploadForm, type: value as Asset["type"] })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="logo">Logo</SelectItem>
                      <SelectItem value="brand-image">Brand Image</SelectItem>
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
                  <Label htmlFor="altText">Alt Text (Optional)</Label>
                  <Input
                    id="altText"
                    value={uploadForm.altText}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, altText: e.target.value })
                    }
                    placeholder="Describe the image"
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
        {brandAssets.length === 0 ? (
          <EmptyState
            icon={Image}
            title="No assets yet"
            description="Upload your brand logos, images, and other assets to get started"
          />
        ) : (
          <>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {brandAssets.map((asset) => (
                <div key={asset.id} className="group relative aspect-square bg-muted rounded-lg overflow-hidden">
                  <NextImage
                    src={asset.filePath}
                    alt={asset.altText || "Brand asset"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-white/90 hover:bg-white focus:bg-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLightboxAsset(asset)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(asset.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs font-medium text-white truncate">
                      {asset.type.replace("-", " ")}
                    </p>
                    {asset.altText && (
                      <p className="text-xs text-white/80 truncate">
                        {asset.altText}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Lightbox Dialog */}
            <Dialog open={!!lightboxAsset} onOpenChange={() => setLightboxAsset(null)}>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>{lightboxAsset?.altText || "Asset Preview"}</DialogTitle>
                  <DialogDescription>
                    {lightboxAsset?.type.replace("-", " ")}
                  </DialogDescription>
                </DialogHeader>
                {lightboxAsset && (
                  <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                    <NextImage
                      src={lightboxAsset.filePath}
                      alt={lightboxAsset.altText || "Brand asset"}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
}
