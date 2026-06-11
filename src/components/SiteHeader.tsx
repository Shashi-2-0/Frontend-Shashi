"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWishlist } from "@/components/WishlistProvider";
import {
  ChevronRight,
  Heart,
  Loader2,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  XCircle,
} from "lucide-react";

import { getCart } from "@/lib/api/cart.api";
import {
  getCatalogCategoryTree,
  unwrapCatalogCategoryTree,
  type CatalogCategoryTreeNode,
} from "@/lib/api/catalog.api";

import {
  findCategoryBySlug,
  getCategoryHref,
  getCategorySlug,
} from "@/lib/category-tree.utils";

import {
  getSearchProductHref,
  getSearchProductImage,
  getSearchProductTitle,
  searchProducts,
  unwrapSearchResults,
  type SearchProduct,
} from "@/lib/api/search.api";


type SiteHeaderBranding = {
  brandName: string;
  partnerBrandName: string;
  brandLogoUrl: string;
  partnerLogoUrl: string;
  showPartnerBrand: boolean;
  homeUrl: string;
  partnerHomeUrl: string;
};

function getSafeCartItems(response: any): any[] {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.cart?.items)) return response.cart.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.cart?.items)) return response.data.cart.items;
  if (Array.isArray(response?.data?.data?.items)) return response.data.data.items;

  return [];
}

function getPublicProductCount(node?: CatalogCategoryTreeNode | null) {
  const publicCount = Number((node as any)?.publicProductCount);
  const productCount = Number((node as any)?.productCount);

  if (Number.isFinite(publicCount)) return publicCount;
  if (Number.isFinite(productCount)) return productCount;

  return null;
}


type SearchCategorySuggestion = {
  id: string;
  name: string;
  slug: string;
  path: string;
  href: string;
  breadcrumb: string[];
  imageUrl: string;
  productCount: number;
  directProductCount: number;
  level: number;
  score: number;
};

const RECENT_SEARCH_STORAGE_KEY = "shahsi_recent_searches";
const MAX_RECENT_SEARCHES = 6;


function unwrapSiteHeaderBranding(response: any): SiteHeaderBranding | null {
  const data =
    response?.data?.headerBranding ||
    response?.data?.header ||
    response?.data?.siteHeader ||
    response?.data ||
    response?.headerBranding ||
    response?.header ||
    response?.siteHeader ||
    response ||
    null;

  if (!data || typeof data !== "object") return null;

  return {
    brandName: String(data.brandName || "").trim(),
    partnerBrandName: String(data.partnerBrandName || "").trim(),
    brandLogoUrl: String(data.brandLogoUrl || "").trim(),
    partnerLogoUrl: String(data.partnerLogoUrl || "").trim(),
    showPartnerBrand: data.showPartnerBrand === true,
    homeUrl: String(data.homeUrl || "").trim(),
    partnerHomeUrl: String(data.partnerHomeUrl || "").trim(),
  };
}

async function getSiteHeaderBranding(): Promise<SiteHeaderBranding | null> {
  try {
    const res = await fetch("/api/proxy/site/header", {
      method: "GET",
      cache: "no-store",
    });

    const json = await res.json();

    if (!res.ok || json?.success === false) {
      return null;
    }

    return unwrapSiteHeaderBranding(json);
  } catch (error) {
    console.error("Failed to fetch site header branding:", error);
    return null;
  }
}

