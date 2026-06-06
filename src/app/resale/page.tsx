"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Heart,
  Info,
  Loader2,
  MapPin,
  Package,
  Ruler,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  UserRound,
  Wand2,
} from "lucide-react";

import {
  buyNowResaleListing,
  getRelatedResaleListings,
  getResaleListings,
  likeResaleListing,
  unlikeResaleListing,
} from "@/lib/api/resale.api";

type Condition = "new" | "excellent" | "good" | "fair";
type FitConfidence = "High" | "Medium" | "Low";
type SortKey = "matched" | "newest" | "priceLow" | "priceHigh" | "confidence";
type FilterKey = "all" | "verified" | "highFit" | "under100" | "shipsFast";

type Listing = {
  id: string;
  title: string;
  brand: string;
  color: string;
  size: string;
  price: number;
  originalPrice: number;
  condition: Condition;
  conditionScore: number;
  fitConfidence: FitConfidence;
  verified: boolean;
  liked?: boolean;
  shipsFrom: string;
  seller: {
    name: string;
    rating: number;
    sales: number;
    verified: boolean;
  };
  measurements: {
    bust?: number;
    waist?: number;
    hip?: number;
    length?: number;
  };
  missingData: string[];
  image: string;
  aiMatch: number;
};

const fallbackListings: Listing[] = [
  {
    id: "fallback-1",
    title: "Mira Chiffon Dress",
    brand: "Shahsi",
    color: "Sage",
    size: "M",
    price: 68,
    originalPrice: 99,
    condition: "excellent",
    conditionScore: 94,
    fitConfidence: "High",
    verified: true,
    liked: false,
    shipsFrom: "New York, NY",
    seller: { name: "Maya R.", rating: 4.9, sales: 18, verified: true },
    measurements: { bust: 38, waist: 30.5, hip: 42, length: 61 },
    missingData: [],
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop",
    aiMatch: 96,
  },
  {
    id: "fallback-2",
    title: "Debra Convertible Chiffon Dress",
    brand: "Shahsi",
    color: "Champagne",
    size: "A6",
    price: 70,
    originalPrice: 119,
    condition: "excellent",
    conditionScore: 91,
    fitConfidence: "High",
    verified: true,
    liked: false,
    shipsFrom: "Los Angeles, CA",
    seller: { name: "Lina A.", rating: 5.0, sales: 24, verified: true },
    measurements: { bust: 36, waist: 28, hip: 40, length: 60 },
    missingData: [],
    image:
      "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=900&auto=format&fit=crop",
    aiMatch: 92,
  },
  {
    id: "fallback-3",
    title: "Valentine Floral Burnout Dress",
    brand: "Shahsi",
    color: "Olive Floral",
    size: "S",
    price: 76,
    originalPrice: 129,
    condition: "new",
    conditionScore: 99,
    fitConfidence: "High",
    verified: false,
    liked: false,
    shipsFrom: "Chicago, IL",
    seller: { name: "Aisha M.", rating: 4.8, sales: 12, verified: false },
    measurements: { bust: 35, waist: 27, hip: 39, length: 48 },
    missingData: [],
    image:
      "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=900&auto=format&fit=crop",
    aiMatch: 88,
  },
  {
    id: "fallback-4",
    title: "Sorrel Stretch Satin Dress",
    brand: "Shahsi",
    color: "Ganache",
    size: "A10",
    price: 84,
    originalPrice: 149,
    condition: "good",
    conditionScore: 82,
    fitConfidence: "Medium",
    verified: true,
    liked: false,
    shipsFrom: "Austin, TX",
    seller: { name: "Sofia K.", rating: 4.7, sales: 9, verified: true },
    measurements: { bust: 39, waist: 31, length: 62 },
    missingData: ["Hip measurement"],
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop",
    aiMatch: 78,
  },
];

