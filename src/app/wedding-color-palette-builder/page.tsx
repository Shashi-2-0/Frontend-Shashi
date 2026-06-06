"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Heart,
  Image,
  Link,
  Mail,
  Palette,
  Plus,
  Search,
  Share2,
  ShoppingBag,
  Sparkles,
  SwatchBook,
  Trash2,
  Users,
  Wand2,
  X,
} from "lucide-react";

type Mood = "garden" | "classic" | "romantic" | "jewel" | "minimal" | "coastal";
type Season = "spring" | "summer" | "fall" | "winter" | "yearRound";
type Role = "bride" | "maidOfHonor" | "bridesmaid" | "mother" | "guest";

type ColorOption = {
  id: string;
  name: string;
  family: string;
  hex: string;
  mood: Mood;
  season: Season;
  match: "High" | "Good" | "Medium";
};

const colorOptions: ColorOption[] = [
  { id: "sage", name: "Sage", family: "Green", hex: "#9ba88f", mood: "garden", season: "spring", match: "High" },
  { id: "eucalyptus", name: "Eucalyptus", family: "Green", hex: "#89a08f", mood: "garden", season: "summer", match: "High" },
  { id: "olive", name: "Olive", family: "Green", hex: "#7f8f69", mood: "garden", season: "fall", match: "Good" },
  { id: "champagne", name: "Champagne", family: "Neutral", hex: "#d8c4a2", mood: "classic", season: "yearRound", match: "High" },
  { id: "ivory", name: "Ivory", family: "Neutral", hex: "#eee8dc", mood: "classic", season: "yearRound", match: "Good" },
  { id: "pearl-gray", name: "Pearl Gray", family: "Neutral", hex: "#b9b7ad", mood: "minimal", season: "winter", match: "Good" },
  { id: "dusty-blue", name: "Dusty Blue", family: "Blue", hex: "#8eb9d6", mood: "coastal", season: "summer", match: "High" },
  { id: "navy", name: "Navy", family: "Blue", hex: "#1f324f", mood: "classic", season: "winter", match: "High" },
  { id: "rosewood", name: "Rosewood", family: "Pink", hex: "#9d5f68", mood: "romantic", season: "fall", match: "High" },
  { id: "english-rose", name: "English Rose", family: "Pink", hex: "#d7a0a6", mood: "romantic", season: "spring", match: "Good" },
  { id: "emerald", name: "Emerald", family: "Green", hex: "#1f6f5b", mood: "jewel", season: "winter", match: "High" },
  { id: "merlot", name: "Merlot", family: "Red", hex: "#6c1f2d", mood: "jewel", season: "fall", match: "High" },
  { id: "black", name: "Black", family: "Black", hex: "#111111", mood: "classic", season: "yearRound", match: "Good" },
  { id: "terracotta", name: "Terracotta", family: "Orange", hex: "#b9664c", mood: "romantic", season: "fall", match: "Medium" },
  { id: "sea-glass", name: "Sea Glass", family: "Blue", hex: "#a8d4cc", mood: "coastal", season: "summer", match: "High" },
];

const starterPalettes = [
  {
    name: "Garden Sage",
    mood: "garden" as Mood,
    colors: ["sage", "eucalyptus", "champagne", "ivory"],
    copy: "Soft green palette for outdoor ceremonies and garden receptions.",
  },
  {
    name: "Jewel Evening",
    mood: "jewel" as Mood,
    colors: ["emerald", "merlot", "navy", "black"],
    copy: "Formal jewel tones for evening, ballroom, and black-tie weddings.",
  },
  {
    name: "Soft Romance",
    mood: "romantic" as Mood,
    colors: ["rosewood", "english-rose", "champagne", "ivory"],
    copy: "Warm romantic palette for spring, coastal, and floral weddings.",
  },
  {
    name: "Modern Neutral",
    mood: "minimal" as Mood,
    colors: ["black", "pearl-gray", "champagne", "ivory"],
    copy: "Clean, elevated neutrals for minimal and editorial wedding design.",
  },
];

const bridalMembers = [
  { name: "Maya", role: "Maid of Honor", color: "Sage", dress: "Mira Chiffon Dress", status: "Approved" },
  { name: "Aisha", role: "Bridesmaid", color: "Eucalyptus", dress: "Azra Bondi Dress", status: "Needs approval" },
  { name: "Sofia", role: "Bridesmaid", color: "Champagne", dress: "Not assigned", status: "Needs dress" },
  { name: "Lina", role: "Bridesmaid", color: "Sage", dress: "Debra Convertible Dress", status: "Approved" },
];

