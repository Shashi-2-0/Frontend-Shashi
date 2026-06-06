"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Heart,
  Loader2,
  Lock,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  XCircle,
} from "lucide-react";

import {
  applyCheckoutPromoCode,
  removeCheckoutPromoCode,
} from "@/lib/api/checkout.api";

import SiteHeader from "@/components/SiteHeader";
import {
  CartItem,
  clearCart,
  getCart,
  getCartItemColor,
  getCartItemId,
  getCartItemImage,
  getCartItemLineTotal,
  getCartItemSize,
  getCartItemSku,
  getCartItemTitle,
  getCartItemUnitPrice,
  removeCartItem,
  unwrapCartItems,
  unwrapCartTotals,
  updateCartItemQuantity,
} from "@/lib/api/cart.api";

function hasToken() {
  if (typeof window === "undefined") return false;

  return Boolean(
    localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("access_token")
  );
}

function formatMoney(value: number | string | undefined | null, currency = "USD") {
  const num = Number(value || 0);

  if (currency === "INR") {
    return `₹${num.toLocaleString("en-IN")}`;
  }

  return `$${num.toLocaleString("en-US")}`;
}

function buildProductHref(item: CartItem) {
  const productId =
    item?.productId ||
    item?.product?.id ||
    item?.product?.productId ||
  (item as any)?.catalogProduct?.id ||
(item as any)?.catalogProduct?.productId;

  return productId ? `/bridesmaid/${productId}` : "/bridesmaid";
}

function getEstimatedArrivalText(item: CartItem) {
  const direct =
    (item as any)?.estimatedArrivalText ||
    (item as any)?.deliveryEstimate ||
    (item as any)?.arrivalText;

  if (direct) return `Estimated arrival ${direct}`;

  const delivery =
    (item as any)?.deliveryOption ||
    (item as any)?.shippingMethod ||
    (item as any)?.deliveryType;

  if (delivery) return `Estimated arrival in 2-3 weeks (${delivery})`;

  return "Estimated arrival in 2-3 weeks";
}

function getItemDelivery(item: CartItem) {
  return (
    (item as any)?.deliveryOption ||
    (item as any)?.shippingMethod ||
    (item as any)?.deliveryType ||
    "STANDARD"
  );
}

function getFreeShippingThreshold(totals: any) {
  const value =
    totals?.freeShippingThreshold ||
    totals?.freeShippingMinimum ||
    totals?.shippingThreshold ||
    129;

  return Number(value || 129);
}

function PaymentBadge({ label }: { label: string }) {
  return (
    <div className="flex h-8 min-w-12 items-center justify-center rounded-[2px] border border-[#dbd5cb] bg-white px-2 text-[12px] font-semibold text-[#15100c]">
      {label}
    </div>
  );
}

