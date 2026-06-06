"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Heart,
  Loader2,
  Minus,
  PackageCheck,
  Plus,
  RefreshCcw,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  XCircle,
} from "lucide-react";

import SiteHeader from "@/components/SiteHeader";
import { addToCart } from "@/lib/api/cart.api";
import {
  CatalogProduct,
  CatalogVariant,
  getCatalogProductById,
} from "@/lib/api/catalog.api";
import { isPublicVisibleProduct } from "@/lib/product-visibility";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type ProductImage = {
  id?: string;
  url: string;
  alt?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  colorName?: string;
  viewType?: string;
  format?: string;
  mimeType?: string;
  mediaType?: "image" | "video";
};

type ProductColor = {
  id?: string;
  name: string;
  hex?: string;
  colorHex?: string;
  imageUrl?: string;
  available?: boolean;
  selected?: boolean;
};

type ProductSize = {
  label: string;
  available?: boolean;
};

type FabricOption = {
  id?: string;
  label: string;
  selected?: boolean;
  available?: boolean;
};

type DeliveryOption = {
  id: string;
  label: string;
  time?: string;
  extraPrice?: number | string;
  available?: boolean;
  estimatedArrivalText?: string;
};

type SizeGuideTab = {
  id: string;
  label: string;
  columns?: string[];
  rows?: Array<Array<string | number>>;
  measurementGuide?: Array<{
    heading?: string;
    title?: string;
    text?: string;
    description?: string;
  }>;
};

type DetailProduct = {
  id: string;
  productId: string;
  title: string;
  name?: string;
  slug?: string;
  sku?: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  categoryId?: string;
categoryName?: string;
categorySlug?: string;
categoryPath?: any[];
breadcrumb?: any[];
  brand?: string;
  vendor?: string;
  status?: string;
  price?: number | string;
  salePrice?: number | string;
  listingPrice?: number | string;
  compareAtPrice?: number | string;
  currency?: string;
  color?: string;
  defaultColor?: string;
  fabric?: string;
  material?: string;
  silhouette?: string;
  neckline?: string;
  dressLength?: string;
  sleeveLength?: string;
  images: ProductImage[];
  colors: ProductColor[];
  sizes: ProductSize[];
  variants: CatalogVariant[];
  fabricOptions: FabricOption[];
  deliveryOptions: DeliveryOption[];
  productDetails?: any;
  featureBadges: Array<{ label: string; icon?: string }>;
  shippingAndReturns?: string;
  sizeGuide?: {
    tabs?: SizeGuideTab[];
  };
  rating?: number;
  reviewsCount?: number;
  raw: CatalogProduct | any;
};

type ProductDetailRow = {
  label: string;
  value: any;
};

type RelatedProductCard = {
  id?: string;
  productId?: string;
  catalogProductId?: string;
  title?: string;
  name?: string;
  slug?: string;
  price?: number | string;
  salePrice?: number | string;
  listingPrice?: number | string;
  rentalPrice?: number | string;
  resalePrice?: number | string;
  imageUrl?: string;
  image?: string;
  thumbnail?: string;
  categoryName?: string;
  categorySlug?: string;
  color?: string;
  colorHex?: string;
  primaryColor?: string;
  variantColor?: string;
  images?: Array<
    | string
    | {
        url?: string;
        src?: string;
        imageUrl?: string;
        secureUrl?: string;
        alt?: string;
      }
  >;
};

const DEFAULT_SIZE_GUIDE_TABS: SizeGuideTab[] = [
  {
    id: "standard-sizing",
    label: "Standard Sizing",
    columns: ["", "XXS", "XS", "S", "M", "L", "XL"],
    rows: [
      ["US Size", "00", "0 / 2", "4 / 6", "8 / 10", "12 / 14", "16"],
      ["UK Size", "4", "6 / 8", "10 / 12", "14 / 16", "18 / 20", "22"],
      ["EU Size", "32", "34 / 36", "38 / 40", "42 / 44", "46 / 48", "50"],
      ["Bust", "32", "33 / 34", "35 / 36", "37 / 38", "39.5 / 41", "42.5"],
      ["Natural Waist", "24", "25 / 26", "27 / 28", "29 / 30", "31.5 / 33", "34.5"],
      ["Drop Waist", "26", "27 / 28", "29 / 30", "31 / 32", "33.5 / 35", "36.5"],
      ["Hips", "34", "35 / 36", "37 / 38", "39 / 40", "41.5 / 43", "44.5"],
    ],
    measurementGuide: [
      {
        heading: "Bust",
        text: "Measure under your arms at the fuller part of your bust. Keep tape level across shoulder blades.",
      },
      {
        heading: "Natural Waist",
        text: "Measure around your natural waistline, keeping the tape comfortably loose.",
      },
      {
        heading: "Drop Waist",
        text: "Measure 1.5 inches below your natural waistline.",
      },
      {
        heading: "Hips",
        text: "Stand with your feet together and measure around the fullest part of your hips.",
      },
    ],
  },
  {
    id: "petite",
    label: "Petite",
    columns: ["", "PXXS", "PXS", "PS", "PM", "PL", "PXL"],
    rows: [
      ["US Size", "00", "0 / 2", "4 / 6", "8 / 10", "12 / 14", "16"],
      ["Bust", "31.5", "32.5 / 33.5", "34.5 / 35.5", "36.5 / 37.5", "39 / 40.5", "42"],
      ["Natural Waist", "23.5", "24.5 / 25.5", "26.5 / 27.5", "28.5 / 29.5", "31 / 32.5", "34"],
      ["Hips", "33.5", "34.5 / 35.5", "36.5 / 37.5", "38.5 / 39.5", "41 / 42.5", "44"],
    ],
    measurementGuide: [
      {
        heading: "Petite fit",
        text: "Petite sizing is adjusted for a shorter frame while keeping the same body measurement logic.",
      },
    ],
  },
  {
    id: "plus-sizing",
    label: "Plus Sizing",
    columns: ["", "1X", "2X", "3X"],
    rows: [
      ["US Size", "14W / 16W", "18W / 20W", "22W / 24W"],
      ["Bust", "43 / 45", "47 / 49", "51 / 53"],
      ["Natural Waist", "36 / 38", "40 / 42", "44 / 46"],
      ["Hips", "46 / 48", "50 / 52", "54 / 56"],
    ],
    measurementGuide: [
      {
        heading: "Plus sizing",
        text: "Use the fullest bust, waist, and hip measurements to choose the most comfortable size.",
      },
    ],
  },
  {
    id: "maternity",
    label: "Maternity",
    columns: ["", "XXS", "XS", "S", "M", "L", "XL"],
    rows: [
      ["US Size", "00", "0 / 2", "4 / 6", "8 / 10", "12 / 14", "16"],
      ["Bust", "32 / 34", "34 / 36", "36 / 38", "38 / 40", "40 / 42", "42 / 44"],
      ["Waist", "24 / 26", "26 / 28", "28 / 30", "30 / 32", "32 / 34", "34 / 36"],
      ["Hips", "34 / 36", "36 / 38", "38 / 40", "40 / 42", "42 / 44", "44 / 46"],
    ],
    measurementGuide: [
      {
        heading: "How to choose maternity size",
        text: "Choose the size closest to your pre-pregnancy size. Maternity garments include added ease.",
      },
    ],
  },
];

function readFirst(...values: any[]) {
  for (const value of values) {
    if (value === undefined || value === null) continue;

    const text = String(value).trim();

    if (!text) continue;
    if (text.toLowerCase() === "null") continue;
    if (text.toLowerCase() === "undefined") continue;

    return text;
  }

  return "";
}

function normalizeText(value: any) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeCompare(value?: string) {
  return normalizeText(value);
}

function normalizeHex(value?: string) {
  const text = readFirst(value);

  if (!text) return "";

  if (text.startsWith("#")) {
    return text.toLowerCase();
  }

  const colorMap: Record<string, string> = {
    white: "#ffffff",
    ivory: "#f1ede4",
    "ivory / cloud dancer": "#f1ede4",
    champagne: "#e6d4a1",
    taupe: "#b9aa99",
    "chocolate expresso": "#654034",
    "chocolate espresso": "#654034",
    chocolate: "#654034",
    "blush pink": "#efc0c4",
    blush: "#efc0c4",
    "dusty rose": "#c18086",
    "ruby red": "#a51e39",
    burgundy: "#782332",
    lavender: "#bda9d5",
    amethyst: "#73539b",
    lilac: "#d6bceb",
    plum: "#42163f",
    ice: "#c8d1ea",
    "sky blue": "#c8dff4",
    "baby blue": "#c8dff4",
    "steel blue": "#8ea3bf",
    "dusty blue": "#93a2ad",
    "powder blue": "#b2c5df",
    "sapphire blue": "#2e459b",
    "midnight navy": "#22304a",
    navy: "#22304a",
    black: "#000000",
    olive: "#746d43",
    "sage green": "#9cad8a",
    sage: "#9cad8a",
    emerald: "#17745e",
    "rich teal": "#0b4144",
    butterscotch: "#c58b37",
    bronzer: "#be8061",
    cinnamon: "#bc6a43",
    sienna: "#a8522e",
    "blushing pink": "#e6d1d0",
    "candy pink": "#d4a8c8",
    "barbie pink": "#d84b9a",
    fuchsia: "#bf3b91",
  };

  return colorMap[normalizeText(text)] || "#d8c7b6";
}

