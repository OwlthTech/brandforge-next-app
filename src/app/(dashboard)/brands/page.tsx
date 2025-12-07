"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState, EmptyState } from "@/components/common";
import { Plus, Palette, Package } from "lucide-react";
import type { Brand } from "@/lib/db/schema";

export default function BrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    industry: "",
    primaryColor: "#0066cc",
    secondaryColor: "#ff6600",
  });

  React.useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      // For now, using first user. In real app, get from auth context
      const usersResponse = await fetch("/api/users");
      const { users } = await usersResponse.json();
      
      if (users.length === 0) {
        setIsLoading(false);
        return;
      }

      const brandsResponse = await fetch(`/api/brands?userId=${users[0].id}`);
      const { brands: fetchedBrands } = await brandsResponse.json();
      setBrands(fetchedBrands);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Get or create user
      let userId;
      const usersResponse = await fetch("/api/users");
      const { users } = await usersResponse.json();

      if (users.length === 0) {
        const createUserResponse = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "User", email: "user@brandforge.com" }),
        });
        const { user } = await createUserResponse.json();
        userId = user.id;
      } else {
        userId = users[0].id;
      }

      // Create brand
      const response = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error("Failed to create brand");

      const { brand } = await response.json();
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        industry: "",
        primaryColor: "#0066cc",
        secondaryColor: "#ff6600",
      });
      
      setIsDialogOpen(false);
      
      // Navigate to new brand dashboard
      router.push(`/brands/${brand.id}`);
    } catch (error) {
      console.error("Failed to create brand:", error);
      alert("Failed to create brand. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const breadcrumbs = [{ label: "Brands" }];

  if (isLoading) {
    return (
      <AppShell breadcrumbs={breadcrumbs}>
        <LoadingState message="Loading your brands..." />
      </AppShell>
    );
  }

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Brands</h1>
          <p className="text-muted-foreground">
            Manage your brands and create consistent design assets
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Brand</DialogTitle>
              <DialogDescription>
                Add a new brand to your workspace
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBrand} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Acme Corporation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your brand..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g., Technology, Fashion, Food"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Brand"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {brands.length === 0 ? (
        <EmptyState
          title="No brands yet"
          description="Create your first brand to start managing products and generating design assets"
          icon={Palette}
          action={{
            label: "Create Your First Brand",
            onClick: () => setIsDialogOpen(true),
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/brands/${brand.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: brand.primaryColor || "#0066cc" }}
                      >
                        <Palette className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="line-clamp-1">{brand.name}</CardTitle>
                        {brand.industry && (
                          <CardDescription className="text-xs mt-1">
                            {brand.industry}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {brand.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {brand.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>View products & assets</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
