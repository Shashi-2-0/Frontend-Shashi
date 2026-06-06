"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  Heart,
  Image,
  MapPin,
  Palette,
  Search,
  Share2,
  ShoppingBag,
  Sparkles,
  Star,
  SwatchBook,
  Users,
  Wand2,
} from "lucide-react";

type Season = "all" | "spring" | "summer" | "fall" | "winter";
type PaletteFilter = "all" | "sage" | "champagne" | "jewel" | "rose" | "neutral";
type Venue = "all" | "garden" | "beach" | "ballroom" | "estate" | "city";

type Wedding = {
  id: string;
  couple: string;
  location: string;
  season: Exclude<Season, "all">;
  venue: Exclude<Venue, "all">;
  palette: Exclude<PaletteFilter, "all">;
  paletteName: string;
  dress: string;
  color: string;
  bridesmaids: number;
  quote: string;
  image: string;
  gallery: string[];
  colors: string[];
  fitConfidence: string;
};

const weddings: Wedding[] = [
  {
    id: "w1",
    couple: "Sofia & Daniel",
    location: "Hudson Valley, NY",
    season: "summer",
    venue: "garden",
    palette: "sage",
    paletteName: "Garden Sage",
    dress: "Mira Chiffon Dress",
    color: "Sage",
    bridesmaids: 4,
    quote: "The sage palette looked soft, modern, and photographed beautifully outside.",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1400&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=900&auto=format&fit=crop",
    ],
    colors: ["#9ba88f", "#89a08f", "#d8c4a2", "#eee8dc"],
    fitConfidence: "High",
  },
  {
    id: "w2",
    couple: "Amina & Kareem",
    location: "Newport, RI",
    season: "fall",
    venue: "estate",
    palette: "champagne",
    paletteName: "Champagne Estate",
    dress: "Debra Convertible Dress",
    color: "Champagne",
    bridesmaids: 6,
    quote: "The champagne tones made every skin tone look elegant and cohesive.",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1400&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=900&auto=format&fit=crop",
    ],
    colors: ["#d8c4a2", "#eee8dc", "#b9b7ad", "#111111"],
    fitConfidence: "High",
  },
  {
    id: "w3",
    couple: "Lina & Mateo",
    location: "Miami, FL",
    season: "winter",
    venue: "ballroom",
    palette: "jewel",
    paletteName: "Jewel Evening",
    dress: "Sorrel Stretch Satin Dress",
    color: "Emerald + Merlot",
    bridesmaids: 5,
    quote: "The jewel tones made the evening feel formal without being heavy.",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1400&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?q=80&w=900&auto=format&fit=crop",
    ],
    colors: ["#1f6f5b", "#6c1f2d", "#111111", "#1f324f"],
    fitConfidence: "Medium",
  },
  {
    id: "w4",
    couple: "Maya & Theo",
    location: "Santa Barbara, CA",
    season: "spring",
    venue: "beach",
    palette: "rose",
    paletteName: "Soft Romance",
    dress: "Valentine Floral Burnout Dress",
    color: "Rosewood",
    bridesmaids: 3,
    quote: "The rose palette felt romantic, light, and perfect for the coast.",
    image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=1400&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=900&auto=format&fit=crop",
    ],
    colors: ["#d7a0a6", "#9d5f68", "#eee8dc", "#d8c4a2"],
    fitConfidence: "High",
  },
];

const ugcTiles = [
  ["#ShahsiBride", "Garden ceremony", "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=900&auto=format&fit=crop"],
  ["#GownloopGuest", "Rented satin gown", "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop"],
  ["#ShahsiPalette", "Sage swatch board", "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=900&auto=format&fit=crop"],
  ["#RealWedding", "Champagne bridesmaids", "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=900&auto=format&fit=crop"],
  ["#ShahsiFit", "Smart Fit success", "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop"],
  ["#BridalParty", "Coordinated order", "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=900&auto=format&fit=crop"],
];

