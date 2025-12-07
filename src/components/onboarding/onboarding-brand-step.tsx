"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Palette, Plus, X } from "lucide-react";

type BrandData = {
  name: string;
  description: string;
  industry: string;
  primaryColor: string;
  secondaryColor: string;
  websiteUrl?: string;
  googleMyBusinessUrl?: string;
  socialMediaUrls?: Record<string, string>;
  logoFile?: File;
  brandedAssets?: Array<{ file: File; name: string }>;
  referenceImages?: Array<{ file: File; url: string }>;
};

interface OnboardingBrandStepProps {
  data: BrandData;
  onChange: (data: BrandData) => void;
}

export function OnboardingBrandStep({ data, onChange }: OnboardingBrandStepProps) {
  const [socialPlatform, setSocialPlatform] = React.useState("");
  const [socialUrl, setSocialUrl] = React.useState("");

  const handleChange = (field: keyof BrandData, value: string | Record<string, string>) => {
    onChange({ ...data, [field]: value });
  };

  const handleAddSocial = () => {
    if (socialPlatform && socialUrl) {
      const updated = { ...(data.socialMediaUrls || {}), [socialPlatform]: socialUrl };
      onChange({ ...data, socialMediaUrls: updated });
      setSocialPlatform("");
      setSocialUrl("");
    }
  };

  const handleRemoveSocial = (platform: string) => {
    const updated = { ...data.socialMediaUrls };
    delete updated[platform];
    onChange({ ...data, socialMediaUrls: updated });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange({ ...data, logoFile: file });
  };

  const handleBrandedAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAssets = Array.from(files).map(file => ({ file, name: file.name }));
      onChange({ ...data, brandedAssets: [...(data.brandedAssets || []), ...newAssets] });
    }
  };

  const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => ({ file, url: "" }));
      onChange({ ...data, referenceImages: [...(data.referenceImages || []), ...newImages] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-full bg-primary/10 p-3">
          <Palette className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Brand Information</h3>
          <p className="text-sm text-muted-foreground">
            Tell us about your brand so we can help you create consistent assets
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="brand-name">
            Brand Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="brand-name"
            placeholder="e.g., Acme Corporation"
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            The name of your brand or company
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand-description">Brand Description</Label>
          <Textarea
            id="brand-description"
            placeholder="Describe what your brand does and what makes it unique..."
            value={data.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            A brief overview of your brand (optional but recommended)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand-industry">
            Industry <span className="text-destructive">*</span>
          </Label>
          <Input
            id="brand-industry"
            placeholder="e.g., Technology, Fashion, Food & Beverage"
            value={data.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            What industry does your brand operate in?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primary-color"
                type="color"
                value={data.primaryColor}
                onChange={(e) => handleChange("primaryColor", e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={data.primaryColor}
                onChange={(e) => handleChange("primaryColor", e.target.value)}
                placeholder="#0066cc"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary-color">Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                id="secondary-color"
                type="color"
                value={data.secondaryColor}
                onChange={(e) => handleChange("secondaryColor", e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={data.secondaryColor}
                onChange={(e) => handleChange("secondaryColor", e.target.value)}
                placeholder="#ff6600"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website-url">Website URL</Label>
          <Input
            id="website-url"
            type="url"
            placeholder="https://www.yourbrand.com"
            value={data.websiteUrl || ""}
            onChange={(e) => handleChange("websiteUrl", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gmb-url">Google My Business URL</Label>
          <Input
            id="gmb-url"
            type="url"
            placeholder="https://g.page/..."
            value={data.googleMyBusinessUrl || ""}
            onChange={(e) => handleChange("googleMyBusinessUrl", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Social Media URLs</Label>
          <div className="space-y-2">
            {data.socialMediaUrls && Object.entries(data.socialMediaUrls).map(([platform, url]) => (
              <div key={platform} className="flex items-center gap-2">
                <Input value={platform} disabled className="w-32" />
                <Input value={url} disabled className="flex-1" />
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSocial(platform)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Platform (e.g., Facebook)"
                value={socialPlatform}
                onChange={(e) => setSocialPlatform(e.target.value)}
                className="w-40"
              />
              <Input
                placeholder="URL"
                value={socialUrl}
                onChange={(e) => setSocialUrl(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddSocial}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Logo Upload</Label>
          <FileUpload
            multiple={false}
            files={data.logoFile ? [data.logoFile] : []}
            onChange={(files) => onChange({ ...data, logoFile: files[0] })}
            label="Upload your brand logo"
            description="SVG, PNG, or JPG (max 2MB)"
            accept="image/*"
          />
        </div>

        <div className="space-y-2">
          <Label>Branded Image Assets</Label>
          <FileUpload
            multiple
            files={data.brandedAssets?.map(a => a.file) || []}
            onChange={(files) => {
              const assets = files.map(file => ({ file, name: file.name }));
              onChange({ ...data, brandedAssets: assets });
            }}
            label="Upload branded assets for inspiration"
            description="Multiple images (PNG, JPG, SVG)"
            accept="image/*"
          />
        </div>

        <div className="space-y-2">
          <Label>Reference Images</Label>
          <FileUpload
            multiple
            files={data.referenceImages?.map(r => r.file) || []}
            onChange={(files) => {
              const images = files.map(file => ({ file, url: "" }));
              onChange({ ...data, referenceImages: images });
            }}
            label="Upload external inspiration images"
            description="Multiple images for creative reference"
            accept="image/*"
          />
        </div>
      </div>
    </div>
  );
}
