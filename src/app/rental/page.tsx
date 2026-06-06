"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Clock,
  Heart,
  Package,
  RefreshCcw,
  Ruler,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wand2,
} from "lucide-react";

import { getCatalogProducts } from "@/lib/api/catalog.api";
import {
  createRentalRequest,
  getMyRentalRequests,
  getRentalAvailability,
} from "@/lib/api/rental.api";

type RentalWindow = "weekend" | "standard" | "extended";

type CollectionFilter =
  | "all"
  | "bridesmaid"
  | "weddingGuest"
  | "blackTie"
  | "garden";

type RentalProduct = {
  id: string;
  variantId?: string;
  name: string;
  meta: string;
  price: number;
  retail: number;
  confidence: string;
  backup: string;
  category: CollectionFilter;
  image: string;
};

const BACKEND_PRODUCT_ID = "6f89f30a-6bb2-4f2b-9483-eace8ffda4fc";

const fallbackRentalCollections: RentalProduct[] = [
  {
    id: "6f89f30a-6bb2-4f2b-9483-eace8ffda4fc",
    variantId: "d8b23ef4-adfe-46d6-afb7-294af3a2d787",
    name: "Royal Blush Pink Anarkali Gown",
    meta: "Blush Pink · Wedding Guest · High fit",
    price: 45,
    retail: 249,
    confidence: "High",
    backup: "A4 backup available",
    category: "bridesmaid",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "a11dedab-31a8-4c99-9d07-f069a3cb6883",
    variantId: "3c6e2478-8e19-46ab-af21-066b530f04a3",
    name: "Elegant Red Saree",
    meta: "Blush Pink · Wedding · High fit",
    price: 42,
    retail: 69,
    confidence: "High",
    backup: "M backup available",
    category: "weddingGuest",
    image:
      "https://images.unsplash.com/photo-1756483502816-d7d3547980ad?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "12083e4c-45b1-4f50-bd54-f1aae41d5400",
    variantId: "237fd0ba-4c92-4d47-85b8-682c14b51b0b",
    name: "Blue Floral Bustier Maxi Dress",
    meta: "Blush Pink · Wedding · Medium fit",
    price: 58,
    retail: 249,
    confidence: "Medium",
    backup: "Backup strongly recommended",
    category: "blackTie",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=900&auto=format&fit=crop",
  },
];

const moduleMap = [
  [
    "Rental",
    "Event date selection, rental windows, reserve flow, backup size, return deadline, rental agreement",
  ],
  [
    "Fit Engine",
    "High-confidence sizing, backup size recommendation, rental risk scoring, length warning",
  ],
  [
    "Catalog",
    "Rental-eligible products, images, variants, size availability, garment measurements",
  ],
  [
    "Orders",
    "Rental reservation, shipping, return label, fulfillment and order status",
  ],
  [
    "Payments",
    "Rental fees, deposits, late fees, damage agreement, Stripe authorization",
  ],
  [
    "Returns Feedback",
    "Fit outcome, rental comfort, return condition, future rental confidence",
  ],
];

