"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Play,
  RefreshCw,
  XCircle,
} from "lucide-react";

import SiteHeader from "@/components/SiteHeader";
import { apiRequest } from "@/lib/api/client";

type BackendCatalogMedia = {
  id?: string;
  url?: string;
  secureUrl?: string;
  alt?: string;
  altText?: string;
  isPrimary?: boolean;
  position?: number;
  sortOrder?: number;
  viewType?: string | null;
  format?: string | null;
  width?: number;
  height?: number;
};

type BackendCatalogProduct = {
  id?: string;
  productId?: string;
  title?: string;
  name?: string;
  slug?: string;
  sku?: string;
  status?: string;
  publishStatus?: string;
  isActive?: boolean;
  published?: boolean;
  price?: number | string | null;
  listingPrice?: number | string | null;
  salePrice?: number | string | null;
  rentalPrice?: number | string | null;
  currency?: string;
  category?: string;
  primaryCategory?: string;
  collection?: string;
  primaryCollection?: string;
  categories?: string[];
  thumbnail?: string;
  imageUrl?: string;
  image?: string;
  images?: BackendCatalogMedia[];
  sizes?: Array<{
    label?: string;
    available?: boolean;
  }>;
  variants?: Array<{
    id?: string;
    variantId?: string;
    size?: string;
    color?: string;
    colorHex?: string | null;
    height?: string | null;
    stock?: number;
    available?: boolean;
    isAvailable?: boolean;
    status?: string;
    price?: number | string | null;
  }>;
};

