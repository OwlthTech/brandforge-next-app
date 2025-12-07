"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <main className="max-w-2xl w-full">
        <Card className="p-8 mb-8 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to BrandForge
          </h1>
          <p className="text-xl mb-6 text-gray-200">
            Manage your brands, products, and design assets in one place.
          </p>
          <p className="text-gray-400 max-w-lg mx-auto">
            BrandForge helps you create consistent brand guidelines, design briefs, and manage your visual assets effortlessly.
          </p>
        </Card>

        <div className="flex gap-4 justify-center mb-8">
          <Button asChild size="lg">
            <a href="/onboarding">Get Started</a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="/brands">View Brands</a>
          </Button>
        </div>
      </main>
    </div>
  );
}
