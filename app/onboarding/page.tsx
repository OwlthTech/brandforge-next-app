"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { OnboardingBrandStep } from "@/components/onboarding/onboarding-brand-step";
import { OnboardingProductsStep } from "@/components/onboarding/onboarding-products-step";
import { OnboardingSummaryStep } from "@/components/onboarding/onboarding-summary-step";
import { onboardingStorage } from "@/lib/utils/local-storage";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useSearchParams } from "next/navigation";

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

type ProductData = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
};

const STEPS = [
  { id: 1, title: "Brand Details", description: "Tell us about your brand" },
  { id: 2, title: "Products", description: "Add your initial products" },
  { id: 3, title: "Summary", description: "Review and confirm" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get("returnTo") || null;
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);

  const [brandData, setBrandData] = React.useState<BrandData>({
    name: "",
    description: "",
    industry: "",
    primaryColor: "#0066cc",
    secondaryColor: "#ff6600",
  });

  const [productsData, setProductsData] = React.useState<ProductData[]>([]);

  // Load saved progress on mount
  React.useEffect(() => {
    const savedProgress = onboardingStorage.getProgress();
    if (savedProgress) {
      setCurrentStep(savedProgress.currentStep);
      if (savedProgress.brandData) {
        setBrandData(savedProgress.brandData as BrandData);
      }
      if (savedProgress.productsData) {
        setProductsData(savedProgress.productsData as ProductData[]);
      }
    }
  }, []);

  // Auto-save progress
  React.useEffect(() => {
    onboardingStorage.saveProgress({
      currentStep,
      brandData,
      productsData,
    });
  }, [currentStep, brandData, productsData]);

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Create user (simplified - in real app would check auth)
      const userResponse = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "User",
          email: "user@brandforge.com",
        }),
      });

      if (!userResponse.ok) throw new Error("Failed to create user");
      const { user } = await userResponse.json();

      // Create brand first (without files)
      const brandResponse = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: brandData.name,
          description: brandData.description,
          industry: brandData.industry,
          primaryColor: brandData.primaryColor,
          secondaryColor: brandData.secondaryColor,
          websiteUrl: brandData.websiteUrl,
          googleMyBusinessUrl: brandData.googleMyBusinessUrl,
          socialMediaUrls: brandData.socialMediaUrls,
        }),
      });

      if (!brandResponse.ok) throw new Error("Failed to create brand");
      const { brand } = await brandResponse.json();

      // Upload logo if provided
      if (brandData.logoFile) {
        const formData = new FormData();
        formData.append("file", brandData.logoFile);
        formData.append("brandId", brand.id);
        formData.append("assetType", "logo");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const { filePath } = await uploadResponse.json();
          
          // Create asset record
          await fetch("/api/assets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              brandId: brand.id,
              name: "Logo",
              type: "logo",
              url: filePath,
            }),
          });
        }
      }

      // Upload branded assets if provided
      if (brandData.brandedAssets && brandData.brandedAssets.length > 0) {
        await Promise.all(
          brandData.brandedAssets.map(async (asset) => {
            const formData = new FormData();
            formData.append("file", asset.file);
            formData.append("brandId", brand.id);
            formData.append("assetType", "branded-asset");

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
                  brandId: brand.id,
                  name: asset.name || asset.file.name,
                  type: "branded-asset",
                  url: filePath,
                }),
              });
            }
          })
        );
      }

      // Upload reference images if provided
      if (brandData.referenceImages && brandData.referenceImages.length > 0) {
        await Promise.all(
          brandData.referenceImages.map(async (ref) => {
            const formData = new FormData();
            formData.append("file", ref.file);
            formData.append("brandId", brand.id);
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
                  brandId: brand.id,
                  name: ref.file.name,
                  type: "inspiration-image",
                  url: filePath,
                  notes: ref.url || undefined,
                }),
              });
            }
          })
        );
      }

      // Create products
      if (productsData.length > 0) {
        await Promise.all(
          productsData.map((product) =>
            fetch("/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                brandId: brand.id,
                name: product.name,
                description: product.description,
                category: product.category,
                tags: product.tags,
              }),
            })
          )
        );
      }

      // Clear saved progress
      onboardingStorage.clearProgress();

      // Redirect based on returnTo param or to brand dashboard
      if (returnTo === "brands") {
        router.push("/brands");
      } else {
        router.push(`/brands/${brand.id}`);
      }
    } catch (error) {
      console.error("Onboarding failed:", error);
      alert("Failed to complete onboarding. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return brandData.name.trim().length > 0 && brandData.industry.trim().length > 0;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Welcome to BrandForge</CardTitle>
                <CardDescription>Let&apos;s set up your brand in a few simple steps</CardDescription>
              </div>
              <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                {currentStep} of {STEPS.length}
              </div>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="space-y-2">
              <div className="relative">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-in-out rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              
              {/* Step Indicators */}
              <div className="flex items-center justify-between relative">
                {STEPS.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center flex-1">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                        ${currentStep > step.id 
                          ? "bg-primary text-primary-foreground" 
                          : currentStep === step.id 
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                            : "bg-muted text-muted-foreground"
                        }
                      `}>
                        {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                      </div>
                      <div className="text-center">
                        <div className={`text-xs font-medium ${
                          currentStep === step.id ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {step.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground hidden sm:block">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className="absolute top-4 h-0.5 bg-muted" style={{
                        left: `${(100 / STEPS.length) * (index + 0.5)}%`,
                        width: `${100 / STEPS.length}%`,
                        zIndex: -1
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="min-h-[400px]">
          {currentStep === 1 && <OnboardingBrandStep data={brandData} onChange={setBrandData} />}
          {currentStep === 2 && <OnboardingProductsStep data={productsData} onChange={setProductsData} />}
          {currentStep === 3 && <OnboardingSummaryStep brandData={brandData} productsData={productsData} />}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isLoading}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} disabled={!canProceed() || isLoading}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isLoading}>
              {isLoading ? "Creating..." : "Finish Setup"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