function normalizeSearchText(value: any) {
  return String(value || "")
    .toLowerCase()
    .replace(/[-_/]+/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function flattenCategoryTreeForSearch(
  nodes: CatalogCategoryTreeNode[] = []
): SearchCategorySuggestion[] {
  const items: SearchCategorySuggestion[] = [];

  nodes.forEach((node) => {
    if (!node || node.isActive === false) return;

    const id = String(node.id || "").trim();
    const name = String(node.name || "").trim();
    const slug = String(node.slug || "").trim();

    const rawPath = Array.isArray(node.path)
      ? node.path.join("/")
      : String(node.path || slug).trim();

    const path = rawPath.replace(/^\/+|\/+$/g, "");
    const href = String(node.url || (path ? `/${path}` : "")).trim();

    const breadcrumb = Array.isArray(node.breadcrumb)
      ? node.breadcrumb.filter(Boolean).map(String)
      : name
        ? [name]
        : [];

    if (id && name && slug && href) {
      items.push({
        id,
        name,
        slug,
        path,
        href,
        breadcrumb,
        imageUrl: String(node.imageUrl || "").trim(),
        productCount:
          typeof node.productCount === "number" ? node.productCount : 0,
        directProductCount:
          typeof node.directProductCount === "number"
            ? node.directProductCount
            : 0,
        level: typeof node.level === "number" ? node.level : breadcrumb.length,
        score: 0,
      });
    }

    if (Array.isArray(node.children) && node.children.length) {
      items.push(...flattenCategoryTreeForSearch(node.children));
    }
  });

  return items;
}

function getMatchedSearchCategories(
  categoryTree: CatalogCategoryTreeNode[],
  query: string
) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery || normalizedQuery.length < 2) return [];

  const queryWords = normalizedQuery.split(" ").filter(Boolean);
  const categories = flattenCategoryTreeForSearch(categoryTree);

  return categories
    .map((category) => {
      const normalizedName = normalizeSearchText(category.name);
      const normalizedSlug = normalizeSearchText(category.slug);
      const normalizedPath = normalizeSearchText(category.path);
      const normalizedBreadcrumb = normalizeSearchText(
        category.breadcrumb.join(" ")
      );

      const searchableText = [
        normalizedName,
        normalizedSlug,
        normalizedPath,
        normalizedBreadcrumb,
      ]
        .filter(Boolean)
        .join(" ");

      const exactNameMatch = normalizedName === normalizedQuery;
      const exactSlugMatch = normalizedSlug === normalizedQuery;
      const exactPathMatch = normalizedPath === normalizedQuery;

      const nameStartsWith = normalizedName.startsWith(normalizedQuery);
      const slugStartsWith = normalizedSlug.startsWith(normalizedQuery);

      const nameIncludes = normalizedName.includes(normalizedQuery);
      const slugIncludes = normalizedSlug.includes(normalizedQuery);
      const pathIncludes = normalizedPath.includes(normalizedQuery);
      const breadcrumbIncludes = normalizedBreadcrumb.includes(normalizedQuery);

      const allWordsMatch = queryWords.every((word) =>
        searchableText.includes(word)
      );

      const hasRealMatch =
        exactNameMatch ||
        exactSlugMatch ||
        exactPathMatch ||
        nameStartsWith ||
        slugStartsWith ||
        nameIncludes ||
        slugIncludes ||
        pathIncludes ||
        breadcrumbIncludes ||
        allWordsMatch;

      if (!hasRealMatch) {
        return {
          ...category,
          score: 0,
        };
      }

      let score = 0;

      if (exactNameMatch) score += 100;
      if (exactSlugMatch) score += 95;
      if (exactPathMatch) score += 90;

      if (nameStartsWith) score += 70;
      if (slugStartsWith) score += 65;

      if (nameIncludes) score += 55;
      if (slugIncludes) score += 50;
      if (pathIncludes) score += 45;
      if (breadcrumbIncludes) score += 40;

      if (allWordsMatch) score += 30;

      if (category.productCount > 0) score += 5;

      return {
        ...category,
        score,
      };
    })
    .filter((category) => category.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      if (b.productCount !== a.productCount) {
        return b.productCount - a.productCount;
      }

      return a.level - b.level;
    })
    .slice(0, 6);
}