function SkeletonItem() {
  return (
    <div className="grid animate-pulse grid-cols-[120px_minmax(0,1fr)] gap-6 border-b border-[#ddd5c9] py-8 sm:grid-cols-[160px_minmax(0,1fr)_150px_110px]">
      <div className="h-[170px] bg-[#e9e3d9]" />
      <div className="space-y-4">
        <div className="h-5 w-2/3 bg-[#e9e3d9]" />
        <div className="h-4 w-1/2 bg-[#e9e3d9]" />
        <div className="h-4 w-1/3 bg-[#e9e3d9]" />
      </div>
      <div className="hidden h-10 bg-[#e9e3d9] sm:block" />
      <div className="hidden h-6 bg-[#e9e3d9] sm:block" />
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();

  const [promoLoading, setPromoLoading] = useState(false);
const [appliedPromoCode, setAppliedPromoCode] = useState("");

  const [items, setItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    currency: "USD",
    freeShippingThreshold: null as number | null,
    qualifiesForFreeShipping: false,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item?.quantity || 1), 0);
  }, [items]);

  const freeShippingThreshold = useMemo(() => {
    return getFreeShippingThreshold(totals);
  }, [totals]);

  const progressPercent = useMemo(() => {
    const subtotal = Number(totals.subtotal || 0);
    if (!freeShippingThreshold) return 100;

    return Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  }, [totals.subtotal, freeShippingThreshold]);

  const freeShippingLeft = Math.max(
    0,
    freeShippingThreshold - Number(totals.subtotal || 0)
  );

  const suggestedItems = useMemo(() => {
    const unique = new Map<string, CartItem>();

    items.forEach((item) => {
      const id = getCartItemId(item) || getCartItemTitle(item);
      if (!unique.has(id)) unique.set(id, item);
    });

    return Array.from(unique.values()).slice(0, 4);
  }, [items]);

  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      if (!hasToken()) {
        setItems([]);
        setTotals({
          subtotal: 0,
          discount: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          currency: "USD",
          freeShippingThreshold: null,
          qualifiesForFreeShipping: false,
        });
        return;
      }

      const response = await getCart();

      setItems(unwrapCartItems(response));
      setTotals(unwrapCartTotals(response) as any);
    } catch (err: any) {
      console.error("Cart load failed:", err);

      const message = String(err?.message || "");

      if (message.toLowerCase().includes("unauthorized")) {
        setItems([]);
        setError("Please login to view your cart.");
      } else {
        setError(message || "Failed to load cart.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function handleQuantityChange(item: CartItem, nextQuantity: number) {
    const cartItemId = getCartItemId(item);
    if (!cartItemId || nextQuantity < 1) return;

    try {
      setActionLoadingId(cartItemId);
      setError("");
      setSuccessMessage("");

      await updateCartItemQuantity(cartItemId, nextQuantity);
      await loadCart();

      setSuccessMessage("Cart updated.");
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err: any) {
      console.error("Quantity update failed:", err);
      setError(err?.message || "Quantity update failed.");
    } finally {
      setActionLoadingId("");
    }
  }

  async function handleRemove(item: CartItem) {
    const cartItemId = getCartItemId(item);
    if (!cartItemId) return;

    try {
      setActionLoadingId(cartItemId);
      setError("");
      setSuccessMessage("");

      await removeCartItem(cartItemId);
      await loadCart();

      setSuccessMessage("Item removed from bag.");
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err: any) {
      console.error("Remove failed:", err);
      setError(err?.message || "Remove item failed.");
    } finally {
      setActionLoadingId("");
    }
  }

  async function handleClearCart() {
    try {
      setActionLoadingId("clear");
      setError("");
      setSuccessMessage("");

      await clearCart();
      await loadCart();

      setSuccessMessage("Cart cleared.");
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err: any) {
      console.error("Clear cart failed:", err);
      setError(err?.message || "Clear cart failed.");
    } finally {
      setActionLoadingId("");
    }
  }

  async function handleApplyPromoCode() {
  const code = promoCode.trim();

  if (!code) {
    setError("Promo code enter karo.");
    return;
  }

  try {
    setPromoLoading(true);
    setError("");
    setSuccessMessage("");

    const response = await applyCheckoutPromoCode({
      promoCode: code,
    });

    await loadCart();

   setAppliedPromoCode(
  response?.data?.promoCode ||
    (response as any)?.promoCode ||
    code
);

    setSuccessMessage("Promo code applied.");
  } catch (err: any) {
    console.error("Apply promo failed:", err);
    setError(err?.message || "Promo code apply nahi ho paaya.");
  } finally {
    setPromoLoading(false);
  }
}

async function handleRemovePromoCode() {
  try {
    setPromoLoading(true);
    setError("");
    setSuccessMessage("");

    await removeCheckoutPromoCode();
    await loadCart();

    setPromoCode("");
    setAppliedPromoCode("");
    setSuccessMessage("Promo code removed.");
  } catch (err: any) {
    console.error("Remove promo failed:", err);
    setError(err?.message || "Promo code remove nahi ho paaya.");
  } finally {
    setPromoLoading(false);
  }
}

  function handleCheckout() {
    if (!items.length) {
      setError("Cart is empty. Please add an item before checkout.");
      return;
    }

    setCheckoutLoading(true);
    router.push("/checkout");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8f5ef] text-[#15100c]">
      <SiteHeader />

      <section className="border-b border-[#ddd5c9] bg-[#f8f5ef] px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1320px]">
          <div className="animate-[cartFadeUp_650ms_ease_both] flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.36em] text-[#b98262]">
                Shahsi Bag
              </p>

              <h1 className="text-[44px] font-light leading-none tracking-[-0.06em] text-[#15100c] sm:text-[58px]">
                Shopping Bag
              </h1>

              <p className="mt-5 text-[18px] font-semibold text-[#15100c]">
                Item(s) ({itemCount})
              </p>
            </div>

            <Link
              href="/bridesmaid"
              className="group inline-flex h-[46px] items-center justify-center gap-3 border border-[#15100c] bg-transparent px-6 text-[11px] font-semibold uppercase tracking-[0.22em] transition duration-300 hover:bg-[#15100c] hover:text-white"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 pt-8 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[minmax(0,1fr)_430px] xl:grid-cols-[minmax(0,1fr)_470px]">
          <div className="min-w-0">
            {error ? (
              <div className="mb-5 animate-[cartFadeUp_450ms_ease_both] flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            {successMessage ? (
              <div className="mb-5 animate-[cartFadeUp_450ms_ease_both] flex items-start gap-3 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            ) : null}

            <div className="rounded-[28px] border border-[#e0d8cc] bg-white/68 p-4 shadow-[0_24px_80px_rgba(23,17,13,0.06)] backdrop-blur sm:p-6">
              {loading ? (
                <div>
                  <SkeletonItem />
                  <SkeletonItem />
                  <SkeletonItem />
                </div>
              ) : !items.length ? (
                <div className="animate-[cartFadeUp_650ms_ease_both] px-5 py-16 text-center">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#f0e8de]">
                    <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
                  </div>

                  <h2 className="mt-6 text-[30px] font-semibold tracking-[-0.04em]">
                    Your shopping bag is empty
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-[#6d6760]">
                    Add your favorite bridesmaid dresses to continue checkout.
                  </p>

                  <Link
                    href="/bridesmaid"
                    className="mt-8 inline-flex h-[52px] items-center justify-center bg-[#15100c] px-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-[#b98262]"
                  >
                    Shop Bridesmaid
                  </Link>
                </div>
              ) : (
                <div>
                  {items.map((item, index) => {
                    const cartItemId = getCartItemId(item);
                    const image = getCartItemImage(item);
                    const title = getCartItemTitle(item);
                    const color = getCartItemColor(item);
                    const size = getCartItemSize(item);
                    const sku = getCartItemSku(item);
                    const qty = Math.max(1, Number(item?.quantity || 1));
                    const unitPrice = getCartItemUnitPrice(item);
                    const lineTotal = getCartItemLineTotal(item);
                    const delivery = getItemDelivery(item);
                    const isLoading = actionLoadingId === cartItemId;

                    return (
                      <article
                        key={cartItemId || `${title}-${index}`}
                        className="group grid animate-[cartFadeUp_650ms_ease_both] grid-cols-[108px_minmax(0,1fr)] gap-5 border-b border-[#ddd5c9] py-7 last:border-b-0 sm:grid-cols-[150px_minmax(0,1fr)_132px_110px] sm:gap-6"
                        style={{ animationDelay: `${index * 85}ms` }}
                      >
                        <Link
                          href={buildProductHref(item)}
                          className="relative block h-[150px] overflow-hidden bg-[#eee8df] sm:h-[190px]"
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={title}
                              className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.04]"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center px-4 text-center text-[10px] uppercase tracking-[0.22em] text-[#8b867f]">
                              No Image
                            </div>
                          )}

               
                        </Link>

                        <div className="min-w-0">
                          <Link
                            href={buildProductHref(item)}
                            className="block text-[17px] font-semibold leading-6 tracking-[-0.02em] text-[#15100c] transition hover:text-[#b98262] sm:text-[20px]"
                          >
                            {title}
                          </Link>

                          <div className="mt-5 space-y-2 text-[13px] leading-5 text-[#4f4943] sm:text-[14px]">
                            {color ? (
                              <p>
                                <b className="text-[#15100c]">Dress Color:</b>{" "}
                                {color}
                              </p>
                            ) : null}

                            {size ? (
                              <p>
                                <b className="text-[#15100c]">Size:</b> {size}
                              </p>
                            ) : null}

                            {sku ? (
                              <p>
                                <b className="text-[#15100c]">SKU:</b> {sku}
                              </p>
                            ) : null}

                            <p className="pt-3 text-[#6d6760]">
                              {getEstimatedArrivalText(item)}
                            </p>
                          </div>

                          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
                            <Link
                              href={buildProductHref(item)}
                              className="underline underline-offset-4 transition hover:text-[#b98262]"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleRemove(item)}
                              disabled={isLoading}
                              className="underline underline-offset-4 transition hover:text-red-700 disabled:opacity-50"
                            >
                              Remove
                            </button>

                            <button
                              type="button"
                              className="underline underline-offset-4 transition hover:text-[#b98262]"
                            >
                              Save for later
                            </button>
                          </div>
                        </div>

                        <div className="col-start-2 flex items-start justify-between gap-4 sm:col-start-auto sm:block">
                          <div className="inline-flex h-[44px] items-center border border-[#ddd5c9] bg-white">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item, qty - 1)}
                              disabled={qty <= 1 || isLoading}
                              className="grid h-full w-11 place-items-center transition hover:bg-[#f3eadf] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <span className="grid h-full min-w-11 place-items-center border-x border-[#ddd5c9] text-[15px]">
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                qty
                              )}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item, qty + 1)}
                              disabled={isLoading}
                              className="grid h-full w-11 place-items-center transition hover:bg-[#f3eadf] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <p className="mt-3 hidden text-[13px] text-[#7a746e] sm:block">
                            Unit: {formatMoney(unitPrice, totals.currency)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[20px] font-semibold text-[#15100c]">
                            {formatMoney(lineTotal, totals.currency)}
                          </p>

                          <p className="mt-3 text-[12px] uppercase tracking-[0.2em] text-[#8b867f]">
                            {delivery}
                          </p>
                        </div>
                      </article>
                    );
                  })}

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-8">
                    <button
                      type="button"
                      onClick={handleClearCart}
                      disabled={actionLoadingId === "clear"}
                      className="inline-flex h-[50px] items-center justify-center gap-3 border border-[#15100c] px-6 text-[11px] font-semibold uppercase tracking-[0.24em] transition hover:bg-[#15100c] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoadingId === "clear" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Clear Cart
                    </button>

                    <Link
                      href="/bridesmaid"
                      className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.2em] text-[#15100c] transition hover:text-[#b98262]"
                    >
                      Keep Shopping
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {suggestedItems.length ? (
              <section className="mt-12 animate-[cartFadeUp_800ms_ease_both]">
                <div className="mb-6 flex items-center justify-between border-b border-[#ddd5c9] pb-5">
                  <h2 className="text-[28px] font-semibold tracking-[-0.04em]">
                    You May Also Like
                  </h2>

                  <Link
                    href="/bridesmaid"
                    className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a746e] transition hover:text-[#15100c]"
                  >
                    View More
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                  {suggestedItems.map((item, index) => {
                    const image = getCartItemImage(item);
                    const title = getCartItemTitle(item);
                    const price = getCartItemUnitPrice(item);

                    return (
                      <Link
                        key={`${getCartItemId(item)}-suggested-${index}`}
                        href={buildProductHref(item)}
                        className="group block"
                      >
                        <div className="aspect-[3/4] overflow-hidden bg-[#eee8df]">
                          {image ? (
                            <img
                              src={image}
                              alt={title}
                              className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.05]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.22em] text-[#8b867f]">
                              No Image
                            </div>
                          )}
                        </div>

                        <h3 className="mt-3 line-clamp-2 text-[14px] font-medium leading-5">
                          {title}
                        </h3>

                        <p className="mt-1 text-[14px] text-[#6d6760]">
                          {formatMoney(price, totals.currency)}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="animate-[cartPanelIn_750ms_cubic-bezier(0.22,1,0.36,1)_both] rounded-[28px] border border-[#ddd5c9] bg-white p-6 shadow-[0_30px_100px_rgba(23,17,13,0.10)] sm:p-8">
              <div>
                <div className="mb-7">
                  <p className="mb-3 text-center text-[15px] font-semibold">
                    {freeShippingLeft <= 0
                      ? "You qualify for Free Standard Shipping!"
                      : `${formatMoney(
                          freeShippingLeft,
                          totals.currency
                        )} away from Free Standard Shipping`}
                  </p>

                  <div className="h-[12px] overflow-hidden rounded-full bg-[#e8e2d8]">
                    <div
                      className="h-full rounded-full bg-[#15100c] transition-all duration-700 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[13px] text-[#15100c]">
                    <span>$0</span>
                    <span>
                      {formatMoney(freeShippingThreshold, totals.currency)}
                    </span>
                  </div>
                </div>

                <h2 className="text-[34px] font-semibold tracking-[-0.05em]">
                  Order Summary
                </h2>

                <div className="mt-7 space-y-4 text-[17px]">
                  <div className="flex justify-between gap-5">
                    <span>Subtotal</span>
                    <strong>{formatMoney(totals.subtotal, totals.currency)}</strong>
                  </div>

                  {Number(totals.discount || 0) > 0 ? (
                    <div className="flex justify-between gap-5 text-emerald-700">
                      <span>Discount</span>
                      <strong>
                        -{formatMoney(totals.discount, totals.currency)}
                      </strong>
                    </div>
                  ) : null}

                  <div className="flex justify-between gap-5">
                    <span>Estimated Shipping</span>
                    <strong>
                      {Number(totals.shipping || 0) > 0
                        ? formatMoney(totals.shipping, totals.currency)
                        : "FREE"}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-5">
                    <span>Tax</span>
                    <strong>{formatMoney(totals.tax, totals.currency)}</strong>
                  </div>

                  <div className="border-t border-[#ddd5c9] pt-5">
                    <div className="flex justify-between gap-5 text-[20px]">
                      <span className="font-semibold">Estimated Total</span>
                      <strong>{formatMoney(totals.total, totals.currency)}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[18px] bg-[#f8f5ef] px-4 py-4 text-[14px] leading-6 text-[#15100c]">
                  or 4 interest-free payments of{" "}
                  <b>{formatMoney(Number(totals.total || 0) / 4, totals.currency)}</b>{" "}
                  with <b>Afterpay</b> or <b>Klarna</b>. or <b>PayPal</b>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!items.length || checkoutLoading || loading}
                  className="mt-6 flex h-[62px] w-full items-center justify-center gap-3 rounded-[4px] bg-[#15100c] text-[12px] font-semibold uppercase tracking-[0.24em] text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#b98262] hover:shadow-[0_18px_44px_rgba(23,17,13,0.22)] disabled:cursor-not-allowed disabled:bg-[#9a948c]"
                >
                  {checkoutLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                  {checkoutLoading ? "Opening Checkout..." : "Secure Checkout"}
                </button>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="h-[54px] rounded-[4px] bg-[#efefef] text-[16px] font-semibold text-[#aaa]"
                  >
                    Pay Later
                  </button>

                  <button
                    type="button"
                    className="h-[54px] rounded-[4px] border border-[#15100c] bg-white text-[17px] font-semibold"
                  >
                    Klarna.
                  </button>
                </div>

                <div className="mt-7 border-t border-[#ddd5c9] pt-5">
                  <button
                    type="button"
                    onClick={() => setPromoOpen((value) => !value)}
                    className="flex w-full items-center justify-between text-[16px]"
                  >
                    Promo Code
                    <ChevronDown
                      className={[
                        "h-5 w-5 transition",
                        promoOpen ? "rotate-180" : "",
                      ].join(" ")}
                    />
                  </button>

                  {promoOpen ? (
                    <div className="mt-4 animate-[cartFadeUp_300ms_ease_both] flex gap-2">
                      <input
                        value={promoCode}
                        onChange={(event) => setPromoCode(event.target.value)}
                        placeholder="Enter code"
                        className="h-[46px] min-w-0 flex-1 border border-[#ddd5c9] bg-white px-3 text-[14px] outline-none focus:border-[#15100c]"
                      />

                      {appliedPromoCode ? (
  <p className="mt-3 text-[12px] text-emerald-700">
    Applied: {appliedPromoCode}
  </p>
) : null}

                     {appliedPromoCode ? (
  <button
    type="button"
    onClick={handleRemovePromoCode}
    disabled={promoLoading}
    className="h-[46px] border border-[#15100c] bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#15100c] transition hover:bg-[#15100c] hover:text-white disabled:opacity-60"
  >
    {promoLoading ? "Removing" : "Remove"}
  </button>
) : (
  <button
    type="button"
    onClick={handleApplyPromoCode}
    disabled={promoLoading}
    className="h-[46px] bg-[#15100c] px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#b98262] disabled:opacity-60"
  >
    {promoLoading ? "Applying" : "Apply"}
  </button>
)}
                    </div>
                  ) : null}
                </div>

                <div className="mt-8">
                  <p className="mb-3 text-[14px] font-semibold">We Accept</p>

                  <div className="flex flex-wrap gap-2">
                    {[
                      "VISA",
                      "MC",
                      "AMEX",
                      "DISC",
                      "JCB",
                      "PayPal",
                      "Apple Pay",
                      "G Pay",
                    ].map((label) => (
                      <PaymentBadge key={label} label={label} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid animate-[cartPanelIn_850ms_cubic-bezier(0.22,1,0.36,1)_both] gap-3">
              <CartPromise
                icon={<Truck />}
                title="Complimentary Shipping"
                copy="Free standard shipping on eligible orders."
              />

              <CartPromise
                icon={<PackageCheck />}
                title="Easy Returns"
                copy="Backend-connected order support and secure returns."
              />

              <CartPromise
                icon={<ShieldCheck />}
                title="Secure Checkout"
                copy="Protected checkout with Stripe payment flow."
              />
            </div>
          </aside>
        </div>
      </section>

      <CartAnimationStyles />
    </main>
  );
}

function CartPromise({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="flex gap-3 rounded-[18px] border border-[#ddd5c9] bg-white/74 px-4 py-4 shadow-[0_12px_40px_rgba(23,17,13,0.05)] transition duration-300 hover:-translate-y-0.5 hover:bg-white">
      <span className="mt-0.5 text-[#b98262] [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </span>

      <div>
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#15100c]">
          {title}
        </h3>
        <p className="mt-1 text-[12px] leading-5 text-[#6d6760]">{copy}</p>
      </div>
    </div>
  );
}

function CartAnimationStyles() {
  return (
    <style jsx global>{`
      @keyframes cartFadeUp {
        0% {
          opacity: 0;
          transform: translateY(18px);
          filter: blur(8px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }
      }

      @keyframes cartPanelIn {
        0% {
          opacity: 0;
          transform: translateX(24px) scale(0.985);
          filter: blur(8px);
        }
        100% {
          opacity: 1;
          transform: translateX(0) scale(1);
          filter: blur(0);
        }
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