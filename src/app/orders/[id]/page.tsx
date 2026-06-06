"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Clock,
  Download,
  Info,
  Mail,
  Package,
  RefreshCcw,
  RotateCcw,
  Ruler,
  Scissors,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
  Users,
} from "lucide-react";

type TrackingTab = "overview" | "shipping" | "rental" | "group" | "mto" | "payment";
type StepStatus = "complete" | "active" | "pending" | "warning";

const orderItems = [
  {
    id: "1",
    product: "Mira Chiffon Dress",
    owner: "Maya",
    type: "Retail",
    color: "Sage",
    size: "M",
    price: "$99",
    status: "Shipped",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "2",
    product: "Azra Bondi Chiffon Dress",
    owner: "Aisha",
    type: "Rental",
    color: "Sage",
    size: "A8",
    price: "$44",
    status: "Return due May 23",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "3",
    product: "Mira Pleated One Shoulder Gown",
    owner: "Bride Custom Order",
    type: "MTO",
    color: "Emerald",
    size: "Custom",
    price: "$169",
    status: "In production",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=900&auto=format&fit=crop",
  },
];

const shippingSteps = [
  ["Order confirmed", "Payment authorized and order created", "May 12, 2026", "complete"],
  ["Packed", "Retail and rental items prepared", "May 13, 2026", "complete"],
  ["Shipped", "Tracking number SHIP-8842 created", "May 14, 2026", "active"],
  ["Out for delivery", "Carrier delivery scan pending", "Expected May 17", "pending"],
  ["Delivered", "Delivery confirmation pending", "Expected May 17", "pending"],
] as const;

const mtoSteps = [
  ["Measurements approved", "Bust, waist, hip, height, and custom length confirmed", "Complete", "complete"],
  ["Pattern preparation", "Custom length and fit preference applied", "In progress", "active"],
  ["Cut and sew", "Fabric enters production queue", "Week 2–5", "pending"],
  ["Quality check", "Final finish and measurements reviewed", "Week 6", "pending"],
  ["Ship custom order", "Tracking sent after production", "Week 6–8", "pending"],
] as const;

const groupMembers = [
  ["Maya", "Mira Chiffon Dress", "Paid", "Shipped"],
  ["Aisha", "Azra Bondi Rental", "Paid", "Return due"],
  ["Lina", "Debra Convertible Dress", "Paid", "Delivered"],
  ["Sofia", "Sorrel Satin Dress", "Pending", "Waiting payment"],
];

const paymentRows = [
  ["Subtotal", "$312"],
  ["Shipping", "$18"],
  ["Rental fee", "$44"],
  ["MTO production", "$169"],
  ["Already paid", "$312"],
  ["Still due", "$68"],
];

const moduleMap = [
  ["Orders", "Order status, line items, fulfillment routing, delivery tracking, order detail state"],
  ["Payments", "Payment authorization, split payment state, paid/pending balance, Stripe metadata"],
  ["Rental", "Rental return deadline, return label, event date, rental agreement, backup sizing"],
  ["Made-to-order", "Production timeline, custom measurements, final approval, production stages"],
  ["Bridal Party", "Group member status, assigned products, member ownership, group checkout state"],
  ["Shipping", "Carrier tracking, delivery timeline, shipment splitting, return shipment"],
  ["Fit Engine", "Fit confidence, backup size, MTO measurement validation, rental risk"],
];

