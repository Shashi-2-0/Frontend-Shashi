"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Heart,
  MessageCircle,
  Package,
  Palette,
  RefreshCcw,
  Ruler,
  Scissors,
  Share2,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  SwatchBook,
  Truck,
  Users,
  Wand2,
} from "lucide-react";

import { addToCart } from "@/lib/api/cart.api";
import { createCheckout } from "@/lib/api/checkout.api";

type CommerceMode = "buy" | "mto" | "rent" | "subscribe" | "resale";
type AccordionKey = "details" | "fabric" | "shipping" | "fit" | "returns" | "help";

const images = [
  "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=1300&auto=format&fit=crop",
];

const swatches = [
  ["Sage", "#9ba88f"],
  ["Eucalyptus", "#89a08f"],
  ["Olive", "#7f8f69"],
  ["Sea Glass", "#a8d4cc"],
  ["Dusty Blue", "#8eb9d6"],
  ["Champagne", "#d8c4a2"],
  ["English Rose", "#d7a0a6"],
  ["Terracotta", "#b9664c"],
  ["Merlot", "#6c1f2d"],
  ["Black", "#111111"],
];

const sizes = [
  { label: "XS", disabled: true },
  { label: "S" },
  { label: "M", recommended: true },
  { label: "L" },
  { label: "XL" },
  { label: "XXL" },
  { label: "1X" },
  { label: "2X" },
  { label: "3X" },
];

const related = [
  {
    name: "Azra Bondi Chiffon Dress",
    price: "$99",
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop",
    meta: "High fit · Sage family",
  },
  {
    name: "Sorrel Stretch Satin Dress",
    price: "$149",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop",
    meta: "Medium fit · Rental ready",
  },
  {
    name: "Debra Convertible Dress",
    price: "$119",
    image:
      "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=900&auto=format&fit=crop",
    meta: "High fit · Group ready",
  },
  {
    name: "Mira Pleated One Shoulder Gown",
    price: "$169",
    image:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=900&auto=format&fit=crop",
    meta: "High style · MTO ready",
  },
];

const moduleMap = [
  ["Catalog", "Title, images, variants, colors, fabric, size chart, garment measurements"],
  ["Retail", "Buy tab, add to bag, standard checkout"],
  ["Made-to-order", "Custom production, body measurements, length and fit preferences"],
  ["Rental", "Event window, backup size, fit confidence, rental reservation"],
  ["Subscription", "Gownloop monthly box, curation, future learning"],
  ["Reseller Marketplace", "Verified resale, seller garment measurements, confidence warnings"],
  ["User Profile", "Bust, waist, hip, height, modesty, color and style preferences"],
  ["Fit Engine", "Recommended size, bust/waist/hip fit, length warning, confidence"],
  ["Style Engine", "Color match, modesty match, body-shape guidance"],
  ["Recommendation Engine", "Final recommendation based on fit, style, availability, feedback"],
  ["Bridal Party", "Assign dress, group approval, member status, shared order"],
  ["Orders", "Cart, checkout, payment state, fulfillment state"],
  ["Returns Feedback", "Reviews, return reasons, fit/style learning loop"],
];

