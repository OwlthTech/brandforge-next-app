"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Trash2, Filter, Search } from "lucide-react";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnailUrl?: string;
};

interface ProductsDataTableProps {
  products: Product[];
  onDelete?: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onProductClick?: (id: string) => void;
}

export function ProductsDataTable({
  products,
  onDelete,
  onBulkDelete,
  onProductClick,
}: ProductsDataTableProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string[]>([]);
  const [tagFilter, setTagFilter] = React.useState<string[]>([]);

  // Get unique categories and tags
  const allCategories = React.useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }, [products]);

  const allTags = React.useMemo(() => {
    return Array.from(new Set(products.flatMap((p) => p.tags || [])));
  }, [products]);

  // Filter products
  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        categoryFilter.length === 0 || categoryFilter.includes(product.category);

      // Tag filter
      const matchesTags =
        tagFilter.length === 0 ||
        tagFilter.some((tag) => product.tags?.includes(tag));

      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [products, searchQuery, categoryFilter, tagFilter]);

  const allSelected =
    filteredProducts.length > 0 && selectedIds.size === filteredProducts.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size > 0 && onBulkDelete) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleCategoryFilterChange = (category: string) => {
    setCategoryFilter((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleTagFilterChange = (tag: string) => {
    setTagFilter((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter([]);
    setTagFilter([]);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Filter */}
          {allCategories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Category
                  {categoryFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {categoryFilter.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allCategories.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={categoryFilter.includes(category)}
                    onCheckedChange={() => handleCategoryFilterChange(category)}
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Tags
                  {tagFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {tagFilter.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={tagFilter.includes(tag)}
                    onCheckedChange={() => handleTagFilterChange(tag)}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Clear Filters */}
          {(searchQuery || categoryFilter.length > 0 || tagFilter.length > 0) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={someSelected ? "opacity-50" : ""}
                />
              </TableHead>
              <TableHead className="w-20">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="text-muted-foreground">
                    {products.length === 0
                      ? "No products yet"
                      : "No products match your filters"}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onProductClick?.(product.id)}
                >
                  <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(product.id)}
                      onCheckedChange={() => handleSelectOne(product.id)}
                      aria-label={`Select ${product.name}`}
                    />
                  </TableCell>
                  <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    {product.thumbnailUrl ? (
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                        <Image
                          src={product.thumbnailUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {product.category && (
                      <Badge variant="outline">{product.category}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {product.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {(product.tags?.length || 0) > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{(product.tags?.length || 0) - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onProductClick?.(product.id)}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDelete?.(product.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results info */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  );
}