const moduleMap = [
  [
    "Reseller Marketplace",
    "Seller profiles, listings, condition scoring, verified resale, seller shipping, marketplace checkout",
  ],
  [
    "Fit Engine",
    "Garment measurement comparison, fit confidence, missing measurement warnings, resale size normalization",
  ],
  [
    "Catalog",
    "Product reference, brand, color, fabric, size, original product data, images",
  ],
  [
    "User Profile",
    "Buyer measurements, saved size, fit preferences, location and style preferences",
  ],
  [
    "Recommendation Engine",
    "AI matching score using fit, style, condition, seller trust, and availability",
  ],
  [
    "Orders",
    "Resale purchase flow, seller shipping state, delivery tracking, buyer confirmation",
  ],
  [
    "Payments",
    "Marketplace payment authorization, seller payout, buyer protection, Stripe Connect-style flow",
  ],
  [
    "Returns Feedback",
    "Buyer fit result, item condition feedback, seller quality signals",
  ],
];

export default function ShahsiResaleMarketplacePage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("matched");
  const [listings, setListings] = useState<Listing[]>(fallbackListings);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(
    fallbackListings[0]
  );
  const [relatedListings, setRelatedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const visibleListings = useMemo(() => {
    let result = listings.filter((listing) => {
      if (filter === "verified") return listing.verified;
      if (filter === "highFit") return listing.fitConfidence === "High";
      if (filter === "under100") return listing.price < 100;
      if (filter === "shipsFast") return listing.seller.rating >= 4.8;
      return true;
    });

    if (sort === "priceLow") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "priceHigh") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "confidence") {
      result = [...result].sort((a, b) => b.conditionScore - a.conditionScore);
    }
    if (sort === "matched") result = [...result].sort((a, b) => b.aiMatch - a.aiMatch);
    if (sort === "newest") result = [...result].reverse();

    return result;
  }, [filter, sort, listings]);

  async function loadListings() {
    try {
      setLoading(true);
      setMessage("");

      const response = await getResaleListings();

      const raw =
        response?.data?.listings ||
        response?.data ||
        response?.listings ||
        response?.items ||
        response ||
        [];

      const mapped = Array.isArray(raw)
        ? raw.map(mapApiListingToListing).filter((item) => Boolean(item.id))
        : [];

      if (mapped.length > 0) {
        setListings(mapped);
        setSelectedListing(mapped[0]);
      }
    } catch (err: any) {
      setMessage(err?.message || "Resale listings load nahi hui.");
    } finally {
      setLoading(false);
    }
  }

  async function loadRelated(id: string) {
    try {
      const response = await getRelatedResaleListings(id);
      const raw =
        response?.data?.listings ||
        response?.data ||
        response?.listings ||
        response?.items ||
        response ||
        [];

      const mapped = Array.isArray(raw)
        ? raw.map(mapApiListingToListing).filter((item) => Boolean(item.id))
        : [];

      setRelatedListings(mapped);
    } catch {
      setRelatedListings([]);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    if (selectedListing?.id && !selectedListing.id.startsWith("fallback")) {
      loadRelated(selectedListing.id);
    }
  }, [selectedListing?.id]);

 async function handleLike(listing: Listing) {
  try {
    setActionLoading(`like-${listing.id}`);
    setMessage("");

    // Fallback/demo listings DB me nahi hote, isliye API hit mat karo
    if (listing.id.startsWith("fallback")) {
      setListings((prev) =>
        prev.map((item) =>
          item.id === listing.id ? { ...item, liked: !item.liked } : item
        )
      );

      setSelectedListing((prev) =>
        prev && prev.id === listing.id ? { ...prev, liked: !prev.liked } : prev
      );

      setMessage(
        "Demo listing liked locally. Real resale listings like/save DB me store honge."
      );

      return;
    }

    if (listing.liked) {
      await unlikeResaleListing(listing.id);
    } else {
      await likeResaleListing(listing.id);
    }

    setListings((prev) =>
      prev.map((item) =>
        item.id === listing.id ? { ...item, liked: !item.liked } : item
      )
    );

    setSelectedListing((prev) =>
      prev && prev.id === listing.id ? { ...prev, liked: !prev.liked } : prev
    );

    setMessage(listing.liked ? "Listing unsaved." : "Listing saved.");
  } catch (err: any) {
    setMessage(err?.message || "Like update nahi hua.");
  } finally {
    setActionLoading(null);
  }
}

  async function handleBuyNow(listing: Listing) {
  try {
    setActionLoading(`buy-${listing.id}`);
    setMessage("");

    // Fallback/demo listings DB me nahi hote, isliye buy-now API hit mat karo
    if (listing.id.startsWith("fallback")) {
      setMessage(
        "Demo listing selected. Buy-now sirf real DB resale listings ke liye chalega."
      );

      return;
    }

    const response: any = await buyNowResaleListing(listing.id);
    const data = response?.data || response;

    const paymentUrl = data?.paymentUrl || data?.checkoutUrl || data?.url;

    if (paymentUrl) {
      window.location.href = paymentUrl;
      return;
    }

    if (data?.orderId) {
      window.location.href = `/orders/${data.orderId}`;
      return;
    }

    setMessage("Resale buy-now created successfully.");
  } catch (err: any) {
    setMessage(err?.message || "Buy now failed.");
  } finally {
    setActionLoading(null);
  }
}

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <Hero />
        <TrustStrip />

        {message && (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 text-sm font-semibold">
            {message}
          </div>
        )}

        <MarketplaceToolbar
          filter={filter}
          setFilter={setFilter}
          sort={sort}
          setSort={setSort}
          count={visibleListings.length}
          loading={loading}
        />

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <ListingGrid
            listings={visibleListings}
            selectedListing={selectedListing}
            setSelectedListing={setSelectedListing}
            onLike={handleLike}
            actionLoading={actionLoading}
          />

          <aside className="xl:sticky xl:top-28 xl:self-start">
            {selectedListing && (
              <ListingDetailPanel
                listing={selectedListing}
                relatedListings={relatedListings}
                onBuyNow={handleBuyNow}
                onLike={handleLike}
                actionLoading={actionLoading}
              />
            )}
          </aside>
        </div>
      </section>

      <SellWithShahsi />
      <MarketplaceFlow />
      <ModuleOwnership />
    </main>
  );
}

