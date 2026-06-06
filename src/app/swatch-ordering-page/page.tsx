"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Heart,
  Info,
  Package,
  Palette,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  SwatchBook,
  Truck,
  Users,
  Wand2,
  X,
} from "lucide-react";

type FabricKey = "chiffon" | "matteSatin" | "stretchSatin" | "crepe" | "velvet";
type PaletteMood = "garden" | "classic" | "jewel" | "neutral" | "romantic";

type Swatch = {
  id: string;
  name: string;
  family: string;
  fabric: FabricKey;
  hex: string;
  match: "High" | "Good" | "Medium";
  mood: PaletteMood;
};

const swatches: Swatch[] = [
  { id: "s1", name: "Sage", family: "Green", fabric: "chiffon", hex: "#9ba88f", match: "High", mood: "garden" },
  { id: "s2", name: "Eucalyptus", family: "Green", fabric: "matteSatin", hex: "#89a08f", match: "High", mood: "garden" },
  { id: "s3", name: "Emerald", family: "Green", fabric: "velvet", hex: "#1f6f5b", match: "High", mood: "jewel" },
  { id: "s4", name: "Champagne", family: "Neutral", fabric: "chiffon", hex: "#d8c4a2", match: "Good", mood: "neutral" },
  { id: "s5", name: "Ivory", family: "Neutral", fabric: "crepe", hex: "#eee8dc", match: "Good", mood: "classic" },
  { id: "s6", name: "Dusty Blue", family: "Blue", fabric: "chiffon", hex: "#8eb9d6", match: "High", mood: "classic" },
  { id: "s7", name: "Rosewood", family: "Pink", fabric: "matteSatin", hex: "#9d5f68", match: "High", mood: "romantic" },
  { id: "s8", name: "English Rose", family: "Pink", fabric: "chiffon", hex: "#d7a0a6", match: "Good", mood: "romantic" },
  { id: "s9", name: "Merlot", family: "Red", fabric: "stretchSatin", hex: "#6c1f2d", match: "High", mood: "jewel" },
  { id: "s10", name: "Black", family: "Black", fabric: "crepe", hex: "#111111", match: "Good", mood: "classic" },
  { id: "s11", name: "Terracotta", family: "Orange", fabric: "chiffon", hex: "#b9664c", match: "Medium", mood: "romantic" },
  { id: "s12", name: "Pearl Gray", family: "Neutral", fabric: "matteSatin", hex: "#b9b7ad", match: "Good", mood: "classic" },
];

const fabricLabels: Record<FabricKey, string> = {
  chiffon: "Chiffon",
  matteSatin: "Matte Satin",
  stretchSatin: "Stretch Satin",
  crepe: "Crepe",
  velvet: "Velvet",
};

const paletteBoards = [
  ["Garden Sage", "Sage · Eucalyptus · Champagne", "Outdoor ceremony", "High style match"],
  ["Jewel Evening", "Emerald · Merlot · Black", "Formal evening", "High contrast"],
  ["Soft Romance", "Rosewood · English Rose · Ivory", "Romantic palette", "Warm tone friendly"],
];

const moduleMap = [
  ["Catalog", "Swatch colors, fabric types, color families, product color availability, swatch inventory"],
  ["Style Engine", "Color match, skin tone guidance, palette harmony, modesty/style preference support"],
  ["Bridal Party", "Shared palette board, member visibility, group approval, swatch assignment"],
  ["Orders", "Swatch cart, free/paid swatch order, shipping status, fulfillment"],
  ["User Profile", "Color preferences, skin tone, event style, saved palettes"],
  ["Recommendation Engine", "Ranks swatches by color match, event type, fabric, availability, and party selections"],
];

