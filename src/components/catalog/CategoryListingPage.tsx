"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";

import { filterPublicVisibleProducts } from "@/lib/product-visibility";
import SiteHeader from "@/components/SiteHeader";

import { addToCart } from "@/lib/api/cart.api";

import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Download,
  Eye,
  Heart,
  Layers,
  Loader2,
  Lock,
  Mail,
  Menu,
  Palette,
  RefreshCcw,
  Ruler,
  Scissors,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  WandSparkles,
  XCircle,
} from "lucide-react";

import {
  CatalogProduct,
  CatalogColorStory,
  CatalogCategoryFaq,
  CatalogCategoryFaqSection,
  CatalogCategoryTreeNode,
  getCatalogCategoryTree,
  getCatalogColorStories,
  getCatalogFilteredProducts,
  getCatalogProducts,
  unwrapCatalogProducts,
} from "@/lib/api/catalog.api";

import {
  findCategoryBySlug,
  getCategoryHref,
  getCategorySlug,
  getCategoryTreeArray,
  getFilterCategoryBase,
} from "@/lib/category-tree.utils";

import { assignDressToMember } from "@/lib/api/bridalParty.api";

const img = {
  blackWrap:
    "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=900&auto=format&fit=crop",
  champagne:
    "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=900&auto=format&fit=crop",
  sage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop",
  blackDress:
    "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=900&auto=format&fit=crop",
  blue: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=900&auto=format&fit=crop",
  navy: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop",
  bride:
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=900&auto=format&fit=crop",
  plus: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=900&auto=format&fit=crop",
  insta1:
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop",
  insta2:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop",
  insta3:
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop",
  insta4:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop",
  insta5:
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=600&auto=format&fit=crop",
};

const colorFilters = [
  { name: "Sage", color: "#a8b99f" },
  { name: "Dusty Blue", color: "#9fb8cf" },
  { name: "Champagne", color: "#e6d7bd" },
  { name: "Emerald", color: "#185f49" },
  { name: "Olive", color: "#58633f" },
  { name: "Terracotta", color: "#c96b4e" },
  { name: "Blush", color: "#eac3c9" },
  { name: "Mauve", color: "#af7d93" },
  { name: "Navy", color: "#192342" },
  { name: "Black", color: "#080808" },
  { name: "Neutral", color: "#dfcfaa" },
  { name: "Floral", color: "#ddb956" },
];

const actionButtonClass =
  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(23,17,13,0.18)] active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

const fadeUpClass =
  "animate-[fadeUpPremium_850ms_cubic-bezier(0.22,1,0.36,1)_both]";

const softScaleClass =
  "animate-[softScaleIn_900ms_cubic-bezier(0.22,1,0.36,1)_both]";

function getStaggerStyle(index: number, base = 80) {
  return {
    animationDelay: `${index * base}ms`,
  };
}

type CatalogFilters = {
  color: string;
  colorStory: string;
  sizeLabel: string;
  height: string;
  dressLength: string;
  fabric: string;
  style: string;
  neckline: string;
  sleeveLength: string;
  occasion: string;
  productionType: string;
  minPrice: string;
  maxPrice: string;
};

const emptyCatalogFilters: CatalogFilters = {
  color: "",
  colorStory: "",
  sizeLabel: "",
  height: "",
  dressLength: "",
  fabric: "",
  style: "",
  neckline: "",
  sleeveLength: "",
  occasion: "",
  productionType: "",
  minPrice: "",
  maxPrice: "",
};

type CatalogHeightOption = {
  label?: string;
  value?: string;
  group?: string;
  sortOrder?: number;
  productCount?: number;
};

function unwrapCatalogHeightOptions(response: any): CatalogHeightOption[] {
  const options =
    response?.data?.heightOptions ||
    response?.heightOptions ||
    response?.data?.data?.heightOptions ||
    response?.data?.filters?.heightOptions ||
    response?.filters?.heightOptions ||
    [];

  return Array.isArray(options) ? options : [];
}

function getBackendFiltersFromResponse(response: any) {
  return (
    response?.data?.filters ||
    response?.filters ||
    response?.data?.data?.filters ||
    null
  );
}

function getHeightOptionValue(option: CatalogHeightOption | string) {
  if (typeof option === "string") return option.trim();
  return String(option?.value || option?.label || "").trim();
}

function getHeightOptionLabel(option: CatalogHeightOption | string) {
  if (typeof option === "string") return option.trim();
  return String(option?.label || option?.value || "").trim();
}

function getHeightOptionGroup(option: CatalogHeightOption | string) {
  if (typeof option === "string") return "Height";
  return String(option?.group || "Height").trim();
}