const moduleMap = [
  ["UGC / Social Proof", "Real wedding cards, customer quotes, image galleries, user-generated content submissions"],
  ["Style Engine", "Palette validation, color harmony, wedding mood guidance, skin tone/color confidence"],
  ["Catalog", "Linked dresses, colors, fabrics, products, swatches, shoppable edits"],
  ["Bridal Party", "Wedding workspace, member count, group order proof, shared palette coordination"],
  ["Recommendation Engine", "Similar weddings, shoppable looks, palette-to-product ranking, conversion paths"],
  ["Swatches", "Palette boards, color samples, validation before dress checkout"],
];

export default function ShahsiRealWeddingsGalleryPage() {
  const [season, setSeason] = useState<Season>("all");
  const [palette, setPalette] = useState<PaletteFilter>("all");
  const [venue, setVenue] = useState<Venue>("all");
  const [selectedWedding, setSelectedWedding] = useState<Wedding>(weddings[0]);

  const visibleWeddings = useMemo(() => weddings.filter((wedding) => {
    const seasonMatch = season === "all" || wedding.season === season;
    const paletteMatch = palette === "all" || wedding.palette === palette;
    const venueMatch = venue === "all" || wedding.venue === venue;
    return seasonMatch && paletteMatch && venueMatch;
  }), [season, palette, venue]);

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <Hero selectedWedding={selectedWedding} />
        <SocialProofStrip />
        <FilterBar season={season} setSeason={setSeason} palette={palette} setPalette={setPalette} venue={venue} setVenue={setVenue} />

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <WeddingGrid weddings={visibleWeddings} selectedWedding={selectedWedding} setSelectedWedding={setSelectedWedding} />
          <aside className="xl:sticky xl:top-28 xl:self-start">
            <WeddingDetail wedding={selectedWedding} />
          </aside>
        </div>
      </section>

      <PaletteValidation />
      <UGCGallery />
      <SubmitWedding />
      <ModuleOwnership />
    </main>
  );
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Real weddings</span>
        <span>Social proof · UGC · palette validation</span>
        <span>Shop looks from real Shahsi events</span>
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
          <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 sm:block">Real weddings gallery</p>
        </div>
        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Gallery</a>
          <a>Palettes</a>
          <a>Bridesmaids</a>
          <a>UGC</a>
          <a>Submit Wedding</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white"><Search className="h-4 w-4" /></button>
          <button className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">Submit photos</button>
        </div>
      </div>
    </header>
  );
}