export default function ShahsiOrderTrackingPage() {
  const [activeTab, setActiveTab] = useState<TrackingTab>("overview");
  const orderStatus = useMemo(() => "Partially shipped", []);

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <Hero orderStatus={orderStatus} />
        <TrackingTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <section className="grid gap-8">
            {(activeTab === "overview" || activeTab === "shipping") && <ShippingPanel />}
            {(activeTab === "overview" || activeTab === "rental") && <RentalReturnPanel />}
            {(activeTab === "overview" || activeTab === "group") && <GroupStatusPanel />}
            {(activeTab === "overview" || activeTab === "mto") && <MtoProductionPanel />}
            {(activeTab === "overview" || activeTab === "payment") && <PaymentStatePanel />}
          </section>

          <aside className="grid gap-8 xl:sticky xl:top-28 xl:self-start">
            <OrderSummary />
            <OrderItems />
            <SupportActions />
          </aside>
        </div>
      </section>

      <TrackingFlow />
      <ModuleOwnership />
    </main>
  );
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Order tracking</span>
        <span>Shipping · rental return · MTO production</span>
        <span>Payment state + bridal group status</span>
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
          <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 sm:block">Order tracking</p>
        </div>
        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Shipping</a>
          <a>Rental Return</a>
          <a>Group Status</a>
          <a>MTO Production</a>
          <a>Payment</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white"><Search className="h-4 w-4" /></button>
          <button className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">Contact support</button>
        </div>
      </div>
    </header>
  );
}

function Hero({ orderStatus }: { orderStatus: string }) {
  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">/orders/SH-10294</p>
          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-6xl">Track every part of your Shahsi order.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Follow shipping, rental returns, bridal group readiness, made-to-order production, and payment status in one modular order timeline.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">View tracking details <ArrowRight className="h-4 w-4" /></button>
            <button className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Download receipt</button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <HeroMetric icon={<Package className="h-4 w-4" />} label="Order status" value={orderStatus} />
          <HeroMetric icon={<Truck className="h-4 w-4" />} label="Delivery" value="May 17" />
          <HeroMetric icon={<RotateCcw className="h-4 w-4" />} label="Rental return" value="May 23" />
          <HeroMetric icon={<CreditCard className="h-4 w-4" />} label="Payment" value="$68 due" />
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl bg-white/10 p-5 backdrop-blur"><div className="mb-3 flex items-center gap-2 text-white/75">{icon}<span className="text-xs uppercase tracking-[0.14em]">{label}</span></div><p className="text-2xl font-medium">{value}</p></div>;
}

