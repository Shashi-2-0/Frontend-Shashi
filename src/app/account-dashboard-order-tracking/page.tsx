"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Heart,
  Home,
  Menu,
  Package,
  Palette,
  RefreshCcw,
  RotateCcw,
  Ruler,
  Scissors,
  Search,
  Shirt,
  ShoppingBag,
  Sparkles,
  Truck,
  Users,
  Wand2,
  X,
} from "lucide-react";

type AccountTab =
  | "overview"
  | "orders"
  | "rentals"
  | "subscription"
  | "fit"
  | "wishlist"
  | "bridal"
  | "returns"
  | "resale";

type OrderStatus = "processing" | "shipped" | "delivered" | "return_due" | "production";

const accountTabs: Array<{
  key: AccountTab;
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "overview", label: "Overview", icon: <Home className="h-4 w-4" /> },
  { key: "orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { key: "rentals", label: "Rentals", icon: <Package className="h-4 w-4" /> },
  { key: "subscription", label: "Subscription", icon: <RefreshCcw className="h-4 w-4" /> },
  { key: "fit", label: "Fit Profile", icon: <Ruler className="h-4 w-4" /> },
  { key: "wishlist", label: "Wishlist", icon: <Heart className="h-4 w-4" /> },
  { key: "bridal", label: "Bridal Parties", icon: <Users className="h-4 w-4" /> },
  { key: "returns", label: "Returns", icon: <RotateCcw className="h-4 w-4" /> },
  { key: "resale", label: "Resale Listings", icon: <Shirt className="h-4 w-4" /> },
];

const orders = [
  {
    id: "SH-10294",
    type: "Retail + Group Order",
    status: "shipped" as OrderStatus,
    item: "Mira Chiffon Dress · Sage",
    date: "May 12, 2026",
    price: "$396.00",
    members: "4 members",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "SH-10221",
    type: "Made-to-order",
    status: "production" as OrderStatus,
    item: "Mira Pleated One Shoulder Gown · Emerald",
    date: "May 4, 2026",
    price: "$169.00",
    members: "Individual",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "SH-10188",
    type: "Rental",
    status: "return_due" as OrderStatus,
    item: "Sorrel Stretch Satin Dress · Ganache",
    date: "Apr 28, 2026",
    price: "$58.00",
    members: "Individual",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop",
  },
];

const wishlist = [
  {
    name: "Azra Bondi Chiffon Dress",
    price: "$99",
    meta: "High fit · +78 colors",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Debra Convertible Chiffon Dress",
    price: "$119",
    meta: "Group ready · All flows",
    image: "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Valentine Floral Burnout Dress",
    price: "$129",
    meta: "Garden edit · High style",
    image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=900&auto=format&fit=crop",
  },
];

const bridalParties = [
  ["Sofia Wedding", "June 22, 2026", "4 members", "3 selections ready", "Payment collecting"],
  ["Lina Garden Party", "July 8, 2026", "6 members", "Palette pending", "Invites sent"],
];

const resaleListings = [
  ["Mira Chiffon Dress · Sage", "$68", "Measurement verified", "Listed"],
  ["Debra Convertible Dress · Champagne", "$70", "Needs hip measurement", "Draft"],
];

export default function ShahsiAccountAndOrderTrackingPages() {
  const [activeTab, setActiveTab] = useState<AccountTab>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(orders[0]);

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <AccountHero />

        <div className="mt-8 grid gap-8 lg:grid-cols-[290px_1fr]">
          <aside className="hidden lg:block">
            <AccountSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </aside>

          <section>
            <MobileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <AccountContent activeTab={activeTab} setActiveTab={setActiveTab} selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} />
          </section>
        </div>
      </section>

      <OrderTrackingPreview selectedOrder={selectedOrder} />
      <ModuleOwnership />
    </main>
  );
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Account dashboard</span>
        <span>Orders · rentals · subscription · resale</span>
        <span>Fit + style intelligence saved to profile</span>
      </div>
    </div>
  );
}

function Header({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean; setMobileMenuOpen: (value: boolean) => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#fbfaf6]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-5 lg:px-8">
        <button className="rounded-full border border-neutral-300 p-3 lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <div>
          <p className="text-2xl font-semibold tracking-tight">Shahsi</p>
          <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 sm:block">Gownloop account system</p>
        </div>
        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Shop</a>
          <a>Bridal Party</a>
          <a>Fit Profile</a>
          <a>Gownloop</a>
          <a>Support</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white"><Search className="h-4 w-4" /></button>
          <button className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">Shop now</button>
        </div>
      </div>
    </header>
  );
}