function mapApiListingToListing(item: any): Listing {
  const product = item?.product || item?.catalogProduct || {};
  const seller = item?.seller || item?.user || item?.owner || {};

  const firstVariant = item?.variants?.[0] || {};
  const measurements = item?.measurements || item?.garmentMeasurements || firstVariant || {};

  const primaryImage =
    item?.images?.find((img: any) => img?.isPrimary)?.url ||
    item?.images?.[0]?.url ||
    item?.image ||
    item?.imageUrl ||
    product?.images?.[0]?.url ||
    product?.imageUrl ||
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop";

  const cityState =
    item?.city && item?.state
      ? `${item.city}, ${item.state}`
      : item?.city || item?.state || seller?.location || "Seller location";

  const condition = normalizeCondition(
    item?.resaleCondition || item?.condition
  );

  const listingPrice = Number(
    item?.listingPrice || item?.price || item?.salePrice || firstVariant?.price || 0
  );

  const originalPrice = Number(
    item?.originalPrice || item?.retailPrice || product?.basePrice || listingPrice || 0
  );

  const hasMeasurementData =
    Boolean(measurements?.chest || measurements?.bust) &&
    Boolean(measurements?.waist) &&
    Boolean(measurements?.length);

  return {
    id: item?.id || item?._id,
    title: item?.title || item?.name || product?.title || product?.name || "Resale listing",
    brand: item?.brand || product?.brand || "Shahsi",
    color:
      item?.primaryColor ||
      item?.resaleColors?.[0] ||
      firstVariant?.primaryColor ||
      product?.color ||
      "Color",
    size: item?.sizeLabel || item?.size || firstVariant?.size || "M",
    price: listingPrice,
    originalPrice,
    condition,
    conditionScore: Number(item?.conditionScore || item?.score || 94),
    fitConfidence: hasMeasurementData ? "High" : "Medium",
    verified: Boolean(
      item?.verified ||
        item?.isVerified ||
        item?.conditionVerified ||
        item?.status === "ACTIVE"
    ),
    liked: Boolean(item?.liked || item?.isLiked || item?.saved),
    shipsFrom: cityState,
    seller: {
      name:
        seller?.name ||
        seller?.fullName ||
        item?.sellerName ||
        item?.ownerName ||
        "Verified seller",
      rating: Number(seller?.rating || item?.sellerRating || 4.8),
      sales: Number(seller?.sales || item?.sellerSales || 0),
      verified: Boolean(seller?.verified || item?.sellerVerified || item?.verified),
    },
    measurements: {
      bust: Number(measurements?.bust || measurements?.chest || 0) || undefined,
      waist: Number(measurements?.waist || 0) || undefined,
      hip: Number(measurements?.hip || 0) || undefined,
      length: Number(measurements?.length || 0) || undefined,
    },
    missingData: hasMeasurementData ? [] : ["Garment measurements incomplete"],
    image: primaryImage,
    aiMatch: Number(item?.aiMatch || item?.matchScore || item?.fitScore || 92),
  };
}