function TrackingTabs({ activeTab, setActiveTab }: { activeTab: TrackingTab; setActiveTab: (tab: TrackingTab) => void }) {
  const tabs: Array<[TrackingTab, string, React.ReactNode]> = [
    ["overview", "Overview", <Package className="h-4 w-4" />],
    ["shipping", "Shipping", <Truck className="h-4 w-4" />],
    ["rental", "Rental return", <RotateCcw className="h-4 w-4" />],
    ["group", "Group status", <Users className="h-4 w-4" />],
    ["mto", "MTO production", <Scissors className="h-4 w-4" />],
    ["payment", "Payment", <CreditCard className="h-4 w-4" />],
  ];

  return (
    <section className="mt-8 rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-neutral-200">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(([id, label, icon]) => <button key={id} onClick={() => setActiveTab(id)} className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium ${activeTab === id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white"}`}>{icon}{label}</button>)}
      </div>
    </section>
  );
}

function ShippingPanel() {
  return (
    <Panel eyebrow="Shipping" title="Shipment timeline" copy="Orders module tracks shipment state across retail, rental, resale, and MTO fulfillment paths.">
      <Timeline steps={shippingSteps} />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric label="Carrier" value="UPS" />
        <Metric label="Tracking" value="SHIP-8842" />
        <Metric label="Delivery window" value="May 17" />
      </div>
    </Panel>
  );
}

function RentalReturnPanel() {
  return (
    <Panel eyebrow="Rental return" title="Rental return status" copy="Rental module tracks event date, return window, backup size, return label, and agreement status.">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.5rem] bg-amber-50 p-5 text-amber-900">
          <div className="mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /><h3 className="font-medium">Return due soon</h3></div>
          <p className="text-sm leading-6">Azra Bondi Chiffon Dress must be shipped back by May 23, 2026. Return label is ready.</p>
          <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-900 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white"><Download className="h-4 w-4" /> Download label</button>
        </div>
        <div className="grid gap-3">
          <LightRow label="Event date" value="May 19, 2026" />
          <LightRow label="Return by" value="May 23, 2026" />
          <LightRow label="Backup size" value="A10 recommended" />
          <LightRow label="Agreement" value="Accepted" />
        </div>
      </div>
    </Panel>
  );
}

function GroupStatusPanel() {
  return (
    <Panel eyebrow="Group status" title="Bridal party order state" copy="Bridal Party module keeps ownership, payments, shipment, and member readiness visible.">
      <div className="grid gap-4 md:grid-cols-2">
        {groupMembers.map(([member, product, payment, status]) => <div key={member} className="rounded-[1.5rem] border border-neutral-200 p-5"><div className="mb-4 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-white">{member.charAt(0)}</div><div><p className="font-medium">{member}</p><p className="text-sm text-neutral-500">{product}</p></div></div><div className="grid gap-2"><LightRow label="Payment" value={payment} /><LightRow label="Status" value={status} /></div></div>)}
      </div>
    </Panel>
  );
}

function MtoProductionPanel() {
  return (
    <Panel eyebrow="MTO production" title="Made-to-order production timeline" copy="Made-to-order module tracks final approval, production stage, quality check, and shipment timeline.">
      <Timeline steps={mtoSteps} />
      <div className="mt-6 rounded-[1.5rem] bg-[#f7f2ea] p-5">
        <div className="mb-4 flex items-center gap-2"><Ruler className="h-5 w-5" /><h3 className="font-medium">Production measurements</h3></div>
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Bust" value="36 in" />
          <Metric label="Waist" value="29 in" />
          <Metric label="Hip" value="39 in" />
          <Metric label="Length" value="132 cm" />
        </div>
      </div>
    </Panel>
  );
}

function PaymentStatePanel() {
  return (
    <Panel eyebrow="Payment state" title="Split payment and balance" copy="Payments module tracks Stripe authorization, member payments, balance due, refunds, and receipts.">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.5rem] bg-neutral-950 p-5 text-white">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Payment status</p>
          <h3 className="mt-2 text-4xl font-medium">$68 due</h3>
          <p className="mt-3 text-sm leading-6 text-white/70">Sofia has not completed her assigned resale item payment. Group order remains partially paid.</p>
          <button className="mt-5 rounded-full bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-950">Send reminder</button>
        </div>
        <div className="grid gap-3">
          {paymentRows.map(([label, value]) => <LightRow key={label} label={label} value={value} />)}
        </div>
      </div>
    </Panel>
  );
}