function sortHeightOptions<T extends CatalogHeightOption | string>(options: T[]) {
  return [...options].sort((a: any, b: any) => {
    const sortA = typeof a === "string" ? 999 : Number(a?.sortOrder || 999);
    const sortB = typeof b === "string" ? 999 : Number(b?.sortOrder || 999);

    if (sortA !== sortB) return sortA - sortB;

    return getHeightOptionLabel(a).localeCompare(getHeightOptionLabel(b), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
}

function isVariantAvailableForSelection(variant: CatalogVariantForCard) {
  const status = String(
    variant?.status ||
      variant?.availabilityStatus ||
      variant?.inventoryStatus ||
      "",
  ).toLowerCase();

  return (
    variant?.isActive !== false &&
    variant?.available !== false &&
    variant?.isAvailable !== false &&
    Number(variant?.stock ?? 0) > 0 &&
    !status.includes("out") &&
    !status.includes("sold")
  );
}

type CatalogCardMedia = {
  id?: string;
  url: string;
  alt?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  viewType?: string;
  format?: string;
  mimeType?: string;
  mediaType: "image" | "video";
};

type BridesmaidProduct = {
  id: string;
  productId: string;
  variantId: string;
  tag: string;
  name: string;
  price: string;
  fabric: string;
  colorName: string;
  image: string;
  media: CatalogCardMedia | null;
  swatches: string[];
  heights?: string[];
  variants: CatalogVariantForCard[];
  raw: CatalogProduct;
};

type AddWorkspaceSelection = {
  variantId?: string;
  size?: string;
  color?: string;
  height?: string;
};

type CatalogVariantForCard = {
  id?: string;
  variantId?: string;
  color?: string;
  colorHex?: string;
  size?: string;
  height?: string;
  price?: number | string;
  stock?: number;
  available?: boolean;
  isAvailable?: boolean;
  isActive?: boolean;
  status?: string;
  availabilityStatus?: string;
  inventoryStatus?: string;
};

const IMAGE_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
  "svg",
  "bmp",
  "tiff",
  "tif",
  "ico",
  "heic",
  "heif",
];

const VIDEO_FORMATS = [
  "mp4",
  "webm",
  "mov",
  "m4v",
  "avi",
  "mkv",
  "wmv",
  "flv",
  "mpeg",
  "mpg",
  "3gp",
  "3g2",
  "ogv",
  "m3u8",
];

function getUrlExtension(url?: string) {
  const cleanUrl = String(url || "").split("?")[0].split("#")[0];
  const lastPart = cleanUrl.split("/").pop() || "";

  if (!lastPart.includes(".")) return "";

  return String(lastPart.split(".").pop() || "").toLowerCase();
}

function detectCatalogMediaType(item: any, url: string): "image" | "video" {
  const viewType = String(
    item?.viewType || item?.type || item?.mediaType || "",
  )
    .toLowerCase()
    .trim();

  const mimeType = String(item?.mimeType || item?.contentType || "")
    .toLowerCase()
    .trim();

  const format = String(item?.format || "")
    .toLowerCase()
    .replace("image/", "")
    .replace("video/", "")
    .trim();

  const extension = getUrlExtension(url);
  const lowerUrl = String(url || "").toLowerCase();

  if (
    viewType.includes("video") ||
    mimeType.includes("video") ||
    lowerUrl.includes("/video/upload/") ||
    VIDEO_FORMATS.includes(format) ||
    VIDEO_FORMATS.includes(extension)
  ) {
    return "video";
  }

  return "image";
}

function getCatalogCardMedia(product: CatalogProduct): CatalogCardMedia | null {
  const mediaItems: CatalogCardMedia[] = [];

  if (Array.isArray(product.images)) {
    product.images.forEach((item: any, index: number) => {
      if (typeof item === "string") {
        const url = String(item || "").trim();

        if (!url) return;

        const mediaType = detectCatalogMediaType({}, url);

        mediaItems.push({
          url,
          alt: product.title || product.name || "Product media",
          sortOrder: index,
          isPrimary: index === 0,
          viewType: mediaType,
          format: getUrlExtension(url),
          mediaType,
        });

        return;
      }

      const url = String(
        item?.url || item?.secureUrl || item?.src || item?.imageUrl || item?.path || "",
      ).trim();

      if (!url) return;

      const mediaType = detectCatalogMediaType(item, url);

      mediaItems.push({
        id: String(item?.id || ""),
        url,
        alt:
          item?.alt ||
          item?.altText ||
          item?.title ||
          product.title ||
          product.name ||
          "Product media",
        sortOrder: Number(item?.position ?? item?.sortOrder ?? item?.order ?? index),
        isPrimary: Boolean(item?.isPrimary),
        viewType: item?.viewType || mediaType,
        format: item?.format || getUrlExtension(url),
        mimeType: item?.mimeType || item?.contentType || "",
        mediaType,
      });
    });
  }

  const unique = new Map<string, CatalogCardMedia>();

mediaItems
  .filter((item) => item.url)
  .sort((a, b) => {
    const sortA = Number(a.sortOrder ?? 999);
    const sortB = Number(b.sortOrder ?? 999);

    if (sortA !== sortB) return sortA - sortB;

    return String(a.url).localeCompare(String(b.url));
  })
  .forEach((item) => {
    if (!unique.has(item.url)) {
      unique.set(item.url, item);
    }
  });

  const firstMedia = Array.from(unique.values())[0];

  if (firstMedia) return firstMedia;

  const fallbackUrl =
    product.imageUrl || product.image || product.thumbnail || "";

  if (!fallbackUrl) return null;

  return {
    url: fallbackUrl,
    alt: product.title || product.name || "Product media",
    sortOrder: 0,
    isPrimary: true,
    viewType: detectCatalogMediaType({}, fallbackUrl),
    format: getUrlExtension(fallbackUrl),
    mediaType: detectCatalogMediaType({}, fallbackUrl),
  };
}

function getImageFromCatalog(product: CatalogProduct) {
  return getCatalogCardMedia(product)?.url || "";
}

function isHexColor(value?: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(
    String(value || "").trim(),
  );
}

function normalizeColorValue(color?: string) {
  const value = String(color || "").trim();
  return isHexColor(value) ? value : "";
}

function getCatalogVariants(product: CatalogProduct): CatalogVariantForCard[] {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const inventory = Array.isArray(product.inventory) ? product.inventory : [];

  return [...variants, ...inventory];
}

function getPrimaryVariantFromCatalog(product: CatalogProduct) {
  const variants = getCatalogVariants(product);
  return variants[0] || null;
}

function getPriceFromCatalog(product: CatalogProduct) {
  const firstVariant = getPrimaryVariantFromCatalog(product);

  const price =
    product.price ||
    product.listingPrice ||
    product.rentalPrice ||
    product.resalePrice ||
    product.rentPrice ||
    firstVariant?.price ||
    "";

  if (price === "" || price === null || price === undefined) return "";

  const numeric = Number(price);

  if (!Number.isNaN(numeric)) {
    return `$${numeric}`;
  }

  return String(price);
}

function getProductIdFromCatalog(product: CatalogProduct) {
  return String(product.id || product.productId || "");
}

function getVariantIdFromCatalog(product: CatalogProduct) {
  const variant = getPrimaryVariantFromCatalog(product);
  return String(variant?.id || variant?.variantId || "");
}

function getVariantIdValue(variant?: CatalogVariantForCard | null) {
  return String(variant?.id || variant?.variantId || "");
}

function normalizeCompare(value?: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function findMatchingVariant(
  product: BridesmaidProduct,
  selectedSize?: string,
  selectedColor?: string,
) {
  const variants = product.variants || [];

  if (!variants.length) return null;

  const size = normalizeCompare(selectedSize);
  const color = normalizeCompare(selectedColor);
  const colorHex = normalizeColorValue(selectedColor);

  const exactMatch = variants.find((variant) => {
    const variantSize = normalizeCompare(variant.size);
    const variantColor = normalizeCompare(variant.color);
    const variantColorHex = normalizeColorValue(variant.color);

    const sizeOk = size ? variantSize === size : true;
    const colorOk = color
      ? variantColor === color || variantColorHex === colorHex
      : true;

    return sizeOk && colorOk && getVariantIdValue(variant);
  });

  if (exactMatch) return exactMatch;

  const sizeMatch = variants.find((variant) => {
    return (
      size &&
      normalizeCompare(variant.size) === size &&
      getVariantIdValue(variant)
    );
  });

  if (sizeMatch) return sizeMatch;

  const colorMatch = variants.find((variant) => {
    const variantColor = normalizeCompare(variant.color);
    const variantColorHex = normalizeColorValue(variant.color);

    return (
      color &&
      (variantColor === color || variantColorHex === colorHex) &&
      getVariantIdValue(variant)
    );
  });

  if (colorMatch) return colorMatch;

  return variants.find((variant) => getVariantIdValue(variant)) || null;
}

function readBackendColorName(item: any) {
  if (!item) return "";
  if (typeof item === "string") return item;

  return String(item.name || item.label || item.value || "").trim();
}

function readBackendColorHex(item: any) {
  if (!item) return "";

  if (typeof item === "string") {
    return normalizeColorValue(item);
  }

  return (
    normalizeColorValue(item.hex) ||
    normalizeColorValue(item.colorHex) ||
    normalizeColorValue(item.value)
  );
}

function getBackendColorNames(product: CatalogProduct) {
  const names: string[] = [];

  if (Array.isArray(product.colors)) {
    product.colors.forEach((item) => {
      const name = readBackendColorName(item);
      if (name && !isHexColor(name)) names.push(name);
    });
  }

  getCatalogVariants(product).forEach((variant) => {
    if (variant.color) names.push(String(variant.color));
  });

  if (product.color) names.push(String(product.color));
  if (product.primaryColor) names.push(String(product.primaryColor));
  if (product.secondaryColor) names.push(String(product.secondaryColor));
  if (product.variantColor) names.push(String(product.variantColor));

  return Array.from(new Set(names.filter(Boolean)));
}

function getSwatchesFromCatalog(product: CatalogProduct) {
  const swatches: string[] = [];

  if (Array.isArray(product.colors)) {
    product.colors.forEach((item) => {
      const hex = readBackendColorHex(item);
      if (hex) swatches.push(hex);
    });
  }

  getCatalogVariants(product).forEach((variant) => {
    const hex = normalizeColorValue((variant as any).colorHex);
    if (hex) swatches.push(hex);
  });

  const unique = Array.from(new Set(swatches.filter(Boolean)));
  return unique.slice(0, 5);
}

function getBackendSizes(product: CatalogProduct) {
  const sizes: string[] = [];

  getCatalogVariants(product).forEach((variant) => {
    if (variant.size) sizes.push(String(variant.size));
  });

  const rawSizes = (product as any).sizes;

  if (Array.isArray(rawSizes)) {
    rawSizes.forEach((item) => {
      if (typeof item === "string") {
        sizes.push(item);
      } else if (item?.label || item?.size || item?.name) {
        sizes.push(String(item.label || item.size || item.name));
      }
    });
  }

  return Array.from(new Set(sizes.filter(Boolean)));
}

function sortBackendSizes(sizes: string[]) {
  const sizeOrder = [
    "XXS",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "1X",
    "2X",
    "3X",
    "4X",
    "PLUS SIZE",
    "MATERNITY",
    "CUSTOM",
  ];

  return [...sizes].sort((a, b) => {
    const cleanA = String(a).trim().toUpperCase();
    const cleanB = String(b).trim().toUpperCase();

    const indexA = sizeOrder.indexOf(cleanA);
    const indexB = sizeOrder.indexOf(cleanB);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return cleanA.localeCompare(cleanB, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
}

function normalizeUniqueValues(values: string[]) {
  return Array.from(
    new Set(values.map((value) => String(value || "").trim()).filter(Boolean)),
  );
}

function getDynamicFilterOptions(products: BridesmaidProduct[]) {
  const sizeSet: string[] = [];
  const heightSet: string[] = [];
  const colorMap = new Map<string, { name: string; color: string }>();
  const fabricSet: string[] = [];
  const lengthSet: string[] = [];
  const productionSet: string[] = [];

  products.forEach((product) => {
    getBackendSizes(product.raw).forEach((size) => {
      sizeSet.push(size);
    });

    if (Array.isArray((product.raw as any).colors)) {
      (product.raw as any).colors.forEach((item: any) => {
        const name = readBackendColorName(item);
        const hex = readBackendColorHex(item);

        if (name) {
          colorMap.set(name, {
            name,
            color: hex || "#ddd5c9",
          });
        }
      });
    }

    getCatalogVariants(product.raw).forEach((variant: any) => {
      if (variant.color) {
        colorMap.set(String(variant.color), {
          name: String(variant.color),
          color: normalizeColorValue(variant.colorHex) || "#ddd5c9",
        });
      }

      if (variant.height) {
        heightSet.push(String(variant.height));
      }

      if (variant.productionType) {
        productionSet.push(String(variant.productionType));
      }
    });

    const rawHeights =
      (product.raw as any).heights || (product.raw as any).heightOptions;

    if (Array.isArray(rawHeights)) {
      rawHeights.forEach((item: any) => {
        if (typeof item === "string") {
          heightSet.push(item);
        } else if (item?.label || item?.height || item?.name) {
          heightSet.push(String(item.label || item.height || item.name));
        }
      });
    }

    const rawColor =
      product.raw.color || product.raw.primaryColor || product.raw.variantColor;

    if (rawColor) {
      colorMap.set(String(rawColor), {
        name: String(rawColor),
        color: product.swatches[0] || "#ddd5c9",
      });
    }

    if (product.fabric) {
      fabricSet.push(product.fabric);
    }

    if ((product.raw as any).material) {
      fabricSet.push(String((product.raw as any).material));
    }

    if ((product.raw as any).silhouette) {
      lengthSet.push(String((product.raw as any).silhouette));
    }
  });

  return {
    sizes: sortBackendSizes(normalizeUniqueValues(sizeSet)),
    heights: normalizeUniqueValues(heightSet),
    colors: Array.from(colorMap.values()).filter((item) => item.name),
    fabric: normalizeUniqueValues(fabricSet),
    dressLength: normalizeUniqueValues(lengthSet),
    productionType: normalizeUniqueValues(productionSet),
  };
}

function mapCatalogProductToCard(
  product: CatalogProduct,
): BridesmaidProduct | null {
  const productId = getProductIdFromCatalog(product);
  const variantId = getVariantIdFromCatalog(product);

  if (!productId) return null;

  const firstVariant = getPrimaryVariantFromCatalog(product);
  const backendColorNames = getBackendColorNames(product);

  const primaryMedia = getCatalogCardMedia(product);

return {
  id: productId,
  productId,
  variantId,
  tag: product.category || product.productType || product.type || "",
  name: product.title || product.name || "",
  price: getPriceFromCatalog(product),
  fabric: product.fabric || product.material || "",
  colorName: firstVariant?.color || backendColorNames[0] || "",
  image: primaryMedia?.url || "",
  media: primaryMedia,
  swatches: getSwatchesFromCatalog(product),
  variants: getCatalogVariants(product),
  raw: product,
};
}

function getProductDetailHref(
  product: BridesmaidProduct,
  categoryPath: string,
) {
  const cleanCategoryPath = String(categoryPath || "")
    .replace(/^\/+|\/+$/g, "")
    .trim();

  const productSlugOrId = String(
    (product.raw as any)?.slug || product.productId || "",
  ).trim();

  if (!cleanCategoryPath || !productSlugOrId) {
    return "#";
  }

  return `/${cleanCategoryPath}/${encodeURIComponent(productSlugOrId)}`;
}

function getCatalogPaginationMeta(response: any, fallbackCount: number) {
  const data = response?.data || {};
  const pagination = data?.pagination || {};

  const total = Number(data?.total ?? pagination?.total ?? fallbackCount);
  const page = Number(data?.page ?? pagination?.page ?? 1);
  const limit = Number(data?.limit ?? pagination?.limit ?? 12);
  const totalPages = Number(
    data?.totalPages ??
      pagination?.totalPages ??
      Math.max(1, Math.ceil(total / limit)),
  );

  return {
    total,
    page,
    limit,
    totalPages,
  };
}



export function CategoryListingPage({
  categoryPath,
}: {
  categoryPath: string;
}) {
  const PRODUCTS_PER_PAGE = 12;

  const selectedCategoryPath = String(categoryPath || "")
    .replace(/^\/+|\/+$/g, "")
    .trim();

  const selectedCategorySlug =
    selectedCategoryPath.split("/").filter(Boolean).pop() || "";

  const [categoryTree, setCategoryTree] = useState<CatalogCategoryTreeNode[]>(
    [],
  );

  const [faqSection, setFaqSection] =
    useState<CatalogCategoryFaqSection | null>(null);
  const [categoryFaqs, setCategoryFaqs] = useState<CatalogCategoryFaq[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqError, setFaqError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [catalogFilters, setCatalogFilters] =
    useState<CatalogFilters>(emptyCatalogFilters);
  const [catalogSort, setCatalogSort] = useState("featured");

  const [catalogProducts, setCatalogProducts] = useState<BridesmaidProduct[]>(
    [],
  );

  const [backendFilters, setBackendFilters] = useState<any>(null);
  const [heightOptions, setHeightOptions] = useState<CatalogHeightOption[]>([]);

  const [catalogTotal, setCatalogTotal] = useState(0);
  const [catalogTotalPages, setCatalogTotalPages] = useState(1);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  const [workspaceMessage, setWorkspaceMessage] = useState("");
  const [workspaceError, setWorkspaceError] = useState("");
  const [assignedProductId, setAssignedProductId] = useState("");

const selectedCategory = useMemo(() => {
  if (!selectedCategoryPath) return null;

  return findCategoryBySlug(categoryTree, selectedCategoryPath) || null;
}, [categoryTree, selectedCategoryPath]);

const categoryResolveError = useMemo(() => {
  if (!selectedCategoryPath) {
    return "Category path missing hai. Backend category URL/path required hai.";
  }

  if (!categoryTree.length) return "";

  if (!selectedCategory) {
    return `Backend category tree me "${selectedCategoryPath}" category nahi mili. Admin panel me category path/url check karo.`;
  }

  return "";
}, [categoryTree.length, selectedCategory, selectedCategoryPath]);

  const catalogFilterKey = useMemo(
    () => JSON.stringify(catalogFilters),
    [catalogFilters],
  );

  useEffect(() => {
    let mounted = true;

    async function loadRealCatalog() {
      try {
        setCatalogLoading(true);
        setCatalogError("");

        if (!selectedCategoryPath) {
  setCatalogProducts([]);
  setBackendFilters(null);
  setHeightOptions([]);
  setCatalogTotal(0);
  setCatalogTotalPages(1);
  setCatalogError("Category path missing hai. Backend category URL/path required hai.");
  setCatalogLoading(false);
  return;
}

if (categoryTree.length && !selectedCategory) {
  setCatalogProducts([]);
  setBackendFilters(null);
  setHeightOptions([]);
  setCatalogTotal(0);
  setCatalogTotalPages(1);
  setCatalogError(
    `Backend category tree me "${selectedCategoryPath}" category nahi mili. Admin panel me category create/path/url check karo.`,
  );
  setCatalogLoading(false);
  return;
}

        const hasActiveFilters = Object.values(catalogFilters).some((value) => {
          return (
            value !== undefined && value !== null && String(value).trim() !== ""
          );
        });

 const commonQuery = {
  categoryPath: selectedCategoryPath,
  page: currentPage,
  limit: PRODUCTS_PER_PAGE,
  sort: catalogSort,
};

        const response = hasActiveFilters
          ? await getCatalogFilteredProducts({
              ...commonQuery,
              ...catalogFilters,
            })
          : await getCatalogProducts(commonQuery);

        const responseFilters = getBackendFiltersFromResponse(response);
        const responseHeightOptions = unwrapCatalogHeightOptions(response);
        const rawProducts = unwrapCatalogProducts(response);
        const visibleRawProducts = filterPublicVisibleProducts(rawProducts);
        const pagination = getCatalogPaginationMeta(
          response,
          visibleRawProducts.length,
        );

        const mapped = visibleRawProducts
          .map(mapCatalogProductToCard)
          .filter(Boolean) as BridesmaidProduct[];

        if (!mounted) return;

        setCatalogProducts(mapped);
        setBackendFilters(responseFilters);
        setHeightOptions(
          responseHeightOptions
            .filter((item) => item?.value || item?.label)
            .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)),
        );
        setCatalogTotal(pagination.total);
        setCatalogTotalPages(pagination.totalPages);
      } catch (error: any) {
        console.error("Real catalog load failed:", error);

        if (!mounted) return;

        setCatalogProducts([]);
        setBackendFilters(null);
        setHeightOptions([]);
        setCatalogTotal(0);
        setCatalogTotalPages(1);
        setCatalogError(error?.message || "Catalog load failed");
      } finally {
        if (mounted) {
          setCatalogLoading(false);
        }
      }
    }

    loadRealCatalog();

    return () => {
      mounted = false;
    };
  }, [
  catalogFilterKey,
  currentPage,
  catalogSort,
  selectedCategoryPath,
  selectedCategory,
  categoryTree.length,
]);

  useEffect(() => {
  setCurrentPage(1);
}, [catalogFilterKey, catalogSort, selectedCategoryPath]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedProductId = localStorage.getItem("bridalLastAssignedProductId");

    if (savedProductId) {
      setAssignedProductId(savedProductId);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadCategoryTree() {
      try {
        setFaqLoading(true);
        setFaqError("");

        const response = await getCatalogCategoryTree();
        const categories = getCategoryTreeArray(response);

        if (!mounted) return;

        setCategoryTree(categories);
      } catch (error: any) {
        console.error("Category tree load failed:", error);

        if (!mounted) return;

        setCategoryTree([]);
        setFaqSection(null);
        setCategoryFaqs([]);
        setFaqError(error?.message || "Category tree load failed");
      } finally {
        if (mounted) {
          setFaqLoading(false);
        }
      }
    }

    loadCategoryTree();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setFaqSection((selectedCategory as any)?.faqSection || null);
    setCategoryFaqs(
      Array.isArray(selectedCategory?.faqs) ? selectedCategory.faqs : [],
    );
  }, [selectedCategory]);

  const filteredProducts = catalogProducts;
  const totalProducts = catalogTotal || filteredProducts.length;
  const totalPages = Math.max(1, catalogTotalPages || 1);
  const paginatedProducts = filteredProducts;

const dynamicFilterOptions = useMemo(() => {
  const backendSizes = Array.isArray(backendFilters?.sizes)
    ? backendFilters.sizes
        .map((item: any) =>
          typeof item === "string"
            ? item
            : item?.value || item?.label || item?.name,
        )
        .filter(Boolean)
    : [];

  const backendFilterHeights = Array.isArray(backendFilters?.heights)
    ? backendFilters.heights.filter(
        (item: any) => typeof item === "string" || item?.value || item?.label,
      )
    : [];

  const masterHeightOptions = Array.isArray(heightOptions)
    ? heightOptions.filter((item) => item?.value || item?.label)
    : [];

  const backendColors = Array.isArray(backendFilters?.colors)
    ? backendFilters.colors
        .map((item: any) => {
          if (typeof item === "string") {
            return {
              name: item,
              color: "",
            };
          }

          return {
            name: item?.name || item?.label || item?.value || "",
            color: item?.hex || item?.colorHex || item?.color || "",
          };
        })
        .filter((item: any) => item.name)
    : [];

  const backendFabrics = Array.isArray(backendFilters?.fabrics)
    ? backendFilters.fabrics
        .map((item: any) =>
          typeof item === "string"
            ? item
            : item?.value || item?.label || item?.name,
        )
        .filter(Boolean)
    : [];

  const backendDressLength = Array.isArray(backendFilters?.dressLength)
    ? backendFilters.dressLength
        .map((item: any) =>
          typeof item === "string"
            ? item
            : item?.value || item?.label || item?.name,
        )
        .filter(Boolean)
    : [];

  const backendProductionType = Array.isArray(backendFilters?.productionType)
    ? backendFilters.productionType
        .map((item: any) =>
          typeof item === "string"
            ? item
            : item?.value || item?.label || item?.name,
        )
        .filter(Boolean)
    : [];

  const finalHeights = backendFilterHeights.length
    ? sortHeightOptions(backendFilterHeights)
    : masterHeightOptions.length
      ? sortHeightOptions(masterHeightOptions)
      : [];

  return {
    sizes: sortBackendSizes(normalizeUniqueValues(backendSizes)),
    heights: finalHeights,
    colors: backendColors,
    fabric: normalizeUniqueValues(backendFabrics),
    dressLength: normalizeUniqueValues(backendDressLength),
    productionType: normalizeUniqueValues(backendProductionType),
  };
}, [backendFilters, heightOptions]);

  const showingFrom =
    totalProducts === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;

  const showingTo =
    totalProducts === 0
      ? 0
      : Math.min(
          (currentPage - 1) * PRODUCTS_PER_PAGE + filteredProducts.length,
          totalProducts,
        );

  async function handleAddToBridalWorkspace(
    product: BridesmaidProduct,
    selection?: AddWorkspaceSelection,
  ) {
    try {
      setWorkspaceMessage("");
      setWorkspaceError("");

      const memberId =
        typeof window !== "undefined"
          ? localStorage.getItem("bridalSelectedMemberId") || ""
          : "";

      const eventId =
        typeof window !== "undefined"
          ? localStorage.getItem("bridalEventId") || ""
          : "";

      const selectedVariantId = selection?.variantId || product.variantId;

      if (!memberId) {
        setWorkspaceError(
          "Pehle /bridal-party dashboard me member card ke saamne Select dabao.",
        );
        return;
      }

      if (!product.productId) {
        setWorkspaceError(
          "Product ID missing hai. Backend catalog response check karo.",
        );
        return;
      }

      const payload = {
        eventId,
        memberId,
        productId: product.productId,
        ...(selectedVariantId ? { variantId: selectedVariantId } : {}),
      };

      await assignDressToMember(payload as any);

      if (typeof window !== "undefined") {
        localStorage.setItem("bridalLastAssignedProductId", product.productId);

        if (selectedVariantId) {
          localStorage.setItem(
            "bridalLastAssignedVariantId",
            selectedVariantId,
          );
        }

        localStorage.setItem("bridalLastAssignedDressName", product.name);

        localStorage.setItem(
          "bridalLastAssignedSelection",
          JSON.stringify({
            productId: product.productId,
            variantId: selectedVariantId,
            dressName: product.name,
            size: selection?.size || "",
            color: selection?.color || "",
            height: selection?.height || "",
            updatedAt: new Date().toISOString(),
          }),
        );
      }

      setAssignedProductId(product.productId);

      setWorkspaceMessage(
        `${product.name} selected member ko assign ho gaya. Size: ${
          selection?.size || ""
        }, Color: ${
          selection?.color || product.colorName
        }. Ab Bridal Party dashboard me continue karo.`,
      );
    } catch (error: any) {
      console.error("Assign real catalog product failed:", error);
      setWorkspaceError(error?.message || "Dress assign failed.");
    }
  }

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-[#fbf8f1] text-[#15100c] selection:bg-[#15100c] selection:text-white">
      <SiteHeader />

      <TrendingCollections />

      <ShopByColorStory
  selectedColor={selectedColor}
  setSelectedColor={setSelectedColor}
  catalogFilters={catalogFilters}
  setCatalogFilters={setCatalogFilters}
  selectedCategoryPath={selectedCategoryPath}
/>

      <CollectionToolbar selectedCategory={selectedCategory} />

      <section className="relative w-full overflow-visible border-t border-[#ddd5c9] bg-[#fbf8f1] px-4 py-[34px] sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_18%_10%,rgba(185,130,98,0.12),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(21,16,12,0.07),transparent_30%)]" />

        <div className="relative mx-auto grid w-full max-w-[1500px] items-start gap-[26px] lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside
            className={`hidden lg:sticky lg:top-[110px] lg:block lg:max-h-[calc(100vh-130px)] lg:self-start lg:overflow-hidden ${fadeUpClass}`}
          >
            <FilterSidebar
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              catalogFilters={catalogFilters}
              setCatalogFilters={setCatalogFilters}
              filterOptions={dynamicFilterOptions}
              categoryTree={categoryTree}
              selectedCategorySlug={selectedCategorySlug}
            />
          </aside>

          <div className="min-w-0">
            <div
              className={`mb-[24px] flex flex-col gap-4 border-b border-[#ddd5c9] pb-[16px] md:flex-row md:items-center md:justify-between ${fadeUpClass}`}
            >
              <div className="flex flex-wrap items-end gap-[16px]">
                <h1 className="font-serif text-[29px] italic leading-none tracking-[-0.035em]">
                 {selectedCategory?.name || selectedCategoryPath || "Category missing"}
                </h1>

                <span className="text-[10px] uppercase tracking-[0.28em] text-[#8b867f]">
                  {catalogLoading
                    ? "Loading Products"
                    : totalProducts > 0
                      ? `Showing ${showingFrom}-${showingTo} of ${totalProducts} Products`
                      : "0 Products"}
                </span>
              </div>

              <div className="flex items-center gap-[12px]">
                <span className="text-[9px] uppercase tracking-[0.34em] text-[#8b867f]">
                  Sort
                </span>

                <SortDropdown value={catalogSort} onChange={setCatalogSort} />
              </div>
            </div>

            {categoryResolveError ? (
  <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    <XCircle className="h-5 w-5" />
    {categoryResolveError}
  </div>
) : null}

            {catalogLoading ? (
              <div className="mb-6 overflow-hidden rounded-[18px] border border-[#ddd5c9] bg-white/70 p-4 shadow-[0_18px_45px_rgba(23,17,13,0.05)] backdrop-blur">
                <div className="mb-4 flex items-center gap-3 text-sm text-[#6d6760]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading curated dresses from backend...
                </div>

                <div className="grid grid-cols-1 gap-x-[16px] gap-y-[24px] sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="overflow-hidden bg-[#eee8df]"
                      style={getStaggerStyle(index, 60)}
                    >
                      <div className="h-[390px] animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[#eee8df] via-[#f8f2ea] to-[#eee8df] bg-[length:220%_100%]" />

                      <div className="space-y-3 bg-[#fbf8f1] pt-4">
                        <div className="h-3 w-3/4 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[#e5ddd2] via-[#f8f2ea] to-[#e5ddd2] bg-[length:220%_100%]" />
                        <div className="h-3 w-1/2 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[#e5ddd2] via-[#f8f2ea] to-[#e5ddd2] bg-[length:220%_100%]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {catalogError ? (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <XCircle className="h-5 w-5" />
                {catalogError}
              </div>
            ) : null}

            {!catalogLoading && !catalogError && !filteredProducts.length ? (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-800">
               Backend catalog se is category ke liye koi product nahi mila. Category path:{" "}
<strong>{selectedCategoryPath}</strong>. Admin panel me product category
mapping/public status check karo.
              </div>
            ) : null}

            {workspaceMessage ? (
              <div className="mb-5 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{workspaceMessage}</span>
                </div>

                <a
                  href="/bridal-party"
                  className="inline-flex h-[34px] items-center justify-center rounded-full bg-emerald-700 px-5 text-[10px] uppercase tracking-[0.24em] text-white"
                >
                  Go to Bridal Party
                </a>
              </div>
            ) : null}

            {workspaceError ? (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <XCircle className="h-5 w-5" />
                {workspaceError}
              </div>
            ) : null}

            <div
              id="grid"
              className="grid grid-cols-1 gap-x-[18px] gap-y-[34px] sm:grid-cols-2 xl:grid-cols-4"
            >
              {paginatedProducts.map((product, index) => (
                <BridesmaidProductCard
  key={`${product.productId}-${product.variantId || product.name}`}
  product={product}
  index={index}
  categoryPath={selectedCategoryPath}
  heightOptions={heightOptions}
  isAssigned={assignedProductId === product.productId}
  onAddToWorkspace={handleAddToBridalWorkspace}
/>
              ))}
            </div>

            {totalProducts > PRODUCTS_PER_PAGE ? (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            ) : null}

            <BridesmaidCopy
              faqSection={faqSection}
              faqs={categoryFaqs}
              faqLoading={faqLoading}
              faqError={faqError}
            />
          </div>
        </div>
      </section>

      <TrustBand />
      <InstagramStrip />
      <Footer />
      <PremiumAnimationStyles />
    </main>
  );
}

function IconCounter({ icon }: { icon: React.ReactNode }) {
  return (
    <span className="relative inline-flex">
      {icon}

      <span className="absolute -right-3 -top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#b98262] text-[10px] text-white">
        0
      </span>
    </span>
  );
}

function TrendingCollections() {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const featured = [
    { title: "A-Line Dresses", image: img.sage },
    { title: "Sleeved Dresses", image: img.blackDress },
    {
      title: "Convertible Dresses",
      image:
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop",
    },
    {
      title: "Slip Silhouettes",
      image:
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop",
    },
    { title: "Chiffon Dresses", image: img.blackWrap },
    { title: "Stretch Satin", image: img.champagne },
    { title: "Garden Party", image: img.bride },
  ];

  const bridesmaidColorFamilies = [
    {
      name: "All",
      color: "conic-gradient(#d674a8, #f2d45c, #7ed6c7, #6f8ed8, #d674a8)",
      shades: colorFilters,
    },
    {
      name: "Green",
      color: "#8fa083",
      shades: [
        { name: "Sage", color: "#a8b99f" },
        { name: "Emerald", color: "#185f49" },
        { name: "Olive", color: "#58633f" },
        { name: "Forest", color: "#315f42" },
        { name: "Eucalyptus", color: "#8fa083" },
        { name: "Seafoam", color: "#b8d6c6" },
      ],
    },
    {
      name: "Blue",
      color: "#9fb8cf",
      shades: [
        { name: "Dusty Blue", color: "#9fb8cf" },
        { name: "Sky Blue", color: "#b8d3e2" },
        { name: "Powder Blue", color: "#9fc4df" },
        { name: "Navy", color: "#192342" },
        { name: "Stormy", color: "#6f748f" },
        { name: "Slate Blue", color: "#83a2c5" },
      ],
    },
    {
      name: "Neutral",
      color: "#e6d7bd",
      shades: [
        { name: "Champagne", color: "#e6d7bd" },
        { name: "Ivory", color: "#f6efe2" },
        { name: "Neutral", color: "#dfcfaa" },
        { name: "Taupe", color: "#9f8b77" },
        { name: "Sand", color: "#d9c79f" },
        { name: "Pearl", color: "#f2eee7" },
      ],
    },
    {
      name: "Pink",
      color: "#eac3c9",
      shades: [
        { name: "Blush", color: "#eac3c9" },
        { name: "Mauve", color: "#af7d93" },
        { name: "Rose", color: "#d99aac" },
        { name: "Petal", color: "#f3d5d6" },
        { name: "Dusty Rose", color: "#c08f95" },
        { name: "Fuchsia", color: "#b61f5c" },
      ],
    },
    {
      name: "Warm",
      color: "#c96b4e",
      shades: [
        { name: "Terracotta", color: "#c96b4e" },
        { name: "Coral", color: "#ec805d" },
        { name: "Rust", color: "#9a4b2f" },
        { name: "Copper", color: "#b86642" },
        { name: "Caramel", color: "#b98262" },
        { name: "Floral", color: "#ddb956" },
      ],
    },
    {
      name: "Dark",
      color: "#111111",
      shades: [
        { name: "Black", color: "#080808" },
        { name: "Navy", color: "#192342" },
        { name: "Charcoal", color: "#2c2c2c" },
        { name: "Onyx", color: "#111111" },
        { name: "Plum", color: "#6c406e" },
        { name: "Wine", color: "#7b1f2a" },
      ],
    },
  ];

  const scrollCarousel = (direction: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;

    const firstCard = el.querySelector<HTMLElement>("[data-collection-card]");
    const cardWidth = firstCard?.offsetWidth || 220;
    const gap = 22;
    const scrollAmount = cardWidth + gap;

    if (direction === "right") {
      const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 12;

      if (nearEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    } else {
      const nearStart = el.scrollLeft <= 12;

      if (nearStart) {
        el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      } else {
        el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <section className="relative z-40 w-full overflow-visible border-b border-[#ddd5c9] bg-[#f7f1e8] px-4 pb-[10px] pt-[22px] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(185,130,98,0.16),transparent_28%),radial-gradient(circle_at_90%_20%,rgba(21,16,12,0.08),transparent_34%)]" />

      <div className="relative mx-auto w-full max-w-[1320px]">
        <div className="grid w-full items-start gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className={`min-w-0 pt-[18px] ${fadeUpClass}`}>
            <p className="mb-[18px] text-[9px] uppercase tracking-[0.42em] text-[#b98262]">
              Bridesmaid Edit
            </p>

            <h2 className="font-serif text-[58px] italic leading-[0.88] tracking-[-0.065em] text-[#15100c] md:text-[70px]">
              Trending
              <br />
              Collections
            </h2>

            <a
              href="/collection"
              className="mt-[32px] inline-flex h-[48px] items-center gap-[10px] bg-[#15100c] px-[24px] text-[8px] font-semibold uppercase tracking-[0.32em] text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#b98262] hover:shadow-[0_18px_45px_rgba(23,17,13,0.18)]"
            >
              ✧ Ships now — 4–8 days
            </a>
          </div>

          <div className="relative min-w-0">
            <button
              type="button"
              onClick={() => scrollCarousel("left")}
              className="absolute left-[10px] top-[104px] z-30 flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white text-[#15100c] shadow-[0_5px_18px_rgba(0,0,0,0.16)] transition hover:scale-105"
              aria-label="Previous collections"
            >
              <ChevronLeft className="h-6 w-6 stroke-[1.8]" />
            </button>

            <div
              ref={carouselRef}
              className="scrollbar-hide flex w-full snap-x snap-mandatory gap-[22px] overflow-x-auto scroll-smooth pr-[2px]"
            >
              {featured.map((item, index) => (
                <a
                  key={item.title}
                  data-collection-card
                  href="/collection"
                  className={`group min-w-[calc((100%-66px)/4)] max-w-[calc((100%-66px)/4)] snap-start text-center ${softScaleClass}`}
                  style={getStaggerStyle(index, 90)}
                >
                  <div className="h-[255px] overflow-hidden bg-[#ded5c8] shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_24px_60px_rgba(23,17,13,0.18)]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>

                  <p className="mt-[18px] font-serif text-[23px] italic leading-none tracking-[-0.04em] text-[#15100c]">
                    {item.title}
                  </p>
                </a>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollCarousel("right")}
              className="absolute right-[10px] top-[104px] z-30 flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white text-[#15100c] shadow-[0_5px_18px_rgba(0,0,0,0.16)] transition hover:scale-105"
              aria-label="Next collections"
            >
              <ChevronRight className="h-6 w-6 stroke-[1.8]" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

function ShopByColorStory({
  selectedColor,
  setSelectedColor,
  catalogFilters,
  setCatalogFilters,
  selectedCategoryPath,
}: {
  selectedColor: string | null;
  setSelectedColor: (color: string | null) => void;
  catalogFilters: CatalogFilters;
  setCatalogFilters: React.Dispatch<React.SetStateAction<CatalogFilters>>;
  selectedCategoryPath: string;
}) {
  const [openFamily, setOpenFamily] = useState<string | null>(null);
  const [activeFamily, setActiveFamily] = useState("All");

  const [backendColorStories, setBackendColorStories] = useState<
    CatalogColorStory[]
  >([]);
  const [colorStoriesLoading, setColorStoriesLoading] = useState(false);
  const [colorStoriesError, setColorStoriesError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadColorStories() {
      try {
        setColorStoriesLoading(true);
        setColorStoriesError("");

       const response = await getCatalogColorStories({
  categoryPath: selectedCategoryPath,
});
        const stories = Array.isArray(response?.data) ? response.data : [];

        if (!mounted) return;

        setBackendColorStories(stories);
      } catch (error: any) {
        console.error("Bridesmaid color stories load failed:", error);

        if (!mounted) return;

        setBackendColorStories([]);
        setColorStoriesError(error?.message || "Color stories load failed");
      } finally {
        if (mounted) {
          setColorStoriesLoading(false);
        }
      }
    }

    loadColorStories();

    return () => {
      mounted = false;
    };
  }, [selectedCategoryPath]);

  function normalizeFilterValue(value?: string | null) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/\//g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

const colorFamilies = useMemo(() => {
  const mapped = backendColorStories
    .filter((story) => story?.active !== false)
    .map((story) => {
      const storySlug = normalizeFilterValue(story.name);

      return {
        name: story.name,
        description: story.description || "",
        color: story.displayColor,
        filterValue: storySlug,
        shades: Array.isArray(story.shades)
          ? story.shades
              .filter((shade) => shade?.active !== false)
              .map((shade) => ({
                name: shade.name,
                color: shade.hex,
                filterValue:
                  shade.filterValue ||
                  normalizeFilterValue(shade.name) ||
                  shade.name,
              }))
          : [],
      };
    });

  return mapped;
}, [backendColorStories]);

function applyColorStory(family: {
  name: string;
  color: string;
  filterValue?: string;
}) {
  setActiveFamily(family.name);
  setOpenFamily(null);

  if (family.name === "All") {
    setSelectedColor(null);

    setCatalogFilters((prev) => ({
      ...prev,
      color: "",
      colorStory: "",
    }));

    return;
  }

  setSelectedColor(family.color);

  setCatalogFilters((prev) => ({
    ...prev,
    color: "",
    colorStory: normalizeFilterValue(family.name),
  }));
}

  function applyShade(
    family: {
      name: string;
      color: string;
      filterValue?: string;
    },
    shade: { name: string; color: string; filterValue?: string },
  ) {
    setActiveFamily(family.name);
    setSelectedColor(shade.color);
    setOpenFamily(null);

    setCatalogFilters((prev) => ({
      ...prev,
      color: shade.filterValue || normalizeFilterValue(shade.name),
      colorStory: "",
    }));
  }

  if (!colorStoriesLoading && !colorFamilies.length) {
    return null;
  }

  return (
    <section className="relative z-[80] overflow-visible border-b border-[#ddd5c9] bg-[#fbf8f1] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(185,130,98,0.10),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(159,184,207,0.14),transparent_28%)]" />

      <div className="relative mx-auto max-w-[1280px]">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.42em] text-[#b98262]">
              Color Atelier
            </p>

            <h2 className="mt-2 font-serif text-[36px] italic leading-none tracking-[-0.045em] text-[#15100c] md:text-[46px]">
              Shop by color story
            </h2>
          </div>

          <p className="max-w-[430px] text-[13px] leading-6 text-[#6d6760]">
            Choose a palette to instantly refine bridesmaid dresses by backend
            color filters.
          </p>
        </div>

        {colorStoriesLoading ? (
          <p className="mb-4 text-center text-[11px] text-[#8b867f]">
            Loading color stories...
          </p>
        ) : null}

        {colorStoriesError ? (
          <p className="mb-4 text-center text-[11px] text-red-600">
            Color stories API error: {colorStoriesError}
          </p>
        ) : null}

        <div className="no-scrollbar relative z-[999] flex items-start justify-center gap-[34px] overflow-visible pb-[32px] pt-2">
          {colorFamilies.map((family, index) => {
            const active =
              activeFamily === family.name ||
              catalogFilters.colorStory === family.filterValue ||
              catalogFilters.colorStory === normalizeFilterValue(family.name);

            const isOpen = openFamily === family.name;

            return (
            <div
  key={family.name}
  className={`relative z-10 flex w-[96px] shrink-0 flex-col items-center ${softScaleClass}`}
  style={getStaggerStyle(index, 70)}
  onMouseEnter={() => {
    if (family.shades.length) setOpenFamily(family.name);
  }}
>
                <button
                  type="button"
                  onClick={() => applyColorStory(family)}
                  className={[
                    "group flex w-full flex-col items-center text-center transition-all duration-300",
                    active
                      ? "text-[#15100c]"
                      : "text-[#6d6760] hover:text-[#15100c]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-[62px] w-[62px] rounded-full shadow-[0_12px_28px_rgba(23,17,13,0.10)] transition duration-300 group-hover:-translate-y-1 group-hover:scale-105",
                      active
                        ? "ring-[3px] ring-[#15100c] ring-offset-[5px] ring-offset-[#fbf8f1]"
                        : "",
                    ].join(" ")}
                    style={{
                      background:
                        family.name === "All"
                          ? family.color
                          : `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.32), transparent 30%), ${family.color}`,
                    }}
                  />

                  <span className="mt-[10px] text-[12px] font-light text-[#15100c]">
                    {family.name}
                  </span>
                </button>

                {isOpen && family.shades.length ? (
                 <div
  onMouseEnter={() => setOpenFamily(family.name)}
  onMouseLeave={() => setOpenFamily(null)}
  className="absolute left-1/2 top-[calc(100%+8px)] z-[9999] w-[300px] -translate-x-1/2 rounded-[18px] border border-[#d8cfc2] bg-white p-4 shadow-[0_22px_60px_rgba(23,17,13,0.18)]"
>
                    <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-[#d8cfc2] bg-white" />

                    <div className="grid grid-cols-3 gap-3">
                      {family.shades.map((shade) => {
           const familyActive =
  catalogFilters.colorStory === normalizeFilterValue(family.name);

const shadeActive =
  familyActive ||
  selectedColor === shade.color ||
  catalogFilters.color === shade.name ||
  catalogFilters.color === shade.filterValue ||
  catalogFilters.color === normalizeFilterValue(shade.name);

                        return (
                          <button
                            key={`${family.name}-${shade.name}`}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              applyShade(family, shade);
                            }}
                            className="flex flex-col items-center text-center"
                          >
                            <span
                              className={[
                                "h-[38px] w-[38px] rounded-full border transition hover:scale-110",
                                shadeActive
                                  ? "border-[#15100c] ring-2 ring-[#15100c] ring-offset-2"
                                  : "border-[#cfc6ba]",
                              ].join(" ")}
                              style={{ background: shade.color }}
                            />

                            <span className="mt-2 text-[10px] leading-3 text-[#6d6760]">
                              {shade.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CollectionToolbar({
  selectedCategory,
}: {
  selectedCategory: CatalogCategoryTreeNode | null;
}) {
  const [activeShopTab, setActiveShopTab] = useState<
    "skin" | "height" | "new" | null
  >(null);

  const breadcrumbItems = selectedCategory?.breadcrumb || [];

  const tabs = [
    { id: "skin" as const, label: "Shop by Skin Tone" },
    { id: "height" as const, label: "Shop by Height/Size" },
    { id: "new" as const, label: "New Arrivals" },
  ];

  const chipMap = {
    skin: ["Fair", "Medium / Olive", "Tan / Golden", "Deep / Rich"],
    height: [
      "Petite",
      "Regular",
      "Tall",
      "Extra Tall",
      "Plus Size",
      "Maternity",
    ],
    new: ["This Week", "New Satin", "New Chiffon", "Dove / Blush"],
  };

  return (
    <section
      className={`relative z-10 w-full overflow-x-hidden bg-[#fbf8f1] px-4 py-8 sm:px-6 lg:px-8 ${fadeUpClass}`}
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <nav aria-label="Breadcrumb" className="border-b border-[#d8cfc2] pb-6">
          <ol className="flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.42em] text-[#15100c]">
            <li>
              <a href="/" className="transition hover:text-[#b98262]">
                Home
              </a>
            </li>

            {breadcrumbItems.length ? (
              breadcrumbItems.map((item, index) => (
                <React.Fragment key={`${item}-${index}`}>
                  <li aria-hidden="true" className="text-[#9c968e]">
                    /
                  </li>

                  <li
                    aria-current={
                      index === breadcrumbItems.length - 1 ? "page" : undefined
                    }
                    className="text-[#15100c]"
                  >
                    {item}
                  </li>
                </React.Fragment>
              ))
            ) : (
              <>
                <li aria-hidden="true" className="text-[#9c968e]">
                  /
                </li>

                <li aria-current="page" className="text-[#15100c]">
                  Bridesmaid Dresses
                </li>
              </>
            )}
          </ol>
        </nav>

        <div className="grid w-full items-center gap-8 pt-9 lg:grid-cols-[minmax(0,1fr)_minmax(360px,560px)]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              {tabs.map((tab) => {
                const isActive = activeShopTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setActiveShopTab((prev) =>
                        prev === tab.id ? null : tab.id,
                      )
                    }
                    className={[
                      "flex h-[48px] items-center justify-center rounded-full border px-6 text-[10px] uppercase tracking-[0.34em] transition sm:px-8",
                      isActive
                        ? "border-[#15100c] bg-[#15100c] text-white"
                        : "border-[#15100c] bg-[#fbf8f1] text-[#15100c] hover:bg-[#15100c] hover:text-white",
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeShopTab ? (
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {chipMap[activeShopTab].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="flex h-[40px] items-center justify-center rounded-full border border-[#d8cfc2] bg-[#fbf8f1] px-5 text-[13px] font-light text-[#15100c] transition hover:-translate-y-0.5 hover:border-[#15100c] hover:bg-white hover:shadow-[0_10px_28px_rgba(23,17,13,0.10)]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <a
            href="/collection"
            className="grid h-[150px] w-full min-w-0 overflow-hidden border border-[#d8cfc2] bg-[#15100c] shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(23,17,13,0.16)] sm:h-[170px] sm:grid-cols-[42%_58%]"
          >
            <div className="hidden overflow-hidden bg-white sm:block">
              <img
                src={img.blackWrap}
                alt="Garden Atelier"
                className="h-full w-full object-cover object-top transition duration-700 hover:scale-105"
              />
            </div>

            <div className="flex min-w-0 flex-col justify-center bg-[#15100c] px-6 text-white sm:px-8">
              <p className="text-[8px] uppercase tracking-[0.38em] text-[#b98262]">
                The Latest Signature Edit
              </p>

              <h3 className="mt-4 font-serif text-[27px] italic leading-none tracking-[-0.04em] text-white sm:text-[32px]">
                Garden Atelier, AW’26
              </h3>

              <span className="mt-5 text-[9px] uppercase tracking-[0.34em] text-white">
                Shop the edit <span className="ml-2">→</span>
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const options = [
    { label: "Featured", value: "featured" },
    { label: "Newest", value: "newest" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Popular", value: "popular" },
  ];

  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-[34px] min-w-[180px] items-center justify-between border border-[#d8cfc2] bg-[#fbf8f1] px-[14px] text-[11px] text-[#15100c]"
      >
        <span className="truncate">{selectedOption.label}</span>

        <ChevronDown
          className={[
            "ml-2 h-4 w-4 shrink-0 transition",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-[38px] z-[80] w-[230px] border border-[#15100c] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
          {options.map((option) => {
            const active = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={[
                  "block w-full px-[18px] py-[7px] text-left text-[11px] leading-[1.25] text-[#15100c] transition",
                  active
                    ? "bg-[#7d7b78] text-white"
                    : "bg-white hover:bg-[#eee9df]",
                ].join(" ")}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function FilterSidebar({
  selectedColor,
  setSelectedColor,
  catalogFilters,
  setCatalogFilters,
  filterOptions,
  categoryTree,
  selectedCategorySlug,
}: {
  selectedColor: string | null;
  setSelectedColor: (color: string | null) => void;
  catalogFilters: CatalogFilters;
  setCatalogFilters: React.Dispatch<React.SetStateAction<CatalogFilters>>;
  filterOptions: {
    sizes: string[];
    heights: any[];
    colors: { name: string; color: string }[];
    fabric: string[];
    dressLength: string[];
    productionType: string[];
  };
  categoryTree: CatalogCategoryTreeNode[];
  selectedCategorySlug: string;
}) {
  const sizes = filterOptions.sizes;
  const heights = filterOptions.heights;
  const dynamicColors = filterOptions.colors;

  const { selectedNode, parentNode, filterCategories } = getFilterCategoryBase(
    categoryTree,
    selectedCategorySlug,
  );

  const showCategoryFilter = Boolean(
    filterCategories.length &&
    selectedNode &&
    ((selectedNode as any).level > 1 || parentNode),
  );

  const groups = [
    {
      title: "Length",
      key: "dressLength" as keyof CatalogFilters,
      options: filterOptions.dressLength,
    },
    {
      title: "Fabric",
      key: "fabric" as keyof CatalogFilters,
      options: filterOptions.fabric,
    },
    {
      title: "Shipping Timeline",
      key: "productionType" as keyof CatalogFilters,
      options: filterOptions.productionType,
    },
  ].filter((group) => group.options.length);

  function updateFilter(key: keyof CatalogFilters, value: string) {
    setCatalogFilters((prev) => {
      const current = prev[key];

      return {
        ...prev,
        [key]: current === value ? "" : value,
      };
    });
  }

  function resetFilters() {
    setSelectedColor(null);
    setCatalogFilters(emptyCatalogFilters);
  }

  return (
    <div className="filter-scrollbar max-h-[calc(100vh-130px)] overflow-y-auto overflow-x-hidden overscroll-contain rounded-[22px] border border-[#ddd5c9] bg-[#fbf8f1]/92 px-[22px] py-[24px] shadow-[0_20px_60px_rgba(23,17,13,0.08)] backdrop-blur-xl transition-all duration-500 hover:shadow-[0_28px_80px_rgba(23,17,13,0.12)]">
      <div className="mb-[24px] flex items-center justify-between">
        <h2 className="font-serif text-[30px] italic leading-none tracking-[-0.045em]">
          Filters
        </h2>

        <button
          type="button"
          onClick={resetFilters}
          className="text-[9px] uppercase tracking-[0.28em] text-[#8b867f] transition hover:text-[#15100c]"
        >
          Reset
        </button>
      </div>

      {showCategoryFilter ? (
        <FilterSection title="Category" icon={<Layers className="h-5 w-5" />}>
          <div className="grid gap-2">
            {filterCategories.map((category) => {
              const active =
                getCategorySlug(category) === getCategorySlug(selectedNode);

              return (
                <a
                  key={category.id || category.slug || category.name}
                  href={getCategoryHref(category)}
                  className={[
                    "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-[12px] transition",
                    active
                      ? "border-[#15100c] bg-[#15100c] text-white"
                      : "border-[#ded6c9] bg-white/50 text-[#15100c] hover:border-[#15100c] hover:bg-white",
                  ].join(" ")}
                >
                  <span className="truncate">{category.name}</span>

                  {typeof category.productCount === "number" ? (
                    <span
                      className={active ? "text-white/70" : "text-[#8b867f]"}
                    >
                      {category.productCount}
                    </span>
                  ) : null}
                </a>
              );
            })}
          </div>
        </FilterSection>
      ) : null}

      {heights.length ? (
        <FilterSection title="Height" icon={<Ruler className="h-5 w-5" />}>
          <div className="space-y-5">
            {Object.entries(
              sortHeightOptions(heights).reduce<Record<string, any[]>>(
                (groups, item) => {
                  const group = getHeightOptionGroup(item);
                  groups[group] = groups[group] || [];
                  groups[group].push(item);
                  return groups;
                },
                {},
              ),
            ).map(([group, items]) => (
              <div key={group}>
                <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#b98262]">
                  {group}
                </p>

                <div className="grid grid-cols-3 gap-1.5">
                  {items.map((item) => {
                    const value = getHeightOptionValue(item);
                    const label = getHeightOptionLabel(item);
                    const active = catalogFilters.height === value;

                    if (!value) return null;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateFilter("height", value)}
                        className={[
                          "min-h-[32px] rounded-[4px] border px-1 text-[10px] transition-all duration-300",
                          active
                            ? "border-[#15100c] bg-[#15100c] text-white"
                            : "border-[#ded6c9] bg-white/50 text-[#15100c] hover:-translate-y-0.5 hover:border-[#15100c] hover:bg-white",
                        ].join(" ")}
                      >
                        {label}
                        {typeof item !== "string" &&
                        typeof item.productCount === "number" ? (
                          <span className="ml-1 opacity-60">
                            ({item.productCount})
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </FilterSection>
      ) : null}

      {sizes.length ? (
        <FilterSection title="Size" icon={<Shirt className="h-5 w-5" />}>
          <div className="grid grid-cols-4 gap-1.5">
            {sizes.map((size) => {
              const active = catalogFilters.sizeLabel === size;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateFilter("sizeLabel", size)}
                  className={[
                    "h-[28px] rounded-[4px] border text-[10px] transition-all duration-300",
                    active
                      ? "border-[#15100c] bg-[#15100c] text-white"
                      : "border-[#ded6c9] bg-white/50 text-[#15100c] hover:-translate-y-0.5 hover:border-[#15100c] hover:bg-white",
                  ].join(" ")}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </FilterSection>
      ) : null}

      {dynamicColors.length ? (
        <FilterSection title="Color" icon={<Palette className="h-5 w-5" />}>
          <div className="flex flex-wrap gap-2.5">
            {dynamicColors.map((item) => {
              const active =
                selectedColor === item.color ||
                catalogFilters.color === item.name;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    const nextActive = active ? "" : item.name;

                    setSelectedColor(active ? null : item.color);

                    setCatalogFilters((prev) => ({
                      ...prev,
                      color: nextActive,
                    }));
                  }}
                  className={[
                    "h-[26px] w-[26px] rounded-full border transition-all duration-300 hover:scale-125",
                    active
                      ? "border-[#15100c] ring-2 ring-[#15100c] ring-offset-2 ring-offset-[#fbf8f1]"
                      : "border-[#cfc6ba]",
                  ].join(" ")}
                  style={{ background: item.color }}
                  title={item.name}
                />
              );
            })}
          </div>
        </FilterSection>
      ) : null}

      {groups.map((group) => (
        <FilterSection
          key={group.title}
          title={group.title}
          icon={<Layers className="h-5 w-5" />}
        >
          <div className="grid gap-2">
            {group.options.map((item) => {
              const active = catalogFilters[group.key] === item;

              return (
                <label
                  key={item}
                  className="flex cursor-pointer items-center gap-2 text-[12px] text-[#6d6760]"
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => updateFilter(group.key, item)}
                    className="h-3.5 w-3.5 rounded border-[#cfc6ba] accent-[#15100c]"
                  />
                  <span
                    className={active ? "font-semibold text-[#15100c]" : ""}
                  >
                    {item}
                  </span>
                </label>
              );
            })}
          </div>
        </FilterSection>
      ))}
    </div>
  );
}

function FilterSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="border-t border-[#ddd5c9] py-[18px]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="flex min-w-0 items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.10em] text-[#15100c]">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center">
            {icon}
          </span>

          <span className="truncate">{title}</span>
        </span>

        <span
          className={[
            "flex h-5 w-5 shrink-0 items-center justify-center text-[22px] font-light leading-none text-[#15100c] transition-transform duration-300",
            open ? "rotate-45" : "rotate-0",
          ].join(" ")}
          aria-hidden="true"
        >
          +
        </span>
      </button>

      <div
        className={[
          "grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <div className="pt-[18px]">{children}</div>
        </div>
      </div>
    </section>
  );
}

function HeightGroup({
  label,
  values,
  activeValue,
  onClick,
}: {
  label: string;
  values: string[];
  activeValue: string;
  onClick: (value: string) => void;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="mb-2 text-[9px] uppercase tracking-[0.28em] text-[#b98262]">
        {label}
      </p>

      <div className="grid grid-cols-4 gap-1.5">
        {values.map((value) => {
          const active = activeValue === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => onClick(value)}
              className={[
                "h-[28px] rounded-[4px] border text-[10px] transition-all duration-300",
                active
                  ? "border-[#15100c] bg-[#15100c] text-white"
                  : "border-[#ded6c9] bg-white/50 text-[#15100c] hover:-translate-y-0.5 hover:border-[#15100c] hover:bg-white",
              ].join(" ")}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BridesmaidProductCard({
  product,
  index = 0,
  categoryPath,
  heightOptions,
  isAssigned,
  isAssigning = false,
  onAddToWorkspace,
}: {
  product: BridesmaidProduct;
  index?: number;
  categoryPath: string;
  heightOptions: CatalogHeightOption[];
  isAssigned: boolean;
  isAssigning?: boolean;
  onAddToWorkspace: (
    product: BridesmaidProduct,
    selection?: AddWorkspaceSelection,
  ) => void | Promise<void>;
}) {
  const backendColors = getBackendColorNames(product.raw);
  const backendSizes = sortBackendSizes(getBackendSizes(product.raw));
  const backendHeights = sortHeightOptions(
    heightOptions.filter((item) => item?.value || item?.label),
  );
  const hasImage = Boolean(product.image);

  const productDetailHref = getProductDetailHref(product, categoryPath);

  const [selectedColorName, setSelectedColorName] = useState(
    product.colorName || backendColors[0] || "",
  );
  const [selectedSize, setSelectedSize] = useState(backendSizes[0] || "");
  const [selectedHeight, setSelectedHeight] = useState("");

  function isHeightAvailable(height: string) {
    return product.variants.some((variant) => {
      const sizeOk = selectedSize
        ? normalizeCompare(variant.size) === normalizeCompare(selectedSize)
        : true;

      const colorOk = selectedColorName
        ? normalizeCompare(variant.color) ===
            normalizeCompare(selectedColorName) ||
          normalizeColorValue((variant as any).colorHex) ===
            normalizeColorValue(selectedColorName)
        : true;

      const heightOk =
        normalizeCompare(variant.height) === normalizeCompare(height);

      return (
        sizeOk &&
        colorOk &&
        heightOk &&
        getVariantIdValue(variant) &&
        isVariantAvailableForSelection(variant)
      );
    });
  }

  useEffect(() => {
    if (!backendHeights.length) return;

    const stillAvailable = selectedHeight && isHeightAvailable(selectedHeight);

    if (stillAvailable) return;

    const nextHeight =
      backendHeights
        .map(getHeightOptionValue)
        .find((height) => height && isHeightAvailable(height)) || "";

    setSelectedHeight(nextHeight);
  }, [backendHeights, selectedColorName, selectedHeight, selectedSize]);

  const [cardCartLoading, setCardCartLoading] = useState(false);
  const [cardCartMessage, setCardCartMessage] = useState("");
  const [cardCartError, setCardCartError] = useState("");

  const selectedVariant = useMemo(() => {
    const size = normalizeCompare(selectedSize);
    const color = normalizeCompare(selectedColorName);
    const height = normalizeCompare(selectedHeight);
    const colorHex = normalizeColorValue(selectedColorName);

    return (
      product.variants.find((variant) => {
        const variantSize = normalizeCompare(variant.size);
        const variantColor = normalizeCompare(variant.color);
        const variantHeight = normalizeCompare(variant.height);
        const variantColorHex = normalizeColorValue((variant as any).colorHex);

        const sizeOk = size ? variantSize === size : true;
        const colorOk = color
          ? variantColor === color || variantColorHex === colorHex
          : true;
        const heightOk = height ? variantHeight === height : true;

        return (
          sizeOk &&
          colorOk &&
          heightOk &&
          getVariantIdValue(variant) &&
          isVariantAvailableForSelection(variant)
        );
      }) || null
    );
  }, [product, selectedColorName, selectedHeight, selectedSize]);

  const selectedVariantId =
    getVariantIdValue(selectedVariant) || product.variantId || "";

  async function handleAddClick() {
    await onAddToWorkspace(product, {
      variantId: selectedVariantId,
      size: selectedSize,
      color: selectedColorName || product.colorName,
      height: selectedHeight,
    });
  }

  async function handleCartAddClick() {
    if (!product.productId) {
      setCardCartError("Product ID missing hai.");
      return;
    }

    if (!selectedVariantId) {
      setCardCartError("Variant ID backend se nahi aa raha.");
      return;
    }

    try {
      setCardCartLoading(true);
      setCardCartMessage("");
      setCardCartError("");

      await addToCart({
        productId: product.productId,
        variantId: selectedVariantId,
        quantity: 1,
        deliveryOption: "STANDARD",
      } as any);

      setCardCartMessage("Added to bag.");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart-updated"));
      }

      setTimeout(() => {
        setCardCartMessage("");
      }, 2200);
    } catch (error: any) {
      console.error("Listing add to bag failed:", error);

      const message = error?.message || "Product add to bag failed.";

      if (message.toLowerCase().includes("unauthorized")) {
        setCardCartError("Please login first to add product to bag.");

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "redirectAfterLogin",
            window.location.pathname + window.location.search,
          );
        }

        return;
      }

      setCardCartError(message);
    } finally {
      setCardCartLoading(false);
    }
  }

  return (
    <article
      className={`group relative flex h-full min-h-[470px] flex-col ${softScaleClass}`}
      style={getStaggerStyle(index, 75)}
    >
      <div
        className={[
          "relative h-[300px] shrink-0 overflow-hidden bg-[#eee8df] shadow-[0_10px_26px_rgba(23,17,13,0.04)]",
          "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover:-translate-y-1 group-hover:shadow-[0_28px_70px_rgba(23,17,13,0.16)]",
          isAssigned ? "ring-2 ring-emerald-600 ring-offset-2" : "",
        ].join(" ")}
      >
        <a
         href={productDetailHref}
          className="absolute inset-0 block"
          aria-label={product.name ? `View ${product.name}` : "View product"}
        >
        {hasImage ? (
  product.media?.mediaType === "video" ? (
    <div className="relative h-full w-full bg-black">
      <video
  src={product.media.url}
  muted
  autoPlay
  loop
  playsInline
  preload="auto"
  className="h-full w-full object-cover object-center transition duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.065]"
/>

      <span className="absolute bottom-3 left-3 rounded-full bg-black/65 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white">
        Video
      </span>
    </div>
  ) : (
    <img
      src={product.image}
      alt={product.name || "Product image"}
      className="h-full w-full object-cover object-top transition duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.065]"
    />
  )
) : (
  <div className="flex h-full w-full items-center justify-center bg-[#eee8df] px-5 text-center text-[11px] uppercase tracking-[0.24em] text-[#8b867f]">
    No image/video from backend
  </div>
)}

          <div className="absolute inset-0 bg-gradient-to-t from-[#15100c]/36 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        </a>

        <button
          type="button"
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[#fbf8f1]/95 text-[#15100c] shadow-[0_8px_20px_rgba(0,0,0,0.10)] backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-[#15100c] hover:text-white"
        >
          <Heart className="h-4 w-4 stroke-[1.7]" />
        </button>

        {isAssigned || product.tag ? (
          <span className="absolute left-3 top-3 bg-[#fbf8f1]/95 px-2.5 py-1 text-[10px] uppercase tracking-[2px] text-[#15100c] backdrop-blur">
            {isAssigned ? "Assigned" : product.tag}
          </span>
        ) : null}

        <a
href={productDetailHref}
          className="absolute left-3 right-3 top-1/2 flex -translate-y-1/2 scale-95 items-center justify-center gap-2 bg-white/92 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#15100c] opacity-0 shadow-[0_18px_45px_rgba(0,0,0,0.20)] backdrop-blur transition-all duration-500 group-hover:scale-100 group-hover:opacity-100"
        >
          <Eye className="h-5 w-5" />
          View Details
        </a>
      </div>

      <div className="flex min-h-[52px] items-start justify-between gap-2 pt-3">
        <div className="min-w-0 flex-1">
          {product.name ? (
            <a
             href={productDetailHref}
              title={product.name}
              className="block h-[36px] overflow-hidden text-ellipsis text-[12px] font-bold leading-[18px] tracking-wide text-[#15100c] transition hover:text-[#b98262] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]"
            >
              {product.name}
            </a>
          ) : (
            <div className="h-[36px]" />
          )}

          {product.fabric ? (
            <p className="mt-0.5 truncate text-[11px] text-[#7a746e]">
              {product.fabric}
            </p>
          ) : null}
        </div>

        {product.price ? (
          <span className="shrink-0 text-xs font-light text-[#b98262]">
            {product.price}
          </span>
        ) : null}
      </div>

      {backendColors.length || product.swatches.length ? (
        <div className="mt-2.5 flex items-center gap-1.5">
          {product.swatches.slice(0, 4).map((color, colorIndex) => (
            <button
              key={`${product.productId}-${color}-${colorIndex}`}
              type="button"
              onClick={() =>
                setSelectedColorName(
                  backendColors[colorIndex] || selectedColorName,
                )
              }
              className={[
                "h-4 w-4 rounded-full border transition-all hover:scale-125",
                colorIndex === 0
                  ? "scale-110 border-[#fbf8f1] ring-1 ring-[#15100c] ring-offset-2"
                  : "border-[#ddd5c9]",
              ].join(" ")}
              style={{ backgroundColor: color }}
              title={backendColors[colorIndex] || color}
            />
          ))}

          {!product.swatches.length && backendColors.length ? (
            <span className="truncate text-[11px] text-[#7a746e]">
              {backendColors.join(", ")}
            </span>
          ) : null}

          {selectedColorName ? (
            <span className="ml-1 truncate text-[11px] text-[#7a746e]">
              {selectedColorName}
            </span>
          ) : null}
        </div>
      ) : null}

      {backendSizes.length ? (
        <div className="mt-2.5 flex min-h-[30px] flex-wrap gap-1.5 overflow-hidden">
          {backendSizes.slice(0, 5).map((size) => {
            const active =
              normalizeCompare(String(size)) === normalizeCompare(selectedSize);

            return (
              <button
                key={String(size)}
                type="button"
                onClick={() => setSelectedSize(String(size))}
                className={[
                  "h-6 min-w-[26px] border px-1.5 text-[9px] uppercase tracking-[1.2px] transition-all duration-300",
                  active
                    ? "border-[#15100c] bg-[#15100c] text-[#fbf8f1]"
                    : "border-[#ddd5c9] text-[#15100c] hover:border-[#15100c] hover:bg-white",
                ].join(" ")}
              >
                {String(size)}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-2.5 min-h-[30px]" />
      )}

      {backendHeights.length ? (
        <div className="mt-2">
          <select
            value={selectedHeight}
            onChange={(event) => {
              const nextHeight = event.target.value;

              if (!isHeightAvailable(nextHeight)) return;

              setSelectedHeight(nextHeight);
            }}
            className="h-[34px] w-full border border-[#d8cfc2] bg-[#fbf8f1] px-3 text-[11px] font-medium text-[#15100c] outline-none transition hover:border-[#15100c]"
          >
            {backendHeights.map((option) => {
              const height = getHeightOptionValue(option);

              if (!height) return null;

              const available = isHeightAvailable(height);

              return (
                <option
                  key={height}
                  value={height}
                  disabled={!available}
                  className={
                    available
                      ? "font-semibold text-[#15100c]"
                      : "text-[#b8afa4]"
                  }
                >
                  {height}
                  {available ? "" : " — unavailable"}
                </option>
              );
            })}
          </select>
        </div>
      ) : (
        <div className="mt-2 min-h-[34px]" />
      )}

      {!selectedVariantId ? (
        <p className="mt-2 border border-amber-200 bg-amber-50 px-2.5 py-2 text-[10px] leading-4 text-amber-800">
          Variant ID backend se nahi aa raha.
        </p>
      ) : null}

      <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-2.5">
        <button
          type="button"
          onClick={handleCartAddClick}
          disabled={cardCartLoading || !product.productId || !selectedVariantId}
          className="inline-flex h-[36px] items-center justify-center gap-1.5 border border-[#15100c] text-[10px] uppercase tracking-[1.8px] text-[#15100c] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#15100c] hover:text-[#fbf8f1] hover:shadow-[0_16px_34px_rgba(23,17,13,0.16)] disabled:cursor-not-allowed disabled:border-[#8b867f] disabled:text-[#8b867f]"
        >
          {cardCartLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Adding
            </>
          ) : (
            <>
              <ShoppingBag className="h-3.5 w-3.5" />
              Add to Bag
            </>
          )}
        </button>

        <a
         href={productDetailHref}
          aria-label="Open product"
          title="Open product"
          className="inline-flex h-[36px] w-[36px] items-center justify-center border border-[#15100c]/30 text-[#15100c] transition-all duration-300 hover:bg-[#15100c] hover:text-[#fbf8f1]"
        >
          <ArrowUpRight className="h-5 w-5" />
        </a>
      </div>

      {cardCartMessage ? (
        <p className="mt-2 flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          {cardCartMessage}
        </p>
      ) : null}

      {cardCartError ? (
        <p className="mt-2 flex items-center gap-2 border border-red-200 bg-red-50 px-3 py-2 text-[11px] leading-4 text-red-700">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          {cardCartError}
        </p>
      ) : null}
    </article>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }).map((_, index) => index + 1);

  return (
    <div className="mt-[46px] flex items-center justify-center gap-2 border-t border-[#ddd5c9] pt-[34px]">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className="h-[34px] border border-[#d8cfc2] px-4 text-[9px] uppercase tracking-[0.24em] transition hover:border-[#15100c] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Prev
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={[
            "h-[34px] w-[34px] border text-[11px] transition",
            page === currentPage
              ? "border-[#15100c] bg-[#15100c] text-white"
              : "border-[#d8cfc2] bg-[#fbf8f1] text-[#15100c] hover:border-[#15100c] hover:bg-white",
          ].join(" ")}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className="h-[34px] border border-[#d8cfc2] px-4 text-[9px] uppercase tracking-[0.24em] transition hover:border-[#15100c] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

function BridesmaidCopy({
  faqSection,
  faqs,
  faqLoading,
  faqError,
}: {
  faqSection: CatalogCategoryFaqSection | null;
  faqs: CatalogCategoryFaq[];
  faqLoading: boolean;
  faqError: string;
}) {
  const heading = faqSection?.heading?.trim();

  const description = faqSection?.description?.trim();

  return (
    <section>
      <div className="mt-[42px] border-t border-[#ddd5c9] pt-[28px]">
        <p className="mb-[18px] text-[13px] uppercase tracking-[0.42em] text-[#b98262]">
          FAQ
        </p>

        <h3 className="font-serif text-[34px] italic tracking-[-0.04em]">
          {heading}
        </h3>

        {description ? (
          <p className="mt-3 max-w-[760px] text-[13px] leading-6 text-[#6d6760]">
            {description}
          </p>
        ) : null}

        {faqLoading ? (
          <p className="mt-5 text-[12px] text-[#8b867f]">
            Loading FAQs from backend...
          </p>
        ) : null}

        {faqError ? (
          <p className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
            FAQ API error: {faqError}
          </p>
        ) : null}

        {!faqLoading && !faqError && faqs.length ? (
          <div className="mt-[22px]">
            {faqs.map((faq, index) => (
              <FaqAccordionItem
                key={`${faq.question}-${index}`}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        ) : null}

        {!faqLoading && !faqError && !faqs.length ? (
          <p className="mt-5 text-[12px] text-[#8b867f]">
            No FAQs added from admin yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function FaqAccordionItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#ddd5c9] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="group flex w-full items-center justify-between gap-6 py-[24px] text-left font-['Cormorant_Garamond'] text-[22px] italic leading-8 text-[#15100c] transition-colors duration-300 hover:text-[#b98262] md:text-[22px]"
      >
        <span className="block transition-colors duration-300">{question}</span>

        <ChevronDown
          className={[
            "h-5 w-5 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "rotate-180 text-[#b98262]" : "",
          ].join(" ")}
        />
      </button>

      <div
        className={[
          "grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <div className="pb-[22px] pr-8 text-[16px] leading-7 text-[#6d6760] md:text-[17px]">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustBand() {
  const items = [
    { icon: Truck, title: "Complimentary Shipping", text: "Orders over $250" },
    {
      icon: RefreshCcw,
      title: "Easy 30-Day Returns",
      text: "With policy conditions",
    },
    { icon: ShieldCheck, title: "Insured Rentals", text: "Protected delivery" },
    { icon: Scissors, title: "Atelier Checked", text: "Quality inspection" },
    { icon: Lock, title: "Secure Checkout", text: "Encrypted payment" },
    { icon: Mail, title: "Concierge Styling", text: "Support available" },
  ];

  return (
    <section className="border-y border-[#ddd5c9] bg-[#eee8df] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1280px] gap-6 sm:grid-cols-2 lg:grid-cols-6">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex flex-col items-center text-center transition duration-300 hover:-translate-y-1"
            >
              <Icon className="mb-3 h-6 w-6 stroke-[1.4]" />

              <p className="text-[11px] font-semibold text-[#15100c]">
                {item.title}
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-[#8b867f]">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-8 flex max-w-[900px] flex-wrap items-center justify-center gap-8 border-t border-[#d2c9bb] pt-6 font-serif text-[14px] italic text-[#15100c]">
        <span>As seen in</span>
        <span>Vogue</span>
        <span>Harper’s Bazaar</span>
        <span>Brides</span>
        <span>Martha Stewart</span>
        <span>The Knot</span>
      </div>
    </section>
  );
}

function InstagramStrip() {
  const images = [
    img.insta1,
    img.insta2,
    img.insta3,
    img.insta4,
    img.insta5,
    img.blackDress,
  ];

  return (
    <section className="bg-[#fbf8f1] px-4 py-[70px] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[980px] text-center">
        <p className="text-[9px] uppercase tracking-[0.42em] text-[#b98262]">
          Social
        </p>

        <h2 className="mt-3 font-serif text-[34px] italic tracking-[-0.04em]">
          As seen on Instagram
        </h2>

        <p className="mt-2 text-[12px] text-[#8b867f]">
          Real brides, real moments — tag #ShahsiAtelier to be featured
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3 md:grid-cols-6">
          {images.map((image, index) => (
            <a
              key={`${image}-${index}`}
              href="/collection"
              className="aspect-square overflow-hidden bg-[#eee8df] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(23,17,13,0.18)]"
            >
              <img
                src={image}
                alt="Instagram preview"
                className="h-full w-full object-cover transition duration-700 hover:scale-110"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className="bg-[#15100c] px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Mail className="h-5 w-5" />

            <div>
              <p className="font-serif text-[20px] italic">
                Here to brighten up your inbox.
              </p>

              <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-white/50">
                Emails are for dress drops, restocks, gifts, sales, and events
              </p>
            </div>
          </div>

          <div className="flex w-full max-w-[520px]">
            <input
              placeholder="Email Address"
              className="h-[44px] flex-1 bg-white px-4 text-sm text-[#15100c] outline-none"
            />

            <button className="h-[44px] bg-white px-6 text-[11px] uppercase tracking-[0.2em] text-[#15100c]">
              Submit
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#fbf8f1] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 text-[12px] text-[#7a746e] md:flex-row md:items-center md:justify-between">
          <div className="font-serif text-[22px] text-[#15100c]">Shahsi</div>

          <nav className="flex flex-wrap gap-5">
            <a href="/terms">Terms</a>
            <a href="/privacy">The Atelier</a>
            <a href="/care">Care & Repair</a>
            <a href="/support">Accessibility</a>
            <a href="/contact">Contact</a>
          </nav>

          <p>© 2026 Shahsi Atelier</p>
        </div>
      </div>
    </footer>
  );
}

function PremiumAnimationStyles() {
  return (
    <style jsx global>{`
      @keyframes fadeUpPremium {
        0% {
          opacity: 0;
          transform: translateY(22px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes softScaleIn {
        0% {
          opacity: 0;
          transform: translateY(18px) scale(0.97);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes shimmer {
        0% {
          background-position: 220% 0;
        }
        100% {
          background-position: -220% 0;
        }
      }

      .filter-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #cfc6ba transparent;
      }

      .filter-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 0;
      }

      .filter-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }

      .filter-scrollbar::-webkit-scrollbar-thumb {
        background: #cfc6ba;
        border-radius: 999px;
      }

      .filter-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #b98262;
      }

      html {
        scroll-behavior: smooth;
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
    `}</style>
  );
}