const shoppableLooks = [
  {
    name: "Mira Chiffon Dress",
    color: "Sage",
    price: "$99",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop",
    fit: "High",
  },
  {
    name: "Azra Bondi Chiffon Dress",
    color: "Eucalyptus",
    price: "$99",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop",
    fit: "High",
  },
  {
    name: "Debra Convertible Dress",
    color: "Champagne",
    price: "$119",
    image: "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=900&auto=format&fit=crop",
    fit: "High",
  },
];

const moduleMap = [
  ["Style Engine", "Palette harmony, skin tone/color guidance, wedding mood, season, modesty and body-shape styling suggestions"],
  ["Bridal Party", "Shared palette board, member color assignment, dress coordination, approval status, invite/share workflow"],
  ["Catalog", "Color availability, fabric swatches, product colors, shoppable dresses and variants"],
  ["Swatches", "Order palette samples, verify fabric/color in person, connect swatches to board"],
  ["Recommendation Engine", "Ranks colors, dresses, swatches, and member assignments using palette, fit, style, and availability"],
  ["User Profile", "Skin tone, color preference, modesty preference, event style, saved palettes"],
  ["Orders", "Palette-to-cart flow, group order, swatch checkout, bridal party dress checkout"],
];

export default function ShahsiWeddingColorPaletteBuilderPage() {
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>(["sage", "eucalyptus", "champagne", "ivory"]);
  const [mood, setMood] = useState<Mood>("garden");
  const [season, setSeason] = useState<Season>("spring");
  const [paletteName, setPaletteName] = useState("Garden Sage Wedding");
  const [activeRole, setActiveRole] = useState<Role>("bridesmaid");

  const selectedColors = useMemo(() => colorOptions.filter((color) => selectedColorIds.includes(color.id)), [selectedColorIds]);
  const visibleColors = useMemo(() => colorOptions.filter((color) => color.mood === mood || color.season === season || selectedColorIds.includes(color.id)), [mood, season, selectedColorIds]);
  const styleScore = useMemo(() => {
    const highMatches = selectedColors.filter((color) => color.match === "High").length;
    return Math.min(98, 76 + highMatches * 5 + selectedColors.length * 2);
  }, [selectedColors]);

  function toggleColor(id: string) {
    setSelectedColorIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= 6 ? current : [...current, id]);
  }

  function applyStarter(colors: string[], nextMood: Mood, name: string) {
    setSelectedColorIds(colors);
    setMood(nextMood);
    setPaletteName(name);
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <Hero selectedColors={selectedColors} styleScore={styleScore} paletteName={paletteName} />
        <BuilderControls paletteName={paletteName} setPaletteName={setPaletteName} mood={mood} setMood={setMood} season={season} setSeason={setSeason} />

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="grid gap-8">
            <StarterPalettes applyStarter={applyStarter} />
            <ColorLibrary visibleColors={visibleColors} selectedColorIds={selectedColorIds} toggleColor={toggleColor} />
            <RoleAssignments activeRole={activeRole} setActiveRole={setActiveRole} selectedColors={selectedColors} />
            <ShoppablePaletteLooks />
          </div>

          <aside className="grid gap-8 xl:sticky xl:top-28 xl:self-start">
            <PalettePreview selectedColors={selectedColors} paletteName={paletteName} styleScore={styleScore} />
            <StyleEnginePanel selectedColors={selectedColors} mood={mood} season={season} styleScore={styleScore} />
            <BridalPartyBoard />
          </aside>
        </div>
      </section>

      <ViralShareFlow />
      <SwatchAndCheckoutFlow />
      <ModuleOwnership />
    </main>
  );
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Wedding Color Palette Builder</span>
        <span>Style Engine + Bridal Party coordination</span>
        <span>Create · share · swatch · shop</span>
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
          <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 sm:block">Palette builder</p>
        </div>
        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Builder</a>
          <a>Starter Palettes</a>
          <a>Assign Colors</a>
          <a>Swatches</a>
          <a>Share Board</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white"><Search className="h-4 w-4" /></button>
          <button className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white"><Share2 className="h-4 w-4" /> Share</button>
        </div>
      </div>
    </header>
  );
}