function AccountHero() {
  return (
    <div className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">Account Dashboard</p>
          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-6xl">Everything you wear, rent, order, return, and resell — in one place.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Manage Shahsi orders, bridal parties, Gownloop subscription, rentals, saved fit profile, wishlist, returns, and resale listings from one modular account hub.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <HeroMetric icon={<ShoppingBag className="h-4 w-4" />} label="Active orders" value="3" />
          <HeroMetric icon={<Users className="h-4 w-4" />} label="Bridal parties" value="2" />
          <HeroMetric icon={<Ruler className="h-4 w-4" />} label="Fit profile" value="Complete" />
          <HeroMetric icon={<RefreshCcw className="h-4 w-4" />} label="Gownloop" value="Active" />
        </div>
      </div>
    </div>
  );
}

function HeroMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
      <div className="mb-3 flex items-center gap-2 text-white/75">{icon}<span className="text-xs uppercase tracking-[0.14em]">{label}</span></div>
      <p className="text-2xl font-medium">{value}</p>
    </div>
  );
}

function AccountSidebar({ activeTab, setActiveTab }: { activeTab: AccountTab; setActiveTab: (tab: AccountTab) => void }) {
  return (
    <div className="sticky top-28 rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-neutral-200">
      <div className="mb-4 rounded-2xl bg-[#f7f2ea] p-4">
        <p className="font-medium">Shahida C</p>
        <p className="mt-1 text-sm text-neutral-600">shahida@shahsi.com</p>
      </div>
      <div className="grid gap-1">
        {accountTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${activeTab === tab.key ? "bg-neutral-950 text-white" : "hover:bg-neutral-100"}`}
          >
            <span className="flex items-center gap-2">{tab.icon}{tab.label}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
}

function MobileTabs({ activeTab, setActiveTab }: { activeTab: AccountTab; setActiveTab: (tab: AccountTab) => void }) {
  return (
    <div className="mb-5 flex gap-2 overflow-x-auto pb-2 lg:hidden">
      {accountTabs.map((tab) => (
        <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium ${activeTab === tab.key ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white"}`}>
          {tab.icon}{tab.label}
        </button>
      ))}
    </div>
  );
}

function AccountContent({
  activeTab,
  setActiveTab,
  selectedOrder,
  setSelectedOrder,
}: {
  activeTab: AccountTab;
  setActiveTab: (tab: AccountTab) => void;
  selectedOrder: typeof orders[number];
  setSelectedOrder: (order: typeof orders[number]) => void;
}) {
  if (activeTab === "orders") return <OrdersPanel setSelectedOrder={setSelectedOrder} />;
  if (activeTab === "rentals") return <RentalsPanel />;
  if (activeTab === "subscription") return <SubscriptionPanel />;
  if (activeTab === "fit") return <FitProfilePanel />;
  if (activeTab === "wishlist") return <WishlistPanel />;
  if (activeTab === "bridal") return <BridalPartiesPanel />;
  if (activeTab === "returns") return <ReturnsPanel />;
  if (activeTab === "resale") return <ResalePanel />;
  return <OverviewPanel setActiveTab={setActiveTab} selectedOrder={selectedOrder} />;
}

function OverviewPanel({ setActiveTab, selectedOrder }: { setActiveTab: (tab: AccountTab) => void; selectedOrder: typeof orders[number] }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-3">
        <SummaryCard icon={<ShoppingBag className="h-5 w-5" />} title="Orders" value="3 active" copy="Retail, MTO, and rental orders" onClick={() => setActiveTab("orders")} />
        <SummaryCard icon={<Users className="h-5 w-5" />} title="Bridal parties" value="2 events" copy="Selections and payments in progress" onClick={() => setActiveTab("bridal")} />
        <SummaryCard icon={<Ruler className="h-5 w-5" />} title="Fit profile" value="Complete" copy="Measurements ready for recommendations" onClick={() => setActiveTab("fit")} />
      </div>

      <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Latest order</p>
            <h2 className="mt-2 text-3xl font-medium tracking-tight">{selectedOrder.id}</h2>
          </div>
          <button className="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">View tracking</button>
        </div>
        <OrderCard order={selectedOrder} onSelect={() => {}} />
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <FitSnapshot />
        <SubscriptionSnapshot />
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value, copy, onClick }: { icon: React.ReactNode; title: string; value: string; copy: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-[1.5rem] bg-white p-5 text-left shadow-sm ring-1 ring-neutral-200 transition hover:-translate-y-0.5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#f7f2ea]">{icon}</div>
      <p className="text-sm text-neutral-500">{title}</p>
      <p className="mt-1 text-2xl font-medium">{value}</p>
      <p className="mt-2 text-sm text-neutral-600">{copy}</p>
    </button>
  );
}

