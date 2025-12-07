"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Brand {
  id: string;
  name: string;
}

interface BrandSwitcherProps {
  brands: Brand[];
  currentBrandId?: string;
  onBrandChange?: (brandId: string) => void;
}

export function BrandSwitcher({
  brands,
  currentBrandId,
  onBrandChange,
}: BrandSwitcherProps) {
  const router = useRouter();

  const currentBrand = brands.find((b) => b.id === currentBrandId);

  const handleBrandChange = (brandId: string) => {
    if (onBrandChange) {
      onBrandChange(brandId);
    } else {
      // Default behavior: navigate to brand dashboard
      router.push(`/brands/${brandId}`);
    }
  };

  const handleCreateNew = () => {
    router.push("/brands/new");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[200px] justify-between"
        >
          {currentBrand ? currentBrand.name : "Select brand..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" align="start">
        <DropdownMenuLabel>Your Brands</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {brands.map((brand) => (
          <DropdownMenuItem
            key={brand.id}
            onSelect={() => handleBrandChange(brand.id)}
          >
            <Check
              className={`mr-2 h-4 w-4 ${
                currentBrandId === brand.id ? "opacity-100" : "opacity-0"
              }`}
            />
            {brand.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Brand
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