export default function ShahsiRentalLandingPage() {
  const [eventDate, setEventDate] = useState("2026-06-22");
  const [rentalWindow, setRentalWindow] = useState<RentalWindow>("standard");
  const [filter, setFilter] = useState<CollectionFilter>("all");

  const [rentalProducts, setRentalProducts] = useState<RentalProduct[]>(
    fallbackRentalCollections
  );

  const [availability, setAvailability] = useState<any>(null);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const filteredCollections = useMemo(() => {
    const source = rentalProducts.length
      ? rentalProducts
      : fallbackRentalCollections;

    if (filter === "all") return source;
    return source.filter((item) => item.category === filter);
  }, [filter, rentalProducts]);

  function getRentalRange() {
    const startDate = eventDate;
    const days =
      rentalWindow === "weekend" ? 4 : rentalWindow === "extended" ? 14 : 7;

    const end = new Date(eventDate);
    end.setDate(end.getDate() + days);

    const endDate = end.toISOString().slice(0, 10);

    return { startDate, endDate, days };
  }

  async function loadRentalData() {
    try {
      setLoadingAvailability(true);

      const { startDate, endDate } = getRentalRange();

      const [availabilityRes, requestsRes, catalogRes] = await Promise.allSettled([
        getRentalAvailability({
          productId: BACKEND_PRODUCT_ID,
          startDate,
          endDate,
        }),
        getMyRentalRequests(),
        getCatalogProducts(),
      ]);

      if (availabilityRes.status === "fulfilled") {
        setAvailability(availabilityRes.value?.data || availabilityRes.value);
      }

      if (requestsRes.status === "fulfilled") {
        const raw = requestsRes.value as any;
        setMyRequests(
          Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw)
            ? raw
            : []
        );
      }

      if (catalogRes.status === "fulfilled") {
        const raw = catalogRes.value as any;

        const catalogList =
          raw?.data || raw?.products || raw?.items || raw || [];

        const dynamicRentalProducts = Array.isArray(catalogList)
          ? catalogList
              .filter(
                (item: any) => item?.availableForDailyRent || item?.isRentable
              )
              .map(mapCatalogToRentalProduct)
              .filter((item: RentalProduct) => Boolean(item.id))
          : [];

        if (dynamicRentalProducts.length > 0) {
          setRentalProducts(dynamicRentalProducts);
        }
      }
    } catch (err: any) {
      console.error("Rental data failed:", err);
      setMessage(err?.message || "Rental data load nahi hua.");
    } finally {
      setLoadingAvailability(false);
    }
  }

  useEffect(() => {
    loadRentalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventDate, rentalWindow]);

  async function handleFindRentals() {
    setMessage("");
    await loadRentalData();
    setMessage("Rental availability refreshed.");
  }

  async function handleReserveRental(product: RentalProduct) {
    try {
      setBookingLoading(product.id);
      setMessage("");

      const { days } = getRentalRange();

      const start = new Date(eventDate);
      const end = new Date(eventDate);
      end.setDate(end.getDate() + days);

      await createRentalRequest({
        productId: product.id || BACKEND_PRODUCT_ID,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });

      setMessage("Rental request created successfully.");
      await loadRentalData();
    } catch (err: any) {
      const msg = err?.message || "Rental request create nahi hui.";

      setMessage(
        msg.includes("already has a request")
          ? "You already requested this rental for these dates. Try a different event date or rental window."
          : msg
      );
    } finally {
      setBookingLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <Hero
          eventDate={eventDate}
          setEventDate={setEventDate}
          rentalWindow={rentalWindow}
          setRentalWindow={setRentalWindow}
          onFindRentals={handleFindRentals}
          loadingAvailability={loadingAvailability}
        />

        {message && (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 text-sm font-semibold">
            {message}
          </div>
        )}

        <ConfidenceStrip
          availability={availability}
          myRequestsCount={myRequests.length}
        />

        <RentalProcess />

        <BackupSizing />

        <RentalCollections
          filter={filter}
          setFilter={setFilter}
          products={filteredCollections}
          onReserve={handleReserveRental}
          bookingLoading={bookingLoading}
        />
      </section>

      <ReturnFlow />
      <EventBasedShopping />
      <ModuleOwnership />
    </main>
  );
}