export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [selectedColor, setSelectedColor] = useState("Sage");
  const [selectedSize, setSelectedSize] = useState("M");
  const [mode, setMode] = useState<CommerceMode>("buy");
  const [open, setOpen] = useState<AccordionKey>("details");
  const [assignedMember, setAssignedMember] = useState("Maya");
  const [cartLoading, setCartLoading] = useState(false);

  const price = useMemo(() => {
    switch (mode) {
      case "buy":
        return "$99";
      case "mto":
        return "$149 custom";
      case "rent":
        return "$42 rental";
      case "subscribe":
        return "Included in Gownloop";
      case "resale":
        return "$68 verified resale";
    }
  }, [mode]);

  function getSavedFitProfile() {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("shahsiFitProfile") || "{}");
    } catch {
      return {};
    }
  }

  async function addProductToCart() {
    const savedProfile: any = getSavedFitProfile();

   const payload = {
  productId: "6f89f30a-6bb2-4f2b-9483-eace8ffda4fc",
  variantId: "d8b23ef4-adfe-46d6-afb7-294af3a2d787",
      quantity: 1,
      sizeType: mode === "mto" ? "CUSTOM" : "STANDARD",
      bust: Number(savedProfile?.bust || savedProfile?.chest || 36),
      waist: Number(savedProfile?.waist || 28),
      hips: Number(savedProfile?.hip || savedProfile?.hips || 38),
      hollowToFloor: Number(savedProfile?.hollowToFloor || 58),
      heightBareFoot: Number(savedProfile?.heightBareFoot || 64),
      extraLength: mode === "mto" ? 1 : 0,
      customSizingAccepted: mode === "mto",
    };

    await addToCart(payload as any);
  }

  async function handleAddToCart() {
    try {
      setCartLoading(true);
      await addProductToCart();
      window.location.href = "/shared-cart";
    } catch (err: any) {
      alert(err?.message || "Cart add failed");
    } finally {
      setCartLoading(false);
    }
  }

  async function handleBuyNow() {
    try {
      setCartLoading(true);

      await addProductToCart();

      const response: any = await createCheckout({
        mode: "individual",
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

      window.location.href = "/shared-cart";
    } catch (err: any) {
      alert(err?.message || "Checkout failed");
    } finally {
      setCartLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      {/* <PromoBar /> */}
      <Header />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <Breadcrumb />

        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] xl:grid-cols-[1.14fr_0.86fr]">
          <Gallery selectedImage={selectedImage} setSelectedImage={setSelectedImage} />

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-7">
              <ProductHeader />

              <div className="mt-6 flex items-end justify-between gap-4 border-b border-neutral-200 pb-6">
                <div>
                  <p className="text-3xl font-medium tracking-tight">{price}</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Retail $99 · Rental $42 · Resale $68
                  </p>
                </div>

                <button className="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">
                  Try before you buy
                </button>
              </div>

              <CommerceTabs mode={mode} setMode={setMode} />
              <SwatchSelector selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
              <SizeSelector selectedSize={selectedSize} setSelectedSize={setSelectedSize} />
              <DeliveryCard mode={mode} />
              <SmartFitCard />
              <StyleMatchCard selectedColor={selectedColor} />
              <RecommendationCard mode={mode} />
              <UserProfileCard />

              <BridalPartyCard
                assignedMember={assignedMember}
                setAssignedMember={setAssignedMember}
              />

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className="rounded-full bg-neutral-950 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  {cartLoading ? "Adding..." : primaryCta(mode)}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={cartLoading}
                  className="rounded-full border border-neutral-950 py-4 text-sm font-semibold uppercase tracking-[0.16em] hover:bg-neutral-50 disabled:opacity-50"
                >
                  Buy now
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-neutral-300 py-4 text-sm font-semibold uppercase tracking-[0.16em] hover:bg-neutral-50 disabled:opacity-50"
              >
                <Users className="h-4 w-4" /> Add to bridal party order
              </button>

              <TrustRows />

              <div className="mt-8 divide-y divide-neutral-200 border-t border-neutral-200">
                <Accordion id="details" title="Product details" open={open} setOpen={setOpen}>
                  <ul className="space-y-2 text-sm leading-6 text-neutral-700">
                    <li>• V-neck chiffon dress with soft drape and flowy A-line skirt.</li>
                    <li>• Adjustable straps, fitted waist, and fully lined bodice.</li>
                    <li>• Available across retail, rental, subscription, resale, and custom flows.</li>
                    <li>• Catalog owns product truth, variants, size chart, and measurements.</li>
                  </ul>
                </Accordion>

                <Accordion id="fabric" title="Fabric, swatches, and color" open={open} setOpen={setOpen}>
                  <p className="text-sm leading-6 text-neutral-700">
                    Chiffon is light and movement-friendly. Order swatches before bridal checkout.
                  </p>
                </Accordion>

                <Accordion id="shipping" title="Shipping, production, rental window" open={open} setOpen={setOpen}>
                  <p className="text-sm leading-6 text-neutral-700">
                    Orders module coordinates checkout and fulfillment. Rental adds event-window logic.
                  </p>
                </Accordion>

                <Accordion id="fit" title="Size, fit, and length" open={open} setOpen={setOpen}>
                  <FitMeters />
                </Accordion>

                <Accordion id="returns" title="Returns feedback learning loop" open={open} setOpen={setOpen}>
                  <p className="text-sm leading-6 text-neutral-700">
                    Returns capture fit result, problem area, color signal, and style feedback.
                  </p>
                </Accordion>

                <Accordion id="help" title="Need help?" open={open} setOpen={setOpen}>
                  <button className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50">
                    <MessageCircle className="h-4 w-4" /> Book fit or bridal styling help
                  </button>
                </Accordion>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <BridalDashboardStrip />
      <Reviews />
      <SuggestedProducts />
      <GownloopCircularSystem />
      <ModuleOwnership />
    </main>
  );
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Get 10 free swatches for bridal parties</span>
        <span>Ships-now colors available</span>
        <span>Smart fit + style guidance included</span>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#fbfaf6]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-5 lg:px-8">
        <div>
          <p className="text-2xl font-semibold tracking-tight">Shahsi</p>
          <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 sm:block">
            Gownloop fashion system
          </p>
        </div>

        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Bridesmaid Dresses</a>
          <a>Free Swatches</a>
          <a>Wedding Guest</a>
          <a>Gownloop</a>
          <a>Resale</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white">
            <Heart className="h-4 w-4" />
          </button>

          <button className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">
            Create party
          </button>
        </div>
      </div>
    </header>
  );
}