function Hero({ selectedWedding }: { selectedWedding: Wedding }) {
  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid min-h-[680px] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">/real-weddings</p>
          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-7xl">See Shahsi colors, dresses, and palettes in real weddings.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Browse real wedding galleries for social proof, user-generated inspiration, palette validation, and shoppable bridal party looks.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Explore weddings <ArrowRight className="h-4 w-4" /></button>
            <button className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Shop this palette</button>
          </div>
        </div>
        <div className="relative min-h-[520px]">
          <img src={selectedWedding.image} alt={selectedWedding.couple} className="h-full w-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-neutral-950/10 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 rounded-[1.75rem] bg-white/90 p-5 text-neutral-950 shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Featured wedding</p>
            <h2 className="mt-2 text-2xl font-medium">{selectedWedding.couple}</h2>
            <p className="mt-1 text-sm text-neutral-600">{selectedWedding.location} · {selectedWedding.paletteName}</p>
            <div className="mt-4 flex gap-2">
              {selectedWedding.colors.map((color) => <span key={color} className="h-9 w-9 rounded-full border border-neutral-200" style={{ background: color }} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialProofStrip() {
  return (
    <section className="mt-8 grid gap-4 md:grid-cols-4">
      <MetricCard icon={<Camera className="h-5 w-5" />} title="Real galleries" value="120+ weddings" />
      <MetricCard icon={<Users className="h-5 w-5" />} title="Bridal parties" value="Verified looks" />
      <MetricCard icon={<Palette className="h-5 w-5" />} title="Palette validation" value="Real lighting" />
      <MetricCard icon={<Star className="h-5 w-5" />} title="Social proof" value="UGC ready" />
    </section>
  );
}

function MetricCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#f7f2ea]">{icon}</div><p className="text-sm text-neutral-500">{title}</p><p className="mt-1 text-xl font-medium">{value}</p></div>;
}

function FilterBar({ season, setSeason, palette, setPalette, venue, setVenue }: { season: Season; setSeason: (v: Season) => void; palette: PaletteFilter; setPalette: (v: PaletteFilter) => void; venue: Venue; setVenue: (v: Venue) => void }) {
  const seasons: Array<[Season, string]> = [["all", "All seasons"], ["spring", "Spring"], ["summer", "Summer"], ["fall", "Fall"], ["winter", "Winter"]];
  const palettes: Array<[PaletteFilter, string]> = [["all", "All palettes"], ["sage", "Sage"], ["champagne", "Champagne"], ["jewel", "Jewel"], ["rose", "Rose"], ["neutral", "Neutral"]];
  const venues: Array<[Venue, string]> = [["all", "All venues"], ["garden", "Garden"], ["beach", "Beach"], ["ballroom", "Ballroom"], ["estate", "Estate"], ["city", "City"]];
  return (
    <section className="mt-10 rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-neutral-200">
      <div className="grid gap-4 lg:grid-cols-3">
        <FilterGroup options={seasons} value={season} setValue={setSeason} />
        <FilterGroup options={palettes} value={palette} setValue={setPalette} />
        <FilterGroup options={venues} value={venue} setValue={setVenue} />
      </div>
    </section>
  );
}

function FilterGroup({ options, value, setValue }: { options: any[]; value: string; setValue: (value: any) => void }) {
  return <div className="flex gap-2 overflow-x-auto pb-1">{options.map(([id, label]) => <button key={id} onClick={() => setValue(id)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${value === id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white"}`}>{label}</button>)}</div>;
}

function WeddingGrid({ weddings, selectedWedding, setSelectedWedding }: { weddings: Wedding[]; selectedWedding: Wedding; setSelectedWedding: (wedding: Wedding) => void }) {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      {weddings.map((wedding) => (
        <article key={wedding.id} onClick={() => setSelectedWedding(wedding)} className={`group cursor-pointer overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 transition hover:-translate-y-0.5 ${selectedWedding.id === wedding.id ? "ring-neutral-950" : "ring-neutral-200"}`}>
          <div className="relative overflow-hidden">
            <img src={wedding.image} alt={wedding.couple} className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
            <button className="absolute right-3 top-3 rounded-full bg-white/90 p-3 shadow-sm backdrop-blur"><Heart className="h-4 w-4" /></button>
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">Real Wedding</span>
          </div>
          <div className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">{wedding.season} · {wedding.venue}</p>
            <h3 className="mt-2 text-2xl font-medium">{wedding.couple}</h3>
            <p className="mt-1 text-sm text-neutral-500">{wedding.location}</p>
            <div className="mt-4 flex gap-2">{wedding.colors.map((color) => <span key={color} className="h-8 w-8 rounded-full border border-neutral-200" style={{ background: color }} />)}</div>
            <p className="mt-4 text-sm leading-6 text-neutral-600">“{wedding.quote}”</p>
          </div>
        </article>
      ))}
    </section>
  );
}

function WeddingDetail({ wedding }: { wedding: Wedding }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Selected wedding</p>
      <h2 className="mt-2 text-3xl font-medium tracking-tight">{wedding.couple}</h2>
      <p className="mt-1 flex items-center gap-2 text-sm text-neutral-500"><MapPin className="h-4 w-4" />{wedding.location}</p>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
        <Mini label="Bridesmaids" value={`${wedding.bridesmaids}`} />
        <Mini label="Palette" value={wedding.paletteName} />
        <Mini label="Fit" value={wedding.fitConfidence} tone={wedding.fitConfidence === "High" ? "success" : "neutral"} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {wedding.gallery.map((image) => <img key={image} src={image} alt="Wedding gallery" className="aspect-square rounded-2xl object-cover" />)}
      </div>

      <div className="mt-6 rounded-[1.5rem] bg-[#f7f2ea] p-5">
        <div className="mb-4 flex items-center gap-2"><Palette className="h-5 w-5" /><h3 className="font-medium">Palette validation</h3></div>
        <div className="mb-4 flex gap-2">{wedding.colors.map((color) => <span key={color} className="h-10 w-10 rounded-full border border-neutral-200" style={{ background: color }} />)}</div>
        <p className="text-sm leading-6 text-neutral-600">This real wedding validates how {wedding.paletteName} photographs in {wedding.venue} lighting and pairs with {wedding.dress}.</p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button className="rounded-full bg-neutral-950 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Shop look</button>
        <button className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-950 py-4 text-sm font-semibold uppercase tracking-[0.16em]"><Share2 className="h-4 w-4" /> Share</button>
      </div>
    </section>
  );
}

function PaletteValidation() {
  return (
    <section className="bg-[#f7f2ea] py-14">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Palette validation</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Real photos make color decisions easier.</h2>
          <p className="mt-4 leading-7 text-neutral-600">Real Weddings turns social proof into practical color confidence by showing palettes across seasons, venues, skin tones, and lighting conditions.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <FlowStep icon={<Palette className="h-5 w-5" />} title="See palette" copy="Real-world color" />
          <FlowStep icon={<SwatchBook className="h-5 w-5" />} title="Order swatches" copy="Verify fabric" />
          <FlowStep icon={<ShoppingBag className="h-5 w-5" />} title="Shop dresses" copy="Apply colors" />
          <FlowStep icon={<Users className="h-5 w-5" />} title="Assign party" copy="Coordinate order" />
        </div>
      </div>
    </section>
  );
}

function UGCGallery() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-14 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionHeader eyebrow="UGC gallery" title="Loved by real brides, guests, and bridal parties." copy="UGC builds trust and gives shoppers proof that Shahsi colors, fit, and group coordination work in real life." />
        <button className="rounded-full border border-neutral-950 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em]">Submit photo</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ugcTiles.map(([tag, caption, image]) => <article key={caption} className="group relative min-h-[420px] overflow-hidden rounded-[1.75rem] bg-neutral-100"><img src={image} alt={caption} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" /><div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" /><div className="absolute bottom-0 left-0 right-0 p-5 text-white"><p className="text-xs uppercase tracking-[0.18em] text-white/60">{tag}</p><h3 className="mt-2 text-2xl font-medium">{caption}</h3></div></article>)}
      </div>
    </section>
  );
}

function SubmitWedding() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 pb-14 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] bg-neutral-950 p-6 text-white md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/50">Submit your wedding</p>
            <h2 className="mt-3 text-4xl font-medium tracking-tight">Share your Shahsi wedding story.</h2>
            <p className="mt-4 max-w-3xl leading-7 text-white/70">Invite customers to submit photos, palette details, dress links, venue info, and fit feedback for social proof and future shoppers.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Upload photos</button>
            <button className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">View guidelines</button>
          </div>
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
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Real Weddings module map.</h2>
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

function Mini({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "success" | "neutral" }) {
  return <div className="rounded-xl bg-[#f7f2ea] p-3"><p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">{label}</p><p className={`font-semibold ${tone === "success" ? "text-emerald-700" : "text-neutral-950"}`}>{value}</p></div>;
}

function FlowStep({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm ring-1 ring-neutral-200"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f2ea]">{icon}</div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-neutral-500">{copy}</p></div>;
}

