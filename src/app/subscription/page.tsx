"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Heart,
  Package,
  Palette,
  RefreshCcw,
  Ruler,
  Search,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  Wand2,
  XCircle,
} from "lucide-react";

type Tier = "starter" | "signature" | "atelier";
type ClosetFilter = "current" | "next" | "kept" | "returned";

const tiers = [
  {
    id: "starter" as Tier,
    name: "Gownloop Starter",
    price: "$49",
    cadence: "/ month",
    tagline: "1 rotating occasion piece",
    bestFor: "Trying the system",
    features: ["1 item per month", "Basic fit matching", "Swap once per cycle", "Keep/buy discount"],
  },
  {
    id: "signature" as Tier,
    name: "Gownloop Signature",
    price: "$89",
    cadence: "/ month",
    tagline: "2 rotating pieces + personalization",
    bestFor: "Most members",
    features: ["2 items per month", "AI style personalization", "Priority swaps", "Fit feedback learning", "Bridal guest edits"],
  },
  {
    id: "atelier" as Tier,
    name: "Gownloop Atelier",
    price: "$149",
    cadence: "/ month",
    tagline: "Premium rotation + stylist review",
    bestFor: "High-touch styling",
    features: ["3 premium pieces", "Stylist-approved box", "Early access drops", "Event-based curation", "Higher keep/buy discount"],
  },
];

const monthlyRotation = [
  {
    status: "Current box",
    title: "Sage Garden Edit",
    date: "May 2026",
    products: "Mira Chiffon Dress + Debra Convertible Dress",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop",
  },
  {
    status: "Next box",
    title: "Jewel Tone Evening",
    date: "June 2026",
    products: "Emerald satin, merlot crepe, black-tie accessories",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop",
  },
  {
    status: "Learning box",
    title: "Fit Feedback Adjusted",
    date: "July 2026",
    products: "Avoid tight hip styles, prioritize A-line midi dresses",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=900&auto=format&fit=crop",
  },
];

const closetItems = [
  {
    name: "Mira Chiffon Dress",
    status: "current" as ClosetFilter,
    meta: "Current box · Sage · Size M",
    action: "Keep for $68",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Debra Convertible Dress",
    status: "current" as ClosetFilter,
    meta: "Current box · Champagne · Size A6",
    action: "Swap available",
    image: "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Sorrel Stretch Satin Dress",
    status: "next" as ClosetFilter,
    meta: "Next box · Ganache · Backup L",
    action: "Approve item",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Valentine Floral Burnout Dress",
    status: "kept" as ClosetFilter,
    meta: "Kept item · Olive Floral",
    action: "View receipt",
    image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Azra Bondi Chiffon Dress",
    status: "returned" as ClosetFilter,
    meta: "Returned · Fit: perfect",
    action: "View feedback",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop",
  },
];

const feedbackSignals = [
  ["Fit result", "Avoid tight hip styles", "Recommendation Engine lowered fitted column dresses"],
  ["Color preference", "Loved sage + emerald", "Style ranking now prioritizes green families"],
  ["Modesty", "Prefers moderate coverage", "Deep V styles require warning"],
  ["Keep behavior", "Kept floral midi", "Subscription now suggests garden/event edits"],
];

const moduleMap = [
  ["Subscription", "Membership tiers, monthly rotation, closet management, swap flow, keep/buy flow, recurring billing state"],
  ["Recommendation Engine", "Personalized monthly box ranking using fit, style, availability, feedback, and member history"],
  ["User Profile", "Measurements, color preferences, modesty, event needs, saved sizes, style inputs"],
  ["Fit Engine", "Fit confidence, backup size, silhouette risk, size explanations for subscription picks"],
  ["Style Engine", "Color matching, body-shape guidance, modesty match, styling reasons"],
  ["Orders", "Subscription shipment, keep/buy checkout, return shipment, box fulfillment"],
  ["Payments", "Recurring billing, keep/buy charges, plan upgrades, Stripe subscription state"],
  ["Returns Feedback", "Fit result, color liked/disliked, problem area, swap reasons, future learning"],
];