function Breadcrumb() {
  return (
    <div className="mb-6 text-sm text-neutral-500">
      Home / Bridesmaid Dresses / Mira Chiffon Dress / Sage
    </div>
  );
}

function Gallery({
  selectedImage,
  setSelectedImage,
}: {
  selectedImage: string;
  setSelectedImage: (image: string) => void;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-[96px_1fr]">
      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
        {images.map((image, index) => (
          <button
            key={image}
            onClick={() => setSelectedImage(image)}
            className={`overflow-hidden rounded-2xl border-2 bg-white ${
              selectedImage === image ? "border-neutral-950" : "border-transparent"
            }`}
          >
            <img
              src={image}
              alt={`Product thumbnail ${index + 1}`}
              className="h-28 w-24 object-cover"
            />
          </button>
        ))}
      </div>

      <div className="order-1 grid gap-4 lg:order-2">
        <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-neutral-200">
          <img
            src={selectedImage}
            alt="Mira chiffon dress sage"
            className="aspect-[4/5] w-full object-cover"
          />

          <div className="absolute left-5 top-5 flex flex-col gap-2">
            <Tag>Ships ASAP</Tag>
            <Tag>Group ready</Tag>
          </div>

          <button className="absolute right-5 top-5 rounded-full bg-white/90 p-3 shadow-sm backdrop-blur">
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {images.slice(1, 3).map((image) => (
            <div
              key={image}
              className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm ring-1 ring-neutral-200"
            >
              <img src={image} alt="Product detail" className="aspect-[4/5] w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
      {children}
    </span>
  );
}

function ProductHeader() {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
        Bridesmaid dress · Chiffon
      </p>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            Mira Chiffon Dress
          </h1>
          <p className="mt-2 text-neutral-600">Sage · V-neck · A-line · Floor length</p>
        </div>

        <button className="rounded-full border border-neutral-300 p-3 hover:bg-neutral-50">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-neutral-950 text-neutral-950" />
          ))}
        </div>
        <span className="text-sm text-neutral-600">4.8 · 1,042 fit-filtered reviews</span>
      </div>
    </div>
  );
}