function normalizeCondition(value: any): Condition {
  const text = String(value || "").toLowerCase();

  if (text.includes("new") || text.includes("new_with_tags")) return "new";
  if (text.includes("worn_once") || text.includes("excellent")) return "excellent";
  if (text.includes("fair")) return "fair";
  if (text.includes("good")) return "good";

  return "excellent";
}

function normalizeFitConfidence(value: any): FitConfidence {
  const text = String(value || "").toLowerCase();
  if (text.includes("low")) return "Low";
  if (text.includes("medium")) return "Medium";
  return "High";
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Verified resale marketplace</span>
        <span>Garment measurements + Fit Engine confidence</span>
        <span>Seller shipping · buyer protection</span>
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
            Verified resale marketplace
          </p>
        </div>

        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Shop resale</a>
          <a>Sell</a>
          <a>Verified listings</a>
          <a>Fit confidence</a>
          <a>Seller guide</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white">
            <Search className="h-4 w-4" />
          </button>
          <button className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">
            List an item
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid min-h-[650px] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">
            /resale
          </p>

          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-7xl">
            Resale with fit confidence, not sizing guesswork.
          </h1>

          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Shahsi resale marketplace normalizes seller sizing with garment
            measurements, condition scoring, verified resale checks, seller
            profiles, and AI matching.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">
              Shop verified resale <ArrowRight className="h-4 w-4" />
            </button>

            <button className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">
              Start selling
            </button>
          </div>
        </div>

        <div className="relative min-h-[520px]">
          <img
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600&auto=format&fit=crop"
            alt="Verified resale fashion"
            className="h-full w-full object-cover opacity-90"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-neutral-950/10 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 grid gap-3 md:grid-cols-3">
            <HeroCard
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Verified resale"
              copy="Condition scored"
            />
            <HeroCard
              icon={<Ruler className="h-4 w-4" />}
              title="Fit confidence"
              copy="Measurements required"
            />
            <HeroCard
              icon={<Wand2 className="h-4 w-4" />}
              title="AI matching"
              copy="Ranked for you"
            />
          </div>
        </div>
      </div>
    </section>
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

function TrustStrip() {
  return (
    <section className="mt-8 grid gap-4 md:grid-cols-4">
      <MetricCard
        icon={<ShieldCheck className="h-5 w-5" />}
        title="Verified resale"
        value="Condition checked"
      />
      <MetricCard
        icon={<Ruler className="h-5 w-5" />}
        title="Garment data"
        value="Measurements required"
      />
      <MetricCard
        icon={<UserRound className="h-5 w-5" />}
        title="Seller profiles"
        value="Ratings + sales"
      />
      <MetricCard
        icon={<Truck className="h-5 w-5" />}
        title="Seller shipping"
        value="Tracked delivery"
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

function MarketplaceToolbar({
  filter,
  setFilter,
  sort,
  setSort,
  count,
  loading,
}: {
  filter: FilterKey;
  setFilter: (filter: FilterKey) => void;
  sort: SortKey;
  setSort: (sort: SortKey) => void;
  count: number;
  loading: boolean;
}) {
  const filters: Array<[FilterKey, string]> = [
    ["all", "All"],
    ["verified", "Verified"],
    ["highFit", "High fit"],
    ["under100", "Under $100"],
    ["shipsFast", "Top sellers"],
  ];

  return (
    <section className="mt-8 rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-neutral-200">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Marketplace
          </p>
          <h2 className="mt-1 text-2xl font-medium">
            {loading ? "Loading resale listings..." : `${count} resale listings matched to your profile`}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                filter === id
                  ? "border-neutral-950 bg-neutral-950 text-white"
                  : "border-neutral-200 bg-white"
              }`}
            >
              {label}
            </button>
          ))}

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium"
          >
            <option value="matched">Best AI match</option>
            <option value="newest">Newest</option>
            <option value="priceLow">Price low</option>
            <option value="priceHigh">Price high</option>
            <option value="confidence">Condition score</option>
          </select>
        </div>
      </div>
    </section>
  );
}

function ListingGrid({
  listings,
  selectedListing,
  setSelectedListing,
  onLike,
  actionLoading,
}: {
  listings: Listing[];
  selectedListing: Listing | null;
  setSelectedListing: (listing: Listing) => void;
  onLike: (listing: Listing) => void;
  actionLoading: string | null;
}) {
  if (!listings.length) {
    return (
      <section className="rounded-[1.75rem] border border-dashed border-neutral-300 bg-white p-8 text-neutral-500">
        No resale listings found.
      </section>
    );
  }

  return (
    <section className="grid gap-5 sm:grid-cols-2">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          active={selectedListing?.id === listing.id}
          onSelect={() => setSelectedListing(listing)}
          onLike={() => onLike(listing)}
          liking={actionLoading === `like-${listing.id}`}
        />
      ))}
    </section>
  );
}

function ListingCard({
  listing,
  active,
  onSelect,
  onLike,
  liking,
}: {
  listing: Listing;
  active: boolean;
  onSelect: () => void;
  onLike: () => void;
  liking: boolean;
}) {
  return (
    <article
      className={`group relative z-0 overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ${
        active ? "ring-neutral-950" : "ring-neutral-200"
      }`}
    >
      <div className="relative overflow-hidden bg-neutral-100">
        <img
          src={listing.image}
          alt={listing.title}
          className="aspect-[3/4] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {listing.verified && <Badge>Verified</Badge>}
          <Badge>{listing.aiMatch}% match</Badge>
        </div>

        <button
          onClick={onLike}
          disabled={liking}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-3 shadow-sm backdrop-blur disabled:opacity-50"
        >
          {liking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart
              className={`h-4 w-4 ${
                listing.liked ? "fill-neutral-950 text-neutral-950" : ""
              }`}
            />
          )}
        </button>
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
            {listing.brand}
          </p>
          <div className="flex items-center gap-1 text-sm font-semibold">
            <Star className="h-3.5 w-3.5 fill-neutral-950 text-neutral-950" />
            {listing.seller.rating}
          </div>
        </div>

        <h3 className="text-lg font-semibold">{listing.title}</h3>
        <p className="mt-1 text-sm text-neutral-500">
          {listing.color} · Size {listing.size} · {conditionLabel(listing.condition)}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Mini label="Fit" value={listing.fitConfidence} />
          <Mini label="Condition" value={`${listing.conditionScore}`} />
          <Mini label="AI" value={`${listing.aiMatch}%`} />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-2xl font-semibold">${listing.price}</p>
            <p className="text-sm text-neutral-500">
              Retail ${listing.originalPrice}
            </p>
          </div>

          <button
            onClick={onSelect}
            className="rounded-full bg-neutral-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white"
          >
            View
          </button>
        </div>
      </div>
    </article>
  );
}

function ListingDetailPanel({
  listing,
  relatedListings,
  onBuyNow,
  onLike,
  actionLoading,
}: {
  listing: Listing;
  relatedListings: Listing[];
  onBuyNow: (listing: Listing) => void;
  onLike: (listing: Listing) => void;
  actionLoading: string | null;
}) {
  const buying = actionLoading === `buy-${listing.id}`;
  const liking = actionLoading === `like-${listing.id}`;

  return (
    <section className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
        Selected listing
      </p>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold">{listing.title}</h2>
          <p className="mt-1 text-neutral-500">
            {listing.color} · Size {listing.size} · {listing.shipsFrom}
          </p>
        </div>

        <button
          onClick={() => onLike(listing)}
          disabled={liking}
          className="rounded-full border border-neutral-300 p-3 disabled:opacity-50"
        >
          {liking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart
              className={`h-4 w-4 ${
                listing.liked ? "fill-neutral-950 text-neutral-950" : ""
              }`}
            />
          )}
        </button>
      </div>

      <div className="mt-6 grid gap-3">
        <LightRow label="Price" value={`$${listing.price}`} />
        <LightRow label="Original price" value={`$${listing.originalPrice}`} />
        <LightRow label="Condition score" value={`${listing.conditionScore}/100`} />
        <LightRow label="Fit confidence" value={listing.fitConfidence} />
        <LightRow label="AI match" value={`${listing.aiMatch}%`} />
      </div>

      <SellerCard listing={listing} />
      <MeasurementPanel listing={listing} />
      <FitConfidencePanel listing={listing} />
      <ShippingPanel listing={listing} />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => onBuyNow(listing)}
          disabled={buying}
          className="flex items-center justify-center gap-2 rounded-full bg-neutral-950 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-50"
        >
          {buying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Buying
            </>
          ) : (
            "Buy resale"
          )}
        </button>

        <button className="rounded-full border border-neutral-950 py-4 text-sm font-semibold uppercase tracking-[0.16em]">
          Ask seller
        </button>
      </div>

      {relatedListings.length > 0 && (
        <div className="mt-6 rounded-[1.5rem] bg-[#fbfaf6] p-4">
          <p className="mb-3 font-semibold">Related resale listings</p>
          <div className="grid gap-2">
            {relatedListings.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-white p-3 text-sm"
              >
                <span>{item.title}</span>
                <strong>${item.price}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function SellerCard({ listing }: { listing: Listing }) {
  return (
    <div className="mt-5 rounded-[1.5rem] bg-[#f7f2ea] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white">
          {listing.seller.name.charAt(0)}
        </div>

        <div>
          <p className="font-semibold">{listing.seller.name}</p>
          <p className="text-sm text-neutral-500">
            {listing.seller.sales} sales · {listing.seller.rating} rating
          </p>
        </div>

        {listing.seller.verified && (
          <BadgeCheck className="ml-auto h-5 w-5 text-emerald-700" />
        )}
      </div>

      <p className="mt-4 text-sm leading-6 text-neutral-700">
        Seller profile helps marketplace trust by showing verification, rating,
        sales history, and shipping location.
      </p>
    </div>
  );
}

function MeasurementPanel({ listing }: { listing: Listing }) {
  return (
    <div className="mt-5 rounded-[1.5rem] border border-neutral-200 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Ruler className="h-5 w-5" />
        <h3 className="font-semibold">Garment measurements</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Mini label="Bust" value={listing.measurements.bust ? `${listing.measurements.bust} in` : "Missing"} />
        <Mini label="Waist" value={listing.measurements.waist ? `${listing.measurements.waist} in` : "Missing"} />
        <Mini label="Hip" value={listing.measurements.hip ? `${listing.measurements.hip} in` : "Missing"} />
        <Mini label="Length" value={listing.measurements.length ? `${listing.measurements.length} in` : "Missing"} />
      </div>

      {listing.missingData.length > 0 && (
        <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-700">
          Missing: {listing.missingData.join(", ")}
        </div>
      )}
    </div>
  );
}

function FitConfidencePanel({ listing }: { listing: Listing }) {
  return (
    <div className="mt-5 rounded-[1.5rem] bg-neutral-950 p-5 text-white">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5" />
        <h3 className="font-semibold">Fit Engine resale confidence</h3>
      </div>

      <DarkRow label="Recommended size match" value={listing.fitConfidence} />
      <DarkRow
        label="Measurement quality"
        value={listing.missingData.length ? "Partial" : "Complete"}
      />
      <DarkRow label="Normalized size" value={`${listing.size} / Shahsi equivalent`} />
    </div>
  );
}

function ShippingPanel({ listing }: { listing: Listing }) {
  return (
    <div className="mt-5 rounded-[1.5rem] border border-neutral-200 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Truck className="h-5 w-5" />
        <h3 className="font-semibold">Seller shipping</h3>
      </div>

      <LightRow label="Ships from" value={listing.shipsFrom} />
      <LightRow label="Handling time" value="2–3 business days" />
      <LightRow label="Buyer protection" value="Included" />
    </div>
  );
}

function SellWithShahsi() {
  return (
    <section className="bg-[#f7f2ea] py-14">
      <div className="mx-auto grid max-w-[1500px] gap-8 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Sell with Shahsi
          </p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">
            List once, sell with measurement confidence.
          </h2>
          <p className="mt-4 leading-7 text-neutral-600">
            Sellers provide garment measurements, condition photos, shipping
            location, and product details so buyers can shop resale with less
            sizing risk.
          </p>

          <button className="mt-7 rounded-full bg-neutral-950 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">
            Create resale listing
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard
            icon={<Shirt className="h-5 w-5" />}
            title="Product details"
            copy="Brand, color, size, condition, original price."
          />
          <InfoCard
            icon={<Ruler className="h-5 w-5" />}
            title="Garment measurements"
            copy="Bust, waist, hip, length required for higher confidence."
          />
          <InfoCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Condition scoring"
            copy="Photos and wear notes support buyer trust."
          />
          <InfoCard
            icon={<Truck className="h-5 w-5" />}
            title="Seller shipping"
            copy="Tracked shipment and payout after delivery."
          />
        </div>
      </div>
    </section>
  );
}

function MarketplaceFlow() {
  const flow = [
    [Shirt, "List", "Seller creates item"],
    [Ruler, "Measure", "Fit data required"],
    [Wand2, "Match", "AI ranks listing"],
    [ShoppingBag, "Buy", "Marketplace checkout"],
    [Truck, "Ship", "Seller ships tracked"],
  ] as const;

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-14 lg:px-8">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
          Marketplace flow
        </p>
        <h2 className="mt-3 text-4xl font-medium tracking-tight">
          Verified resale from listing to delivery.
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {flow.map(([Icon, title, copy]) => (
            <div
              key={title}
              className="rounded-[1.5rem] bg-[#fbfaf6] p-5 text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-sm text-neutral-500">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModuleOwnership() {
  return (
    <section className="bg-neutral-950 py-14 text-white">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <p className="text-xs uppercase tracking-[0.22em] text-white/50">
          Modular monolith ownership
        </p>
        <h2 className="mt-3 text-4xl font-medium tracking-tight">
          Resale Marketplace module map.
        </h2>

        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
      {children}
    </span>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-[#f7f2ea] p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function LightRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-2xl bg-[#fbfaf6] p-4 text-sm">
      <span className="text-neutral-600">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DarkRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-2xl bg-white/10 p-4 text-sm">
      <span className="text-white/60">{label}</span>
      <strong>{value}</strong>
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
    <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <p className="font-semibold">{title}</p>
      </div>
      <p className="text-sm leading-6 text-neutral-600">{copy}</p>
    </div>
  );
}

function conditionLabel(value: Condition) {
  return {
    new: "New with tags",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
  }[value];
}