export default function ShahsiSwatchOrderingPage() {
  const [fabric, setFabric] = useState<FabricKey | "all">("all");
  const [mood, setMood] = useState<PaletteMood | "all">("all");
  const [selectedSwatches, setSelectedSwatches] = useState<string[]>(["s1", "s2", "s4"]);

  const visibleSwatches = useMemo(() => {
    return swatches.filter((swatch) => {
      const fabricMatch = fabric === "all" || swatch.fabric === fabric;
      const moodMatch = mood === "all" || swatch.mood === mood;
      return fabricMatch && moodMatch;
    });
  }, [fabric, mood]);

  const selected = swatches.filter((swatch) => selectedSwatches.includes(swatch.id));

  function toggleSwatch(id: string) {
    setSelectedSwatches((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <Hero selected={selected} />
        <PaletteConfidence selected={selected} />
        <FilterBar fabric={fabric} setFabric={setFabric} mood={mood} setMood={setMood} />

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <SwatchGrid swatches={visibleSwatches} selectedSwatches={selectedSwatches} toggleSwatch={toggleSwatch} />
          <aside className="grid gap-8 xl:sticky xl:top-28 xl:self-start">
            <SwatchCart selected={selected} toggleSwatch={toggleSwatch} />
            <StyleEnginePanel selected={selected} />
            <BridalPaletteBoard />
          </aside>
        </div>
      </section>

      <HowSwatchesWork />
      <PaletteBoards />
      <ModuleOwnership />
    </main>
  );
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Swatch ordering</span>
        <span>Color confidence before checkout</span>
        <span>Coordinate bridal palettes with your party</span>
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
          <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 sm:block">Swatch studio</p>
        </div>
        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Colors</a>
          <a>Fabric</a>
          <a>Palette Board</a>
          <a>Bridal Party</a>
          <a>Order Swatches</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white"><Search className="h-4 w-4" /></button>
          <button className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white"><SwatchBook className="h-4 w-4" /> Order</button>
        </div>
      </div>
    </header>
  );
}

function Hero({ selected }: { selected: Swatch[] }) {
  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid min-h-[640px] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">/swatches</p>
          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-7xl">See the color before the dress.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Order swatches by color, fabric, and wedding mood. Build a bridal palette, share it with your party, and let Shahsi’s Style Engine guide color confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Order free swatches <ArrowRight className="h-4 w-4" /></button>
            <button className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Create palette board</button>
          </div>
        </div>
        <div className="relative min-h-[520px]">
          <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600&auto=format&fit=crop" alt="Shahsi swatch studio" className="h-full w-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-neutral-950/10 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 rounded-[1.75rem] bg-white/90 p-4 text-neutral-950 shadow-sm backdrop-blur">
            <p className="mb-3 text-sm font-medium">Current palette</p>
            <div className="flex flex-wrap gap-3">
              {selected.map((swatch) => <div key={swatch.id} className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm"><span className="h-6 w-6 rounded-full border border-neutral-200" style={{ background: swatch.hex }} /><span className="text-sm font-medium">{swatch.name}</span></div>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PaletteConfidence({ selected }: { selected: Swatch[] }) {
  return (
    <section className="mt-8 grid gap-4 md:grid-cols-4">
      <MetricCard icon={<Palette className="h-5 w-5" />} title="Palette colors" value={`${selected.length} selected`} />
      <MetricCard icon={<Sparkles className="h-5 w-5" />} title="Style match" value="High" />
      <MetricCard icon={<Users className="h-5 w-5" />} title="Party visibility" value="Shared" />
      <MetricCard icon={<Truck className="h-5 w-5" />} title="Swatch shipping" value="3–5 days" />
    </section>
  );
}

function MetricCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#f7f2ea]">{icon}</div><p className="text-sm text-neutral-500">{title}</p><p className="mt-1 text-xl font-medium">{value}</p></div>;
}

function FilterBar({ fabric, setFabric, mood, setMood }: { fabric: FabricKey | "all"; setFabric: (value: FabricKey | "all") => void; mood: PaletteMood | "all"; setMood: (value: PaletteMood | "all") => void }) {
  const fabricOptions: Array<[FabricKey | "all", string]> = [["all", "All fabrics"], ["chiffon", "Chiffon"], ["matteSatin", "Matte Satin"], ["stretchSatin", "Stretch Satin"], ["crepe", "Crepe"], ["velvet", "Velvet"]];
  const moodOptions: Array<[PaletteMood | "all", string]> = [["all", "All moods"], ["garden", "Garden"], ["classic", "Classic"], ["jewel", "Jewel"], ["neutral", "Neutral"], ["romantic", "Romantic"]];

  return (
    <section className="mt-10 rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-neutral-200">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {fabricOptions.map(([id, label]) => <button key={id} onClick={() => setFabric(id)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${fabric === id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white"}`}>{label}</button>)}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:justify-end">
          {moodOptions.map(([id, label]) => <button key={id} onClick={() => setMood(id)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${mood === id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white"}`}>{label}</button>)}
        </div>
      </div>
    </section>
  );
}

function SwatchGrid({ swatches, selectedSwatches, toggleSwatch }: { swatches: Swatch[]; selectedSwatches: string[]; toggleSwatch: (id: string) => void }) {
  return (
    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {swatches.map((swatch) => {
        const selected = selectedSwatches.includes(swatch.id);
        return (
          <article key={swatch.id} className={`rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 transition hover:-translate-y-0.5 ${selected ? "ring-neutral-950" : "ring-neutral-200"}`}>
            <div className="relative overflow-hidden rounded-[1.5rem] p-6" style={{ background: swatch.hex }}>
              <div className="h-44 rounded-[1.25rem] bg-white/25 backdrop-blur" />
              <button onClick={() => toggleSwatch(swatch.id)} className="absolute right-4 top-4 rounded-full bg-white/90 p-3 shadow-sm backdrop-blur">{selected ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}</button>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">{swatch.family}</p>
                <span className="rounded-full bg-[#f7f2ea] px-3 py-1 text-xs font-medium">{swatch.match} match</span>
              </div>
              <h3 className="text-xl font-medium">{swatch.name}</h3>
              <p className="mt-1 text-sm text-neutral-500">{fabricLabels[swatch.fabric]} · {swatch.mood} palette</p>
              <button onClick={() => toggleSwatch(swatch.id)} className={`mt-5 w-full rounded-full py-3 text-xs font-semibold uppercase tracking-[0.14em] ${selected ? "bg-neutral-950 text-white" : "border border-neutral-950"}`}>{selected ? "Added" : "Add swatch"}</button>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function SwatchCart({ selected, toggleSwatch }: { selected: Swatch[]; toggleSwatch: (id: string) => void }) {
  return (
    <section className="rounded-[1.75rem] bg-neutral-950 p-5 text-white shadow-sm md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">Swatch cart</p>
      <h2 className="mt-2 text-3xl font-medium tracking-tight">{selected.length} selected</h2>
      <div className="mt-6 grid gap-3">
        {selected.map((swatch) => <div key={swatch.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 p-3"><div className="flex items-center gap-3"><span className="h-8 w-8 rounded-full border border-white/20" style={{ background: swatch.hex }} /><div><p className="font-medium">{swatch.name}</p><p className="text-xs text-white/60">{fabricLabels[swatch.fabric]}</p></div></div><button onClick={() => toggleSwatch(swatch.id)}><X className="h-4 w-4" /></button></div>)}
      </div>
      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Order swatches <ArrowRight className="h-4 w-4" /></button>
      <p className="mt-4 text-center text-xs leading-5 text-white/60">First 10 bridal-party swatches can be free or credited toward dress checkout.</p>
    </section>
  );
}

function StyleEnginePanel({ selected }: { selected: Swatch[] }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <div className="mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5" /><h2 className="text-xl font-medium">Style Engine guidance</h2></div>
      <div className="grid gap-3">
        <LightRow label="Palette harmony" value="High" />
        <LightRow label="Skin tone match" value="Warm / neutral friendly" />
        <LightRow label="Wedding mood" value={selected[0]?.mood || "Garden"} />
        <LightRow label="Recommended fabric" value="Chiffon + Matte Satin" />
      </div>
      <div className="mt-5 flex gap-3 rounded-2xl bg-[#f7f2ea] p-4 text-sm text-neutral-700"><Info className="mt-0.5 h-4 w-4 shrink-0" /><p>Style Engine should compare color preference, skin tone, wedding mood, modesty preference, and dress availability before final palette approval.</p></div>
    </section>
  );
}

function BridalPaletteBoard() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <div className="mb-4 flex items-center gap-2"><Users className="h-5 w-5" /><h2 className="text-xl font-medium">Bridal party board</h2></div>
      <div className="grid gap-3">
        <LightRow label="Bride approval" value="Pending" />
        <LightRow label="Members viewed" value="3 of 4" />
        <LightRow label="Palette status" value="Shared" />
        <LightRow label="Dress colors linked" value="2 products" />
      </div>
      <button className="mt-5 w-full rounded-full border border-neutral-950 py-3 text-xs font-semibold uppercase tracking-[0.14em]">Share palette</button>
    </section>
  );
}

function HowSwatchesWork() {
  return (
    <section className="bg-[#f7f2ea] py-14">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">How swatches work</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Color confidence before the full order.</h2>
          <p className="mt-4 leading-7 text-neutral-600">Swatches reduce uncertainty across lighting, fabric, photos, bridesmaid preferences, and final dress selection.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <FlowStep icon={<Palette className="h-5 w-5" />} title="Choose colors" copy="Filter by mood and fabric" />
          <FlowStep icon={<SwatchBook className="h-5 w-5" />} title="Order swatches" copy="Ship color samples" />
          <FlowStep icon={<Users className="h-5 w-5" />} title="Share board" copy="Coordinate with party" />
          <FlowStep icon={<ShoppingBag className="h-5 w-5" />} title="Checkout dresses" copy="Apply palette to products" />
        </div>
      </div>
    </section>
  );
}

function PaletteBoards() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-14 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionHeader eyebrow="Recommended boards" title="Start with a curated palette" copy="Palette boards give the user a faster path from color inspiration to product selection." />
        <button className="inline-flex items-center gap-2 rounded-full border border-neutral-950 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em]">Create custom board <ArrowRight className="h-4 w-4" /></button>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {paletteBoards.map(([title, colors, mood, match]) => <article key={title} className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200"><div className="mb-5 flex gap-2">{colors.split(" · ").map((name) => { const swatch = swatches.find((item) => item.name === name); return <span key={name} className="h-12 w-12 rounded-full border border-neutral-200" style={{ background: swatch?.hex || "#ddd" }} />; })}</div><h3 className="text-xl font-medium">{title}</h3><p className="mt-1 text-sm text-neutral-500">{colors}</p><div className="mt-5 grid gap-2"><LightRow label="Mood" value={mood} /><LightRow label="Match" value={match} /></div></article>)}
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
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Swatch Ordering module map.</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {moduleMap.map(([title, copy]) => <div key={title} className="rounded-2xl border border-white/10 p-5"><h3 className="font-medium">{title}</h3><p className="mt-3 text-sm leading-6 text-white/70">{copy}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <div><p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{eyebrow}</p><h2 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">{title}</h2><p className="mt-3 max-w-3xl leading-7 text-neutral-600">{copy}</p></div>;
}

function LightRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#fbfaf6] p-4 text-sm"><span className="text-neutral-600">{label}</span><strong className="text-right">{value}</strong></div>;
}

function FlowStep({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm ring-1 ring-neutral-200"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f2ea]">{icon}</div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-neutral-500">{copy}</p></div>;
}