function CommerceTabs({
  mode,
  setMode,
}: {
  mode: CommerceMode;
  setMode: (mode: CommerceMode) => void;
}) {
  const tabs: Array<[CommerceMode, string, React.ReactNode]> = [
    ["buy", "Buy", <ShoppingBag key="buy" className="h-4 w-4" />],
    ["mto", "MTO", <Scissors key="mto" className="h-4 w-4" />],
    ["rent", "Rent", <Package key="rent" className="h-4 w-4" />],
    ["subscribe", "Sub", <RefreshCcw key="sub" className="h-4 w-4" />],
    ["resale", "Resale", <Shirt key="resale" className="h-4 w-4" />],
  ];

  return (
    <section className="mt-7">
      <p className="mb-3 font-medium">Choose flow</p>
      <div className="grid grid-cols-5 gap-2 rounded-2xl bg-neutral-100 p-1">
        {tabs.map(([id, label, icon]) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 text-xs font-medium transition ${
              mode === id ? "bg-white shadow-sm" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

function SwatchSelector({
  selectedColor,
  setSelectedColor,
}: {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}) {
  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-medium">Color: {selectedColor}</p>
        <button className="inline-flex items-center gap-1 text-sm underline underline-offset-4">
          <SwatchBook className="h-4 w-4" /> Free swatches
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {swatches.map(([name, color]) => (
          <button
            key={name}
            onClick={() => setSelectedColor(String(name))}
            className={`rounded-full border-2 p-1 ${
              selectedColor === name ? "border-neutral-950" : "border-transparent"
            }`}
          >
            <span
              className="block h-10 w-10 rounded-full border border-neutral-200"
              style={{ background: String(color) }}
            />
          </button>
        ))}
      </div>

      <p className="mt-2 text-xs uppercase tracking-[0.14em] text-emerald-700">
        Sage ships ASAP
      </p>
    </section>
  );
}

function SizeSelector({
  selectedSize,
  setSelectedSize,
}: {
  selectedSize: string;
  setSelectedSize: (size: string) => void;
}) {
  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-medium">Size: {selectedSize}</p>
        <button className="inline-flex items-center gap-1 text-sm underline underline-offset-4">
          <Ruler className="h-4 w-4" /> Size guide
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {sizes.map((size) => (
          <button
            key={size.label}
            disabled={size.disabled}
            onClick={() => setSelectedSize(size.label)}
            className={`rounded-xl border py-3 text-sm font-medium ${
              selectedSize === size.label
                ? "border-neutral-950 bg-neutral-950 text-white"
                : "border-neutral-200 bg-white hover:border-neutral-400"
            } ${size.disabled ? "cursor-not-allowed opacity-40 line-through" : ""}`}
          >
            <span>{size.label}</span>
            {size.recommended && (
              <span className="mt-1 block text-[10px] uppercase tracking-[0.12em]">Rec</span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

function DeliveryCard({ mode }: { mode: CommerceMode }) {
  const text = {
    buy: "Ships in 3–6 business days. Rush options available at checkout.",
    mto: "Production estimate: 6–8 weeks. Confirm measurements before checkout.",
    rent: "Select event window and backup size before reservation.",
    subscribe: "Add to next Gownloop box. Learns from feedback after return.",
    resale: "Seller ships after order confirmation. Measurement confidence required.",
  }[mode];

  return (
    <div className="mt-6 flex gap-3 rounded-2xl border border-neutral-200 p-4 text-sm text-neutral-700">
      <Truck className="mt-0.5 h-4 w-4" />
      <p>{text}</p>
    </div>
  );
}

function SmartFitCard() {
  return (
    <Panel title="Fit Engine · Smart Fit" icon={<Sparkles className="h-4 w-4" />} dark>
      <div className="grid gap-3 text-sm">
        <Row label="Recommended size" value="M" />
        <Row label="Confidence" value="High" />
        <div className="grid grid-cols-3 gap-2">
          <Mini label="Bust" value="Good" />
          <Mini label="Waist" value="Fitted" />
          <Mini label="Hip" value="Good" />
        </div>
        <p className="text-white/70">Length warning: floor length; heels recommended if under 5'4".</p>
      </div>
    </Panel>
  );
}

function StyleMatchCard({ selectedColor }: { selectedColor: string }) {
  return (
    <Panel title="Style Engine · Style Match" icon={<Palette className="h-4 w-4" />}>
      <div className="space-y-3 text-sm">
        <Row label="Color match" value="High" />
        <Row label="Modesty match" value="Good" />
        <Row label="Body-shape guidance" value="A-line recommended" />
        <p className="text-neutral-600">
          {selectedColor} complements warm and neutral complexion profiles while supporting an elegant bridal palette.
        </p>
      </div>
    </Panel>
  );
}

function RecommendationCard({ mode }: { mode: CommerceMode }) {
  const weight = {
    buy: "Fit 50% · Style 25% · Availability 15% · Feedback 10%",
    mto: "Body profile 60% · Fit preference 25% · Style 15%",
    rent: "Fit 70% · Style 15% · Availability 15%",
    subscribe: "Fit 40% · Style 35% · Feedback 25%",
    resale: "Garment data 45% · Fit 35% · Seller confidence 20%",
  }[mode];

  return (
    <Panel title="Recommendation Engine" icon={<Wand2 className="h-4 w-4" />}>
      <p className="text-sm leading-6 text-neutral-700">
        Final recommendation uses {weight}.
      </p>
    </Panel>
  );
}

function UserProfileCard() {
  return (
    <Panel title="User Profile" icon={<Ruler className="h-4 w-4" />}>
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <Mini label="Bust" value="36 in" />
        <Mini label="Waist" value="29 in" />
        <Mini label="Hip" value="39 in" />
        <Mini label="Height" value="5'6" />
      </div>
    </Panel>
  );
}

function BridalPartyCard({
  assignedMember,
  setAssignedMember,
}: {
  assignedMember: string;
  setAssignedMember: (member: string) => void;
}) {
  return (
    <Panel title="Bridal Party Dashboard" icon={<Users className="h-4 w-4" />}>
      <div className="space-y-3 text-sm">
        <select
          value={assignedMember}
          onChange={(e) => setAssignedMember(e.target.value)}
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3"
        >
          <option>Maya</option>
          <option>Aisha</option>
          <option>Sofia</option>
          <option>Lina</option>
        </select>

        <Status label="Bride approval" value="Pending" />
        <Status label="Measurements" value="Complete" />
        <Status label="Payment" value="Not started" />
        <Status label="Group order" value="Collecting" />
      </div>
    </Panel>
  );
}

function Panel({
  title,
  icon,
  children,
  dark = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <section className={`mt-6 rounded-[1.5rem] p-4 ${dark ? "bg-neutral-950 text-white" : "border border-[#ded8cf] bg-[#f7f2ea]"}`}>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <p className="font-medium">{title}</p>
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="opacity-70">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/90 p-3 text-center text-neutral-950">
      <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-3">
      <span className="text-neutral-600">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TrustRows() {
  return (
    <div className="mt-5 grid gap-3 text-sm text-neutral-700 sm:grid-cols-3">
      <div className="flex gap-2">
        <Truck className="h-4 w-4" /> Ships ASAP
      </div>
      <div className="flex gap-2">
        <BadgeCheck className="h-4 w-4" /> Fit confidence
      </div>
      <div className="flex gap-2">
        <Users className="h-4 w-4" /> Group-ready
      </div>
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
  id: AccordionKey;
  title: string;
  open: AccordionKey;
  setOpen: (id: AccordionKey) => void;
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
        <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
}

function FitMeters() {
  return (
    <div className="space-y-5 text-sm text-neutral-700">
      <Meter label="Fit meter" left="Fitted" middle="True fit" right="Roomy" value="46%" />
      <Meter label="Stretch meter" left="No stretch" middle="Some give" right="High stretch" value="24%" />
      <Meter label="Length meter" left="Mini" middle="Midi" right="Floor" value="92%" />
    </div>
  );
}

function Meter({
  label,
  left,
  middle,
  right,
  value,
}: {
  label: string;
  left: string;
  middle: string;
  right: string;
  value: string;
}) {
  return (
    <div>
      <p className="mb-2 font-medium text-neutral-950">{label}</p>
      <div className="relative h-2 rounded-full bg-neutral-200">
        <div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-neutral-950"
          style={{ left: value }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-neutral-500">
        <span>{left}</span>
        <span>{middle}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

function BridalDashboardStrip() {
  return (
    <section className="bg-[#f7f2ea] py-14">
      <div className="mx-auto grid max-w-[1500px] gap-8 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Bridal Party Dashboard
          </p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">
            Coordinate fit, approval, payment, and one group order.
          </h2>
          <p className="mt-4 text-neutral-600">
            This product can be assigned to members, approved by the bride, paid individually,
            and merged into one coordinated order.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Maya", "Selected", "Payment pending"],
            ["Aisha", "Needs size", "Not started"],
            ["Sofia", "Needs approval", "Not started"],
            ["Lina", "Selected", "Paid"],
          ].map(([name, status, pay]) => (
            <div key={name} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{name}</h3>
                <Check className="h-4 w-4 text-emerald-700" />
              </div>
              <p className="mt-2 text-sm text-neutral-600">{status}</p>
              <p className="text-sm font-medium">{pay}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-16 lg:px-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
          Returns Feedback
        </p>
        <h2 className="mt-3 text-4xl font-medium tracking-tight">
          Reviews with fit and return intelligence.
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ["Fits true to size", "M · 5'6", "Waist was fitted but flattering. Sage color matched the group palette."],
          ["Great for rental", "L backup", "I used backup size for comfort and the event window was easy."],
          ["Color looked elegant", "M · warm tone", "Sage photographed beautifully outdoors."],
        ].map(([title, meta, body]) => (
          <article key={title} className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-neutral-950 text-neutral-950" />
              ))}
            </div>
            <h3 className="font-medium">{title}</h3>
            <p className="mt-1 text-sm text-neutral-500">{meta}</p>
            <p className="mt-3 text-sm leading-6 text-neutral-700">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SuggestedProducts() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Suggested Products
          </p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">
            Recommendation Engine picks.
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((product) => (
            <article key={product.name} className="group overflow-hidden rounded-[1.75rem] bg-[#fbfaf6]">
              <img
                src={product.image}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              />
              <div className="p-5">
                <h3 className="font-medium">{product.name}</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  {product.price} · {product.meta}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function GownloopCircularSystem() {
  const flows = [
    [ShoppingBag, "Buy"],
    [Package, "Rent"],
    [RefreshCcw, "Subscribe"],
    [Heart, "Keep"],
    [Shirt, "Resell"],
  ] as const;

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-16 lg:px-8">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
              Gownloop circular system
            </p>
            <h2 className="mt-3 text-4xl font-medium tracking-tight">
              Buy, rent, subscribe, keep, resell.
            </h2>
            <p className="mt-4 leading-7 text-neutral-600">
              The same garment can move through multiple business models while shared fit
              and style intelligence remains consistent.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-5">
            {flows.map(([Icon, label]) => (
              <div key={label} className="rounded-2xl bg-[#fbfaf6] p-5 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ModuleOwnership() {
  return (
    <section className="bg-neutral-950 py-16 text-white">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-white/50">
            Modular Monolith Ownership
          </p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">
            Every product-page block maps directly to a module.
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
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

function primaryCta(mode: CommerceMode) {
  return {
    buy: "Add to bag",
    mto: "Start made-to-order",
    rent: "Reserve rental",
    subscribe: "Add to Gownloop",
    resale: "Buy verified resale",
  }[mode];
}