type CatalogResponse = {
  success?: boolean;
  data?: {
    products?: BackendCatalogProduct[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    filters?: any;
  };
  error?: any;
};

const PRODUCTS_PER_PAGE = 12;

const VIDEO_FORMATS = new Set([
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
  "ogv",
  "m3u8",
]);

function normalizeNumber(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function getProductId(product: BackendCatalogProduct) {
  return String(product.productId || product.id || "").trim();
}

function getProductTitle(product: BackendCatalogProduct) {
  return String(product.title || product.name || "Product title missing from backend");
}

function getProductPrice(product: BackendCatalogProduct) {
  const value =
    product.salePrice ??
    product.listingPrice ??
    product.price ??
    product.variants?.find((variant) => variant.price !== undefined)?.price ??
    0;

  return normalizeNumber(value, 0);
}

function getCurrency(product: BackendCatalogProduct) {
  return String(product.currency || "USD");
}

function formatPrice(product: BackendCatalogProduct) {
  const price = getProductPrice(product);
  const currency = getCurrency(product);

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `$${price}`;
  }
}

function isVideoMedia(media?: BackendCatalogMedia | null) {
  if (!media) return false;

  const viewType = String(media.viewType || "").toLowerCase();
  const format = String(media.format || "").toLowerCase().replace(".", "");
  const url = String(media.secureUrl || media.url || "").toLowerCase();

  if (viewType === "video") return true;
  if (VIDEO_FORMATS.has(format)) return true;

  return Array.from(VIDEO_FORMATS).some((ext) => url.includes(`.${ext}`));
}

function getSortedMedia(product: BackendCatalogProduct) {
  const media = Array.isArray(product.images) ? product.images : [];

  return [...media]
    .filter((item) => item?.secureUrl || item?.url)
    .sort((a, b) => {
      const aPosition = normalizeNumber(a.position, 9999);
      const bPosition = normalizeNumber(b.position, 9999);

      if (aPosition !== bPosition) return aPosition - bPosition;

      const aSort = normalizeNumber(a.sortOrder, 9999);
      const bSort = normalizeNumber(b.sortOrder, 9999);

      return aSort - bSort;
    });
}

function getPrimaryMedia(product: BackendCatalogProduct) {
  const sortedMedia = getSortedMedia(product);

  if (sortedMedia.length) return sortedMedia[0];

  const directUrl = product.thumbnail || product.imageUrl || product.image;

  if (!directUrl) return null;

  return {
    url: directUrl,
    secureUrl: directUrl,
    alt: getProductTitle(product),
    altText: getProductTitle(product),
    position: 0,
    sortOrder: 0,
    viewType: null,
    format: directUrl.split(".").pop(),
  };
}

function getAvailableSizes(product: BackendCatalogProduct) {
  const sizesFromBackend = Array.isArray(product.sizes)
    ? product.sizes
        .filter((size) => size?.label)
        .map((size) => ({
          label: String(size.label),
          available: Boolean(size.available),
        }))
    : [];

  if (sizesFromBackend.length) return sizesFromBackend;

  const variants = Array.isArray(product.variants) ? product.variants : [];

  return variants
    .filter((variant) => variant?.size)
    .map((variant) => ({
      label: String(variant.size),
      available: Boolean(variant.available || variant.isAvailable),
    }));
}

function getProductCategoryLabel(product: BackendCatalogProduct) {
  return String(
    product.primaryCategory ||
      product.category ||
      product.primaryCollection ||
      product.collection ||
      product.categories?.[0] ||
      "",
  );
}

function getProductDetailHref(product: BackendCatalogProduct) {
  const productSlugOrId = String(product.slug || getProductId(product)).trim();

  if (!productSlugOrId) return "#";

  return `/products/${encodeURIComponent(productSlugOrId)}`;
}

function getPaginationItems(currentPage: number, totalPages: number) {
  const pages: Array<number | "..."> = [];

  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page += 1) {
      pages.push(page);
    }

    return pages;
  }

  pages.push(1);

  if (currentPage > 4) pages.push("...");

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - 3) pages.push("...");

  pages.push(totalPages);

  return pages;
}

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageFromUrl = Math.max(1, normalizeNumber(searchParams.get("page"), 1));

  const [products, setProducts] = useState<BackendCatalogProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(PRODUCTS_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const paginationItems = useMemo(() => {
    return getPaginationItems(currentPage, totalPages);
  }, [currentPage, totalPages]);

  async function loadProducts(page: number) {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest<CatalogResponse>(
        `/catalog?page=${page}&limit=${PRODUCTS_PER_PAGE}&sort=featured`,
        {
          method: "GET",
        },
      );

      const source = response?.data || {};
      const backendProducts = Array.isArray(source.products)
        ? source.products
        : [];

      setProducts(backendProducts);
      setTotal(normalizeNumber(source.total, backendProducts.length));
      setCurrentPage(normalizeNumber(source.page, page));
      setLimit(normalizeNumber(source.limit, PRODUCTS_PER_PAGE));
      setTotalPages(normalizeNumber(source.totalPages, 1));
    } catch (error: any) {
      console.error("Products catalog load failed:", error);

      setProducts([]);
      setTotal(0);
      setCurrentPage(page);
      setTotalPages(1);
      setLimit(PRODUCTS_PER_PAGE);
      setError(error?.message || "Backend /catalog API failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts(pageFromUrl);
  }, [pageFromUrl]);

  function goToPage(page: number) {
    const safePage = Math.max(1, Math.min(page, totalPages || 1));

    router.push(`/products?page=${safePage}`);
  }

  const showingFrom = total ? (currentPage - 1) * limit + 1 : 0;
  const showingTo = Math.min(currentPage * limit, total);

  return (
    <main className="min-h-screen bg-[#fbf8f1] text-[#15100c]">
      <SiteHeader />

      <section className="border-b border-[#ded3c4] bg-[#f4ecdf] px-5 py-10 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-xs uppercase tracking-[0.35em] text-[#8a8178]">
            Backend Catalog
          </p>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-serif text-5xl font-medium tracking-[-0.05em] text-[#15100c] md:text-7xl">
                All Products
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6d6760]">
                Ye page backend <strong>/catalog</strong> se real products show
                karega. Koi mock/fallback product nahi hai.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadProducts(currentPage)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#15100c] px-5 text-xs font-semibold uppercase tracking-[0.18em] transition hover:bg-[#15100c] hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-8 lg:px-10">
        <div className="mb-6 flex flex-col gap-3 border-b border-[#ded3c4] pb-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-[#6d6760]">
            {loading
              ? "Loading backend products..."
              : total
                ? `Showing ${showingFrom}-${showingTo} of ${total} products`
                : "No products returned from backend"}
          </p>

          <p className="text-xs uppercase tracking-[0.24em] text-[#8a8178]">
            Page {currentPage} of {totalPages}
          </p>
        </div>

        {error ? (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Backend catalog error</p>
              <p>{error}</p>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="flex min-h-[380px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-[#6d6760]">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading products from backend...
            </div>
          </div>
        ) : null}

        {!loading && !error && products.length === 0 ? (
          <div className="rounded-2xl border border-[#ded3c4] bg-white px-6 py-10 text-center">
            <p className="text-lg font-semibold text-[#15100c]">
              Backend ne koi product return nahi kiya.
            </p>
            <p className="mt-2 text-sm text-[#6d6760]">
              /catalog response me products array empty aa raha hai.
            </p>
          </div>
        ) : null}

        {!loading && !error && products.length ? (
          <>
            <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard
                  key={`${getProductId(product)}-${index}`}
                  product={product}
                />
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#ded3c4] pt-6 md:flex-row">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#d8cdbf] px-5 text-sm font-semibold text-[#15100c] transition hover:border-[#15100c] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {paginationItems.map((item, index) => {
                  if (item === "...") {
                    return (
                      <span
                        key={`dots-${index}`}
                        className="flex h-10 w-10 items-center justify-center text-sm text-[#8a8178]"
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => goToPage(item)}
                      className={[
                        "flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-semibold transition",
                        item === currentPage
                          ? "border-[#15100c] bg-[#15100c] text-white"
                          : "border-[#d8cdbf] bg-white text-[#15100c] hover:border-[#15100c]",
                      ].join(" ")}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#d8cdbf] px-5 text-sm font-semibold text-[#15100c] transition hover:border-[#15100c] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}

function ProductCard({ product }: { product: BackendCatalogProduct }) {
  const media = getPrimaryMedia(product);
  const mediaUrl = media?.secureUrl || media?.url || "";
  const hasVideo = isVideoMedia(media);
  const title = getProductTitle(product);
  const href = getProductDetailHref(product);
  const sizes = getAvailableSizes(product);
  const categoryLabel = getProductCategoryLabel(product);

  return (
    <article className="group">
      <a
        href={href}
        className="relative block overflow-hidden bg-[#efe5d8] aspect-[3/4]"
      >
        {mediaUrl ? (
          hasVideo ? (
            <>
              <video
                src={mediaUrl}
                muted
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
                onMouseEnter={(event) => {
                  event.currentTarget.play().catch(() => {});
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.pause();
                }}
              />

              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white">
                <Play className="h-3 w-3 fill-white" />
                Video
              </span>
            </>
          ) : (
            <img
              src={mediaUrl}
              alt={media?.altText || media?.alt || title}
              className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-[#8a8178]">
            Backend media missing
          </div>
        )}

        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="flex h-11 items-center justify-center rounded-full bg-white/95 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#15100c] shadow-lg">
            View Product
          </span>
        </div>
      </a>

      <div className="pt-4">
        {categoryLabel ? (
          <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-[#9a9187]">
            {categoryLabel}
          </p>
        ) : null}

        <a
          href={href}
          className="line-clamp-2 text-[15px] font-semibold leading-6 text-[#15100c] transition hover:text-[#b98262]"
        >
          {title}
        </a>

        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[#15100c]">
            {formatPrice(product)}
          </p>

          <p className="text-[11px] uppercase tracking-[0.18em] text-[#8a8178]">
            {product.status || product.publishStatus || ""}
          </p>
        </div>

        {sizes.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {sizes.slice(0, 7).map((size, index) => (
              <span
                key={`${size.label}-${index}`}
                className={[
                  "rounded-full border px-2.5 py-1 text-[11px]",
                  size.available
                    ? "border-[#15100c] text-[#15100c]"
                    : "border-[#ded3c4] text-[#aaa39b]",
                ].join(" ")}
              >
                {size.label}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-[#8a8178]">
            Backend sizes missing
          </p>
        )}
      </div>
    </article>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#fbf8f1] text-[#15100c]">
          <p className="text-sm text-[#6d6760]">Loading products...</p>
        </main>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}