function mapCatalogToRentalProduct(item: any): RentalProduct {
  const primaryImage =
    item?.images?.find((img: any) => img?.isPrimary)?.url ||
    item?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop";

  const firstVariant =
    item?.variants?.find((variant: any) => variant?.isAvailable) ||
    item?.variants?.[0];

  const category = normalizeRentalCategory(item);

  const rentalPrice = Number(
    item?.rentalPrice ||
      firstVariant?.rentalPrice ||
      item?.listingPrice ||
      item?.basePrice ||
      firstVariant?.price ||
      0
  );

  const retailPrice = Number(
    item?.basePrice ||
      item?.compareAtPrice ||
      item?.originalPrice ||
      firstVariant?.compareAtPrice ||
      firstVariant?.price ||
      rentalPrice ||
      0
  );

  const color =
    item?.color || firstVariant?.color || item?.primaryColor || "Color";

  const occasion =
    item?.occasion || item?.eventType || item?.category || "Event";

  return {
    id: item?.id,
    variantId: firstVariant?.id,
    name: item?.title || item?.name || "Rental item",
    meta: `${color} · ${occasion} · High fit`,
    price: rentalPrice,
    retail: retailPrice,
    confidence: item?.rating && Number(item.rating) < 4 ? "Medium" : "High",
    backup: item?.sizeLabel
      ? `${item.sizeLabel} backup available`
      : "Backup size available",
    category,
    image: primaryImage,
  };
}

function normalizeRentalCategory(item: any): CollectionFilter {
  const text = `${item?.category || ""} ${item?.occasion || ""} ${
    item?.eventType || ""
  } ${item?.primaryCollection || ""} ${item?.secondaryCollection || ""} ${(
    item?.tags || []
  ).join(" ")}`.toLowerCase();

  if (text.includes("bridesmaid") || text.includes("bridal")) {
    return "bridesmaid";
  }

  if (text.includes("guest")) {
    return "weddingGuest";
  }

  if (text.includes("black") || text.includes("formal")) {
    return "blackTie";
  }

  if (text.includes("garden")) {
    return "garden";
  }

  return "all";
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Rental by event date</span>
        <span>Backup sizing powered by Fit Engine</span>
        <span>Reserve · wear · return</span>
      </div>
    </div>
  );
}

