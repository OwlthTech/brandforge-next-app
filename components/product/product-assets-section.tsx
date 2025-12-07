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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/ui/file-upload";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/common";
import { Image, Upload, Trash2, MoreVertical, Pencil, Images } from "lucide-react";
import type { Asset } from "@/lib/db/schema";

interface ProductAssetsSectionProps {
  brandId: string;
  productId: string;
  assets: Asset[];
  onUpdate: () => void;
}

type AssetSubtype = "front" | "back" | "side" | "angled" | "detail" | "custom";

export function ProductAssetsSection({ brandId, productId, assets, onUpdate }: ProductAssetsSectionProps) {
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedAssets, setSelectedAssets] = React.useState<Set<string>>(new Set());
  const [editingAsset, setEditingAsset] = React.useState<Asset | null>(null);
  const [activeTab, setActiveTab] = React.useState("all");
  
  const [uploadForm, setUploadForm] = React.useState({
    subtype: "front" as AssetSubtype,
    files: [] as File[],
    altTexts: {} as Record<number, string>,
  });

  const [editForm, setEditForm] = React.useState({
    subtype: "front" as AssetSubtype,
    altText: "",
  });

  const handleFilesChange = (files: File[]) => {
    setUploadForm({ ...uploadForm, files });
  };

  const handleUpload = async () => {
    if (uploadForm.files.length === 0) return;

    setIsLoading(true);
    try {
      // Upload each file
      for (let i = 0; i < uploadForm.files.length; i++) {
        const file = uploadForm.files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("brandId", brandId);
        formData.append("productId", productId);
        formData.append("assetType", "product-image");
        formData.append("subtype", uploadForm.subtype);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error(`Failed to upload ${file.name}`);

        const { filePath, size, mimeType } = await uploadResponse.json();

        // Create asset record with individual alt text
        const altText = uploadForm.altTexts[i] || "";
        await fetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandId,
            productId,
            type: "product-image",
            subtype: uploadForm.subtype,
            filePath,
            altText: altText || null,
            metadata: {
              originalName: file.name,
              size,
              mimeType,
            },
          }),
        });
      }

      setIsUploadOpen(false);
      setUploadForm({ subtype: "front", files: [], altTexts: {} });
      onUpdate();
    } catch (error) {
      console.error("Error uploading assets:", error);
      alert(error instanceof Error ? error.message : "Failed to upload assets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingAsset) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/assets/${editingAsset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtype: editForm.subtype,
          altText: editForm.altText || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update asset");

      setIsEditOpen(false);
      setEditingAsset(null);
      onUpdate();
    } catch (error) {
      console.error("Error updating asset:", error);
      alert("Failed to update asset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

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

  const handleBulkDelete = async () => {
    if (selectedAssets.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedAssets.size} image(s)?`)) return;

    try {
      await Promise.all(
        Array.from(selectedAssets).map(assetId =>
          fetch(`/api/assets/${assetId}`, { method: "DELETE" })
        )
      );
      setSelectedAssets(new Set());
      onUpdate();
    } catch (error) {
      console.error("Error deleting assets:", error);
      alert("Failed to delete some assets");
    }
  };

  const openEditDialog = (asset: Asset) => {
    setEditingAsset(asset);
    setEditForm({
      subtype: (asset.subtype as AssetSubtype) || "front",
      altText: asset.altText || "",
    });
    setIsEditOpen(true);
  };

  const toggleAssetSelection = (assetId: string) => {
    const newSelection = new Set(selectedAssets);
    if (newSelection.has(assetId)) {
      newSelection.delete(assetId);
    } else {
      newSelection.add(assetId);
    }
    setSelectedAssets(newSelection);
  };

  const toggleAllInView = (assetIds: string[]) => {
    const allSelected = assetIds.every(id => selectedAssets.has(id));
    const newSelection = new Set(selectedAssets);
    
    if (allSelected) {
      assetIds.forEach(id => newSelection.delete(id));
    } else {
      assetIds.forEach(id => newSelection.add(id));
    }
    setSelectedAssets(newSelection);
  };

  const productImages = assets.filter(a => a.type === "product-image");
  const groupedAssets = productImages.reduce((acc, asset) => {
    const subtype = asset.subtype || "custom";
    if (!acc[subtype]) acc[subtype] = [];
    acc[subtype].push(asset);
    return acc;
  }, {} as Record<string, Asset[]>);

  const subtypes: AssetSubtype[] = ["front", "back", "side", "angled", "detail", "custom"];
  const subtypeLabels: Record<AssetSubtype, string> = {
    front: "Front View",
    back: "Back View",
    side: "Side View",
    angled: "Angled View",
    detail: "Detail Shot",
    custom: "Custom",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>
              Upload product photos from different angles
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {selectedAssets.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {selectedAssets.size}
              </Button>
            )}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Upload Product Images</DialogTitle>
                  <DialogDescription>
                    Upload multiple photos and set individual alt text for each
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="subtype">View Angle</Label>
                    <Select
                      value={uploadForm.subtype}
                      onValueChange={(value) =>
                        setUploadForm({ ...uploadForm, subtype: value as AssetSubtype })
                      }
                    >
                      <SelectTrigger id="subtype">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="front">Front View</SelectItem>
                        <SelectItem value="back">Back View</SelectItem>
                        <SelectItem value="side">Side View</SelectItem>
                        <SelectItem value="angled">Angled View</SelectItem>
                        <SelectItem value="detail">Detail Shot</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Images</Label>
                    <FileUpload
                      files={uploadForm.files}
                      onChange={handleFilesChange}
                      maxFiles={20}
                      accept="image/*"
                      multiple
                      label="Click to upload or drag and drop"
                      description="PNG, JPG, WEBP (max 20 files)"
                    />
                  </div>

                  {uploadForm.files.length > 0 && (
                    <div className="space-y-3">
                      <Label>Alt Text for Each Image</Label>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {uploadForm.files.map((file, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground min-w-8">
                              {index + 1}.
                            </span>
                            <div className="flex-1">
                              <Input
                                placeholder={`Alt text for ${file.name}`}
                                value={uploadForm.altTexts[index] || ""}
                                onChange={(e) =>
                                  setUploadForm({
                                    ...uploadForm,
                                    altTexts: {
                                      ...uploadForm.altTexts,
                                      [index]: e.target.value,
                                    },
                                  })
                                }
                              />
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {file.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsUploadOpen(false);
                      setUploadForm({ subtype: "front", files: [], altTexts: {} });
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={isLoading || uploadForm.files.length === 0}
                  >
                    {isLoading ? "Uploading..." : `Upload ${uploadForm.files.length} Image${uploadForm.files.length !== 1 ? 's' : ''}`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {productImages.length === 0 ? (
          <EmptyState
            icon={Image}
            title="No product images yet"
            description="Upload photos of your product from different angles"
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${subtypes.length + 1}, minmax(0, 1fr))` }}>
              <TabsTrigger value="all">
                All Images {productImages.length > 0 && `(${productImages.length})`}
              </TabsTrigger>
              {subtypes.map((subtype) => (
                <TabsTrigger key={subtype} value={subtype}>
                  {subtypeLabels[subtype]}
                  {groupedAssets[subtype]?.length ? ` (${groupedAssets[subtype].length})` : ""}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {productImages.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Checkbox
                      checked={productImages.every(a => selectedAssets.has(a.id))}
                      onCheckedChange={() => toggleAllInView(productImages.map(a => a.id))}
                    />
                    <span className="text-sm text-muted-foreground">
                      Select all ({productImages.length})
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {productImages.map((asset) => (
                      <Card key={asset.id} className="overflow-hidden">
                        <div className="aspect-square bg-muted flex items-center justify-center relative group">
                          <div className="absolute top-2 left-2 z-10">
                            <Checkbox
                              checked={selectedAssets.has(asset.id)}
                              onCheckedChange={() => toggleAssetSelection(asset.id)}
                              className="bg-white shadow-md"
                            />
                          </div>
                          <NextImage
                            src={asset.filePath}
                            alt={asset.altText || "Product image"}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-8 w-8 p-0 bg-white shadow-md focus:bg-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(asset)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit Details
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
                        </div>
                        <CardContent className="p-3">
                          <div className="space-y-1">
                            {asset.subtype && (
                              <p className="text-xs font-medium text-primary">
                                {subtypeLabels[asset.subtype as AssetSubtype]}
                              </p>
                            )}
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
                </>
              ) : null}
            </TabsContent>

            {subtypes.map((subtype) => (
              <TabsContent key={subtype} value={subtype} className="mt-4">
                {groupedAssets[subtype]?.length ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <Checkbox
                        checked={groupedAssets[subtype].every(a => selectedAssets.has(a.id))}
                        onCheckedChange={() => toggleAllInView(groupedAssets[subtype].map(a => a.id))}
                      />
                      <span className="text-sm text-muted-foreground">
                        Select all ({groupedAssets[subtype].length})
                      </span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {groupedAssets[subtype].map((asset) => (
                        <Card key={asset.id} className="overflow-hidden">
                          <div className="aspect-square bg-muted flex items-center justify-center relative group">
                            <div className="absolute top-2 left-2 z-10">
                              <Checkbox
                                checked={selectedAssets.has(asset.id)}
                                onCheckedChange={() => toggleAssetSelection(asset.id)}
                                className="bg-white shadow-md"
                              />
                            </div>
                            <NextImage
                              src={asset.filePath}
                              alt={asset.altText || `${subtype} view`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-8 w-8 p-0 bg-white shadow-md focus:bg-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditDialog(asset)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Details
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
                          </div>
                          <CardContent className="p-3">
                            {asset.altText && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {asset.altText}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No {subtypeLabels[subtype].toLowerCase()} images yet
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image Details</DialogTitle>
            <DialogDescription>
              Update the view angle or alt text for this image
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subtype">View Angle</Label>
              <Select
                value={editForm.subtype}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, subtype: value as AssetSubtype })
                }
              >
                <SelectTrigger id="edit-subtype">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front">Front View</SelectItem>
                  <SelectItem value="back">Back View</SelectItem>
                  <SelectItem value="side">Side View</SelectItem>
                  <SelectItem value="angled">Angled View</SelectItem>
                  <SelectItem value="detail">Detail Shot</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-altText">Alt Text</Label>
              <Textarea
                id="edit-altText"
                value={editForm.altText}
                onChange={(e) =>
                  setEditForm({ ...editForm, altText: e.target.value })
                }
                placeholder="Describe the image"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false);
                setEditingAsset(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