function formatMoney(value?: number | string, currency = "USD") {
  if (value === undefined || value === null || value === "") {
    return "Price on request";
  }

  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return String(value).startsWith("$") ? String(value) : `$${value}`;
  }

  if (currency === "INR") {
    return `₹${numeric.toLocaleString("en-IN")}`;
  }

  return `$${numeric.toLocaleString("en-US")}`;
}

function stripHtml(value?: string) {
  return String(value || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getRawProduct(response: any) {
  return (
    response?.data?.product ||
    response?.data?.catalogProduct ||
    response?.data?.item ||
    response?.data ||
    response?.product ||
    response?.catalogProduct ||
    response?.item ||
    response
  );
}

function getProductId(product: any) {
  return readFirst(product?.id, product?.productId, product?.catalogProductId);
}

function getVariantId(variant?: any | null) {
  return readFirst(
    variant?.id,
    variant?.variantId,
    variant?.productVariantId,
    variant?.skuId
  );
}

function getVariants(product: any): CatalogVariant[] {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const inventory = Array.isArray(product?.inventory) ? product.inventory : [];
  const productVariants = Array.isArray(product?.productVariants)
    ? product.productVariants
    : [];

  return [...variants, ...inventory, ...productVariants];
}

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

function detectMediaType(item: any, url: string): "image" | "video" {
  const viewType = readFirst(item?.viewType, item?.type, item?.mediaType)
    .toLowerCase()
    .trim();

  const mimeType = readFirst(item?.mimeType, item?.contentType)
    .toLowerCase()
    .trim();

  const format = readFirst(item?.format)
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

  if (
    viewType.includes("image") ||
    mimeType.includes("image") ||
    lowerUrl.includes("/image/upload/") ||
    IMAGE_FORMATS.includes(format) ||
    IMAGE_FORMATS.includes(extension)
  ) {
    return "image";
  }

  return "image";
}

function getImages(product: any): ProductImage[] {
  const result: ProductImage[] = [];

  if (Array.isArray(product?.images)) {
    product.images.forEach((item: any, index: number) => {
      if (typeof item === "string") {
        const url = readFirst(item);

        if (url) {
          const mediaType = detectMediaType({}, url);

          result.push({
            url,
            alt: readFirst(product?.title, product?.name),
            sortOrder: index,
            isPrimary: index === 0,
            viewType: mediaType,
            format: getUrlExtension(url),
            mediaType,
          });
        }

        return;
      }

      const url = readFirst(
        item?.url,
        item?.secureUrl,
        item?.src,
        item?.imageUrl,
        item?.path,
      );

      if (url) {
        const mediaType = detectMediaType(item, url);

        result.push({
          id: readFirst(item?.id),
          url,
          alt: readFirst(
            item?.alt,
            item?.altText,
            item?.title,
            product?.title,
            product?.name,
          ),
          sortOrder: Number(
            item?.position ?? item?.sortOrder ?? item?.order ?? index,
          ),
          isPrimary: Boolean(item?.isPrimary),
          colorName: readFirst(item?.colorName),
          viewType: readFirst(item?.viewType) || mediaType,
          format: readFirst(item?.format) || getUrlExtension(url),
          mimeType: readFirst(item?.mimeType, item?.contentType),
          mediaType,
        });
      }
    });
  }

  const unique = new Map<string, ProductImage>();

  result
    .filter((media) => media.url)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    .forEach((media) => {
      if (!unique.has(media.url)) {
        unique.set(media.url, media);
      }
    });

  const galleryMedia = Array.from(unique.values());

  if (galleryMedia.length) {
    return galleryMedia;
  }

  const fallbackImage = readFirst(
    product?.thumbnail,
    product?.imageUrl,
    product?.image,
  );

  if (!fallbackImage) return [];

  const mediaType = detectMediaType({}, fallbackImage);

  return [
    {
      url: fallbackImage,
      alt: readFirst(product?.title, product?.name),
      sortOrder: 0,
      isPrimary: true,
      viewType: mediaType,
      format: getUrlExtension(fallbackImage),
      mediaType,
    },
  ];
}

function getColors(product: any): ProductColor[] {
  const result: ProductColor[] = [];

  if (Array.isArray(product?.colors)) {
    product.colors.forEach((item: any) => {
      if (typeof item === "string") {
        const name = readFirst(item);

        if (name) {
          result.push({
            name,
            hex: normalizeHex(name),
            colorHex: normalizeHex(name),
            available: true,
          });
        }

        return;
      }

      const name = readFirst(item?.name, item?.label, item?.value, item?.color);

      if (name) {
        result.push({
          id: readFirst(item?.id),
          name,
          hex: readFirst(item?.hex, item?.colorHex) || normalizeHex(name),
          colorHex: readFirst(item?.colorHex, item?.hex) || normalizeHex(name),
          imageUrl: readFirst(item?.imageUrl),
          available:
            typeof item?.available === "boolean" ? item.available : true,
          selected: Boolean(item?.selected),
        });
      }
    });
  }

  getVariants(product).forEach((variant: any) => {
    const name = readFirst(variant?.color);

    if (name) {
      result.push({
        name,
        hex: readFirst(variant?.colorHex, variant?.hex) || normalizeHex(name),
        colorHex:
          readFirst(variant?.colorHex, variant?.hex) || normalizeHex(name),
        available:
          typeof variant?.available === "boolean" ? variant.available : true,
      });
    }
  });

  const productColor = readFirst(
    product?.defaultColor,
    product?.color,
    product?.primaryColor,
    product?.variantColor
  );

  if (productColor) {
    result.push({
      name: productColor,
      hex: normalizeHex(productColor),
      colorHex: normalizeHex(productColor),
      available: true,
      selected: true,
    });
  }

  const unique = new Map<string, ProductColor>();

  result.forEach((color) => {
    const key = normalizeText(color.name);

    if (!key) return;

    if (!unique.has(key)) {
      unique.set(key, color);
    }
  });

  return Array.from(unique.values());
}

function getSizes(product: any): ProductSize[] {
  const result: ProductSize[] = [];

  if (Array.isArray(product?.sizes)) {
    product.sizes.forEach((item: any) => {
      if (typeof item === "string") {
        const label = readFirst(item);

        if (label) {
          result.push({ label, available: true });
        }

        return;
      }

      const label = readFirst(item?.label, item?.size, item?.name);

      if (label) {
        result.push({
          label,
          available:
            typeof item?.available === "boolean" ? item.available : true,
        });
      }
    });
  }

  getVariants(product).forEach((variant: any) => {
    const label = readFirst(variant?.size);

    if (label) {
      result.push({
        label,
        available:
          typeof variant?.available === "boolean" ? variant.available : true,
      });
    }
  });

  const unique = new Map<string, ProductSize>();

  result.forEach((size) => {
    const key = normalizeText(size.label);

    if (!key) return;

    if (!unique.has(key)) {
      unique.set(key, size);
    }
  });

  return Array.from(unique.values());
}

function getFabricOptions(product: any): FabricOption[] {
  if (Array.isArray(product?.fabricOptions) && product.fabricOptions.length) {
    return product.fabricOptions
      .map((item: any) => ({
        id: readFirst(item?.id, item?.label),
        label: readFirst(item?.label, item?.name, item?.id),
        selected: Boolean(item?.selected),
        available: typeof item?.available === "boolean" ? item.available : true,
      }))
      .filter((item: FabricOption) => item.label);
  }

  const fabric = readFirst(product?.fabric, product?.material);

  return fabric
    ? [
        {
          id: fabric,
          label: fabric,
          selected: true,
          available: true,
        },
      ]
    : [];
}

function getDeliveryOptions(product: any): DeliveryOption[] {
  if (Array.isArray(product?.deliveryOptions) && product.deliveryOptions.length) {
    return product.deliveryOptions
      .map((item: any) => ({
        id: readFirst(item?.id, item?.value, item?.label).toUpperCase(),
        label: readFirst(item?.label, item?.name, item?.id),
        time: readFirst(item?.time, item?.estimatedArrivalText),
        extraPrice: item?.extraPrice,
        available: typeof item?.available === "boolean" ? item.available : true,
        estimatedArrivalText: readFirst(item?.estimatedArrivalText, item?.time),
      }))
      .filter((item: DeliveryOption) => item.id && item.label);
  }

  return [
    {
      id: "STANDARD",
      label: "Standard",
      time: "3-5 business days",
      extraPrice: 0,
      available: true,
      estimatedArrivalText: "3-5 business days",
    },
  ];
}

function getFeatureBadges(product: any) {
  const badges: Array<{ label: string; icon?: string }> = [];

  if (Array.isArray(product?.featureBadges)) {
    product.featureBadges.forEach((item: any) => {
      const label = readFirst(item?.label, item?.name, item);

      if (label) {
        badges.push({ label, icon: readFirst(item?.icon) });
      }
    });
  }

  if (Array.isArray(product?.highlights)) {
    product.highlights.forEach((item: any) => {
      const label = readFirst(item?.label, item?.title, item);

      if (label) {
        badges.push({ label });
      }
    });
  }

  if (Array.isArray(product?.productDetails?.features)) {
    product.productDetails.features.forEach((item: any) => {
      const label = readFirst(item);

      if (label) {
        badges.push({ label });
      }
    });
  }

  const unique = new Map<string, { label: string; icon?: string }>();

  badges.forEach((badge) => {
    const key = normalizeText(badge.label);

    if (!key) return;

    if (!unique.has(key)) {
      unique.set(key, badge);
    }
  });

  return Array.from(unique.values()).slice(0, 4);
}

function mapBackendProduct(rawProduct: any): DetailProduct | null {
  if (!rawProduct || typeof rawProduct !== "object") return null;

  const productId = getProductId(rawProduct);

  if (!productId) return null;

  const images = getImages(rawProduct);
  const colors = getColors(rawProduct);
  const sizes = getSizes(rawProduct);
  const variants = getVariants(rawProduct);
  const fabricOptions = getFabricOptions(rawProduct);
  const deliveryOptions = getDeliveryOptions(rawProduct);

  return {
    id: productId,
    productId,
    title: readFirst(rawProduct?.title, rawProduct?.name, "Untitled Product"),
    name: readFirst(rawProduct?.name),
    slug: readFirst(rawProduct?.slug),
    sku: readFirst(rawProduct?.sku),
    shortDescription: readFirst(rawProduct?.shortDescription),
    description:
      stripHtml(rawProduct?.descriptionHtml) ||
      stripHtml(rawProduct?.description) ||
      readFirst(rawProduct?.shortDescription),
    category: readFirst(
  rawProduct?.categoryName,
  rawProduct?.category,
  rawProduct?.productType,
  rawProduct?.type
),
categoryId: readFirst(rawProduct?.categoryId),
categoryName: readFirst(rawProduct?.categoryName),
categorySlug: readFirst(rawProduct?.categorySlug),
categoryPath: Array.isArray(rawProduct?.categoryPath)
  ? rawProduct.categoryPath
  : [],
breadcrumb: Array.isArray(rawProduct?.breadcrumb)
  ? rawProduct.breadcrumb
  : [],
    brand: readFirst(rawProduct?.brand, "Shahsi"),
    vendor: readFirst(rawProduct?.vendor),
    status: readFirst(rawProduct?.status, rawProduct?.publishStatus),
    price:
      rawProduct?.price ??
      rawProduct?.salePrice ??
      rawProduct?.listingPrice ??
      variants[0]?.price,
    salePrice: rawProduct?.salePrice,
    listingPrice: rawProduct?.listingPrice,
    compareAtPrice: rawProduct?.compareAtPrice,
    currency: readFirst(rawProduct?.currency, "USD"),
    color: readFirst(
      rawProduct?.color,
      rawProduct?.primaryColor,
      rawProduct?.variantColor
    ),
    defaultColor: readFirst(rawProduct?.defaultColor, rawProduct?.color),
    fabric: readFirst(rawProduct?.fabric, rawProduct?.material),
    material: readFirst(rawProduct?.material),
    silhouette: readFirst(
      rawProduct?.silhouette,
      rawProduct?.productDetails?.silhouette
    ),
    neckline: readFirst(
      rawProduct?.neckline,
      rawProduct?.productDetails?.neckline
    ),
    dressLength: readFirst(
      rawProduct?.dressLength,
      rawProduct?.productDetails?.length
    ),
    sleeveLength: readFirst(
      rawProduct?.sleeveLength,
      rawProduct?.productDetails?.sleeves
    ),
    images,
    colors,
    sizes,
    variants,
    fabricOptions,
    deliveryOptions,
    productDetails: rawProduct?.productDetails || {},
    featureBadges: getFeatureBadges(rawProduct),
    shippingAndReturns: readFirst(
      rawProduct?.shippingAndReturns,
      rawProduct?.tabShippingReturns,
      rawProduct?.returnText
    ),
    sizeGuide: rawProduct?.sizeGuide,
    rating: Number(rawProduct?.rating || rawProduct?.reviewsAverage || 0),
    reviewsCount: Number(rawProduct?.reviewsCount || rawProduct?.reviewsTotal || rawProduct?.reviewCount || 0),
    raw: rawProduct,
  };
}

function getVariantIdValue(variant?: CatalogVariant | null) {
  return getVariantId(variant);
}

function normalizeColorValue(color?: string) {
  return normalizeHex(color);
}

function findMatchingVariant(
  product: DetailProduct,
  selectedSize?: string,
  selectedColor?: string
) {
  const size = normalizeCompare(selectedSize);
  const color = normalizeCompare(selectedColor);
  const colorHex = normalizeColorValue(selectedColor);

  const exact = product.variants.find((variant: any) => {
    const variantSize = normalizeCompare(variant?.size);
    const variantColor = normalizeCompare(variant?.color);
    const variantHex = normalizeColorValue(variant?.colorHex || variant?.color);

    const sizeOk = size ? variantSize === size : true;
    const colorOk = color
      ? variantColor === color || variantHex === colorHex
      : true;

    return sizeOk && colorOk && getVariantIdValue(variant);
  });

  if (exact) return exact;

  const sizeMatch = product.variants.find((variant: any) => {
    return (
      size &&
      normalizeCompare(variant?.size) === size &&
      getVariantIdValue(variant)
    );
  });

  if (sizeMatch) return sizeMatch;

  const colorMatch = product.variants.find((variant: any) => {
    const variantColor = normalizeCompare(variant?.color);
    const variantHex = normalizeColorValue(variant?.colorHex || variant?.color);

    return (
      color &&
      (variantColor === color || variantHex === colorHex) &&
      getVariantIdValue(variant)
    );
  });

  if (colorMatch) return colorMatch;

  return product.variants.find((variant) => getVariantIdValue(variant)) || null;
}

function isVariantAvailable(variant?: CatalogVariant | null) {
  if (!variant) return true;

  const status = String(
    (variant as any)?.status ||
      (variant as any)?.availabilityStatus ||
      (variant as any)?.inventoryStatus ||
      ""
  ).toLowerCase();

  if (status.includes("out") || status.includes("sold")) return false;

  if (typeof (variant as any)?.available === "boolean") {
    return (variant as any).available;
  }

  if (typeof (variant as any)?.isAvailable === "boolean") {
    return (variant as any).isAvailable;
  }

  if (typeof (variant as any)?.stock === "number") {
    return (variant as any).stock > 0;
  }

  return true;
}

function getSizeGuideTabs(sizeGuide?: DetailProduct["sizeGuide"]) {
  if (Array.isArray(sizeGuide?.tabs) && sizeGuide.tabs.length) {
    return sizeGuide.tabs;
  }

  return DEFAULT_SIZE_GUIDE_TABS;
}

function valueToText(value: any) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === undefined || value === null || value === "") return "";
  return String(value);
}

