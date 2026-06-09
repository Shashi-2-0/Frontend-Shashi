import type { CatalogCategoryTreeNode } from "@/lib/api/catalog.api";

export type TopMenuItem = {
  title: string;
  url: string;
};

export function getCategoryTreeArray(response: any): CatalogCategoryTreeNode[] {
  const data =
    response?.data?.data ||
    response?.data?.categories ||
    response?.data ||
    response?.categories ||
    [];

  return Array.isArray(data) ? data : [];
}

export function normalizeSlug(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "");
}

export function getCategoryPath(node?: CatalogCategoryTreeNode | null) {
  return String((node as any)?.path || node?.url || node?.slug || node?.seoSlug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
}

export function getCategorySlug(node?: CatalogCategoryTreeNode | null) {
  return String(node?.slug || node?.seoSlug || getCategoryPath(node) || "").trim();
}

export function getCategoryHref(node?: CatalogCategoryTreeNode | null) {
  if (!node) return "/collection";

  const backendUrl = String((node as any).url || "").trim();

  if (backendUrl) {
    return backendUrl.startsWith("/") ? backendUrl : `/${backendUrl}`;
  }

  const path = getCategoryPath(node);

  if (path) {
    return `/${path.replace(/^\/+|\/+$/g, "")}`;
  }

  const slug = getCategorySlug(node);

  if (slug) {
    return `/${slug}`;
  }

  return "/collection";
}

export function getCategoryDisplayUrl(node?: CatalogCategoryTreeNode | null) {
  return getCategoryHref(node);
}

export function findCategoryBySlug(
  nodes: CatalogCategoryTreeNode[],
  slug?: string | null,
): CatalogCategoryTreeNode | null {
  const target = normalizeSlug(slug);

  if (!target) return null;

  for (const node of nodes) {
    const nodeSlug = normalizeSlug(node.slug);
    const nodeSeoSlug = normalizeSlug(node.seoSlug);
    const nodePath = normalizeSlug((node as any).path);
    const nodeUrl = normalizeSlug((node as any).url);

    if (
      nodeSlug === target ||
      nodeSeoSlug === target ||
      nodePath === target ||
      nodeUrl === target
    ) {
      return node;
    }

    const found = findCategoryBySlug(node.children || [], target);

    if (found) return found;
  }

  return null;
}

export function findCategoryByPath(
  nodes: CatalogCategoryTreeNode[],
  path?: string | null,
): CatalogCategoryTreeNode | null {
  return findCategoryBySlug(nodes, path);
}

export function findParentCategory(
  nodes: CatalogCategoryTreeNode[],
  slug?: string | null,
  parent: CatalogCategoryTreeNode | null = null,
): CatalogCategoryTreeNode | null {
  const target = normalizeSlug(slug);

  if (!target) return null;

  for (const node of nodes) {
    const nodeSlug = normalizeSlug(node.slug);
    const nodeSeoSlug = normalizeSlug(node.seoSlug);
    const nodePath = normalizeSlug((node as any).path);
    const nodeUrl = normalizeSlug((node as any).url);

    if (
      nodeSlug === target ||
      nodeSeoSlug === target ||
      nodePath === target ||
      nodeUrl === target
    ) {
      return parent;
    }

    const found = findParentCategory(node.children || [], target, node);

    if (found) return found;
  }

  return null;
}

export function flattenCategories(
  nodes: CatalogCategoryTreeNode[],
  result: CatalogCategoryTreeNode[] = [],
) {
  nodes.forEach((node) => {
    result.push(node);

    if (node.children?.length) {
      flattenCategories(node.children, result);
    }
  });

  return result;
}

export function parseTopMenu(value: unknown): TopMenuItem[] {
  if (!value || typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        title: String(item?.title || "").trim(),
        url: String(item?.url || "").trim(),
      }))
      .filter((item) => item.title && item.url);
  } catch {
    return [];
  }
}

export function getCategoryImage(node?: CatalogCategoryTreeNode | null) {
  return (
    (node as any)?.imageUrl ||
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=900&auto=format&fit=crop"
  );
}

export function getFilterCategoryBase(
  tree: CatalogCategoryTreeNode[],
  selectedSlug?: string | null,
) {
  const selectedNode = findCategoryBySlug(tree, selectedSlug);
  const parentNode = findParentCategory(tree, selectedSlug);

  if (!selectedNode) {
    return {
      selectedNode: null,
      parentNode: null,
      baseNode: null,
      filterCategories: [],
    };
  }

  const baseNode = selectedNode.children?.length
    ? selectedNode
    : parentNode || selectedNode;

  return {
    selectedNode,
    parentNode,
    baseNode,
    filterCategories: baseNode?.children || [],
  };
}

export function getBreadcrumbItems(node?: CatalogCategoryTreeNode | null) {
  if (!node?.breadcrumb?.length) return [];

  return node.breadcrumb.map((item: any, index: number) => {
    if (typeof item === "string") {
      return {
        label: item,
        href: "",
        isLast: index === node.breadcrumb!.length - 1,
      };
    }

    return {
      label: String(item?.name || item?.label || item?.title || item?.slug || ""),
      href: item?.url || (item?.path ? `/${item.path}` : item?.slug ? `/${item.slug}` : ""),
      isLast: index === node.breadcrumb!.length - 1,
    };
  });
}

export function findFirstCategoryWithName(
  nodes: CatalogCategoryTreeNode[],
  name: string,
): CatalogCategoryTreeNode | null {
  const target = normalizeSlug(name);

  for (const node of nodes) {
    if (normalizeSlug(node.name) === target) {
      return node;
    }

    const found = findFirstCategoryWithName(node.children || [], name);

    if (found) return found;
  }

  return null;
}


export function normalizeCategoryLookupValue(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[_/]+/g, " ")
    .replace(/-+/g, " ")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findCategoryByCollectionValue(
  nodes: CatalogCategoryTreeNode[],
  value?: string | null,
): CatalogCategoryTreeNode | null {
  const target = normalizeCategoryLookupValue(value);

  if (!target) return null;

  for (const node of nodes) {
    const candidates = [
      node.name,
      node.slug,
      node.seoSlug,
      (node as any).path,
      (node as any).url,
      (node as any).title,
      (node as any).label,
      (node as any).handle,
    ];

    const matched = candidates.some((candidate) => {
      return normalizeCategoryLookupValue(candidate) === target;
    });

    if (matched) {
      return node;
    }

    const found = findCategoryByCollectionValue(node.children || [], value);

    if (found) return found;
  }

  return null;
}

export function buildCategoryHrefFromCollectionValue(
  nodes: CatalogCategoryTreeNode[],
  value?: string | null,
) {
  const category = findCategoryByCollectionValue(nodes, value);

  if (category) {
    return getCategoryHref(category);
  }

  return "";
}