function productMatchesSearchQuery(product: SearchProduct, query: string) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery || normalizedQuery.length < 2) return false;

  const categoryPathRaw = product.categoryPath;
  const categoryPath = Array.isArray(categoryPathRaw)
    ? categoryPathRaw.join(" ")
    : String(categoryPathRaw || "");

  const searchableText = normalizeSearchText(
    [
      product.title,
      product.name,
      product.slug,
      product.brand,
      product.category,
      categoryPath,
      product.color,
    ]
      .filter(Boolean)
      .join(" ")
  );

  if (!searchableText) return false;

  const queryWords = normalizedQuery.split(" ").filter(Boolean);

  return (
    searchableText.includes(normalizedQuery) ||
    queryWords.every((word) => searchableText.includes(word))
  );
}

function readRecentSearches() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(RECENT_SEARCH_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === "undefined") return [];

  const cleanQuery = String(query || "").trim();

  if (!cleanQuery) return readRecentSearches();

  const previous = readRecentSearches();

  const next = [
    cleanQuery,
    ...previous.filter(
      (item) => item.toLowerCase() !== cleanQuery.toLowerCase()
    ),
  ].slice(0, MAX_RECENT_SEARCHES);

  window.localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(next));

  return next;
}

function clearRecentSearches() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(RECENT_SEARCH_STORAGE_KEY);
}

function removeRecentSearch(query: string) {
  if (typeof window === "undefined") return [];

  const cleanQuery = String(query || "").trim();

  const next = readRecentSearches().filter(
    (item) => item.toLowerCase() !== cleanQuery.toLowerCase()
  );

  window.localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(next));

  return next;
}