function OrdersPanel({ setSelectedOrder }: { setSelectedOrder: (order: typeof orders[number]) => void }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <PanelHeader eyebrow="Orders" title="Order history and tracking" copy="Retail, rental, made-to-order, subscription, resale, and bridal group order states." />
      <div className="mt-6 grid gap-4">
        {orders.map((order) => <OrderCard key={order.id} order={order} onSelect={() => setSelectedOrder(order)} />)}
      </div>
    </section>
  );
}

function OrderCard({ order, onSelect }: { order: typeof orders[number]; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className="grid gap-4 rounded-[1.5rem] border border-neutral-200 p-4 text-left transition hover:border-neutral-400 md:grid-cols-[110px_1fr_auto] md:items-center">
      <img src={order.image} alt={order.item} className="h-28 w-full rounded-2xl object-cover md:h-28 md:w-28" />
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} />
          <span className="rounded-full bg-[#f7f2ea] px-3 py-1 text-xs font-medium">{order.type}</span>
        </div>
        <p className="font-medium">{order.item}</p>
        <p className="mt-1 text-sm text-neutral-500">{order.id} · {order.date} · {order.members}</p>
        <p className="mt-1 text-sm font-medium">{order.price}</p>
      </div>
      <div className="flex items-center gap-2 text-sm font-medium">Track <ArrowRight className="h-4 w-4" /></div>
    </button>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map = {
    processing: ["Processing", "bg-blue-50 text-blue-700"],
    shipped: ["Shipped", "bg-emerald-50 text-emerald-700"],
    delivered: ["Delivered", "bg-neutral-100 text-neutral-700"],
    return_due: ["Return due", "bg-amber-50 text-amber-700"],
    production: ["In production", "bg-purple-50 text-purple-700"],
  } as const;
  const [label, classes] = map[status];
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${classes}`}>{label}</span>;
}

function RentalsPanel() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <PanelHeader eyebrow="Rentals" title="Rental windows and returns" copy="Track event dates, backup sizes, shipment status, and rental return deadlines." />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <RentalCard title="Sorrel Stretch Satin Dress" event="May 19, 2026" returnBy="May 23, 2026" backup="Backup size: L" status="Return due soon" />
        <RentalCard title="Azra Bondi Chiffon Dress" event="June 2, 2026" returnBy="June 6, 2026" backup="Backup size: A10" status="Reserved" />
      </div>
    </section>
  );
}

function RentalCard({ title, event, returnBy, backup, status }: { title: string; event: string; returnBy: string; backup: string; status: string }) {
  return (
    <div className="rounded-[1.5rem] border border-neutral-200 p-5">
      <div className="mb-4 flex items-center justify-between"><Package className="h-5 w-5" /><span className="rounded-full bg-[#f7f2ea] px-3 py-1 text-xs font-medium">{status}</span></div>
      <h3 className="font-medium">{title}</h3>
      <div className="mt-4 space-y-2 text-sm text-neutral-600">
        <p>Event date: {event}</p>
        <p>Return by: {returnBy}</p>
        <p>{backup}</p>
      </div>
    </div>
  );
}

function SubscriptionPanel() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <PanelHeader eyebrow="Gownloop Subscription" title="Monthly box and personalization" copy="Subscription curation uses style preferences, fit outcomes, and return feedback." />
      <div className="mt-6 rounded-[1.5rem] bg-neutral-950 p-6 text-white">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/50">Current plan</p>
            <h3 className="mt-2 text-3xl font-medium">Gownloop Signature</h3>
            <p className="mt-3 text-white/70">Next box ships June 1, 2026. Prioritizing A-line midi dresses in jewel tones.</p>
          </div>
          <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Manage plan</button>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <MetricCard label="Style preference" value="Jewel tones" />
        <MetricCard label="Fit learning" value="Avoid tight hip" />
        <MetricCard label="Feedback score" value="8 signals" />
      </div>
    </section>
  );
}

function FitProfilePanel() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <PanelHeader eyebrow="User Profile" title="Saved fit and style profile" copy="This profile powers Smart Fit, Style Match, recommendations, rental confidence, and subscription curation." />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="Bust" value="36 in" />
        <MetricCard label="Waist" value="29 in" />
        <MetricCard label="Hip" value="39 in" />
        <MetricCard label="Height" value="5'6\" />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <InfoBlock icon={<Sparkles className="h-5 w-5" />} title="Fit Engine" copy="Recommended baseline: M / A8. Bust good, waist fitted, hip good. Rental backup: L / A10 for fitted silhouettes." />
        <InfoBlock icon={<Palette className="h-5 w-5" />} title="Style Engine" copy="Color match: jewel tones, sage, emerald, champagne. Modesty preference: moderate coverage. Body-shape guidance: A-line recommended." />
      </div>
    </section>
  );
}

function WishlistPanel() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <PanelHeader eyebrow="Wishlist" title="Saved styles" copy="Wishlist items can be added to bag, assigned to a bridal party, rented, subscribed, or watched for resale." />
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {wishlist.map((item) => (
          <article key={item.name} className="overflow-hidden rounded-[1.5rem] bg-[#fbfaf6]">
            <img src={item.image} alt={item.name} className="aspect-[4/5] w-full object-cover" />
            <div className="p-4">
              <h3 className="font-medium">{item.name}</h3>
              <p className="mt-1 text-sm text-neutral-500">{item.price} · {item.meta}</p>
              <button className="mt-4 w-full rounded-full bg-neutral-950 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">Add to party</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function BridalPartiesPanel() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <PanelHeader eyebrow="Bridal Party / Group Ordering" title="Events and group order state" copy="Invite members, assign dresses, track measurements, approvals, payments, and shared checkout state." />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {bridalParties.map(([name, date, members, selections, payment]) => (
          <div key={name} className="rounded-[1.5rem] border border-neutral-200 p-5">
            <div className="mb-4 flex items-center justify-between"><Users className="h-5 w-5" /><span className="rounded-full bg-[#f7f2ea] px-3 py-1 text-xs font-medium">{payment}</span></div>
            <h3 className="text-xl font-medium">{name}</h3>
            <p className="mt-1 text-sm text-neutral-500">{date} · {members}</p>
            <p className="mt-4 text-sm text-neutral-600">{selections}</p>
            <button className="mt-5 rounded-full bg-neutral-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">Open dashboard</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReturnsPanel() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <PanelHeader eyebrow="Returns Feedback" title="Returns, exchanges, and learning signals" copy="Returns are not only operations. They improve fit, style, subscription, rental, and resale recommendations." />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <MetricCard label="Fit result" value="Perfect / too small / too large" />
        <MetricCard label="Problem area" value="Bust / waist / hip / length" />
        <MetricCard label="Style signal" value="Color liked / disliked" />
      </div>
      <div className="mt-5 rounded-[1.5rem] border border-neutral-200 p-5">
        <h3 className="font-medium">Open return</h3>
        <p className="mt-2 text-sm text-neutral-600">Sorrel Stretch Satin Dress · Return due May 23, 2026</p>
        <button className="mt-4 rounded-full border border-neutral-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em]">Start return feedback</button>
      </div>
    </section>
  );
}

function ResalePanel() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <PanelHeader eyebrow="Reseller Marketplace" title="Resale listings" copy="Create listings with garment measurements, condition notes, seller sizing confidence, and verified resale checkout." />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {resaleListings.map(([title, price, confidence, status]) => (
          <div key={title} className="rounded-[1.5rem] border border-neutral-200 p-5">
            <div className="mb-4 flex items-center justify-between"><Shirt className="h-5 w-5" /><span className="rounded-full bg-[#f7f2ea] px-3 py-1 text-xs font-medium">{status}</span></div>
            <h3 className="font-medium">{title}</h3>
            <p className="mt-1 text-sm text-neutral-500">{price}</p>
            <p className="mt-4 text-sm text-neutral-600">{confidence}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PanelHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">{title}</h2>
      <p className="mt-3 max-w-3xl leading-7 text-neutral-600">{copy}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[1.5rem] bg-[#f7f2ea] p-5"><p className="text-xs uppercase tracking-[0.16em] text-neutral-500">{label}</p><p className="mt-2 text-xl font-medium">{value}</p></div>;
}

function InfoBlock({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-[1.5rem] border border-neutral-200 p-5"><div className="mb-3 flex items-center gap-2">{icon}<h3 className="font-medium">{title}</h3></div><p className="text-sm leading-6 text-neutral-600">{copy}</p></div>;
}

function FitSnapshot() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200">
      <div className="mb-4 flex items-center gap-2"><Ruler className="h-5 w-5" /><h3 className="text-xl font-medium">Saved Fit Profile</h3></div>
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <MetricCard label="Bust" value="36" />
        <MetricCard label="Waist" value="29" />
        <MetricCard label="Hip" value="39" />
        <MetricCard label="Height" value="5'6" />
      </div>
    </section>
  );
}

function SubscriptionSnapshot() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200">
      <div className="mb-4 flex items-center gap-2"><RefreshCcw className="h-5 w-5" /><h3 className="text-xl font-medium">Gownloop Box</h3></div>
      <p className="text-sm leading-6 text-neutral-600">Next box: June 1, 2026. Prioritize A-line midi dresses in jewel tones. Avoid tight hip styles.</p>
      <button className="mt-5 rounded-full bg-neutral-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">Manage box</button>
    </section>
  );
}

function OrderTrackingPreview({ selectedOrder }: { selectedOrder: typeof orders[number] }) {
  return (
    <section className="bg-[#f7f2ea] py-14">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">/orders/:id</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Order tracking detail page pattern.</h2>
          <p className="mt-4 leading-7 text-neutral-600">Use this same visual system for individual order tracking pages with shipping, rental return, group status, MTO production, and payment state.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200">
            <div className="mb-5 flex items-center justify-between">
              <div><p className="text-sm text-neutral-500">Order</p><h3 className="text-3xl font-medium">{selectedOrder.id}</h3></div>
              <StatusBadge status={selectedOrder.status} />
            </div>
            <OrderCard order={selectedOrder} onSelect={() => {}} />
          </div>
          <TrackingTimeline status={selectedOrder.status} />
        </div>
      </div>
    </section>
  );
}

function TrackingTimeline({ status }: { status: OrderStatus }) {
  const steps = [
    ["Payment confirmed", "Stripe payment captured", true, <ShoppingBag className="h-4 w-4" />],
    ["Processing", "Inventory or production rules loaded", true, <ClipboardCheck className="h-4 w-4" />],
    ["Shipped / Production", "Shipping label or MTO production state", status === "shipped" || status === "production" || status === "return_due", <Truck className="h-4 w-4" />],
    ["Group / Rental state", "Group payment, event window, or rental return", status === "return_due" || status === "shipped", <Users className="h-4 w-4" />],
  ];
  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200">
      <h3 className="mb-5 text-xl font-medium">Tracking timeline</h3>
      <div className="space-y-4">
        {steps.map(([title, copy, complete, icon]) => (
          <div key={String(title)} className="flex gap-4 rounded-2xl border border-neutral-200 p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${complete ? "bg-neutral-950 text-white" : "bg-[#f7f2ea] text-neutral-500"}`}>{icon}</div>
            <div>
              <p className="font-medium">{title}</p>
              <p className="mt-1 text-sm text-neutral-600">{copy}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModuleOwnership() {
  const items = [
    ["Account", "Orders, rentals, subscription, fit profile, wishlist, bridal parties, returns, resale listings"],
    ["Orders", "Cart, checkout, payment state, shipment, fulfillment, and order history"],
    ["Rental", "Rental window, backup size, return deadline, event readiness"],
    ["Subscription", "Monthly Gownloop box, curation rules, learning signals"],
    ["User Profile", "Saved measurements, fit preferences, style inputs, complexion/color preferences"],
    ["Fit Engine", "Recommended size, body measurements, fit confidence, rental warnings"],
    ["Style Engine", "Color match, modesty match, body-shape guidance"],
    ["Bridal Party", "Event workspace, assignment, status, group payment, shared checkout"],
    ["Reseller Marketplace", "Seller listing, garment measurements, condition, resale confidence"],
    ["Returns Feedback", "Return reasons, fit result, problem area, style signal"],
  ];
  return (
    <section className="bg-neutral-950 py-14 text-white">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-white/50">Modular Monolith Ownership</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Account and order tracking module map.</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {items.map(([title, copy]) => <div key={title} className="rounded-2xl border border-white/10 p-5"><h3 className="font-medium">{title}</h3><p className="mt-3 text-sm leading-6 text-white/70">{copy}</p></div>)}
        </div>
      </div>
    </section>
  );
}