export default function ShahsiGownloopSubscriptionPage() {
  const [selectedTier, setSelectedTier] = useState<Tier>("signature");
  const [closetFilter, setClosetFilter] = useState<ClosetFilter>("current");

  const activeTier = tiers.find((tier) => tier.id === selectedTier)!;
  const visibleCloset = useMemo(() => closetItems.filter((item) => item.status === closetFilter), [closetFilter]);

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <Hero selectedTier={selectedTier} setSelectedTier={setSelectedTier} activeTier={activeTier} />
        <MembershipTiers selectedTier={selectedTier} setSelectedTier={setSelectedTier} />
        <MonthlyRotation />
        <PersonalizationSystem />
        <ClosetManagement closetFilter={closetFilter} setClosetFilter={setClosetFilter} visibleCloset={visibleCloset} />
      </section>

      <KeepBuyAndSwap />
      <FeedbackLearning />
      <ModuleOwnership />
    </main>
  );
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Gownloop subscription</span>
        <span>Monthly rotation · swap · keep · return</span>
        <span>Personalized by Shahsi intelligence</span>
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
          <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 sm:block">Gownloop subscription</p>
        </div>
        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Membership</a>
          <a>Monthly Rotation</a>
          <a>Closet</a>
          <a>Swap</a>
          <a>Feedback</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white"><Search className="h-4 w-4" /></button>
          <button className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">Join Gownloop</button>
        </div>
      </div>
    </header>
  );
}