export default function SiteHeader() {

  const [siteHeaderBranding, setSiteHeaderBranding] =
  useState<SiteHeaderBranding | null>(null);
  const { count: wishlistCount, refreshWishlistCount } = useWishlist();

  const searchWrapRef = useRef<HTMLDivElement | null>(null);




  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [cartCount, setCartCount] = useState(0);
  const [showTopStrip, setShowTopStrip] = useState(true);

  const [categoryTree, setCategoryTree] = useState<CatalogCategoryTreeNode[]>(
    [],
  );

  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(
    null,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const showTopStripRef = useRef(true);
  const lastScrollYRef = useRef(0);

  const activeCategory = useMemo(() => {
    if (!activeCategorySlug) return null;

    return findCategoryBySlug(categoryTree, activeCategorySlug);
  }, [activeCategorySlug, categoryTree]);

  const searchCategorySuggestions = useMemo(() => {
  return getMatchedSearchCategories(categoryTree, searchQuery);
}, [categoryTree, searchQuery]);

async function loadSiteHeaderBranding() {
  const branding = await getSiteHeaderBranding();
  setSiteHeaderBranding(branding);
}


  async function loadCartCount() {
    try {
      const response = await getCart();
      const items = getSafeCartItems(response);

      const count = items.reduce((sum, item) => {
        return sum + Number(item?.quantity || item?.qty || 1);
      }, 0);

      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }

  async function loadCategoryTree() {
    try {
     const response = await getCatalogCategoryTree();
const tree = unwrapCatalogCategoryTree(response);

setCategoryTree(tree);
    } catch (error) {
      console.error("Header category tree load failed:", error);
      setCategoryTree([]);
    }
  }




  useEffect(() => {
  refreshWishlistCount();

  function handleWishlistUpdated() {
    refreshWishlistCount();
  }

  window.addEventListener("wishlist-updated", handleWishlistUpdated);
  window.addEventListener("wishlistUpdated", handleWishlistUpdated);
  window.addEventListener("wishlist:updated", handleWishlistUpdated);
  window.addEventListener("wishlist-count-updated", handleWishlistUpdated);
  window.addEventListener("wishlistCountUpdated", handleWishlistUpdated);
  window.addEventListener("focus", handleWishlistUpdated);

  return () => {
    window.removeEventListener("wishlist-updated", handleWishlistUpdated);
    window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
    window.removeEventListener("wishlist:updated", handleWishlistUpdated);
    window.removeEventListener("wishlist-count-updated", handleWishlistUpdated);
    window.removeEventListener("wishlistCountUpdated", handleWishlistUpdated);
    window.removeEventListener("focus", handleWishlistUpdated);
  };
}, [refreshWishlistCount]);

  useEffect(() => {
  setRecentSearches(readRecentSearches());
}, []);


  useEffect(() => {
  if (!searchOpen) return;

  function handleClickOutside(event: MouseEvent | TouchEvent) {
    const target = event.target as Node | null;

    if (!target) return;

    if (searchWrapRef.current?.contains(target)) return;

    setSearchOpen(false);
  }

  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("touchstart", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
    document.removeEventListener("touchstart", handleClickOutside);
  };
}, [searchOpen]);

useEffect(() => {
  loadCartCount();
  loadCategoryTree();
  loadSiteHeaderBranding();

  function handleCartUpdated() {
    loadCartCount();
  }

  window.addEventListener("cart-updated", handleCartUpdated);
  window.addEventListener("focus", handleCartUpdated);

  return () => {
    window.removeEventListener("cart-updated", handleCartUpdated);
    window.removeEventListener("focus", handleCartUpdated);
  };
}, []);

  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      setSearchError("");
      setSearchOpen(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError("");
        setSearchOpen(true);

        const response = await searchProducts(query);
      const results = unwrapSearchResults(response).filter((product) =>
  productMatchesSearchQuery(product, searchQuery)
);

setSearchResults(results);
      } catch (error: any) {
        console.error("Search failed:", error);
        setSearchResults([]);
        setSearchError(error?.message || "Search API failed.");
        setSearchOpen(true);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    let ticking = false;

    function updateTopStrip(nextValue: boolean) {
      if (showTopStripRef.current === nextValue) return;

      showTopStripRef.current = nextValue;
      setShowTopStrip(nextValue);
    }

    function handleScroll() {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const lastScrollY = lastScrollYRef.current;
        const diff = currentScrollY - lastScrollY;

        if (currentScrollY <= 20) {
          updateTopStrip(true);
          lastScrollYRef.current = currentScrollY;
          ticking = false;
          return;
        }

        if (Math.abs(diff) > 14) {
          if (diff > 0) {
            updateTopStrip(false);
          } else {
            updateTopStrip(true);
          }

          lastScrollYRef.current = currentScrollY;
        }

        ticking = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const query = searchQuery.trim();

  setRecentSearches(saveRecentSearch(query));

  if (!query) return;

  if (searchCategorySuggestions.length) {
    window.location.href = searchCategorySuggestions[0].href;
    return;
  }

  if (searchResults.length) {
    window.location.href = getSearchProductHref(searchResults[0]);
    return;
  }

  setSearchOpen(true);
}
const mainBrandName = siteHeaderBranding?.brandName || "";
const partnerBrandName = siteHeaderBranding?.partnerBrandName || "";
const brandLogoUrl = siteHeaderBranding?.brandLogoUrl || "";
const partnerLogoUrl = siteHeaderBranding?.partnerLogoUrl || "";
const homeUrl = siteHeaderBranding?.homeUrl || "/";
const partnerHomeUrl = siteHeaderBranding?.partnerHomeUrl || "";

const hasMainBrand = Boolean(mainBrandName || brandLogoUrl);

const hasPartnerBrand = Boolean(
  siteHeaderBranding?.showPartnerBrand && (partnerBrandName || partnerLogoUrl),
);
  return (
    <>
      <header
        className="fixed left-0 right-0 top-0 z-[999] bg-[#fbf8f1]/95 shadow-sm backdrop-blur"
        onMouseLeave={() => setActiveCategorySlug(null)}
      >
        <div
          className={[
            "overflow-hidden bg-[#15100c] text-[#fbf8f1]",
            "transition-[max-height,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[max-height,opacity,transform]",
            showTopStrip
              ? "max-h-[30px] translate-y-0 opacity-100"
              : "max-h-0 -translate-y-3 opacity-0",
          ].join(" ")}
        >
          <div className="flex h-[30px] items-center justify-between px-6 text-[9px] uppercase tracking-[0.25em] lg:px-10">
            <p className="hidden md:block">
              Complimentary shipping on orders over $250 · Try at home with
              resale & rent
            </p>

            <nav className="ml-auto flex items-center gap-4 lg:gap-6">
              <a href="/collection" className="transition hover:text-[#d4b49a]">
                Shop
              </a>

              <span className="text-white/35">|</span>

              <a href="/resale" className="transition hover:text-[#d4b49a]">
                Resale
              </a>

              <span className="text-white/35">|</span>

              <a href="/rental" className="transition hover:text-[#d4b49a]">
                Rental
              </a>

              <span className="text-white/35">|</span>

              <a href="/mto" className="transition hover:text-[#d4b49a]">
                Made to Order
              </a>
            </nav>
          </div>
        </div>

        <div className="grid min-h-[94px] items-center border-b border-[#ddd5c9] px-6 py-5 lg:grid-cols-[410px_1fr_190px] lg:px-10">
         <div className="flex items-center gap-[23px]">
  {hasMainBrand ? (
    <a
     href={homeUrl}
      className="border-b-2 border-[#15100c] pb-[11px] pr-[10px] font-serif text-[38px] leading-none tracking-[-0.06em] transition hover:text-[#b98262]"
    >
      {brandLogoUrl ? (
        <img
        src={brandLogoUrl}
      alt={mainBrandName || "Brand logo"}
          className="h-[44px] w-auto object-contain"
        />
      ) : (
      mainBrandName
      )}
    </a>
  ) : null}

  {hasMainBrand && hasPartnerBrand ? (
    <span className="h-[36px] w-px bg-[#d8d0c4]" />
  ) : null}

  {hasPartnerBrand ? (
    <a
     href={partnerHomeUrl}
      className="pb-[10px] font-serif text-[36px] italic leading-none tracking-[-0.04em] text-[#5f5a55] transition hover:text-[#b98262]"
    >
      {partnerLogoUrl ? (
        <img
         src={partnerLogoUrl}
         alt={partnerBrandName || "Partner brand logo"}
          className="h-[42px] w-auto object-contain"
        />
      ) : (
       partnerBrandName
      )}
    </a>
  ) : null}
</div>

     <form
  onSubmit={handleSearchSubmit}
  className="relative flex h-[58px] w-full max-w-[860px] border border-[#d8cfc2] bg-white"
>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => {
  setRecentSearches(readRecentSearches());
  setSearchOpen(true);
}}
              placeholder="evening gowns, bridal, sizes..."
              className="h-full flex-1 bg-white px-6 text-[15px] text-[#15100c] outline-none placeholder:text-[#aaa39c]"
            />

            <button
              type="submit"
              className="grid h-full w-[82px] place-items-center bg-[#15100c] text-white transition hover:bg-[#b98262]"
              aria-label="Search products"
            >
              {searchLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Search className="h-6 w-6 stroke-[1.8]" />
              )}
            </button>

            {searchOpen ? (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[1000] max-h-[430px] overflow-y-auto border border-[#d8cfc2] bg-white shadow-[0_22px_70px_rgba(23,17,13,0.18)]">
                <div className="flex items-center justify-between border-b border-[#eee8df] px-5 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a8178]">
                    Search Results
                  </p>

                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="text-[12px] uppercase tracking-[0.18em] text-[#15100c] hover:text-[#b98262]"
                  >
                    Close
                  </button>
                </div>

                {!searchQuery.trim() && recentSearches.length ? (
  <div className="border-b border-[#eee8df]">
    <div className="flex items-center justify-between px-5 pb-2 pt-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a8178]">
        Recent Searches
      </p>

      <button
        type="button"
        onClick={() => {
          clearRecentSearches();
          setRecentSearches([]);
        }}
        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b98262] transition hover:text-[#15100c]"
      >
        Clear
      </button>
    </div>

    <div className="grid">
   {recentSearches.map((item) => (
  <div
    key={item}
    className="flex items-center justify-between border-t border-[#f5efe7] transition hover:bg-[#fbf8f1]"
  >
    <button
      type="button"
      onClick={() => {
        setSearchQuery(item);
        setSearchOpen(true);
      }}
      className="min-w-0 flex-1 px-5 py-3 text-left"
    >
      <span className="block truncate text-[14px] font-semibold text-[#15100c]">
        {item}
      </span>
    </button>

    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        setRecentSearches(removeRecentSearch(item));
      }}
      className="mr-5 grid h-8 w-8 place-items-center text-[#8a8178] transition hover:text-[#15100c]"
      aria-label={`Remove ${item} from recent searches`}
      title="Remove"
    >
      <X className="h-4 w-4 stroke-[2]" />
    </button>
  </div>
))}
    </div>
  </div>
) : null}

                {searchLoading ? (
                  <div className="flex items-center gap-3 px-5 py-5 text-sm text-[#6d6760]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching backend...
                  </div>
                ) : null}

                {searchError ? (
                  <div className="flex items-start gap-3 px-5 py-5 text-sm text-red-700">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{searchError}</span>
                  </div>
                ) : null}

{!searchLoading &&
!searchError &&
!searchCategorySuggestions.length &&
!searchResults.length ? (
  <div className="px-5 py-5 text-sm text-[#6d6760]">
    No categories or products found for <strong>{searchQuery}</strong>.
  </div>
) : null}

{!searchLoading && !searchError && searchCategorySuggestions.length ? (
  <div className="border-b border-[#eee8df]">
    <div className="px-5 pb-2 pt-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a8178]">
        Matching Categories
      </p>
    </div>

    <div className="grid">
      {searchCategorySuggestions.map((category) => {
        const breadcrumbText = category.breadcrumb.join(" / ");

        return (
          <a
            key={`search-category-${category.id}`}
            href={category.href}
            onClick={() => {
  setRecentSearches(saveRecentSearch(searchQuery));
}}
            className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-4 border-t border-[#f5efe7] px-5 py-3 transition hover:bg-[#fbf8f1]"
          >
          <div className="h-[52px] w-[52px] overflow-hidden rounded-full bg-[#efe8de]">
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[16px] font-serif text-[#15100c]">
                  {category.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[#15100c]">
                {category.name}
              </p>

              <p className="mt-1 truncate text-[12px] text-[#8a8178]">
                {breadcrumbText}
                {category.productCount > 0
                  ? ` • ${category.productCount} products`
                  : ""}
              </p>
            </div>

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b98262]">
              View
            </span>
          </a>
        );
      })}
    </div>
  </div>
) : null}

                {!searchLoading && !searchError && searchResults.length ? (
                <div className="grid">
  <div className="px-5 pb-2 pt-4">
    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a8178]">
      Matching Products
    </p>
  </div>

  {searchResults.map((product) => {
                      const title = getSearchProductTitle(product);
                      const image = getSearchProductImage(product);
                      const href = getSearchProductHref(product);

                      return (
                        <a
                          key={product.id || product.productId || title}
                          href={href}
                           onClick={() => {
    setRecentSearches(saveRecentSearch(searchQuery));
  }}
                         className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 border-b border-[#f0ebe4] px-5 py-4 transition hover:bg-[#fbf8f1]"
                        >
                          <div className="h-16 w-16 overflow-hidden bg-[#eee8df]">
                            {image ? (
                              <img
                                src={image}
                                alt={title}
                                className="h-full w-full object-cover object-top"
                              />
                            ) : (
                             <div className="flex h-full w-full items-center justify-center bg-[#efe8de] px-2 text-center text-[9px] uppercase tracking-[0.12em] text-[#8a8178]">
  Image missing
</div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-semibold text-[#15100c]">
                              {title}
                            </p>

                            <p className="mt-1 truncate text-[12px] text-[#8a8178]">
                              {product.brand ? `${product.brand} • ` : ""}
                              {product.category || "Category missing"}
                            </p>
                          </div>

                        
                        </a>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}
          </form>

          <div className="hidden items-center justify-end gap-[24px] lg:flex">
            <a href="/account" className="transition hover:text-[#b98262]">
              <User className="h-[21px] w-[21px] stroke-[1.5]" />
            </a>

            <a href="/wishlist" className="transition hover:text-[#b98262]">
              <IconCounter
                count={wishlistCount}
                icon={
                  <Heart
                    className={[
                      "h-[23px] w-[23px] stroke-[1.5]",
                      wishlistCount > 0 ? "fill-[#15100c]" : "",
                    ].join(" ")}
                  />
                }
              />
            </a>

            <a href="/cart" className="transition hover:text-[#b98262]">
              <IconCounter
                count={cartCount}
                icon={
                  <ShoppingBag className="h-[23px] w-[23px] stroke-[1.5]" />
                }
              />
            </a>
          </div>

          <button type="button" className="ml-auto lg:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <nav className="hidden h-[46px] items-center justify-center gap-[34px] border-b border-[#ddd5c9] px-8 text-[12px] uppercase tracking-[0.28em] text-[#7a746e] xl:flex">
          {categoryTree.length ? (
            categoryTree.map((category) => {
              const slug = getCategorySlug(category);
              const active = activeCategorySlug === slug;
              const hasChildren = Boolean(category.children?.length);

              return (
                <a
                  key={category.id || slug || category.name}
                  href={getCategoryHref(category)}
                  onMouseEnter={() => {
                    if (hasChildren) {
                      setActiveCategorySlug(slug);
                    } else {
                      setActiveCategorySlug(null);
                    }
                  }}
                  className={[
                    "relative flex h-full items-center whitespace-nowrap transition hover:text-[#15100c]",
                    active ? "text-[#b98262]" : "",
                    active
                      ? "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#15100c]"
                      : "",
                  ].join(" ")}
                >
                  {category.name}
                </a>
              );
            })
          ) : (
            <span className="text-[11px] uppercase tracking-[0.24em] text-red-600">
              Category menu backend se nahi aaya
            </span>
          )}
        </nav>

        {activeCategory ? <DynamicMegaMenu category={activeCategory} /> : null}
      </header>

      <div className="h-[170px] shrink-0" />
    </>
  );
}

function DynamicMegaMenu({ category }: { category: CatalogCategoryTreeNode }) {
  const directChildren = (category.children || []).filter((node) => {
    return node && (node as any).isActive !== false;
  });

  if (!directChildren.length) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-[998] border-b border-[#ddd5c9] bg-white shadow-[0_28px_70px_rgba(23,17,13,0.12)]">
      <div className="mx-auto max-w-[1500px] px-8 py-10">
        <div className="flex max-w-[360px] flex-col gap-7">
          {directChildren.map((node) => (
            <a
              key={node.id || node.slug || node.name}
              href={getCategoryHref(node)}
              className="block text-[14px] font-semibold leading-7 text-[#15100c] transition hover:translate-x-1 hover:text-[#b98262]"
            >
              {node.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryMenuLink({ node }: { node: CatalogCategoryTreeNode }) {
  const count = getPublicProductCount(node);

  return (
    <a
      href={getCategoryHref(node)}
      className="group flex items-center justify-between gap-3 text-[15px] leading-5 text-[#15100c] transition hover:text-[#b98262]"
    >
      <span>
        {node.name}
        {typeof count === "number" ? (
          <span className="ml-2 text-[12px] text-[#9a948c]">({count})</span>
        ) : null}
      </span>

      <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
    </a>
  );
}

function IconCounter({
  icon,
  count = 0,
}: {
  icon: React.ReactNode;
  count?: number;
}) {
  return (
    <span className="relative inline-flex">
      {icon}

      <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b98262] px-[5px] text-[10px] leading-none text-white">
        {count}
      </span>
    </span>
  );
}