"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";

import { getCart } from "@/lib/api/cart.api";
import {
  getCatalogCategoryTree,
  type CatalogCategoryTreeNode,
} from "@/lib/api/catalog.api";
import {
  findCategoryBySlug,
  getCategoryHref,
  getCategoryImage,
  getCategorySlug,
  getCategoryTreeArray,
  parseTopMenu,
} from "@/lib/category-tree.utils";

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

export default function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);
  const [showTopStrip, setShowTopStrip] = useState(true);

  const [categoryTree, setCategoryTree] = useState<CatalogCategoryTreeNode[]>(
    [],
  );
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(
    null,
  );

  const showTopStripRef = useRef(true);
  const lastScrollYRef = useRef(0);

  const activeCategory = useMemo(() => {
    if (!activeCategorySlug) return null;

    return findCategoryBySlug(categoryTree, activeCategorySlug);
  }, [activeCategorySlug, categoryTree]);

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
      const tree = getCategoryTreeArray(response);

      setCategoryTree(tree);
    } catch (error) {
      console.error("Header category tree load failed:", error);
      setCategoryTree([]);
    }
  }

  useEffect(() => {
    loadCartCount();
    loadCategoryTree();

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
              Complimentary shipping on orders over $250 · Try at home with resale
              & rent
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

              <a
                href="/made-to-order"
                className="transition hover:text-[#d4b49a]"
              >
                Made to Order
              </a>
            </nav>
          </div>
        </div>

        <div className="grid min-h-[94px] items-center border-b border-[#ddd5c9] px-6 py-5 lg:grid-cols-[410px_1fr_190px] lg:px-10">
          <div className="flex items-center gap-[23px]">
            <a
              href="/"
              className="border-b-2 border-[#15100c] pb-[11px] pr-[10px] font-serif text-[38px] leading-none tracking-[-0.06em] transition hover:text-[#b98262]"
            >
              Shahsi
            </a>

            <span className="h-[36px] w-px bg-[#d8d0c4]" />

            <a
              href="/subscription"
              className="pb-[10px] font-serif text-[36px] italic leading-none tracking-[-0.04em] text-[#5f5a55] transition hover:text-[#b98262]"
            >
              GownLoop
            </a>
          </div>

          <div className="hidden w-full items-center md:flex">
            <input
              placeholder="evening gowns, bridal, sizes..."
              className="h-[48px] flex-1 border border-[#d8d0c4] bg-white px-[22px] text-[14px] font-light outline-none placeholder:text-[#aaa39b]"
            />

            <button className="flex h-[48px] w-[60px] items-center justify-center bg-[#15100c] text-white transition hover:bg-[#b98262]">
              <Search className="h-[20px] w-[20px] stroke-[1.7]" />
            </button>
          </div>

          <div className="hidden items-center justify-end gap-[24px] lg:flex">
            <a href="/account" className="transition hover:text-[#b98262]">
              <User className="h-[21px] w-[21px] stroke-[1.5]" />
            </a>

            <a href="/wishlist" className="transition hover:text-[#b98262]">
              <IconCounter
                count={0}
                icon={<Heart className="h-[23px] w-[23px] stroke-[1.5]" />}
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

          <button className="ml-auto lg:hidden">
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
            <>
              <a href="/collection" className="transition hover:text-[#15100c]">
                New In
              </a>
              <a href="/collection" className="transition hover:text-[#15100c]">
                Evening
              </a>
              <a
                href="/bridesmaid"
                className="text-[#b98262] transition hover:text-[#15100c]"
              >
                Bridesmaid
              </a>
            </>
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