function Header() {
  return (
   <header className="sticky top-0 z-20 border-b border-neutral-200 bg-[#fbfaf6]/95 backdrop-blur-xl">  
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-5 lg:px-8">
        <div>
          <p className="text-2xl font-semibold tracking-tight">Shahsi</p>
          <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 sm:block">
            Rental system
          </p>
        </div>

        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>How it works</a>
          <a>Event date</a>
          <a>Collections</a>
          <a>Backup sizing</a>
          <a>Return flow</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white">
            <Search className="h-4 w-4" />
          </button>

          <button className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">
            Reserve rental
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({
  eventDate,
  setEventDate,
  rentalWindow,
  setRentalWindow,
  onFindRentals,
  loadingAvailability,
}: {
  eventDate: string;
  setEventDate: (value: string) => void;
  rentalWindow: RentalWindow;
  setRentalWindow: (value: RentalWindow) => void;
  onFindRentals: () => void;
  loadingAvailability: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid min-h-[660px] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">
            /rental
          </p>

          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-7xl">
            Rent with confidence for the event, not the guess.
          </h1>

          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Shahsi rental combines event-date shopping, Fit Engine confidence
            scoring, backup size recommendations, easy returns, and rental-safe
            checkout.
          </p>

          <div className="mt-8 rounded-[1.75rem] bg-white/10 p-4 backdrop-blur">
            <p className="mb-4 text-sm font-medium text-white">
              Start with your event date
            </p>

            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="rounded-2xl bg-white p-4 text-neutral-950">
                <span className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                  Event date
                </span>

                <input
                  type="date"
                  value={eventDate}
                  onChange={(event) => setEventDate(event.target.value)}
                  className="mt-2 w-full bg-transparent text-2xl font-medium outline-none"
                />
              </label>

              <button
                onClick={onFindRentals}
                disabled={loadingAvailability}
                className="rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950 disabled:opacity-50"
              >
                {loadingAvailability ? "Checking..." : "Find rentals"}
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <WindowButton
              id="weekend"
              label="Weekend"
              copy="4 days"
              value={rentalWindow}
              setValue={setRentalWindow}
            />

            <WindowButton
              id="standard"
              label="Standard"
              copy="7 days"
              value={rentalWindow}
              setValue={setRentalWindow}
            />

            <WindowButton
              id="extended"
              label="Extended"
              copy="14 days"
              value={rentalWindow}
              setValue={setRentalWindow}
            />
          </div>
        </div>

        <div className="relative min-h-[520px]">
          <img
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600&auto=format&fit=crop"
            alt="Shahsi rental fashion"
            className="h-full w-full object-cover opacity-90"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-neutral-950/10 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 grid gap-3 md:grid-cols-3">
            <HeroCard
              icon={<Sparkles className="h-4 w-4" />}
              title="Fit confidence"
              copy="High only rentals"
            />

            <HeroCard
              icon={<Package className="h-4 w-4" />}
              title="Backup size"
              copy="Recommended safely"
            />

            <HeroCard
              icon={<RefreshCcw className="h-4 w-4" />}
              title="Return flow"
              copy="Label included"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function WindowButton({
  id,
  label,
  copy,
  value,
  setValue,
}: {
  id: RentalWindow;
  label: string;
  copy: string;
  value: RentalWindow;
  setValue: (value: RentalWindow) => void;
}) {
  return (
    <button
      onClick={() => setValue(id)}
      className={`rounded-2xl p-4 text-left ${
        value === id ? "bg-white text-neutral-950" : "bg-white/10 text-white"
      }`}
    >
      <p className="font-medium">{label}</p>
      <p
        className={`mt-1 text-sm ${
          value === id ? "text-neutral-500" : "text-white/60"
        }`}
      >
        {copy}
      </p>
    </button>
  );
}

function HeroCard({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-2xl bg-white/90 p-4 text-neutral-950 shadow-sm backdrop-blur">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <p className="font-medium">{title}</p>
      </div>
      <p className="text-sm text-neutral-600">{copy}</p>
    </div>
  );
}

function ConfidenceStrip({
  availability,
  myRequestsCount,
}: {
  availability: any;
  myRequestsCount: number;
}) {
  const availabilityLabel =
    availability?.message ||
    availability?.status ||
    availability?.availabilityStatus ||
    "High confidence only";

  return (
    <section className="mt-8 grid gap-4 md:grid-cols-4">
      <MetricCard
        icon={<Ruler className="h-5 w-5" />}
        title="Availability"
        value={availabilityLabel}
      />

      <MetricCard
        icon={<Package className="h-5 w-5" />}
        title="Backup size"
        value="Included when needed"
      />

      <MetricCard
        icon={<CalendarDays className="h-5 w-5" />}
        title="My requests"
        value={`${myRequestsCount} active`}
      />

      <MetricCard
        icon={<Truck className="h-5 w-5" />}
        title="Return label"
        value="Included"
      />
    </section>
  );
}

function MetricCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#f7f2ea]">
        {icon}
      </div>

      <p className="text-sm text-neutral-500">{title}</p>
      <p className="mt-1 text-xl font-medium">{value}</p>
    </div>
  );
}

function RentalProcess() {
  const steps = [
    [
      <CalendarDays className="h-5 w-5" key="calendar" />,
      "Choose event date",
      "Shahsi filters rental availability by event timing.",
    ],
    [
      <Ruler className="h-5 w-5" key="ruler" />,
      "Confirm fit profile",
      "Fit Engine checks size confidence before reservation.",
    ],
    [
      <Package className="h-5 w-5" key="package" />,
      "Reserve dress + backup",
      "Backup sizing appears when risk is detected.",
    ],
    [
      <Truck className="h-5 w-5" key="truck" />,
      "Wear and return",
      "Return label and deadline are included.",
    ],
  ];

  return (
    <section className="mt-14 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-8">
      <SectionHeader
        eyebrow="Rental process"
        title="How Shahsi rental works"
        copy="The rental flow is designed to reduce bad-fit shipments and make event timing clear before checkout."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {steps.map(([icon, title, copy], index) => (
          <div key={String(title)} className="rounded-[1.5rem] bg-[#fbfaf6] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                {icon}
              </div>

              <span className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                0{index + 1}
              </span>
            </div>

            <h3 className="font-medium">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BackupSizing() {
  return (
    <section className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] bg-neutral-950 p-6 text-white shadow-sm md:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-white/50">
          Backup sizing
        </p>

        <h2 className="mt-3 text-4xl font-medium tracking-tight">
          Rental confidence means having a safer second option.
        </h2>

        <p className="mt-4 leading-7 text-white/70">
          Fit Engine recommends a backup size when the selected dress has fitted
          waist/hip zones, low stretch, or all-day event risk.
        </p>

        <button className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">
          Check my backup size <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4">
        <BackupCard
          title="Recommended size"
          value="M / A8"
          copy="Best balance across bust, waist, hip, and length."
          tone="dark"
        />

        <BackupCard
          title="Backup size"
          value="L / A10"
          copy="Safer for rental if you prefer comfort or extended wear."
        />

        <BackupCard
          title="Rental risk"
          value="Low"
          copy="Measurements are complete and garment data is high quality."
        />
      </div>
    </section>
  );
}

function BackupCard({
  title,
  value,
  copy,
  tone = "light",
}: {
  title: string;
  value: string;
  copy: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={`rounded-[1.5rem] p-6 shadow-sm ring-1 ${
        tone === "dark"
          ? "bg-neutral-950 text-white ring-neutral-950"
          : "bg-white ring-neutral-200"
      }`}
    >
      <p
        className={`text-xs uppercase tracking-[0.16em] ${
          tone === "dark" ? "text-white/50" : "text-neutral-500"
        }`}
      >
        {title}
      </p>

      <p className="mt-2 text-3xl font-medium">{value}</p>

      <p
        className={`mt-3 text-sm leading-6 ${
          tone === "dark" ? "text-white/70" : "text-neutral-600"
        }`}
      >
        {copy}
      </p>
    </div>
  );
}

function RentalCollections({
  filter,
  setFilter,
  products,
  onReserve,
  bookingLoading,
}: {
  filter: CollectionFilter;
  setFilter: (value: CollectionFilter) => void;
  products: RentalProduct[];
  onReserve: (product: RentalProduct) => void;
  bookingLoading: string | null;
}) {
  const filters: Array<[CollectionFilter, string]> = [
    ["all", "All"],
    ["bridesmaid", "Bridesmaid"],
    ["weddingGuest", "Wedding guest"],
    ["blackTie", "Black tie"],
    ["garden", "Garden"],
  ];

  return (
    <section className="mt-14">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionHeader
          eyebrow="Rental collections"
          title="Rent event-ready dresses"
          copy="Browse rental-eligible dresses with confidence messaging, backup sizing, and return flow clarity."
        />

        <button className="inline-flex items-center gap-2 rounded-full border border-neutral-950 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em]">
          View all rentals <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
        {filters.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`shrink-0 rounded-full border px-5 py-3 text-sm font-medium ${
              filter === id
                ? "border-neutral-950 bg-neutral-950 text-white"
                : "border-neutral-200 bg-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-neutral-300 bg-white p-8 text-neutral-500">
          No rental products available for this filter.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <RentalProductCard
              key={product.id}
              product={product}
              onReserve={onReserve}
              bookingLoading={bookingLoading}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function RentalProductCard({
  product,
  onReserve,
  bookingLoading,
}: {
  product: RentalProduct;
  onReserve: (product: RentalProduct) => void;
  bookingLoading: string | null;
}) {
  return (
<article className="group relative z-0 overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-neutral-200">
        <div className="relative overflow-hidden bg-neutral-100">
        <img
          src={product.image}
          alt={product.name}
          className="aspect-[3/4] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />

        <button className="absolute right-3 top-3 rounded-full bg-white/90 p-3 shadow-sm backdrop-blur">
          <Heart className="h-4 w-4" />
        </button>

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          <Badge>Rental</Badge>
          <Badge>{product.confidence} fit</Badge>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className="h-3.5 w-3.5 fill-neutral-950 text-neutral-950"
            />
          ))}
        </div>

        <h3 className="font-medium">{product.name}</h3>
        <p className="mt-1 text-sm text-neutral-500">{product.meta}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <Mini label="Rent" value={`$${product.price}`} />
          <Mini label="Retail" value={`$${product.retail}`} />
        </div>

        <div className="mt-4 rounded-2xl bg-[#f7f2ea] p-3 text-sm text-neutral-700">
          <strong>Backup:</strong> {product.backup}
        </div>

        <button
          onClick={() => onReserve(product)}
          disabled={bookingLoading === product.id}
          className="mt-4 w-full rounded-full bg-neutral-950 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-50"
        >
          {bookingLoading === product.id ? "Reserving..." : "Reserve rental"}
        </button>
      </div>
    </article>
  );
}

function ReturnFlow() {
  return (
    <section className="mt-14 bg-[#f7f2ea] py-14">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Return flow
          </p>

          <h2 className="mt-3 text-4xl font-medium tracking-tight">
            Wear it, send it back, improve future fit.
          </h2>

          <p className="mt-4 leading-7 text-neutral-600">
            Rental returns feed the recommendation loop with comfort, fit
            outcome, problem area, and return condition signals.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <FlowStep
            icon={<Package className="h-5 w-5" />}
            title="Receive"
            copy="Arrives before event window"
          />

          <FlowStep
            icon={<Sparkles className="h-5 w-5" />}
            title="Wear"
            copy="Use recommended or backup size"
          />

          <FlowStep
            icon={<RefreshCcw className="h-5 w-5" />}
            title="Return"
            copy="Prepaid label included"
          />

          <FlowStep
            icon={<Wand2 className="h-5 w-5" />}
            title="Learn"
            copy="Feedback improves next rental"
          />
        </div>
      </div>
    </section>
  );
}

function EventBasedShopping() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-14 lg:px-8">
      <div className="grid gap-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Event-based shopping
          </p>

          <h2 className="mt-3 text-4xl font-medium tracking-tight">
            Rental pages should start with when, not just what.
          </h2>

          <p className="mt-4 leading-7 text-neutral-600">
            The rental module filters inventory by event date, shipping buffer,
            return window, and backup-size availability before the user reaches
            checkout.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard
            icon={<CalendarDays className="h-5 w-5" />}
            title="Event date"
            copy="Determines availability and shipping buffer."
          />

          <InfoCard
            icon={<Clock className="h-5 w-5" />}
            title="Rental window"
            copy="Weekend, standard, or extended rental period."
          />

          <InfoCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Confidence threshold"
            copy="Rental prioritizes high-confidence fit."
          />

          <InfoCard
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Risk warnings"
            copy="Backup size or alternative style when needed."
          />
        </div>
      </div>
    </section>
  );
}

function ModuleOwnership() {
  return (
    <section className="bg-neutral-950 py-14 text-white">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-white/50">
            Modular Monolith Ownership
          </p>

          <h2 className="mt-3 text-4xl font-medium tracking-tight">
            Rental page module map.
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {moduleMap.map(([title, copy]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 p-5"
            >
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
      {children}
    </span>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f7f2ea] p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </p>

      <p className="font-semibold">{value}</p>
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

function InfoCard({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-[#fbfaf6] p-5">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <p className="font-medium">{title}</p>
      </div>

      <p className="text-sm leading-6 text-neutral-600">{copy}</p>
    </div>
  );
}