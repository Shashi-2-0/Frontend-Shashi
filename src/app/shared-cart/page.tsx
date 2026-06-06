"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  CreditCard,
  Loader2,
  Package,
  RefreshCcw,
  Scissors,
  Search,
  Shirt,
  ShoppingBag,
  Trash2,
  Truck,
  Users,
} from "lucide-react";

import { clearCart, getCart, removeCartItem } from "@/lib/api/cart.api";
import { createCheckout } from "@/lib/api/checkout.api";

type CartMode = "individual" | "group";
type CommerceType = "buy" | "rent" | "subscribe" | "resale" | "mto";
type PaymentStatus = "paid" | "pending" | "not_started";
type ValidationStatus = "ready" | "warning" | "blocked";

type CartItem = {
  id: string;
  productId?: string;
  product: string;
  member: string;
  ownerEmail?: string;
  commerceType: CommerceType;
  color: string;
  size: string;
  price: number;
  paymentStatus: PaymentStatus;
  validationStatus: ValidationStatus;
  image: string;
  fitConfidence: "High" | "Medium" | "Low";
  note: string;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop";

export default function ShahsiSharedCartPage() {
  const [cartMode, setCartMode] = useState<CartMode>("group");
  const [openSection, setOpenSection] = useState<
    "payments" | "validations" | "shipping"
  >("payments");

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      const response = await getCart();
      const raw: any = response;

      const list =
        raw?.data?.items ||
        raw?.data?.cart?.items ||
        raw?.cart?.items ||
        raw?.items ||
        raw?.data ||
        raw;

      const mapped = Array.isArray(list) ? list.map(mapCartItem) : [];
      setItems(mapped);
    } catch (err: any) {
      setError(err?.message || "Cart load nahi ho paya.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function handleRemove(id: string) {
    try {
      await removeCartItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err?.message || "Item remove nahi hua.");
    }
  }

  async function handleClearCart() {
    try {
      await clearCart();
      setItems([]);
    } catch (err: any) {
      alert(err?.message || "Cart clear nahi hua.");
    }
  }

  async function handleCheckout() {
    try {
      setCheckoutLoading(true);

      const savedEventId =
        typeof window !== "undefined"
          ? localStorage.getItem("bridalEventId") ||
            localStorage.getItem("shahsiBridalEventId") ||
            undefined
          : undefined;

      const response: any = await createCheckout({
        mode: cartMode,
        eventId: savedEventId,
      });

      const data = response?.data || response;
      const paymentUrl = data?.paymentUrl || data?.url || data?.checkoutUrl;

      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      if (data?.orderId) {
        window.location.href = `/orders/${data.orderId}`;
        return;
      }

     alert("Checkout created successfully.");
window.location.href = "/account";
    } catch (err: any) {
      alert(err?.message || "Checkout create nahi hua.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const paid = items
      .filter((item) => item.paymentStatus === "paid")
      .reduce((sum, item) => sum + item.price, 0);
    const due = subtotal - paid;
    const ready = items.filter((item) => item.validationStatus === "ready").length;
    const warnings = items.filter(
      (item) => item.validationStatus === "warning"
    ).length;
    const blocked = items.filter(
      (item) => item.validationStatus === "blocked"
    ).length;

    return { subtotal, paid, due, ready, warnings, blocked };
  }, [items]);

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />

      <Header onClear={handleClearCart} />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <CartHero
          cartMode={cartMode}
          setCartMode={setCartMode}
          totals={totals}
          totalItems={items.length}
        />

        {loading && (
          <div className="mt-8 flex items-center justify-center rounded-[1.75rem] bg-white p-10 ring-1 ring-neutral-200">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading cart...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && (
          <div className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="grid gap-8">
              <CartItems
                cartMode={cartMode}
                items={items}
                onRemove={handleRemove}
              />

              <GroupOrderState items={items} />

              <ValidationCenter items={items} />
            </div>

            <aside className="grid gap-8 xl:sticky xl:top-28 xl:self-start">
              <CheckoutSummary
                totals={totals}
                cartMode={cartMode}
                onCheckout={handleCheckout}
                checkoutLoading={checkoutLoading}
                disabled={items.length === 0 || totals.blocked > 0}
              />

              <SplitPaymentPanel totals={totals} items={items} />

              <CartAccordions
                openSection={openSection}
                setOpenSection={setOpenSection}
              />
            </aside>
          </div>
        )}
      </section>

      <CheckoutFlow />
      <ModuleOwnership />
    </main>
  );
}

function mapCartItem(raw: any): CartItem {
  const product = raw?.product || raw?.productData || {};

  const id =
    raw?.id ||
    raw?.cartItemId ||
    raw?._id ||
    raw?.productId ||
    crypto.randomUUID();

  const price =
    Number(raw?.price) ||
    Number(raw?.total) ||
    Number(product?.price) ||
    Number(product?.salePrice) ||
    0;

  return {
    id,
    productId: raw?.productId || product?.id || product?._id,
    product:
      raw?.productName ||
      raw?.name ||
      raw?.title ||
      product?.name ||
      product?.title ||
      "Shahsi item",
    member:
      raw?.memberName ||
      raw?.ownerName ||
      raw?.assignedTo ||
      raw?.member ||
      "You",
    ownerEmail: raw?.memberEmail || raw?.ownerEmail || "",
    commerceType: normalizeCommerceType(
      raw?.commerceType || raw?.type || raw?.mode || "buy"
    ),
    color: raw?.color || product?.color || raw?.variant?.color || "Default",
    size:
      raw?.size ||
      raw?.sizeLabel ||
      raw?.variant?.size ||
      raw?.sizeType ||
      "Selected",
    price,
    paymentStatus: normalizePaymentStatus(raw?.paymentStatus),
    validationStatus: normalizeValidationStatus(raw?.validationStatus),
    image:
      raw?.image ||
      raw?.imageUrl ||
      product?.image ||
      product?.imageUrl ||
      product?.images?.[0] ||
      fallbackImage,
    fitConfidence: normalizeFitConfidence(raw?.fitConfidence),
    note:
      raw?.note ||
      raw?.validationNote ||
      raw?.message ||
      "Cart item ready for checkout validation.",
  };
}

function normalizeCommerceType(value: any): CommerceType {
  const v = String(value || "").toLowerCase();
  if (v.includes("rent")) return "rent";
  if (v.includes("sub")) return "subscribe";
  if (v.includes("resale")) return "resale";
  if (v.includes("mto") || v.includes("custom")) return "mto";
  return "buy";
}

function normalizePaymentStatus(value: any): PaymentStatus {
  const v = String(value || "").toLowerCase();
  if (v.includes("paid")) return "paid";
  if (v.includes("pending")) return "pending";
  return "not_started";
}

function normalizeValidationStatus(value: any): ValidationStatus {
  const v = String(value || "").toLowerCase();
  if (v.includes("block")) return "blocked";
  if (v.includes("warn") || v.includes("review")) return "warning";
  return "ready";
}

function normalizeFitConfidence(value: any): "High" | "Medium" | "Low" {
  const v = String(value || "").toLowerCase();
  if (v.includes("low")) return "Low";
  if (v.includes("medium")) return "Medium";
  return "High";
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Shared Cart</span>
        <span>Individual checkout · group ordering · split payments</span>
        <span>Retail · rental · subscription · resale · MTO validation</span>
      </div>
    </div>
  );
}