function buildProductDetailRows(product: DetailProduct): ProductDetailRow[] {
  const details = product.productDetails || {};
  const raw = product.raw || {};

  return [
    { label: "Length", value: details.length || details.dressLength || product.dressLength },
    { label: "Fabric", value: details.fabric || product.fabric },
    { label: "Silhouette", value: details.silhouette || product.silhouette },
    { label: "Sleeves", value: details.sleeves || details.sleeveLength || product.sleeveLength },
    { label: "Neckline", value: details.neckline || product.neckline },
    { label: "Back style", value: details.backStyle || raw.backStyle },
    { label: "Embellishment", value: details.embellishment || raw.embellishment },
    { label: "Padding", value: details.padding || raw.padding },
    { label: "Boning", value: details.boning || raw.boning },
    { label: "Features", value: details.features },
    { label: "Brand", value: product.brand },
    { label: "Vendor", value: product.vendor },
    { label: "SKU", value: product.sku },
    { label: "Category", value: product.category },
  ].filter((row) => valueToText(row.value));
}

function getRelatedProductId(product: RelatedProductCard) {
  return readFirst(product?.id, product?.productId, product?.catalogProductId);
}

function getRelatedProductTitle(product: RelatedProductCard) {
  return readFirst(product?.title, product?.name, "Product");
}

