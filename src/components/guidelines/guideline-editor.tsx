"use client";

import * as React from "react";
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
import { RegenerableTextarea } from "@/components/ui/regenerable-textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import type { BrandGuidelineSections, ProductGuidelineSections } from "@/types/guideline";

interface GuidelineEditorProps {
  type: "brand" | "product";
  content: BrandGuidelineSections | ProductGuidelineSections;
  onChange: (content: BrandGuidelineSections | ProductGuidelineSections) => void;
  onSave: () => void;
  isSaving?: boolean;
  brandId?: string;
  productId?: string;
}

export function GuidelineEditor({ type, content, onChange, onSave, isSaving, brandId, productId }: GuidelineEditorProps) {
  if (type === "brand") {
    return <BrandGuidelineEditor content={content as BrandGuidelineSections} onChange={onChange} onSave={onSave} isSaving={isSaving} brandId={brandId} />;
  }
  return <ProductGuidelineEditor content={content as ProductGuidelineSections} onChange={onChange} onSave={onSave} isSaving={isSaving} brandId={brandId} productId={productId} />;
}

function BrandGuidelineEditor({ 
  content, 
  onChange, 
  onSave, 
  isSaving,
  brandId
}: { 
  content: BrandGuidelineSections; 
  onChange: (content: BrandGuidelineSections) => void;
  onSave: () => void;
  isSaving?: boolean;
  brandId?: string;
}) {
  const [regenerating, setRegenerating] = React.useState<string | null>(null);

  const updateSection = <K extends keyof BrandGuidelineSections>(
    section: K,
    value: BrandGuidelineSections[K]
  ) => {
    onChange({ ...content, [section]: value });
  };

  const regenerateSection = async (section: keyof BrandGuidelineSections) => {
    if (!brandId) return;
    
    setRegenerating(section);
    try {
      const response = await fetch("/api/ai/regenerate-brand-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, section, currentContent: content[section] }),
      });

      if (!response.ok) throw new Error("Failed to regenerate section");

      const data = await response.json();
      updateSection(section, data[section]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to regenerate section");
    } finally {
      setRegenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Brand Guidelines</h2>
          <p className="text-muted-foreground">Define your brand identity and standards</p>
        </div>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Guidelines"}
        </Button>
      </div>

      <Tabs defaultValue="story" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="story">Story</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="palette">Palette</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="logo">Logo</TabsTrigger>
          <TabsTrigger value="imagery">Imagery</TabsTrigger>
        </TabsList>

        <TabsContent value="story" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Brand Story</CardTitle>
                  <CardDescription>Define your brand's mission, vision, and values</CardDescription>
                </div>
                {brandId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => regenerateSection("story")}
                    disabled={regenerating === "story"}
                    className="text-sm font-thin leading-loose"
                  >
                    {regenerating === "story" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Regenerate all fields
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mission">Mission Statement</Label>
                <RegenerableTextarea
                  id="mission"
                  value={content.story?.mission || ""}
                  onChange={(val) => updateSection("story", { ...content.story, mission: val })}
                  placeholder="What is your brand's purpose?"
                  rows={3}
                  brandId={brandId}
                  section="story"
                  field="mission"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vision">Vision Statement</Label>
                <RegenerableTextarea
                  id="vision"
                  value={content.story?.vision || ""}
                  onChange={(val) => updateSection("story", { ...content.story, vision: val })}
                  placeholder="What future does your brand envision?"
                  rows={3}
                  brandId={brandId}
                  section="story"
                  field="vision"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandPersonality">Brand Personality</Label>
                <RegenerableTextarea
                  id="brandPersonality"
                  value={content.story?.brandPersonality || ""}
                  onChange={(val) => updateSection("story", { ...content.story, brandPersonality: val })}
                  placeholder="Describe your brand's character and personality"
                  rows={3}
                  brandId={brandId}
                  section="story"
                  field="personality"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <RegenerableTextarea
                  id="targetAudience"
                  value={content.story?.targetAudience || ""}
                  onChange={(val) => updateSection("story", { ...content.story, targetAudience: val })}
                  placeholder="Who is your ideal customer?"
                  rows={3}
                  brandId={brandId}
                  section="story"
                  field="targetAudience"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Voice</CardTitle>
              <CardDescription>Define how your brand communicates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="writingStyle">Writing Style</Label>
                <Textarea
                  id="writingStyle"
                  value={content.voice?.writingStyle || ""}
                  onChange={(e) => updateSection("voice", { ...content.voice, writingStyle: e.target.value })}
                  placeholder="Describe your brand's writing style"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exampleCopy">Example Copy</Label>
                <Textarea
                  id="exampleCopy"
                  value={content.voice?.exampleCopy || ""}
                  onChange={(e) => updateSection("voice", { ...content.voice, exampleCopy: e.target.value })}
                  placeholder="Provide examples of on-brand copy"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="palette" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>Define your brand colors and usage guidelines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="colorGuidelines">Color Guidelines</Label>
                <Textarea
                  id="colorGuidelines"
                  value={content.palette?.colorGuidelines || ""}
                  onChange={(e) => updateSection("palette", { ...content.palette, colorGuidelines: e.target.value })}
                  placeholder="Describe how to use your brand colors"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Define your brand fonts and text styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="typographyGuidelines">Typography Guidelines</Label>
                <Textarea
                  id="typographyGuidelines"
                  value={content.typography?.typographyGuidelines || ""}
                  onChange={(e) => updateSection("typography", { ...content.typography, typographyGuidelines: e.target.value })}
                  placeholder="Describe font usage, hierarchy, and styling"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logo Usage</CardTitle>
              <CardDescription>Define logo guidelines and standards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clearSpace">Clear Space</Label>
                <Input
                  id="clearSpace"
                  value={content.logo?.clearSpace || ""}
                  onChange={(e) => updateSection("logo", { ...content.logo, clearSpace: e.target.value })}
                  placeholder="e.g., Minimum 10px on all sides"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumSize">Minimum Size</Label>
                <Input
                  id="minimumSize"
                  value={content.logo?.minimumSize || ""}
                  onChange={(e) => updateSection("logo", { ...content.logo, minimumSize: e.target.value })}
                  placeholder="e.g., 40px height for digital"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imagery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Imagery Guidelines</CardTitle>
              <CardDescription>Define visual style for photography and graphics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photographyStyle">Photography Style</Label>
                <Textarea
                  id="photographyStyle"
                  value={content.imagery?.photographyStyle || ""}
                  onChange={(e) => updateSection("imagery", { ...content.imagery, photographyStyle: e.target.value })}
                  placeholder="Describe the photography style"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageGuidelines">Image Guidelines</Label>
                <Textarea
                  id="imageGuidelines"
                  value={content.imagery?.imageGuidelines || ""}
                  onChange={(e) => updateSection("imagery", { ...content.imagery, imageGuidelines: e.target.value })}
                  placeholder="General image usage guidelines"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content.additionalNotes || ""}
            onChange={(e) => onChange({ ...content, additionalNotes: e.target.value })}
            placeholder="Add any additional guidelines or notes"
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ProductGuidelineEditor({ 
  content, 
  onChange, 
  onSave, 
  isSaving,
  brandId,
  productId
}: { 
  content: ProductGuidelineSections; 
  onChange: (content: ProductGuidelineSections) => void;
  onSave: () => void;
  isSaving?: boolean;
  brandId?: string;
  productId?: string;
}) {
  const [regenerating, setRegenerating] = React.useState<string | null>(null);

  const updateSection = <K extends keyof ProductGuidelineSections>(
    section: K,
    value: ProductGuidelineSections[K]
  ) => {
    onChange({ ...content, [section]: value });
  };

  const regenerateSection = async (section: keyof ProductGuidelineSections) => {
    if (!brandId || !productId) return;
    
    setRegenerating(section);
    try {
      const response = await fetch("/api/ai/regenerate-product-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, productId, section, currentContent: content[section] }),
      });

      if (!response.ok) throw new Error("Failed to regenerate section");

      const data = await response.json();
      updateSection(section, data[section]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to regenerate section");
    } finally {
      setRegenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Guidelines</h2>
          <p className="text-muted-foreground">Define product positioning and messaging</p>
        </div>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Guidelines"}
        </Button>
      </div>

      <Tabs defaultValue="positioning" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="positioning">Positioning</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="visuals">Visuals</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>

        <TabsContent value="positioning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Positioning</CardTitle>
              <CardDescription>Define what makes this product unique</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productDescription">Product Description</Label>
                <Textarea
                  id="productDescription"
                  value={content.positioning?.productDescription || ""}
                  onChange={(e) => updateSection("positioning", { ...content.positioning, productDescription: e.target.value })}
                  placeholder="Describe the product in detail"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetMarket">Target Market</Label>
                <Textarea
                  id="targetMarket"
                  value={content.positioning?.targetMarket || ""}
                  onChange={(e) => updateSection("positioning", { ...content.positioning, targetMarket: e.target.value })}
                  placeholder="Who is this product for?"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competitiveDifferentiation">Competitive Differentiation</Label>
                <Textarea
                  id="competitiveDifferentiation"
                  value={content.positioning?.competitiveDifferentiation || ""}
                  onChange={(e) => updateSection("positioning", { ...content.positioning, competitiveDifferentiation: e.target.value })}
                  placeholder="What sets this product apart?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messaging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Messaging</CardTitle>
              <CardDescription>Define key messages and copy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={content.messaging?.headline || ""}
                  onChange={(e) => updateSection("messaging", { ...content.messaging, headline: e.target.value })}
                  placeholder="Main product headline"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={content.messaging?.tagline || ""}
                  onChange={(e) => updateSection("messaging", { ...content.messaging, tagline: e.target.value })}
                  placeholder="Product tagline or slogan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="callToAction">Call to Action</Label>
                <Input
                  id="callToAction"
                  value={content.messaging?.callToAction || ""}
                  onChange={(e) => updateSection("messaging", { ...content.messaging, callToAction: e.target.value })}
                  placeholder="e.g., Shop Now, Learn More"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visuals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visual Guidelines</CardTitle>
              <CardDescription>Define product photography and visual standards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photographyGuidelines">Photography Guidelines</Label>
                <Textarea
                  id="photographyGuidelines"
                  value={content.visuals?.photographyGuidelines || ""}
                  onChange={(e) => updateSection("visuals", { ...content.visuals, photographyGuidelines: e.target.value })}
                  placeholder="How should this product be photographed?"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lightingStyle">Lighting Style</Label>
                <Input
                  id="lightingStyle"
                  value={content.visuals?.lightingStyle || ""}
                  onChange={(e) => updateSection("visuals", { ...content.visuals, lightingStyle: e.target.value })}
                  placeholder="e.g., Natural light, Soft box, Studio"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backgroundPreferences">Background Preferences</Label>
                <Input
                  id="backgroundPreferences"
                  value={content.visuals?.backgroundPreferences || ""}
                  onChange={(e) => updateSection("visuals", { ...content.visuals, backgroundPreferences: e.target.value })}
                  placeholder="e.g., White background, Lifestyle setting"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Guidelines</CardTitle>
              <CardDescription>Optimize for e-commerce platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titleFormula">Title Formula</Label>
                <Input
                  id="titleFormula"
                  value={content.marketplace?.titleFormula || ""}
                  onChange={(e) => updateSection("marketplace", { ...content.marketplace, titleFormula: e.target.value })}
                  placeholder="e.g., [Brand] [Product Type] - [Key Feature]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionStructure">Description Structure</Label>
                <Textarea
                  id="descriptionStructure"
                  value={content.marketplace?.descriptionStructure || ""}
                  onChange={(e) => updateSection("marketplace", { ...content.marketplace, descriptionStructure: e.target.value })}
                  placeholder="Define the structure for marketplace descriptions"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Guidelines</CardTitle>
              <CardDescription>Platform-specific content guidelines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagramGuidelines">Instagram</Label>
                <Textarea
                  id="instagramGuidelines"
                  value={content.socialMedia?.instagramGuidelines || ""}
                  onChange={(e) => updateSection("socialMedia", { ...content.socialMedia, instagramGuidelines: e.target.value })}
                  placeholder="Instagram-specific guidelines"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebookGuidelines">Facebook</Label>
                <Textarea
                  id="facebookGuidelines"
                  value={content.socialMedia?.facebookGuidelines || ""}
                  onChange={(e) => updateSection("socialMedia", { ...content.socialMedia, facebookGuidelines: e.target.value })}
                  placeholder="Facebook-specific guidelines"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content.additionalNotes || ""}
            onChange={(e) => onChange({ ...content, additionalNotes: e.target.value })}
            placeholder="Add any additional guidelines or notes"
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
}
