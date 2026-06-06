"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { CategoryListingPage } from "@/components/catalog/CategoryListingPage";
import { ScopedProductDetailPage } from "@/components/catalog/ScopedProductDetailPage";
import {
  getCatalogCategoryTree,
  type CatalogCategoryTreeNode,
} from "@/lib/api/catalog.api";
import {
  findCategoryBySlug,
  getCategoryTreeArray,
} from "@/lib/category-tree.utils";

function DynamicCatalogPathContent() {
  const params = useParams();

  const segments = useMemo(() => {
    const rawPath = (params as any)?.categoryPath;

    if (Array.isArray(rawPath)) {
      return rawPath.map(String).filter(Boolean);
    }

    const value = String(rawPath || "").replace(/^\/+|\/+$/g, "");

    return value ? value.split("/").filter(Boolean) : [];
  }, [params]);

  const fullPath = segments.join("/");

  const [categoryTree, setCategoryTree] = useState<CatalogCategoryTreeNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(true);
  const [treeError, setTreeError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadTree() {
      try {
        setTreeLoading(true);
        setTreeError("");

        const response = await getCatalogCategoryTree();
        const tree = getCategoryTreeArray(response);

        if (!mounted) return;

        setCategoryTree(tree);
      } catch (error: any) {
        console.error("Dynamic route category tree load failed:", error);

        if (!mounted) return;

        setCategoryTree([]);
        setTreeError(error?.message || "Category tree load failed.");
      } finally {
        if (mounted) setTreeLoading(false);
      }
    }

    loadTree();

    return () => {
      mounted = false;
    };
  }, []);

  if (treeLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbf8f1] text-[#15100c]">
        <p className="text-sm text-[#6d6760]">Loading category route...</p>
      </main>
    );
  }

  if (treeError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbf8f1] px-6 text-[#15100c]">
        <div className="max-w-xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
          <p className="font-semibold">Backend category tree error</p>
          <p>{treeError}</p>
        </div>
      </main>
    );
  }

  const exactCategory = findCategoryBySlug(categoryTree, fullPath);

  if (exactCategory) {
    return <CategoryListingPage categoryPath={fullPath} />;
  }

  const productSlugOrId = segments[segments.length - 1] || "";
  const productCategoryPath = segments.slice(0, -1).join("/");

  return (
    <ScopedProductDetailPage
      categoryPath={productCategoryPath}
      productId={productSlugOrId}
    />
  );
}

export default function DynamicCatalogPathPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#fbf8f1] text-[#15100c]">
          <p className="text-sm text-[#6d6760]">Loading catalog...</p>
        </main>
      }
    >
      <DynamicCatalogPathContent />
    </Suspense>
  );
}