function getRelatedProductImage(product: RelatedProductCard) {
  if (Array.isArray(product?.images) && product.images.length) {
    const first = product.images[0];

    if (typeof first === "string") {
      return readFirst(first);
    }

    return readFirst(first?.url, first?.secureUrl, first?.src, first?.imageUrl);
  }

  return readFirst(product?.imageUrl, product?.image, product?.thumbnail);
}

function getRelatedProductPrice(product: RelatedProductCard) {
  const price =
    product?.price ??
    product?.salePrice ??
    product?.listingPrice ??
    product?.rentalPrice ??
    product?.resalePrice ??
    "";

  if (price === "" || price === null || price === undefined) return "";

  return formatMoney(price);
}

function normalizeRelatedProducts(value: any): RelatedProductCard[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      id: readFirst(item.id, item.productId, item.catalogProductId),
      productId: readFirst(item.productId, item.id, item.catalogProductId),
      catalogProductId: readFirst(item.catalogProductId),
      title: readFirst(item.title, item.name),
      name: readFirst(item.name, item.title),
      slug: readFirst(item.slug),
      price:
        item.price ??
        item.salePrice ??
        item.listingPrice ??
        item.rentalPrice ??
        item.resalePrice ??
        "",
      salePrice: item.salePrice,
      listingPrice: item.listingPrice,
      rentalPrice: item.rentalPrice,
      resalePrice: item.resalePrice,
      imageUrl: readFirst(item.imageUrl, item.image, item.thumbnail),
      image: readFirst(item.image),
      thumbnail: readFirst(item.thumbnail),
      categoryName: readFirst(item.categoryName),
      categorySlug: readFirst(item.categorySlug),
      color: readFirst(item.color, item.primaryColor, item.variantColor),
      colorHex: readFirst(item.colorHex),
      images: Array.isArray(item.images) ? item.images : [],
    }))
    .filter((item) => getRelatedProductId(item) || getRelatedProductTitle(item));
}

function parseMaybeJsonArray(value: any): any[] {
  if (Array.isArray(value)) return value;

  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getSimilarColorProducts(rawProduct: any): RelatedProductCard[] {
  const sources = [
    rawProduct?.similarColorProductCards,
    rawProduct?.similarColorProducts,
    rawProduct?.similarColorProductCards?.data,
    rawProduct?.similarColorProducts?.data,
    rawProduct?.metafields?.similarColorProductCards,
    rawProduct?.metafields?.similarColorProducts,
  ];

  for (const source of sources) {
    const normalized = normalizeRelatedProducts(parseMaybeJsonArray(source));
    if (normalized.length) return normalized;
  }

  return [];
}

function getSimilarColorProductIds(rawProduct: any) {
  const ids = [
    ...(Array.isArray(rawProduct?.similarColorProducts)
      ? rawProduct.similarColorProducts
      : []),
    ...(Array.isArray(rawProduct?.metafields?.similarColorProducts)
      ? rawProduct.metafields.similarColorProducts
      : []),
  ];

  return Array.from(
    new Set(
      ids
        .map((item) => {
          if (typeof item === "string") return item;
          return readFirst(item?.id, item?.productId, item?.catalogProductId);
        })
        .filter(Boolean)
    )
  );
}

function mapRawProductToRelatedCard(rawProduct: any): RelatedProductCard | null {
  if (!rawProduct) return null;

  const id = getProductId(rawProduct);

  if (!id) return null;

  const images = getImages(rawProduct);
  const firstImage = images[0]?.url || readFirst(rawProduct.imageUrl, rawProduct.image, rawProduct.thumbnail);

  return {
    id,
    productId: id,
    catalogProductId: readFirst(rawProduct.catalogProductId),
    title: readFirst(rawProduct.title, rawProduct.name),
    name: readFirst(rawProduct.name, rawProduct.title),
    slug: readFirst(rawProduct.slug),
    price:
      rawProduct.price ??
      rawProduct.salePrice ??
      rawProduct.listingPrice ??
      rawProduct.rentalPrice ??
      rawProduct.resalePrice ??
      "",
    salePrice: rawProduct.salePrice,
    listingPrice: rawProduct.listingPrice,
    rentalPrice: rawProduct.rentalPrice,
    resalePrice: rawProduct.resalePrice,
    imageUrl: firstImage,
    image: firstImage,
    thumbnail: readFirst(rawProduct.thumbnail),
    categoryName: readFirst(rawProduct.categoryName),
    categorySlug: readFirst(rawProduct.categorySlug),
    color: readFirst(rawProduct.color, rawProduct.primaryColor, rawProduct.variantColor),
    colorHex: readFirst(rawProduct.colorHex),
    images: rawProduct.images || [],
  };
}

function getBreadcrumbLabel(item: any) {
  if (!item) return "";

  if (typeof item === "string") {
    return readFirst(item);
  }

  return readFirst(
    item.name,
    item.label,
    item.title,
    item.categoryName,
    item.slug
  );
}

function getBreadcrumbSlug(item: any) {
  if (!item || typeof item === "string") return "";

  return readFirst(
    item.slug,
    item.categorySlug,
    item.seoSlug,
    item.value
  );
}

function getProductBreadcrumbItems(product: DetailProduct) {
  const raw = product.raw || {};

  const backendBreadcrumb = Array.isArray(product.breadcrumb)
    ? product.breadcrumb
        .map((item) => ({
          label: getBreadcrumbLabel(item),
          slug: getBreadcrumbSlug(item),
        }))
        .filter((item) => item.label)
    : [];

  if (backendBreadcrumb.length) {
    return backendBreadcrumb;
  }

  const categoryPath = Array.isArray(product.categoryPath)
    ? product.categoryPath
        .map((item) => ({
          label: getBreadcrumbLabel(item),
          slug: getBreadcrumbSlug(item),
        }))
        .filter((item) => item.label)
    : [];

  if (categoryPath.length) {
    return categoryPath;
  }

  const rawBreadcrumb = Array.isArray(raw.breadcrumb)
    ? raw.breadcrumb
        .map((item: any) => ({
          label: getBreadcrumbLabel(item),
          slug: getBreadcrumbSlug(item),
        }))
        .filter((item: any) => item.label)
    : [];

  if (rawBreadcrumb.length) {
    return rawBreadcrumb;
  }

  const rawCategoryPath = Array.isArray(raw.categoryPath)
    ? raw.categoryPath
        .map((item: any) => ({
          label: getBreadcrumbLabel(item),
          slug: getBreadcrumbSlug(item),
        }))
        .filter((item: any) => item.label)
    : [];

  if (rawCategoryPath.length) {
    return rawCategoryPath;
  }

  const categoryName = readFirst(
    product.categoryName,
    raw.categoryName,
    product.category,
    raw.category,
    raw.primaryCollection,
    raw.productType,
    raw.type
  );

  const categorySlug = readFirst(
    product.categorySlug,
    raw.categorySlug,
    raw.primaryCollection,
    raw.productType,
    raw.type
  );

  return categoryName
    ? [
        {
          label: categoryName,
          slug: categorySlug,
        },
      ]
    : [
        {
          label: "Bridesmaids",
          slug: "bridesmaid-products",
        },
      ];
}

function getCategoryBreadcrumbHref(item: { label: string; slug?: string }) {
  const slug = readFirst(item.slug);

  if (!slug) return "/bridesmaid";

  return `/bridesmaid?categorySlug=${encodeURIComponent(slug)}`;
}

export default function BridesmaidProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = String(params?.productId || "");

  const [product, setProduct] = useState<DetailProduct | null>(null);

  const [similarColorProducts, setSimilarColorProducts] = useState<RelatedProductCard[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [zoomPanelStyle, setZoomPanelStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedFabric, setSelectedFabric] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeSizeGuideTab, setActiveSizeGuideTab] = useState("");
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleImageZoomMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const gap = 22;
    const panelWidth = rect.width;
    const panelHeight = rect.height;
    const panelLeft = rect.right + gap;
    const panelTop = rect.top;

    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });

    setZoomPanelStyle({
      left: panelLeft,
      top: panelTop,
      width: panelWidth,
      height: panelHeight,
    });
  }

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await getCatalogProductById(productId);
        const rawProduct = getRawProduct(response);

        if (!isPublicVisibleProduct(rawProduct)) {
          if (!mounted) return;

          setProduct(null);
          setError("Product active/published nahi hai.");
          return;
        }

        const mappedProduct = mapBackendProduct(rawProduct);

        if (!mounted) return;

        if (!mappedProduct) {
          setProduct(null);
          setError("Product detail backend response me valid product id nahi mila.");
          return;
        }

        const firstImage = mappedProduct.images[0]?.url || "";
        const firstColor =
          mappedProduct.defaultColor ||
          mappedProduct.color ||
          mappedProduct.colors[0]?.name ||
          "";
        const selectedFabricOption =
          mappedProduct.fabricOptions.find((item) => item.selected)?.label ||
          mappedProduct.fabricOptions[0]?.label ||
          "";
        const firstSize = mappedProduct.sizes[0]?.label || "";
        const firstDelivery = mappedProduct.deliveryOptions[0]?.id || "";
        const firstSizeGuideTab =
          getSizeGuideTabs(mappedProduct.sizeGuide)[0]?.id || "";

        setProduct(mappedProduct);
        setSelectedImage(firstImage);
        setSelectedColor(firstColor);
        setSelectedFabric(selectedFabricOption);
        setSelectedSize(firstSize);
        setSelectedDelivery(firstDelivery);
        setActiveSizeGuideTab(firstSizeGuideTab);

        setProduct(mappedProduct);