function Hero({ selectedColors, styleScore, paletteName }: { selectedColors: ColorOption[]; styleScore: number; paletteName: string }) {
  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid min-h-[680px] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">/palette-builder</p>
          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-7xl">Build a wedding palette your whole party can follow.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Create bridal palettes, validate color harmony, assign shades to bridesmaids, order swatches, and turn your board into a group dress order.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Start palette <ArrowRight className="h-4 w-4" /></button>
            <button className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Use Style Engine</button>
          </div>
        </div>
        <div className="relative min-h-[520px]">
          <div className="absolute inset-0 grid grid-cols-2">
            {selectedColors.slice(0, 4).map((color) => <div key={color.id} style={{ background: color.hex }} />)}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-neutral-950/10 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 rounded-[1.75rem] bg-white/90 p-5 text-neutral-950 shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Live palette</p>
            <h2 className="mt-2 text-2xl font-medium">{paletteName}</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {selectedColors.map((color) => <span key={color.id} className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm"><span className="h-7 w-7 rounded-full border border-neutral-200" style={{ background: color.hex }} /><span className="text-sm font-medium">{color.name}</span></span>)}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#fbfaf6] p-3 text-sm"><span>Style Engine harmony</span><strong>{styleScore}%</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuilderControls({ paletteName, setPaletteName, mood, setMood, season, setSeason }: { paletteName: string; setPaletteName: (value: string) => void; mood: Mood; setMood: (value: Mood) => void; season: Season; setSeason: (value: Season) => void }) {
  const moods: Array<[Mood, string]> = [["garden", "Garden"], ["classic", "Classic"], ["romantic", "Romantic"], ["jewel", "Jewel"], ["minimal", "Minimal"], ["coastal", "Coastal"]];
  const seasons: Array<[Season, string]> = [["spring", "Spring"], ["summer", "Summer"], ["fall", "Fall"], ["winter", "Winter"], ["yearRound", "Year-round"]];
  return (
    <section className="mt-8 rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr_1fr]">
        <label className="rounded-[1.5rem] bg-[#fbfaf6] p-4">
          <span className="text-xs uppercase tracking-[0.16em] text-neutral-500">Palette name</span>
          <input value={paletteName} onChange={(event) => setPaletteName(event.target.value)} className="mt-3 w-full bg-transparent text-2xl font-medium outline-none" />
        </label>
        <div>
          <p className="mb-3 text-sm font-medium">Wedding mood</p>
          <div className="flex flex-wrap gap-2">{moods.map(([id, label]) => <button key={id} onClick={() => setMood(id)} className={`rounded-full border px-4 py-2 text-sm font-medium ${mood === id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white"}`}>{label}</button>)}</div>
        </div>
        <div>
          <p className="mb-3 text-sm font-medium">Season</p>
          <select value={season} onChange={(event) => setSeason(event.target.value as Season)} className="w-full rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm font-medium">
            {seasons.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
}

function StarterPalettes({ applyStarter }: { applyStarter: (colors: string[], mood: Mood, name: string) => void }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader eyebrow="Starter palettes" title="Start from a proven wedding color story" copy="Use curated palettes to move quickly, then personalize with Style Engine guidance." />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {starterPalettes.map((palette) => (
          <button key={palette.name} onClick={() => applyStarter(palette.colors, palette.mood, palette.name)} className="rounded-[1.5rem] border border-neutral-200 bg-[#fbfaf6] p-5 text-left transition hover:border-neutral-950">
            <div className="mb-5 flex gap-2">{palette.colors.map((id) => { const color = colorOptions.find((item) => item.id === id)!; return <span key={id} className="h-12 w-12 rounded-full border border-neutral-200" style={{ background: color.hex }} />; })}</div>
            <h3 className="text-xl font-medium">{palette.name}</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{palette.copy}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function ColorLibrary({ visibleColors, selectedColorIds, toggleColor }: { visibleColors: ColorOption[]; selectedColorIds: string[]; toggleColor: (id: string) => void }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader eyebrow="Color library" title="Add or remove palette colors" copy="Select up to 6 colors. Shahsi recommends 3–5 colors for a cohesive bridal party palette." />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleColors.map((color) => {
          const selected = selectedColorIds.includes(color.id);
          return (
            <button key={color.id} onClick={() => toggleColor(color.id)} className={`rounded-[1.5rem] border p-4 text-left ${selected ? "border-neutral-950 bg-[#fbfaf6]" : "border-neutral-200"}`}>
              <div className="mb-4 flex items-center justify-between">
                <span className="h-14 w-14 rounded-full border border-neutral-200" style={{ background: color.hex }} />
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${selected ? "bg-neutral-950 text-white" : "bg-[#f7f2ea]"}`}>{selected ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}</span>
              </div>
              <p className="font-medium">{color.name}</p>
              <p className="mt-1 text-sm text-neutral-500">{color.family} · {color.match} match</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RoleAssignments({ activeRole, setActiveRole, selectedColors }: { activeRole: Role; setActiveRole: (role: Role) => void; selectedColors: ColorOption[] }) {
  const roles: Array<[Role, string]> = [["bride", "Bride"], ["maidOfHonor", "Maid of Honor"], ["bridesmaid", "Bridesmaids"], ["mother", "Mothers"], ["guest", "Guests"]];
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader eyebrow="Group style coordination" title="Assign colors by wedding role" copy="This is where the palette builder becomes a Bridal Party coordination tool, not just a mood board." />
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {roles.map(([id, label]) => <button key={id} onClick={() => setActiveRole(id)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${activeRole === id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white"}`}>{label}</button>)}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {selectedColors.slice(0, 4).map((color, index) => (
          <div key={color.id} className="rounded-[1.5rem] border border-neutral-200 p-5">
            <div className="mb-4 flex items-center gap-3"><span className="h-12 w-12 rounded-full border border-neutral-200" style={{ background: color.hex }} /><div><p className="font-medium">{color.name}</p><p className="text-sm text-neutral-500">Assigned to {activeRoleLabel(activeRole)} group {index + 1}</p></div></div>
            <div className="grid gap-2"><LightRow label="Dress match" value="Available" /><LightRow label="Swatch" value="Order ready" /><LightRow label="Approval" value={index % 2 === 0 ? "Approved" : "Pending"} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShoppablePaletteLooks() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionHeader eyebrow="Shoppable palette" title="Dresses that match this board" copy="Recommendation Engine turns palette colors into real product suggestions and group-order actions." />
        <button className="inline-flex items-center gap-2 rounded-full border border-neutral-950 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em]">Shop all <ArrowRight className="h-4 w-4" /></button>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {shoppableLooks.map((look) => (
          <article key={look.name} className="overflow-hidden rounded-[1.5rem] bg-[#fbfaf6]">
            <img src={look.image} alt={look.name} className="aspect-[4/5] w-full object-cover" />
            <div className="p-4">
              <h3 className="font-medium">{look.name}</h3>
              <p className="mt-1 text-sm text-neutral-500">{look.color} · {look.price} · {look.fit} fit</p>
              <button className="mt-4 w-full rounded-full bg-neutral-950 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">Assign dress</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PalettePreview({ selectedColors, paletteName, styleScore }: { selectedColors: ColorOption[]; paletteName: string; styleScore: number }) {
  return (
    <section className="rounded-[1.75rem] bg-neutral-950 p-5 text-white shadow-sm md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">Palette preview</p>
      <h2 className="mt-2 text-3xl font-medium tracking-tight">{paletteName}</h2>
      <div className="mt-6 overflow-hidden rounded-[1.5rem]">
        <div className="grid h-48 grid-cols-2">
          {selectedColors.slice(0, 4).map((color) => <div key={color.id} style={{ background: color.hex }} />)}
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        <DarkRow label="Colors" value={`${selectedColors.length}`} />
        <DarkRow label="Harmony score" value={`${styleScore}%`} />
        <DarkRow label="Swatch status" value="Ready" />
        <DarkRow label="Share status" value="Private link" />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button className="inline-flex items-center justify-center gap-2 rounded-full bg-white py-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-950"><Share2 className="h-4 w-4" /> Share</button>
        <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white"><Download className="h-4 w-4" /> Export</button>
      </div>
    </section>
  );
}

function StyleEnginePanel({ selectedColors, mood, season, styleScore }: { selectedColors: ColorOption[]; mood: Mood; season: Season; styleScore: number }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <div className="mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5" /><h2 className="text-xl font-medium">Style Engine guidance</h2></div>
      <div className="grid gap-3">
        <LightRow label="Palette harmony" value={`${styleScore}%`} />
        <LightRow label="Mood" value={capitalize(mood)} />
        <LightRow label="Season" value={season === "yearRound" ? "Year-round" : capitalize(season)} />
        <LightRow label="Best fabric" value="Chiffon + matte satin" />
        <LightRow label="Color risk" value={selectedColors.length > 5 ? "Too many colors" : "Balanced"} />
      </div>
      <div className="mt-5 rounded-2xl bg-[#f7f2ea] p-4 text-sm leading-6 text-neutral-700">
        <strong>Guidance:</strong> Keep one dominant color, one supporting color, one neutral, and one optional accent for the cleanest bridal party look.
      </div>
    </section>
  );
}

function BridalPartyBoard() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <div className="mb-4 flex items-center gap-2"><Users className="h-5 w-5" /><h2 className="text-xl font-medium">Bridal Party board</h2></div>
      <div className="grid gap-3">
        {bridalMembers.map((member) => (
          <div key={member.name} className="rounded-2xl bg-[#fbfaf6] p-4">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-medium">{member.name}</p><p className="text-sm text-neutral-500">{member.role}</p></div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium">{member.status}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm"><span>{member.color}</span><strong>{member.dress}</strong></div>
          </div>
        ))}
      </div>
      <button className="mt-5 w-full rounded-full border border-neutral-950 py-3 text-xs font-semibold uppercase tracking-[0.14em]">Invite party</button>
    </section>
  );
}

function ViralShareFlow() {
  return (
    <section className="bg-[#f7f2ea] py-14">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Viral sharing feature</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Make palettes easy to share, save, and copy.</h2>
          <p className="mt-4 leading-7 text-neutral-600">This page can become a viral acquisition loop when users share palette boards before they are ready to buy dresses.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <FlowStep icon={<Palette className="h-5 w-5" />} title="Create" copy="Build palette" />
          <FlowStep icon={<Copy className="h-5 w-5" />} title="Copy" copy="Duplicate board" />
          <FlowStep icon={<Share2 className="h-5 w-5" />} title="Share" copy="Send to party" />
          <FlowStep icon={<ShoppingBag className="h-5 w-5" />} title="Shop" copy="Convert to order" />
        </div>
      </div>
    </section>
  );
}

function SwatchAndCheckoutFlow() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-14 lg:px-8">
      <div className="grid gap-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Swatch + checkout path</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">From palette to swatches to group order.</h2>
          <p className="mt-4 leading-7 text-neutral-600">A strong palette builder should connect directly into swatch ordering, collection filters, product pages, and bridal party checkout.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white"><SwatchBook className="h-4 w-4" /> Order swatches</button>
            <button className="rounded-full border border-neutral-950 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em]">Shop dresses</button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard icon={<SwatchBook className="h-5 w-5" />} title="Swatches" copy="Order samples for every selected color." />
          <InfoCard icon={<ShoppingBag className="h-5 w-5" />} title="Collections" copy="Filter dresses by board colors." />
          <InfoCard icon={<Users className="h-5 w-5" />} title="Bridal party" copy="Assign colors and track approvals." />
          <InfoCard icon={<Wand2 className="h-5 w-5" />} title="Recommendations" copy="Rank dresses by palette and fit." />
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
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Palette Builder module map.</h2>
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

function LightRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#fbfaf6] p-4 text-sm"><span className="text-neutral-600">{label}</span><strong className="text-right">{value}</strong></div>;
}

function DarkRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 p-4 text-sm"><span className="text-white/65">{label}</span><strong className="text-right">{value}</strong></div>;
}

function FlowStep({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm ring-1 ring-neutral-200"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f2ea]">{icon}</div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-neutral-500">{copy}</p></div>;
}

function InfoCard({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-[1.5rem] bg-[#fbfaf6] p-5"><div className="mb-3 flex items-center gap-2">{icon}<p className="font-medium">{title}</p></div><p className="text-sm leading-6 text-neutral-600">{copy}</p></div>;
}

function activeRoleLabel(role: Role) {
  if (role === "maidOfHonor") return "maid of honor";
  if (role === "bridesmaid") return "bridesmaid";
  if (role === "mother") return "mother";
  return role;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}