function Header({ onClear }: { onClear: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#fbfaf6]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-5 lg:px-8">
        <div>
          <p className="text-2xl font-semibold tracking-tight">Shahsi</p>
          <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 sm:block">
            Shared cart system
          </p>
        </div>

        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Cart</a>
          <a>Group Order</a>
          <a>Payments</a>
          <a>Validations</a>
          <a>Checkout</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white">
            <Search className="h-4 w-4" />
          </button>

          <button
            onClick={onClear}
            className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium hover:bg-white"
          >
            Clear
          </button>
        </div>
      </div>
    </header>
  );
}

function CartHero({
  cartMode,
  setCartMode,
  totals,
  totalItems,
}: {
  cartMode: CartMode;
  setCartMode: (mode: CartMode) => void;
  totals: any;
  totalItems: number;
}) {
  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">/cart</p>

          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-6xl">
            Shared cart for individual and bridal group checkout.
          </h1>

          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Shahsi cart manages assigned products, split payments, bridal ownership,
            rental timing, subscription eligibility, resale validation, and
            made-to-order production warnings.
          </p>

          <div className="mt-8 grid gap-2 sm:grid-cols-2">
            <button
              onClick={() => setCartMode("group")}
              className={`rounded-full px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] ${
                cartMode === "group"
                  ? "bg-white text-neutral-950"
                  : "border border-white/30 text-white"
              }`}
            >
              Group order
            </button>

            <button
              onClick={() => setCartMode("individual")}
              className={`rounded-full px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] ${
                cartMode === "individual"
                  ? "bg-white text-neutral-950"
                  : "border border-white/30 text-white"
              }`}
            >
              Individual checkout
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <HeroMetric
            icon={<ShoppingBag className="h-4 w-4" />}
            label="Subtotal"
            value={`₹${totals.subtotal}`}
          />

          <HeroMetric
            icon={<CreditCard className="h-4 w-4" />}
            label="Still due"
            value={`₹${totals.due}`}
          />

          <HeroMetric
            icon={<BadgeCheck className="h-4 w-4" />}
            label="Ready items"
            value={`${totals.ready}/${totalItems || 0}`}
          />

          <HeroMetric
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Needs review"
            value={`${totals.warnings + totals.blocked}`}
          />
        </div>
      </div>
    </section>
  );
}

function HeroMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
      <div className="mb-3 flex items-center gap-2 text-white/75">
        {icon}
        <span className="text-xs uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="text-2xl font-medium">{value}</p>
    </div>
  );
}

function CartItems({
  cartMode,
  items,
  onRemove,
}: {
  cartMode: CartMode;
  items: CartItem[];
  onRemove: (id: string) => void;
}) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader
        eyebrow="Cart items"
        title={cartMode === "group" ? "Assigned group cart" : "Your individual cart"}
        copy="Each item keeps its commerce flow, member owner, payment status, fit confidence, and validation state."
      />

      {items.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-neutral-300 p-8 text-neutral-500">
          Cart empty hai. Product page se item add karo.
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {items.map((item) => (
            <CartItemCard key={item.id} item={item} onRemove={onRemove} />
          ))}
        </div>
      )}
    </section>
  );
}

function CartItemCard({
  item,
  onRemove,
}: {
  item: CartItem;
  onRemove: (id: string) => void;
}) {
  return (
    <article className="grid gap-4 rounded-[1.5rem] border border-neutral-200 p-4 md:grid-cols-[116px_1fr_auto] md:items-center">
      <img
        src={item.image}
        alt={item.product}
        className="h-32 w-full rounded-2xl object-cover md:h-28 md:w-28"
      />

      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          <CommerceBadge type={item.commerceType} />
          <ValidationBadge status={item.validationStatus} />
          <PaymentBadge status={item.paymentStatus} />
        </div>

        <h3 className="text-xl font-medium">{item.product}</h3>

        <p className="mt-1 text-sm text-neutral-500">
          {item.member} · {item.color} · Size {item.size}
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <MiniMetric label="Owner" value={item.member} />

          <MiniMetric
            label="Fit"
            value={item.fitConfidence}
            tone={item.fitConfidence === "High" ? "success" : "neutral"}
          />

          <MiniMetric label="Note" value={item.note} wide />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 md:block md:text-right">
        <p className="text-2xl font-medium">₹{item.price}</p>

        <button
          onClick={() => onRemove(item.id)}
          className="mt-0 rounded-full border border-neutral-300 p-3 hover:bg-neutral-50 md:mt-5"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function GroupOrderState({ items }: { items: CartItem[] }) {
  const owners = items.length ? items : [];

  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader
        eyebrow="Group order state"
        title="Bridal member ownership"
        copy="Bridal Party module tracks who owns each item, who has paid, and what still blocks group checkout."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {owners.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-neutral-300 p-6 text-neutral-500">
            No assigned members yet.
          </div>
        ) : (
          owners.map((item) => (
            <div key={item.id} className="rounded-[1.5rem] border border-neutral-200 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-white">
                    {item.member.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="font-medium">{item.member}</p>
                    <p className="text-sm text-neutral-500">{item.product}</p>
                  </div>
                </div>

                <p className="font-medium">₹{item.price}</p>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-[#fbfaf6] p-3 text-sm">
                <span>Payment</span>
                <strong>{paymentText(item.paymentStatus)}</strong>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function ValidationCenter({ items }: { items: CartItem[] }) {
  const rental = items.some((item) => item.commerceType === "rent");
  const subscription = items.some((item) => item.commerceType === "subscribe");
  const resale = items.some((item) => item.commerceType === "resale");
  const mto = items.some((item) => item.commerceType === "mto");

  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader
        eyebrow="Validation center"
        title="Rental, subscription, resale, and MTO checks"
        copy="Before checkout, Shahsi validates non-standard commerce flows so the order does not fail after payment."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ValidationCard
          icon={<Package className="h-5 w-5" />}
          title="Rental timing"
          status={rental ? "Warning" : "Ready"}
          copy={
            rental
              ? "Rental item found. Event date and backup size should be confirmed."
              : "No rental item requiring timing validation."
          }
        />

        <ValidationCard
          icon={<RefreshCcw className="h-5 w-5" />}
          title="Subscription eligibility"
          status={subscription ? "Ready" : "Ready"}
          copy={
            subscription
              ? "Subscription item can be added to Gownloop flow."
              : "No subscription blockers."
          }
        />

        <ValidationCard
          icon={<Shirt className="h-5 w-5" />}
          title="Resale validation"
          status={resale ? "Warning" : "Ready"}
          copy={
            resale
              ? "Resale item should include seller measurements and condition validation."
              : "No resale validation required."
          }
        />

        <ValidationCard
          icon={<Scissors className="h-5 w-5" />}
          title="MTO production warning"
          status={mto ? "Warning" : "Ready"}
          copy={
            mto
              ? "Made-to-order item requires production timeline confirmation."
              : "No MTO production warning."
          }
        />
      </div>
    </section>
  );
}

function CheckoutSummary({
  totals,
  cartMode,
  onCheckout,
  checkoutLoading,
  disabled,
}: {
  totals: any;
  cartMode: CartMode;
  onCheckout: () => void;
  checkoutLoading: boolean;
  disabled: boolean;
}) {
  return (
    <section className="rounded-[1.75rem] bg-neutral-950 p-5 text-white shadow-sm md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
        Checkout summary
      </p>

      <h2 className="mt-2 text-3xl font-medium tracking-tight">
        {cartMode === "group" ? "Group checkout" : "Individual checkout"}
      </h2>

      <div className="mt-6 grid gap-3">
        <DarkRow label="Subtotal" value={`₹${totals.subtotal}`} />
        <DarkRow label="Already paid" value={`₹${totals.paid}`} />
        <DarkRow label="Still due" value={`₹${totals.due}`} />
        <DarkRow label="Shipping estimate" value="Calculated at checkout" />
      </div>

      <button
        onClick={onCheckout}
        disabled={disabled || checkoutLoading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {checkoutLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating checkout
          </>
        ) : (
          <>
            Continue to checkout <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      {totals.blocked > 0 && (
        <p className="mt-4 text-center text-xs leading-5 text-red-200">
          Blocked validations must be resolved before checkout.
        </p>
      )}
    </section>
  );
}

function SplitPaymentPanel({
  totals,
  items,
}: {
  totals: any;
  items: CartItem[];
}) {
  const paidCount = items.filter((item) => item.paymentStatus === "paid").length;
  const remaining = Math.max(items.length - paidCount, 0);

  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5" />
        <h2 className="text-xl font-medium">Split payment</h2>
      </div>

      <p className="text-sm leading-6 text-neutral-600">
        Each member can pay individually while the organizer monitors group readiness.
      </p>

      <div className="mt-5 grid gap-3">
        <LightRow label="Paid" value={`₹${totals.paid}`} />
        <LightRow label="Pending" value={`₹${totals.due}`} />
        <LightRow
          label="Payment state"
          value={`${paidCount} paid · ${remaining} remaining`}
        />
      </div>

      <button className="mt-5 w-full rounded-full border border-neutral-950 py-3 text-xs font-semibold uppercase tracking-[0.14em]">
        Send payment reminders
      </button>
    </section>
  );
}

function CartAccordions({
  openSection,
  setOpenSection,
}: {
  openSection: "payments" | "validations" | "shipping";
  setOpenSection: (section: "payments" | "validations" | "shipping") => void;
}) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <div className="divide-y divide-neutral-200">
        <Accordion
          id="payments"
          title="Payment rules"
          open={openSection}
          setOpen={setOpenSection}
        >
          Each cart item can be paid by its assigned owner, the bride, or included in a group payment.
        </Accordion>

        <Accordion
          id="validations"
          title="Validation rules"
          open={openSection}
          setOpen={setOpenSection}
        >
          Rental, subscription, resale, and MTO items must pass validation before checkout can finalize.
        </Accordion>

        <Accordion
          id="shipping"
          title="Shipping and fulfillment"
          open={openSection}
          setOpen={setOpenSection}
        >
          Orders module groups items for coordinated shipping while respecting rental return windows, MTO production, and seller-shipped resale items.
        </Accordion>
      </div>
    </section>
  );
}

function CheckoutFlow() {
  return (
    <section className="bg-[#f7f2ea] py-14">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Checkout handoff
          </p>

          <h2 className="mt-3 text-4xl font-medium tracking-tight">
            From shared cart to modular checkout.
          </h2>

          <p className="mt-4 leading-7 text-neutral-600">
            The cart prepares clean order data before sending the user to checkout.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <FlowStep icon={<ShoppingBag className="h-5 w-5" />} title="Cart" copy="Validate items" />
          <FlowStep icon={<Users className="h-5 w-5" />} title="Ownership" copy="Assign members" />
          <FlowStep icon={<CreditCard className="h-5 w-5" />} title="Payments" copy="Split or group pay" />
          <FlowStep icon={<Truck className="h-5 w-5" />} title="Fulfillment" copy="Route by model" />
          <FlowStep icon={<BadgeCheck className="h-5 w-5" />} title="Order" copy="Submit checkout" />
        </div>
      </div>
    </section>
  );
}

function ModuleOwnership() {
  const moduleMap = [
    ["Orders", "Cart items, checkout handoff, fulfillment state"],
    ["Bridal Party", "Member ownership and group order state"],
    ["Payments", "Split payment and Stripe checkout handoff"],
    ["Rental", "Rental timing, event date, backup size"],
    ["Subscription", "Gownloop eligibility and box enrollment"],
    ["Reseller Marketplace", "Seller measurement validation"],
    ["Made-to-order", "Production timeline and custom measurements"],
    ["Fit Engine", "Fit confidence and size validation"],
    ["Catalog", "Product, variant, size, color and image data"],
  ];

  return (
    <section className="bg-neutral-950 py-14 text-white">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-white/50">
            Modular Monolith Ownership
          </p>

          <h2 className="mt-3 text-4xl font-medium tracking-tight">
            Shared Cart module map.
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {moduleMap.map(([title, copy]) => (
            <div key={title} className="rounded-2xl border border-white/10 p-5">
              <h3 className="font-medium">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
        {title}
      </h2>

      <p className="mt-3 max-w-3xl leading-7 text-neutral-600">{copy}</p>
    </div>
  );
}

function CommerceBadge({ type }: { type: CommerceType }) {
  const labels: Record<CommerceType, [string, React.ReactNode]> = {
    buy: ["Retail", <ShoppingBag key="buy" className="h-3.5 w-3.5" />],
    rent: ["Rental", <Package key="rent" className="h-3.5 w-3.5" />],
    subscribe: ["Subscription", <RefreshCcw key="sub" className="h-3.5 w-3.5" />],
    resale: ["Resale", <Shirt key="resale" className="h-3.5 w-3.5" />],
    mto: ["MTO", <Scissors key="mto" className="h-3.5 w-3.5" />],
  };

  const [label, icon] = labels[type];

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#f7f2ea] px-3 py-1 text-xs font-medium">
      {icon}
      {label}
    </span>
  );
}

function ValidationBadge({ status }: { status: ValidationStatus }) {
  const styles = {
    ready: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    blocked: "bg-red-50 text-red-700",
  }[status];

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles}`}>
      {status === "ready" ? "Ready" : status === "warning" ? "Review" : "Blocked"}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const styles = {
    paid: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    not_started: "bg-neutral-100 text-neutral-700",
  }[status];

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles}`}>
      {paymentText(status)}
    </span>
  );
}

function paymentText(status: PaymentStatus) {
  if (status === "paid") return "Paid";
  if (status === "pending") return "Payment pending";
  return "Not started";
}

function MiniMetric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "success" | "neutral";
  wide?: boolean;
}) {
  return (
    <div className="rounded-xl bg-[#f7f2ea] p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-semibold ${
          tone === "success" ? "text-emerald-700" : "text-neutral-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ValidationCard({
  icon,
  title,
  status,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  status: "Ready" | "Warning" | "Blocked";
  copy: string;
}) {
  const statusClass =
    status === "Ready"
      ? "text-emerald-700"
      : status === "Blocked"
      ? "text-red-700"
      : "text-amber-700";

  return (
    <div className="rounded-[1.5rem] border border-neutral-200 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-medium">{title}</h3>
        </div>

        <span className={`text-sm font-medium ${statusClass}`}>{status}</span>
      </div>

      <p className="text-sm leading-6 text-neutral-600">{copy}</p>
    </div>
  );
}

function DarkRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4 text-sm">
      <span className="text-white/65">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#fbfaf6] p-4 text-sm">
      <span className="text-neutral-600">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Accordion({
  id,
  title,
  open,
  setOpen,
  children,
}: {
  id: "payments" | "validations" | "shipping";
  title: string;
  open: string;
  setOpen: (id: "payments" | "validations" | "shipping") => void;
  children: React.ReactNode;
}) {
  const isOpen = id === open;

  return (
    <div className="py-4">
      <button
        onClick={() => setOpen(id)}
        className="flex w-full items-center justify-between text-left font-medium"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <p className="mt-3 text-sm leading-6 text-neutral-600">{children}</p>
      )}
    </div>
  );
}

function FlowStep({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm ring-1 ring-neutral-200">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f2ea]">
        {icon}
      </div>

      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{copy}</p>
    </div>
  );
}