setSelectedImage(firstImage);
setSelectedColor(firstColor);
setSelectedFabric(selectedFabricOption);
setSelectedSize(firstSize);
setSelectedDelivery(firstDelivery);
setActiveSizeGuideTab(firstSizeGuideTab);

const hydratedSimilarColorProducts = getSimilarColorProducts(rawProduct);

if (hydratedSimilarColorProducts.length) {
  setSimilarColorProducts(hydratedSimilarColorProducts);
} else {
  const similarIds = getSimilarColorProductIds(rawProduct);

  if (similarIds.length) {
    const relatedResults = await Promise.allSettled(
      similarIds.map(async (id) => {
        const relatedResponse = await getCatalogProductById(id);
        const relatedRaw = getRawProduct(relatedResponse);
        return mapRawProductToRelatedCard(relatedRaw);
      })
    );

    const relatedCards = relatedResults
      .map((result) => {
        if (result.status !== "fulfilled") return null;
        return result.value;
      })
      .filter(Boolean) as RelatedProductCard[];

    if (mounted) {
      setSimilarColorProducts(relatedCards);
    }
  } else {
    setSimilarColorProducts([]);
  }
}
      } catch (err: any) {
        console.error("Product detail load failed:", err);

        if (!mounted) return;

        setProduct(null);
        setError(err?.message || "Product detail load failed.");
        setSimilarColorProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (productId) loadProduct();

    return () => {
      mounted = false;
    };
  }, [productId]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return findMatchingVariant(product, selectedSize, selectedColor);
  }, [product, selectedSize, selectedColor]);

  const selectedVariantId = getVariantIdValue(selectedVariant);
  const variantAvailable = isVariantAvailable(selectedVariant);

  const selectedColorObject = useMemo(() => {
    if (!product) return null;

    return (
      product.colors.find(
        (item) => normalizeCompare(item.name) === normalizeCompare(selectedColor)
      ) || null
    );
  }, [product, selectedColor]);

  const priceText = product ? formatMoney(product.price, product.currency) : "";
  const compareAtPriceText =
    product && product.compareAtPrice
      ? formatMoney(product.compareAtPrice, product.currency)
      : "";

  const sizeGuideTabs = product ? getSizeGuideTabs(product.sizeGuide) : [];
  const activeSizeGuide =
    sizeGuideTabs.find((tab) => tab.id === activeSizeGuideTab) ||
    sizeGuideTabs[0];

  const productDetailRows = product ? buildProductDetailRows(product) : [];

 const breadcrumbItems: BreadcrumbItem[] = product
  ? getProductBreadcrumbItems(product)
  : [];

  const selectedMedia =
  product?.images.find((item) => item.url === selectedImage) ||
  product?.images[0] ||
  null;
  

  async function handleAddToBag() {
    if (!product) return;

    if (!product.productId) {
      setError("Product ID missing from backend.");
      return;
    }

    try {
      setCartLoading(true);
      setError("");
      setSuccessMessage("");

      await addToCart({
        productId: product.productId,
        variantId: selectedVariantId || undefined,
        quantity,
        deliveryOption: selectedDelivery || "STANDARD",
      } as any);

      setSuccessMessage("Product added to bag.");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart-updated"));
      }
    } catch (error: any) {
      console.error("Add to cart failed:", error);

      const message = error?.message || "Product could not be added to bag.";

      if (message.toLowerCase().includes("unauthorized")) {
        setError("Please login first to add this product to bag.");

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "redirectAfterLogin",
            window.location.pathname + window.location.search
          );
        }

        return;
      }

      setError(message);
    } finally {
      setCartLoading(false);
    }
  }

  async function handleBuyNow() {
    await handleAddToBag();
    router.push("/cart");
  }

  function handleAddThroughWorkspace() {
    if (!product) return;

    const selection = {
      productId: product.productId,
      variantId: selectedVariantId,
      title: product.title,
      image: selectedImage || product.images[0]?.url || "",
      price: priceText,
      color: selectedColor,
      size: selectedSize,
      delivery: selectedDelivery,
      quantity,
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("bridalLastSelectedDress", JSON.stringify(selection));
      localStorage.setItem("bridalLastAssignedProductId", product.productId);

      if (selectedVariantId) {
        localStorage.setItem("bridalLastAssignedVariantId", selectedVariantId);
      }
    }

    setSuccessMessage("Selection saved for Bridal Workspace.");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-[#15100c]">
        <SiteHeader />

        <section className="mx-auto grid max-w-[1220px] gap-9 px-6 py-10 lg:grid-cols-[520px_minmax(0,560px)] lg:px-10">
          <div className="grid gap-4 lg:grid-cols-[62px_minmax(0,1fr)]">
            <div className="hidden space-y-3 lg:block">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[78px] animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-[#e7ded2] via-white to-[#e7ded2] bg-[length:220%_100%]"
                />
              ))}
            </div>

            <div className="h-[620px] animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-[#e7ded2] via-white to-[#e7ded2] bg-[length:220%_100%]" />
          </div>

          <div className="space-y-5 pt-2">
            <div className="h-4 w-48 animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-[#e7ded2] via-white to-[#e7ded2] bg-[length:220%_100%]" />
            <div className="h-12 w-3/4 animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-[#e7ded2] via-white to-[#e7ded2] bg-[length:220%_100%]" />
            <div className="h-5 w-1/2 animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-[#e7ded2] via-white to-[#e7ded2] bg-[length:220%_100%]" />
            <div className="h-[280px] animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-[#e7ded2] via-white to-[#e7ded2] bg-[length:220%_100%]" />
          </div>
        </section>

        <ProductDetailAnimationStyles />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-white text-[#15100c]">
        <SiteHeader />

        <div className="mx-auto max-w-[900px] px-6 py-16 lg:px-10">
          <div className="animate-[fadeUpProduct_650ms_ease_both] border border-red-200 bg-red-50 px-6 py-8 text-red-700">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 shrink-0" />
              <span>{error || "Product nahi mila."}</span>
            </div>

            <a
              href="/bridesmaid"
              className="mt-6 inline-flex h-[44px] items-center justify-center border border-[#15100c] px-5 text-[10px] uppercase tracking-[0.24em] text-[#15100c]"
            >
              Back to Bridesmaid
            </a>
          </div>
        </div>

        <ProductDetailAnimationStyles />
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-white text-[#15100c] selection:bg-[#15100c] selection:text-white">
      <SiteHeader />

    <section className="border-b border-[#e7e0d7] bg-white px-6 py-[18px] lg:px-10">
  <div className="mx-auto flex max-w-[1220px] flex-wrap items-center justify-between gap-4">
    <div className="animate-[fadeUpProduct_650ms_ease_both] flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[#7a746e]">
      <a href="/" className="hover:text-[#15100c]">
        Home
      </a>

     {breadcrumbItems.map(
  (
    item: {
      label: string;
      href?: string;
    },
    index: number,
  ) => (
    <React.Fragment key={`${item.label}-${index}`}>
      <span>/</span>

          <a
            href={getCategoryBreadcrumbHref(item)}
            className="hover:text-[#15100c]"
          >
            {item.label}
          </a>
        </React.Fragment>
      ))}

      <span>/</span>

      <span className="max-w-[300px] truncate text-[#15100c]">
        {product.title}
      </span>
    </div>

    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[#7a746e] transition hover:-translate-x-1 hover:text-[#15100c]"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  </div>
</section>

      <section className="relative overflow-visible bg-white px-6 py-8 lg:px-10">
        <div className="relative mx-auto grid max-w-[1260px] gap-12 overflow-visible lg:grid-cols-[500px_minmax(0,560px)] lg:items-start lg:justify-center xl:gap-20">
          <div className="animate-[productImageIn_850ms_cubic-bezier(0.22,1,0.36,1)_both] grid gap-3 lg:grid-cols-[62px_minmax(0,1fr)]">
            <div className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible">
              {product.images.map((image, index) => (
                <button
                  key={`${image.url}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image.url)}
                  className={[
                    "h-[78px] w-[58px] shrink-0 overflow-hidden border bg-[#f3f0eb] transition-all duration-300",
                    selectedImage === image.url
                      ? "border-[#15100c] shadow-[0_8px_18px_rgba(23,17,13,0.14)]"
                      : "border-[#ddd5c9] hover:border-[#15100c]",
                  ].join(" ")}
                >
                {image.mediaType === "video" ? (
  <div className="relative h-full w-full bg-black">
    <video
      src={image.url}
      muted
      playsInline
      preload="metadata"
      className="h-full w-full object-cover object-center"
    />

    <span className="absolute inset-0 grid place-items-center bg-black/25 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
      Video
    </span>
  </div>
) : (
  <img
    src={image.url}
    alt={image.alt || product.title || "Product image"}
    className="h-full w-full object-cover object-top"
  />
)}
                </button>
              ))}
            </div>

         <div
  className={[
    "group relative flex h-[620px] items-center justify-center overflow-visible bg-transparent",
    selectedMedia?.mediaType === "video" ? "cursor-default" : "cursor-crosshair",
  ].join(" ")}
  onMouseEnter={(event) => {
    if (selectedMedia?.mediaType === "video") return;
    setZoomVisible(true);
    handleImageZoomMove(event);
  }}
  onMouseLeave={() => setZoomVisible(false)}
  onMouseMove={(event) => {
    if (selectedMedia?.mediaType === "video") return;
    handleImageZoomMove(event);
  }}
>
              {selectedImage ? (
                <>
                  <div className="relative h-full w-full overflow-hidden bg-[#f3f0eb]">
                   {selectedMedia?.mediaType === "video" ? (
  <video
    src={selectedMedia.url}
    controls
    autoPlay
    muted
    loop
    playsInline
    preload="metadata"
    className="h-full w-full bg-black object-contain object-center"
  />
) : (
  <img
    src={selectedImage}
    alt={product.title}
    className="h-full w-full object-contain object-center transition duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.01]"
  />
)}

                 {selectedMedia?.mediaType !== "video" ? (
  <>
    <div
      className={[
        "pointer-events-none absolute inset-0 bg-[#15100c]/18 transition-opacity duration-150",
        zoomVisible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    />

    <div
      className={[
        "pointer-events-none absolute h-[330px] w-[250px] border border-[#15100c]/35 bg-white/20 shadow-[0_18px_45px_rgba(23,17,13,0.18)] backdrop-blur-[1px] transition-opacity duration-150",
        zoomVisible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      style={{
        left: `${zoomPosition.x}%`,
        top: `${zoomPosition.y}%`,
        transform: "translate(-50%, -50%)",
      }}
    />

    <span
      className={[
        "pointer-events-none absolute z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-[26px] leading-none text-[#9bb231] transition-opacity duration-150",
        zoomVisible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      style={{
        left: `${zoomPosition.x}%`,
        top: `${zoomPosition.y}%`,
      }}
    >
      +
    </span>
  </>
) : null}

                    <button
                      type="button"
                      className="absolute right-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-[#15100c] shadow-[0_10px_26px_rgba(23,17,13,0.14)] transition hover:scale-110 hover:bg-[#15100c] hover:text-white"
                    >
                      <Heart className="h-5 w-5 stroke-[1.5]" />
                    </button>
                  </div>

                {selectedMedia?.mediaType !== "video" && typeof document !== "undefined"
  ? createPortal(
                        <div
                          className={[
                            "pointer-events-none fixed z-[2147483647] overflow-hidden border border-[#ddd5c9] bg-white shadow-[0_30px_90px_rgba(23,17,13,0.28)] transition-[opacity,transform] duration-150 ease-out",
                            zoomVisible
                              ? "translate-x-0 scale-100 opacity-100"
                              : "translate-x-3 scale-[0.99] opacity-0",
                          ].join(" ")}
                          style={{
                            left: zoomPanelStyle.left,
                            top: zoomPanelStyle.top,
                            width: zoomPanelStyle.width,
                            height: zoomPanelStyle.height,
                          }}
                        >
                          <div
                            className="h-full w-full bg-no-repeat"
                            style={{
                              backgroundImage: `url(${selectedImage})`,
                              backgroundSize: "230%",
                              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                            }}
                          />
                        </div>,
                        document.body
                      )
                    : null}
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center px-8 text-center text-[12px] uppercase tracking-[0.28em] text-[#8b867f]">
                  No image from backend
                </div>
              )}
            </div>
          </div>

          <aside className="animate-[productPanelIn_850ms_cubic-bezier(0.22,1,0.36,1)_both] lg:self-start">
            <div className="bg-white">
              <div className="pb-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {product.featureBadges.slice(0, 2).map((badge) => (
                    <span
                      key={badge.label}
                      className="rounded-full bg-[#e9dfd4] px-3 py-1 text-[11px] font-semibold text-[#6b5b4d]"
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>

                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.34em] text-[#b98262]">
                      {product.brand || "Shahsi"} · {product.category || "Bridesmaid"}
                    </p>

                    <h1 className="max-w-[460px] text-[30px] font-semibold leading-[1.02] tracking-[-0.035em] text-[#15100c] lg:text-[36px]">
                      {product.title}
                    </h1>

                    {product.shortDescription ? (
                      <p className="mt-3 text-[15px] leading-6 text-[#6d6760]">
                        {product.shortDescription}
                      </p>
                    ) : null}

                    {product.rating || product.reviewsCount ? (
                      <div className="mt-3 inline-flex items-center gap-2 text-[13px] text-[#15100c]">
                        {product.reviewsCount ? (
                          <span className="underline underline-offset-2">
                            Reviews({product.reviewsCount})
                          </span>
                        ) : null}

                        {product.rating ? (
                          <span className="inline-flex items-center text-[#15100c]">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className={[
                                  "h-[14px] w-[14px]",
                                  index < Math.round(product.rating || 0)
                                    ? "fill-[#15100c]"
                                    : "fill-transparent",
                                ].join(" ")}
                              />
                            ))}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[26px] font-semibold leading-none text-[#15100c]">
                      {priceText}
                    </p>

                    {compareAtPriceText ? (
                      <p className="mt-4 text-[14px] font-light text-[#8b867f] line-through">
                        {compareAtPriceText}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-6 border-y border-[#ddd5c9] py-6">
                {product.fabricOptions.length ? (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-[#8b867f]">
                        Fabric
                      </p>

                      {selectedFabric ? (
                        <p className="text-[13px] text-[#15100c]">
                          {selectedFabric}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {product.fabricOptions.map((fabric) => {
                        const active = selectedFabric === fabric.label;

                        return (
                          <button
                            key={fabric.id || fabric.label}
                            type="button"
                            onClick={() => setSelectedFabric(fabric.label)}
                            disabled={fabric.available === false}
                            className={[
                              "h-[44px] border px-2 text-[13px] font-semibold transition-all duration-300",
                              active
                                ? "border-[#15100c] bg-[#15100c] text-white"
                                : "border-[#d8d0c4] bg-white text-[#15100c] hover:border-[#15100c]",
                              fabric.available === false
                                ? "cursor-not-allowed opacity-50"
                                : "",
                            ].join(" ")}
                          >
                            {fabric.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {product.colors.length ? (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-[#8b867f]">
                        Color
                      </p>

                      <p className="text-[13px] text-[#15100c]">
                        {selectedColor}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setColorDropdownOpen((value) => !value)}
                      className="flex h-[52px] w-full items-center justify-between border border-[#15100c] bg-white px-4 text-left transition hover:shadow-[0_10px_24px_rgba(23,17,13,0.08)]"
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className="h-[26px] w-[26px] rounded-full border border-[#d8d0c4]"
                          style={{
                            backgroundColor:
                              selectedColorObject?.hex ||
                              normalizeHex(selectedColor),
                          }}
                        />

                        <span className="text-[14px] font-semibold text-[#15100c]">
                          {selectedColor || "Select color"}
                        </span>
                      </span>

                      <ChevronDown
                        className={[
                          "h-5 w-5 transition",
                          colorDropdownOpen ? "rotate-180" : "",
                        ].join(" ")}
                      />
                    </button>

                    {colorDropdownOpen ? (
                      <div className="mt-2 animate-[fadeUpProduct_300ms_ease_both] border border-[#ddd5c9] bg-white p-4 shadow-[0_18px_45px_rgba(23,17,13,0.14)]">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {product.colors.map((color) => (
                            <button
                              key={`dropdown-${color.id || color.name}`}
                              type="button"
                              onClick={() => {
                                setSelectedColor(color.name);
                                setColorDropdownOpen(false);
                              }}
                              disabled={color.available === false}
                              className="flex items-center gap-2 px-2 py-2 text-left text-[13px] transition hover:bg-[#f7f1e8] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <span
                                className="h-5 w-5 rounded-full border border-[#cfc6ba]"
                                style={{
                                  backgroundColor:
                                    color.hex || normalizeHex(color.name),
                                }}
                              />

                              {color.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-4 grid grid-cols-8 gap-x-[12px] gap-y-[14px] sm:grid-cols-10">
                      {product.colors.map((color, index) => {
                        const active =
                          normalizeCompare(color.name) ===
                          normalizeCompare(selectedColor);

                        return (
                          <button
                            key={`${color.id || color.name}-${index}`}
                            type="button"
                            onClick={() => setSelectedColor(color.name)}
                            disabled={color.available === false}
                            className={[
                              "group relative flex h-[34px] w-[34px] items-center justify-center rounded-full border transition-all duration-300 hover:scale-110",
                              active
                                ? "border-[#15100c] ring-2 ring-[#15100c] ring-offset-2"
                                : "border-[#dfd7cc]",
                              color.available === false
                                ? "cursor-not-allowed opacity-50"
                                : "",
                            ].join(" ")}
                            title={color.name}
                          >
                            <span
                              className="block h-full w-full rounded-full"
                              style={{
                                backgroundColor:
                                  color.hex || normalizeHex(color.name),
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {product.sizes.length ? (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-[#8b867f]">
                        Size
                      </p>

                      {sizeGuideTabs.length ? (
                        <button
                          type="button"
                          onClick={() => setSizeGuideOpen(true)}
                          className="inline-flex items-center gap-2 text-[13px] text-[#15100c] underline underline-offset-2"
                        >
                          <Ruler className="h-4 w-4" />
                          Size chart
                        </button>
                      ) : null}
                    </div>

                    <select
                      value={selectedSize}
                      onChange={(event) => setSelectedSize(event.target.value)}
                      className="h-[52px] w-full border border-[#15100c] bg-white px-4 text-[14px] font-semibold text-[#15100c] outline-none transition focus:shadow-[0_10px_24px_rgba(23,17,13,0.08)]"
                    >
                      {product.sizes.map((size) => (
                        <option key={size.label} value={size.label}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {product.deliveryOptions.length ? (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-[#8b867f]">
                        Delivery
                      </p>

                      <p className="text-[12px] text-[#7a746e]">
                        {
                          product.deliveryOptions.find(
                            (item) => item.id === selectedDelivery
                          )?.estimatedArrivalText
                        }
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {product.deliveryOptions.map((option) => {
                        const active = selectedDelivery === option.id;
                        const extraPrice = Number(option.extraPrice || 0);

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedDelivery(option.id)}
                            disabled={option.available === false}
                            className={[
                              "flex items-start justify-between gap-4 border px-4 py-4 text-left transition-all duration-300",
                              active
                                ? "border-[#15100c] bg-white shadow-[0_10px_24px_rgba(23,17,13,0.08)]"
                                : "border-[#ddd5c9] bg-white hover:border-[#15100c]",
                              option.available === false
                                ? "cursor-not-allowed opacity-50"
                                : "",
                            ].join(" ")}
                          >
                            <span>
                              <span className="block text-[12px] uppercase tracking-[0.22em] text-[#15100c]">
                                {option.label}
                              </span>

                              <span className="mt-1 block text-[12px] text-[#7a746e]">
                                {option.time || option.estimatedArrivalText}
                              </span>
                            </span>

                            <span className="text-right text-[12px] font-semibold text-[#15100c]">
                              {extraPrice > 0
                                ? formatMoney(extraPrice, product.currency)
                                : "Free"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div>
                  <p className="mb-3 text-[11px] uppercase tracking-[0.32em] text-[#8b867f]">
                    Quantity
                  </p>

                  <div className="inline-flex h-[42px] items-center border border-[#ddd5c9] bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((value) => Math.max(1, value - 1))
                      }
                      className="flex h-full w-[42px] items-center justify-center transition hover:bg-[#f3eadf]"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="flex h-full min-w-[42px] items-center justify-center border-x border-[#ddd5c9] text-[14px]">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => setQuantity((value) => value + 1)}
                      className="flex h-full w-[42px] items-center justify-center transition hover:bg-[#f3eadf]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {!selectedVariantId ? (
                  <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Variant ID missing hai. Backend variant mapping check karna hoga.
                  </div>
                ) : null}

                {!variantAvailable ? (
                  <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Selected size/color currently unavailable hai.
                  </div>
                ) : null}

                {error ? (
                  <div className="flex items-center gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <XCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                ) : null}

                {successMessage ? (
                  <div className="flex items-center gap-3 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {successMessage}
                  </div>
                ) : null}

                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={handleAddToBag}
                    disabled={!variantAvailable || cartLoading}
                    className="inline-flex h-[54px] items-center justify-center gap-3 bg-[#15100c] px-6 text-[11px] uppercase tracking-[0.28em] text-white transition-all duration-300 hover:bg-[#b98262] disabled:cursor-not-allowed disabled:bg-[#8b867f]"
                  >
                    {cartLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShoppingBag className="h-4 w-4" />
                    )}

                    {cartLoading ? "Adding..." : `Add to Bag · ${priceText}`}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={!variantAvailable || cartLoading}
                    className="inline-flex h-[52px] items-center justify-center gap-3 border border-[#15100c] px-6 text-[11px] uppercase tracking-[0.28em] text-[#15100c] transition-all duration-300 hover:bg-[#15100c] hover:text-white disabled:cursor-not-allowed disabled:border-[#b8afa4] disabled:text-[#b8afa4]"
                  >
                    Buy Now · {priceText}
                  </button>

                  <button
                    type="button"
                    onClick={handleAddThroughWorkspace}
                    className="inline-flex h-[46px] items-center justify-center gap-2 border border-[#ddd5c9] bg-white text-[10px] uppercase tracking-[0.24em] text-[#15100c] transition-all duration-300 hover:border-[#15100c]"
                  >
                    <Sparkles className="h-4 w-4" />
                    Add through Bridal Workspace
                  </button>
                </div>
              </div>

              {product.featureBadges.length ? (
                <div className="grid grid-cols-2 gap-5 border-b border-[#ddd5c9] py-10 sm:grid-cols-3">
                  {product.featureBadges.slice(0, 3).map((badge) => (
                    <div
                      key={badge.label}
                      className="flex items-center gap-4 bg-white px-1 py-2 transition hover:-translate-y-1"
                    >
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#f2e8e4]">
                        <PackageCheck className="h-5 w-5 stroke-[1.4]" />
                      </span>

                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                        {badge.label}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="grid gap-0 pt-8">
                <ProductPromise
                  icon={<Truck />}
                  title="Shipping"
                  copy={
                    product.deliveryOptions.find(
                      (item) => item.id === selectedDelivery
                    )?.estimatedArrivalText ||
                    product.shippingAndReturns ||
                    "Shipping timeline depends on selected delivery option."
                  }
                />

                <ProductPromise
                  icon={<RefreshCcw />}
                  title="Returns"
                  copy="Eligible items can be resized, restyled, or returned as per policy."
                />

                <ProductPromise
                  icon={<ShieldCheck />}
                  title="Secure Checkout"
                  copy="Protected payment flow and order support."
                />
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-[#ddd5c9] bg-white px-6 py-14 lg:px-10">
        <div className="mx-auto max-w-[1060px]">
          <div className="animate-[fadeUpProduct_850ms_cubic-bezier(0.22,1,0.36,1)_both] divide-y divide-[#ddd5c9] border-y border-[#ddd5c9]">
            <DetailAccordion title="Product Details" defaultOpen>
              <div className="grid gap-6 md:grid-cols-[150px_minmax(0,1fr)]">
                <div className="flex items-start gap-4">
                  <PackageCheck className="h-7 w-7 stroke-[1.3]" />

                  <h3 className="text-[18px] font-semibold text-[#15100c]">
                    Product Details
                  </h3>
                </div>

                <div>
                  <h4 className="mb-2 text-[14px] font-semibold">Description</h4>

                  <p className="text-[14px] leading-7 text-[#5f5a54]">
                    {product.description || product.shortDescription || "—"}
                  </p>

                  {productDetailRows.length ? (
                    <div className="mt-6 grid gap-x-10 gap-y-3 text-[14px] text-[#5f5a54] md:grid-cols-2">
                      {productDetailRows.map((row) => (
                        <p key={row.label}>
                          <b className="text-[#15100c]">{row.label} :</b>{" "}
                          {valueToText(row.value)}
                        </p>
                      ))}
                    </div>
                  ) : null}

                  {Array.isArray(product.productDetails?.notes) &&
                  product.productDetails.notes.length ? (
                    <div className="mt-5 space-y-1 text-[14px] italic text-[#5f5a54]">
                      {product.productDetails.notes.map((note: string) => (
                        <p key={note}>*{note}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </DetailAccordion>

            <DetailAccordion title="Tips From The Pros">
              <p>
                Choose your usual size for a fitted look. For special fitting needs,
                use the size guide before adding to bag.
              </p>
            </DetailAccordion>

            <DetailAccordion title="Shipping & Returns">
              <p>
                {product.shippingAndReturns ||
                  "Shipping and return details depend on selected delivery option."}
              </p>
            </DetailAccordion>
          </div>
        </div>
      </section>

<SimilarColorProductsSection products={similarColorProducts} />

      {sizeGuideOpen && activeSizeGuide ? (
        <SizeGuideModal
          tabs={sizeGuideTabs}
          activeTab={activeSizeGuideTab}
          onChangeTab={setActiveSizeGuideTab}
          onClose={() => setSizeGuideOpen(false)}
        />
      ) : null}

      <ProductDetailAnimationStyles />
    </main>
  );
}

function SimilarColorProductsSection({
  products,
}: {
  products: RelatedProductCard[];
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  if (!products.length) return null;

  function scrollProducts(direction: "left" | "right") {
    const element = scrollRef.current;
    if (!element) return;

    const firstCard = element.querySelector<HTMLElement>("[data-related-card]");
    const cardWidth = firstCard?.offsetWidth || 320;
    const gap = 28;
    const amount = cardWidth + gap;

    element.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section className="relative border-t border-[#e7e0d7] bg-white px-4 py-[70px] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-10 text-center">
          <h2 className="text-[42px] font-semibold leading-none tracking-[-0.045em] text-[#15100c] md:text-[56px]">
            You May Also Like
          </h2>
        </div>

        <div className="relative">
          {products.length > 4 ? (
            <button
              type="button"
              onClick={() => scrollProducts("left")}
              aria-label="Previous similar products"
              className="absolute -left-3 top-[42%] z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#15100c] shadow-[0_12px_30px_rgba(23,17,13,0.14)] transition hover:scale-105 hover:bg-[#15100c] hover:text-white lg:flex"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : null}

          <div
            ref={scrollRef}
            className="similar-products-scroll flex gap-7 overflow-x-auto scroll-smooth pb-2"
          >
            {products.map((item, index) => {
              const id = getRelatedProductId(item);
              const title = getRelatedProductTitle(item);
              const image = getRelatedProductImage(item);
              const price = getRelatedProductPrice(item);

              return (
                <a
                  key={`${id || title}-${index}`}
                  data-related-card
                  href={id ? `/bridesmaid/${id}` : "#"}
                  className="group min-w-[78vw] max-w-[78vw] shrink-0 sm:min-w-[46%] sm:max-w-[46%] lg:min-w-[calc((100%-84px)/4)] lg:max-w-[calc((100%-84px)/4)]"
                >
                  <div className="aspect-[3/4.15] overflow-hidden bg-[#eee8df]">
                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-5 text-center text-[11px] uppercase tracking-[0.24em] text-[#8b867f]">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-start justify-between gap-4 text-[18px] leading-6 text-[#15100c]">
                    <h3 className="min-w-0 flex-1 truncate font-normal transition group-hover:text-[#b98262]">
                      {title}
                    </h3>

                    {price ? (
                      <p className="shrink-0 font-normal">{price}</p>
                    ) : null}
                  </div>
                </a>
              );
            })}
          </div>

          {products.length > 4 ? (
            <button
              type="button"
              onClick={() => scrollProducts("right")}
              aria-label="Next similar products"
              className="absolute -right-3 top-[42%] z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#15100c] shadow-[0_12px_30px_rgba(23,17,13,0.14)] transition hover:scale-105 hover:bg-[#15100c] hover:text-white lg:flex"
            >
              <ArrowLeft className="h-5 w-5 rotate-180" />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ProductPromise({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="group flex gap-4 border-t border-[#ddd5c9] bg-white px-0 py-5 transition-colors duration-300 hover:text-[#b98262]">
      <span className="mt-0.5 text-[#b98262] transition-transform duration-300 group-hover:translate-x-1 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>

      <div className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
        <h3 className="text-[12px] uppercase tracking-[0.22em] text-[#15100c] transition-colors duration-300 group-hover:text-[#b98262]">
          {title}
        </h3>

        <p className="mt-1 text-[12px] leading-5 text-[#7a746e]">
          {copy}
        </p>
      </div>
    </div>
  );
}

function DetailAccordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group flex w-full items-center justify-between py-6 text-left text-[11px] uppercase tracking-[0.34em] text-[#15100c] transition-colors duration-300 hover:text-[#b98262]"
      >
        <span className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
          {title}
        </span>

        {open ? (
          <Minus className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:rotate-90" />
        ) : (
          <Plus className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:rotate-90" />
        )}
      </button>

      {open ? (
        <div className="animate-[fadeUpProduct_350ms_ease_both] pb-7 text-[14px] font-light leading-7 text-[#6d6760]">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function SizeGuideModal({
  tabs,
  activeTab,
  onChangeTab,
  onClose,
}: {
  tabs: SizeGuideTab[];
  activeTab: string;
  onChangeTab: (value: string) => void;
  onClose: () => void;
}) {
  const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const columns = currentTab?.columns || [];
  const rows = currentTab?.rows || [];
  const guideItems = currentTab?.measurementGuide || [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-[2px]">
      <div className="relative animate-[modalPopProduct_420ms_cubic-bezier(0.22,1,0.36,1)_both] max-h-[92vh] w-full max-w-[760px] overflow-hidden bg-white shadow-[0_30px_100px_rgba(23,17,13,0.25)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center text-[24px] leading-none text-[#6d6760] transition hover:bg-[#15100c] hover:text-white"
          aria-label="Close size guide"
        >
          ×
        </button>

        <div className="max-h-[92vh] overflow-y-auto px-7 py-7">
          <div className="mb-6 grid grid-cols-4 border border-[#d8d1c8]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onChangeTab(tab.id)}
                  className={[
                    "h-[50px] border-r border-[#d8d1c8] px-2 text-[9px] font-semibold uppercase tracking-[0.34em] text-[#15100c] transition last:border-r-0 sm:text-[10px]",
                    isActive
                      ? "bg-white shadow-[inset_0_0_0_1px_rgba(23,17,13,0.22)]"
                      : "bg-white hover:bg-[#f6f4f1]",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <h3 className="mb-5 text-[18px] font-semibold text-[#15100c]">
            {currentTab?.label || "Standard Sizing"}
          </h3>

          {columns.length && rows.length ? (
            <div className="overflow-x-auto border border-[#ded8d0]">
              <table className="w-full min-w-[650px] border-collapse text-[12px] text-[#15100c]">
                <thead>
                  <tr>
                    {columns.map((column, index) => (
                      <th
                        key={`${column}-${index}`}
                        className={[
                          "border border-[#ded8d0] bg-[#f4f4f4] px-4 py-4 text-center font-semibold",
                          index === 0 ? "w-[145px]" : "",
                        ].join(" ")}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, index) => (
                        <td
                          key={`${rowIndex}-${index}`}
                          className={[
                            "border border-[#ded8d0] px-4 py-4 text-center",
                            index === 0
                              ? "bg-[#fafafa] text-left font-semibold"
                              : "",
                          ].join(" ")}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Size guide backend se empty aa raha hai.
            </p>
          )}

          {guideItems.length ? (
            <div className="mt-7 border-t border-[#ded8d0] pt-6">
              <h4 className="text-[16px] font-semibold text-[#15100c]">
                Measurement Guide
              </h4>

              <div className="mt-5 space-y-5">
                {guideItems.map((item, index) => (
                  <div key={`${item.heading || item.title || "guide"}-${index}`}>
                    <h5 className="text-[13px] font-semibold text-[#15100c]">
                      {item.heading || item.title || "Guide"}
                    </h5>

                    <p className="mt-2 text-[12px] leading-5 text-[#15100c]">
                      {item.text || item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ProductDetailAnimationStyles() {
  return (
    <style jsx global>{`
      @keyframes shimmer {
        0% {
          background-position: 220% 0;
        }
        100% {
          background-position: -220% 0;
        }
      }

      @keyframes fadeUpProduct {
        0% {
          opacity: 0;
          transform: translateY(22px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes productImageIn {
        0% {
          opacity: 0;
          transform: translateX(-22px) scale(0.985);
          filter: blur(8px);
        }
        100% {
          opacity: 1;
          transform: translateX(0) scale(1);
          filter: blur(0);
        }
      }

      @keyframes productPanelIn {
        0% {
          opacity: 0;
          transform: translateX(22px) scale(0.985);
          filter: blur(8px);
        }
        100% {
          opacity: 1;
          transform: translateX(0) scale(1);
          filter: blur(0);
        }
      }

      @keyframes modalPopProduct {
        0% {
          opacity: 0;
          transform: translateY(20px) scale(0.96);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .similar-products-scroll {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .similar-products-scroll::-webkit-scrollbar {
        display: none;
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