function Hero({ selectedTier, setSelectedTier, activeTier }: { selectedTier: Tier; setSelectedTier: (tier: Tier) => void; activeTier: typeof tiers[number] }) {
  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid min-h-[700px] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">/gownloop</p>
          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-7xl">A smarter rotating closet for every occasion.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Gownloop is Shahsi’s subscription system: monthly fashion rotation, AI personalization, closet management, keep/buy, swap, return, and feedback learning.
          </p>

          <div className="mt-8 rounded-[1.75rem] bg-white/10 p-4 backdrop-blur">
            <p className="mb-4 text-sm font-medium text-white">Choose your membership</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {tiers.map((tier) => (
                <button key={tier.id} onClick={() => setSelectedTier(tier.id)} className={`rounded-2xl p-4 text-left ${selectedTier === tier.id ? "bg-white text-neutral-950" : "bg-white/10 text-white"}`}>
                  <p className="font-medium">{tier.name.replace("Gownloop ", "")}</p>
                  <p className={`mt-1 text-sm ${selectedTier === tier.id ? "text-neutral-500" : "text-white/60"}`}>{tier.price}{tier.cadence}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Start {activeTier.name} <ArrowRight className="h-4 w-4" /></button>
            <button className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">See my box preview</button>
          </div>
        </div>

        <div className="relative min-h-[520px]">
          <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600&auto=format&fit=crop" alt="Gownloop subscription fashion" className="h-full w-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-neutral-950/10 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 grid gap-3 md:grid-cols-3">
            <HeroCard icon={<RefreshCcw className="h-4 w-4" />} title="Monthly rotation" copy="New box each cycle" />
            <HeroCard icon={<Wand2 className="h-4 w-4" />} title="AI personalization" copy="Learns every return" />
            <HeroCard icon={<Heart className="h-4 w-4" />} title="Keep or swap" copy="Flexible closet" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCard({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-2xl bg-white/90 p-4 text-neutral-950 shadow-sm backdrop-blur"><div className="mb-2 flex items-center gap-2">{icon}<p className="font-medium">{title}</p></div><p className="text-sm text-neutral-600">{copy}</p></div>;
}

function MembershipTiers({ selectedTier, setSelectedTier }: { selectedTier: Tier; setSelectedTier: (tier: Tier) => void }) {
  return (
    <section className="mt-14">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionHeader eyebrow="Membership tiers" title="Choose your Gownloop level" copy="Each plan uses Shahsi intelligence to personalize monthly selections and improve after every wear, swap, keep, and return." />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {tiers.map((tier) => (
          <article key={tier.id} className={`rounded-[2rem] p-6 shadow-sm ring-1 transition ${selectedTier === tier.id ? "bg-neutral-950 text-white ring-neutral-950" : "bg-white ring-neutral-200"}`}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f2ea] text-neutral-950"><RefreshCcw className="h-5 w-5" /></div>
              {tier.id === "signature" && <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-950">Recommended</span>}
            </div>
            <p className={`text-xs uppercase tracking-[0.18em] ${selectedTier === tier.id ? "text-white/50" : "text-neutral-500"}`}>{tier.bestFor}</p>
            <h3 className="mt-3 text-3xl font-medium tracking-tight">{tier.name}</h3>
            <div className="mt-4 flex items-end gap-1"><span className="text-5xl font-medium">{tier.price}</span><span className={selectedTier === tier.id ? "text-white/60" : "text-neutral-500"}>{tier.cadence}</span></div>
            <p className={`mt-4 ${selectedTier === tier.id ? "text-white/70" : "text-neutral-600"}`}>{tier.tagline}</p>
            <div className="mt-6 grid gap-3">
              {tier.features.map((feature) => <div key={feature} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4" />{feature}</div>)}
            </div>
            <button onClick={() => setSelectedTier(tier.id)} className={`mt-7 w-full rounded-full py-4 text-sm font-semibold uppercase tracking-[0.16em] ${selectedTier === tier.id ? "bg-white text-neutral-950" : "bg-neutral-950 text-white"}`}>Select plan</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function MonthlyRotation() {
  return (
    <section className="mt-14 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-8">
      <SectionHeader eyebrow="Monthly rotation" title="Your box changes as Shahsi learns" copy="Each box is built from fit confidence, style preference, availability, event needs, and feedback history." />
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {monthlyRotation.map((box) => (
          <article key={box.title} className="overflow-hidden rounded-[1.75rem] bg-[#fbfaf6]">
            <div className="relative">
              <img src={box.image} alt={box.title} className="aspect-[4/5] w-full object-cover" />
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">{box.status}</span>
            </div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">{box.date}</p>
              <h3 className="mt-2 text-xl font-medium">{box.title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{box.products}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PersonalizationSystem() {
  return (
    <section className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] bg-neutral-950 p-6 text-white shadow-sm md:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-white/50">AI personalization</p>
        <h2 className="mt-3 text-4xl font-medium tracking-tight">Recommendation Engine builds every box from signals.</h2>
        <p className="mt-4 leading-7 text-white/70">
          Gownloop is not a random subscription. Each monthly rotation is scored using fit confidence, style match, color preferences, availability, event needs, and return feedback.
        </p>
        <button className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Preview my next box <ArrowRight className="h-4 w-4" /></button>
      </div>
      <div className="grid gap-4">
        <ScoreCard title="Fit score" value="40%" copy="Uses measurements, saved sizes, and comfort feedback." />
        <ScoreCard title="Style score" value="35%" copy="Uses color preference, modesty, body-shape guidance, and event style." />
        <ScoreCard title="Feedback score" value="25%" copy="Uses keep, swap, return, too small, too large, and color feedback." />
      </div>
    </section>
  );
}

function ScoreCard({ title, value, copy }: { title: string; value: string; copy: string }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      <div className="flex items-center justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[0.16em] text-neutral-500">{title}</p><p className="mt-2 text-3xl font-medium">{value}</p></div>
        <Sparkles className="h-6 w-6" />
      </div>
      <p className="mt-4 text-sm leading-6 text-neutral-600">{copy}</p>
    </div>
  );
}

function ClosetManagement({ closetFilter, setClosetFilter, visibleCloset }: { closetFilter: ClosetFilter; setClosetFilter: (filter: ClosetFilter) => void; visibleCloset: typeof closetItems }) {
  const filters: Array<[ClosetFilter, string]> = [["current", "Current box"], ["next", "Next box"], ["kept", "Kept"], ["returned", "Returned"]];
  return (
    <section className="mt-14">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionHeader eyebrow="Closet management" title="Manage your rotating closet" copy="Approve, swap, keep, buy, return, or give feedback from one Gownloop closet page." />
        <button className="inline-flex items-center gap-2 rounded-full border border-neutral-950 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em]">Open closet <ArrowRight className="h-4 w-4" /></button>
      </div>
      <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
        {filters.map(([id, label]) => <button key={id} onClick={() => setClosetFilter(id)} className={`shrink-0 rounded-full border px-5 py-3 text-sm font-medium ${closetFilter === id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white"}`}>{label}</button>)}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visibleCloset.map((item) => <ClosetCard key={item.name} item={item} />)}
      </div>
    </section>
  );
}

function ClosetCard({ item }: { item: typeof closetItems[number] }) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-neutral-200">
      <div className="relative overflow-hidden">
        <img src={item.image} alt={item.name} className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <button className="absolute right-3 top-3 rounded-full bg-white/90 p-3 shadow-sm backdrop-blur"><Heart className="h-4 w-4" /></button>
      </div>
      <div className="p-5">
        <h3 className="font-medium">{item.name}</h3>
        <p className="mt-1 text-sm leading-6 text-neutral-500">{item.meta}</p>
        <button className="mt-4 w-full rounded-full bg-neutral-950 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">{item.action}</button>
      </div>
    </article>
  );
}

function KeepBuyAndSwap() {
  return (
    <section className="bg-[#f7f2ea] py-14">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Keep / buy and swap flow</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Flexible ownership, not just rental.</h2>
          <p className="mt-4 leading-7 text-neutral-600">Members can keep favorite pieces, buy at a discount, swap before shipment, or return to keep the closet rotating.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <FlowStep icon={<RefreshCcw className="h-5 w-5" />} title="Receive box" copy="Monthly pieces arrive" />
          <FlowStep icon={<Shirt className="h-5 w-5" />} title="Wear" copy="Try with confidence" />
          <FlowStep icon={<Heart className="h-5 w-5" />} title="Keep / buy" copy="Discounted ownership" />
          <FlowStep icon={<Package className="h-5 w-5" />} title="Swap / return" copy="Send back and learn" />
        </div>
      </div>
    </section>
  );
}

function FeedbackLearning() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-14 lg:px-8">
      <div className="grid gap-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Feedback learning</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Every keep, swap, and return improves the next box.</h2>
          <p className="mt-4 leading-7 text-neutral-600">Gownloop turns behavior into personalization signals for the Subscription module and Recommendation Engine.</p>
          <button className="mt-8 rounded-full bg-neutral-950 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Give feedback</button>
        </div>
        <div className="grid gap-3">
          {feedbackSignals.map(([title, signal, impact]) => (
            <div key={title} className="rounded-2xl bg-[#fbfaf6] p-4">
              <div className="mb-2 flex items-center justify-between gap-3"><p className="font-medium">{title}</p><BadgeCheck className="h-4 w-4" /></div>
              <p className="text-sm text-neutral-600">{signal}</p>
              <p className="mt-2 text-sm font-medium">{impact}</p>
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
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-white/50">Modular Monolith Ownership</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Gownloop page module map.</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {moduleMap.map(([title, copy]) => <div key={title} className="rounded-2xl border border-white/10 p-5"><h3 className="font-medium">{title}</h3><p className="mt-3 text-sm leading-6 text-white/70">{copy}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <div><p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{eyebrow}</p><h2 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">{title}</h2><p className="mt-3 max-w-3xl leading-7 text-neutral-600">{copy}</p></div>;
}

function FlowStep({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm ring-1 ring-neutral-200"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f2ea]">{icon}</div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-neutral-500">{copy}</p></div>;
}