function Timeline({ steps }: { steps: readonly (readonly [string, string, string, StepStatus])[] }) {
  return (
    <div className="grid gap-3">
      {steps.map(([title, copy, date, status]) => <div key={title} className="flex gap-4 rounded-2xl border border-neutral-200 p-4"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${status === "complete" ? "bg-emerald-700 text-white" : status === "active" ? "bg-neutral-950 text-white" : status === "warning" ? "bg-amber-100 text-amber-800" : "bg-[#f7f2ea] text-neutral-500"}`}>{status === "complete" ? <CheckCircle2 className="h-5 w-5" /> : status === "warning" ? <AlertTriangle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}</div><div className="min-w-0 flex-1"><div className="flex flex-col justify-between gap-1 md:flex-row md:items-center"><p className="font-medium">{title}</p><span className="text-sm text-neutral-500">{date}</span></div><p className="mt-1 text-sm leading-6 text-neutral-600">{copy}</p></div></div>)}
    </div>
  );
}

function OrderSummary() {
  return (
    <section className="rounded-[1.75rem] bg-neutral-950 p-5 text-white shadow-sm md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">Order summary</p>
      <h2 className="mt-2 text-3xl font-medium tracking-tight">SH-10294</h2>
      <div className="mt-6 grid gap-3">
        <DarkRow label="Placed" value="May 12, 2026" />
        <DarkRow label="Status" value="Partially shipped" />
        <DarkRow label="Items" value="3" />
        <DarkRow label="Total" value="$543" />
        <DarkRow label="Still due" value="$68" />
      </div>
      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Pay balance <ArrowRight className="h-4 w-4" /></button>
    </section>
  );
}

function OrderItems() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Line items</p>
      <h2 className="mt-2 text-2xl font-medium">Tracked items</h2>
      <div className="mt-5 grid gap-4">
        {orderItems.map((item) => <article key={item.id} className="grid gap-4 rounded-[1.5rem] border border-neutral-200 p-4 sm:grid-cols-[88px_1fr]"><img src={item.image} alt={item.product} className="h-24 w-full rounded-2xl object-cover sm:h-24 sm:w-22" /><div><div className="mb-2 flex flex-wrap gap-2"><Badge>{item.type}</Badge><Badge>{item.status}</Badge></div><p className="font-medium">{item.product}</p><p className="mt-1 text-sm text-neutral-500">{item.owner} · {item.color} · {item.size}</p><p className="mt-2 text-sm font-medium">{item.price}</p></div></article>)}
      </div>
    </section>
  );
}

function SupportActions() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Support</p>
      <h2 className="mt-2 text-2xl font-medium">Need help?</h2>
      <div className="mt-5 grid gap-3">
        <button className="inline-flex items-center justify-between rounded-2xl bg-[#fbfaf6] p-4 text-left text-sm font-medium">Message support <Mail className="h-4 w-4" /></button>
        <button className="inline-flex items-center justify-between rounded-2xl bg-[#fbfaf6] p-4 text-left text-sm font-medium">Download receipt <Download className="h-4 w-4" /></button>
        <button className="inline-flex items-center justify-between rounded-2xl bg-[#fbfaf6] p-4 text-left text-sm font-medium">Start return <RotateCcw className="h-4 w-4" /></button>
      </div>
    </section>
  );
}

function TrackingFlow() {
  return (
    <section className="bg-[#f7f2ea] py-14">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Tracking architecture</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">One order can have multiple tracking paths.</h2>
          <p className="mt-4 leading-7 text-neutral-600">The order tracking page must show retail shipping, rental returns, MTO production, split payments, and bridal group ownership together without confusing the customer.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          <FlowStep icon={<Truck className="h-5 w-5" />} title="Shipping" copy="Carrier status" />
          <FlowStep icon={<RotateCcw className="h-5 w-5" />} title="Rental" copy="Return deadline" />
          <FlowStep icon={<Scissors className="h-5 w-5" />} title="MTO" copy="Production stage" />
          <FlowStep icon={<Users className="h-5 w-5" />} title="Group" copy="Member state" />
          <FlowStep icon={<CreditCard className="h-5 w-5" />} title="Payment" copy="Balance due" />
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
          <p className="text-xs uppercase tracking-[0.22em] text-white/50">Modular Monolith Ownership</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Order Tracking module map.</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {moduleMap.map(([title, copy]) => <div key={title} className="rounded-2xl border border-white/10 p-5"><h3 className="font-medium">{title}</h3><p className="mt-3 text-sm leading-6 text-white/70">{copy}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function Panel({ eyebrow, title, copy, children }: { eyebrow: string; title: string; copy: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">{title}</h2>
      <p className="mt-3 max-w-3xl leading-7 text-neutral-600">{copy}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[1.5rem] bg-[#f7f2ea] p-5"><p className="text-xs uppercase tracking-[0.16em] text-neutral-500">{label}</p><p className="mt-2 text-xl font-medium">{value}</p></div>;
}

function LightRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#fbfaf6] p-4 text-sm"><span className="text-neutral-600">{label}</span><strong className="text-right">{value}</strong></div>;
}

function DarkRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 p-4 text-sm"><span className="text-white/65">{label}</span><strong className="text-right">{value}</strong></div>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-[#f7f2ea] px-3 py-1 text-xs font-medium">{children}</span>;
}

function FlowStep({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm ring-1 ring-neutral-200"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f2ea]">{icon}</div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-neutral-500">{copy}</p></div>;
}
