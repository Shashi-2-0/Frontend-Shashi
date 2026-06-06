"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Heart,
  Info,
  Package,
  Palette,
  Ruler,
  Search,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  Users,
  Wand2,
} from "lucide-react";

type FitZone = "good" | "fitted" | "roomy" | "warning";
type AccordionKey = "why" | "measurements" | "rental" | "style";

const measurementData = {
  bust: { user: 36, garment: 38, ease: 2, fit: "Good", zone: "good" as FitZone },
  waist: { user: 29, garment: 30.5, ease: 1.5, fit: "Fitted", zone: "fitted" as FitZone },
  hip: { user: 39, garment: 42, ease: 3, fit: "Good", zone: "good" as FitZone },
};

const alternativeSizes = [
  {
    size: "S / A6",
    confidence: "Medium",
    reason: "Better for a closer waist fit, but may feel snug through bust and hip.",
  },
  {
    size: "M / A8",
    confidence: "High",
    reason: "Best balance across bust, waist, hip, length, and comfort preference.",
  },
  {
    size: "L / A10",
    confidence: "High backup",
    reason: "Safer for rental or if you prefer relaxed waist and hip ease.",
  },
];

const recommendedProducts = [
  {
    name: "Mira Chiffon Dress",
    price: "$99",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop",
    fit: "High",
    size: "M",
  },
  {
    name: "Azra Bondi Chiffon Dress",
    price: "$99",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop",
    fit: "High",
    size: "A8",
  },
  {
    name: "Debra Convertible Dress",
    price: "$119",
    image: "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=900&auto=format&fit=crop",
    fit: "High",
    size: "A8",
  },
];

const moduleMap = [
  ["Fit Engine", "Recommended size, confidence, bust/waist/hip fit, ease, length guidance, backup size warnings"],
  ["Recommendation Engine", "Combines fit score, style score, product availability, rental risk, and feedback signals"],
  ["User Profile", "Saved bust, waist, hip, height, fit preference, modesty preference, color preferences"],
  ["Rental", "Uses stricter confidence rules and backup size guidance to reduce bad-fit shipments"],
  ["Catalog", "Garment measurements, fabric stretch, fit type, size chart, length data"],
  ["Returns Feedback", "Previous fit outcomes adjust confidence and future size ranking"],
];

export default function ShahsiSmartSizeRecommendationPage() {
  const [openAccordion, setOpenAccordion] = useState<AccordionKey>("why");
  const [selectedUseCase, setSelectedUseCase] = useState<"buy" | "rent" | "bridal">("buy");

  const confidenceScore = useMemo(() => {
    if (selectedUseCase === "rent") return 91;
    if (selectedUseCase === "bridal") return 94;
    return 96;
  }, [selectedUseCase]);

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <Hero confidenceScore={confidenceScore} selectedUseCase={selectedUseCase} setSelectedUseCase={setSelectedUseCase} />

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-8">
            <RecommendedSizeCard confidenceScore={confidenceScore} selectedUseCase={selectedUseCase} />
            <FitBreakdown />
            <LengthGuidance />
            <AlternativeSize />
            <RecommendationReasoning openAccordion={openAccordion} setOpenAccordion={setOpenAccordion} />
          </div>

          <aside className="grid gap-8 xl:sticky xl:top-28 xl:self-start">
            <ConfidenceCard confidenceScore={confidenceScore} />
            <RentalWarnings selectedUseCase={selectedUseCase} />
            <StyleExplanation />
            <NextActions selectedUseCase={selectedUseCase} />
          </aside>
        </div>
      </section>

      <RecommendedProducts />
      <ModuleOwnership />
    </main>
  );
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Smart Size Recommendation</span>
        <span>Fit Engine + Recommendation Engine</span>
        <span>Reduce returns with confidence scoring</span>
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
          <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 sm:block">Smart fit recommendation</p>
        </div>
        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Recommendation</a>
          <a>Fit Breakdown</a>
          <a>Rental Safety</a>
          <a>Style Match</a>
          <a>Shop Results</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white"><Search className="h-4 w-4" /></button>
          <button className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">Save result</button>
        </div>
      </div>
    </header>
  );
}

function Hero({ confidenceScore, selectedUseCase, setSelectedUseCase }: { confidenceScore: number; selectedUseCase: "buy" | "rent" | "bridal"; setSelectedUseCase: (value: "buy" | "rent" | "bridal") => void }) {
  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">/fit-results</p>
          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-6xl">Your best size is M / A8.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Shahsi explains why this size is recommended, where it fits well, where it may feel fitted, and what backup size is safest for rental or bridal group orders.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Shop recommended size <ArrowRight className="h-4 w-4" /></button>
            <button className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Update fit profile</button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <HeroMetric icon={<Sparkles className="h-4 w-4" />} label="Confidence" value={`${confidenceScore}%`} />
          <HeroMetric icon={<Ruler className="h-4 w-4" />} label="Recommended size" value="M / A8" />
          <HeroMetric icon={<Package className="h-4 w-4" />} label="Backup size" value="L / A10" />
          <HeroMetric icon={<Palette className="h-4 w-4" />} label="Style match" value="High" />
        </div>
      </div>

      <div className="border-t border-white/10 p-4 md:px-10 md:py-5">
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            ["buy", "Buying", <ShoppingBag className="h-4 w-4" />],
            ["rent", "Rental safety", <Package className="h-4 w-4" />],
            ["bridal", "Bridal party", <Users className="h-4 w-4" />],
          ].map(([key, label, icon]) => (
            <button
              key={String(key)}
              onClick={() => setSelectedUseCase(key as "buy" | "rent" | "bridal")}
              className={`flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition ${selectedUseCase === key ? "bg-white text-neutral-950" : "bg-white/10 text-white hover:bg-white/15"}`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl bg-white/10 p-5 backdrop-blur"><div className="mb-3 flex items-center gap-2 text-white/75">{icon}<span className="text-xs uppercase tracking-[0.14em]">{label}</span></div><p className="text-2xl font-medium">{value}</p></div>;
}

function RecommendedSizeCard({ confidenceScore, selectedUseCase }: { confidenceScore: number; selectedUseCase: string }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader eyebrow="Recommended size" title="M / A8 is the best match" copy="This result balances body measurements, garment measurements, fabric behavior, preferred fit, height, and previous feedback signals." />
      <div className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[1.5rem] bg-neutral-950 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Final size</p>
          <p className="mt-3 text-6xl font-medium tracking-tight">M</p>
          <p className="mt-2 text-white/70">Equivalent: A8</p>
          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <p className="text-sm text-white/65">Confidence score</p>
            <p className="mt-1 text-3xl font-medium">{confidenceScore}%</p>
          </div>
        </div>
        <div className="grid gap-3">
          <ResultRow icon={<CheckCircle2 className="h-4 w-4" />} title="Best overall fit" copy="Bust, waist, and hip all fall within safe ease ranges for this garment." />
          <ResultRow icon={<Ruler className="h-4 w-4" />} title="Length guidance included" copy="Floor length works best with heels. Petite users should review length warning." />
          <ResultRow icon={<Package className="h-4 w-4" />} title={selectedUseCase === "rent" ? "Rental-safe recommendation" : "Backup size available"} copy="L / A10 is recommended as a comfort or rental backup size." />
        </div>
      </div>
    </section>
  );
}

function ConfidenceCard({ confidenceScore }: { confidenceScore: number }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <div className="mb-5 flex items-center gap-2"><Sparkles className="h-5 w-5" /><h2 className="text-xl font-medium">Confidence score</h2></div>
      <div className="relative mx-auto flex h-44 w-44 items-center justify-center rounded-full bg-[#f7f2ea]">
        <div className="absolute inset-3 rounded-full border-[14px] border-neutral-950" />
        <div className="relative text-center">
          <p className="text-5xl font-medium">{confidenceScore}</p>
          <p className="text-sm text-neutral-500">out of 100</p>
        </div>
      </div>
      <p className="mt-5 text-center text-sm leading-6 text-neutral-600">High confidence because your saved measurements are complete and match garment measurement data.</p>
    </section>
  );
}

function FitBreakdown() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader eyebrow="Bust / waist / hip fit" title="Fit breakdown" copy="The Fit Engine compares your profile against garment measurements and fabric stretch to classify each body zone." />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <FitZoneCard label="Bust" data={measurementData.bust} />
        <FitZoneCard label="Waist" data={measurementData.waist} />
        <FitZoneCard label="Hip" data={measurementData.hip} />
      </div>
    </section>
  );
}

function FitZoneCard({ label, data }: { label: string; data: { user: number; garment: number; ease: number; fit: string; zone: FitZone } }) {
  return (
    <div className="rounded-[1.5rem] border border-neutral-200 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-medium">{label}</h3>
        <ZoneBadge zone={data.zone}>{data.fit}</ZoneBadge>
      </div>
      <div className="grid gap-3 text-sm">
        <LightRow label="Your measurement" value={`${data.user} in`} />
        <LightRow label="Garment" value={`${data.garment} in`} />
        <LightRow label="Ease" value={`+${data.ease} in`} />
      </div>
    </div>
  );
}

function ZoneBadge({ zone, children }: { zone: FitZone; children: React.ReactNode }) {
  const className = zone === "good" ? "bg-emerald-50 text-emerald-700" : zone === "fitted" ? "bg-amber-50 text-amber-700" : zone === "warning" ? "bg-red-50 text-red-700" : "bg-neutral-100 text-neutral-700";
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>{children}</span>;
}

function LengthGuidance() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader eyebrow="Length guidance" title="Floor length with heel guidance" copy="Length calculation uses your height, garment length, heel preference, and silhouette type." />
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <MetricBox label="Your height" value="5'6\" />
        <MetricBox label="Garment length" value="61 in" />
        <MetricBox label="Predicted fall" value="Floor" />
      </div>
      <div className="mt-5 flex gap-3 rounded-2xl bg-[#f7f2ea] p-4 text-sm text-neutral-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Recommended with 2–3 inch heels. If you prefer flats, consider hemming or petite length where available.</p>
      </div>
    </section>
  );
}

function AlternativeSize() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader eyebrow="Alternative size" title="When to choose another size" copy="Alternative sizes are not mistakes. They depend on comfort preference, rental safety, and silhouette risk." />
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {alternativeSizes.map((item) => (
          <div key={item.size} className={`rounded-[1.5rem] border p-5 ${item.size === "M / A8" ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200"}`}>
            <p className="text-sm opacity-70">Size</p>
            <h3 className="mt-1 text-2xl font-medium">{item.size}</h3>
            <p className="mt-3 text-sm font-medium">{item.confidence}</p>
            <p className={`mt-3 text-sm leading-6 ${item.size === "M / A8" ? "text-white/70" : "text-neutral-600"}`}>{item.reason}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RentalWarnings({ selectedUseCase }: { selectedUseCase: string }) {
  return (
    <section className={`rounded-[1.75rem] p-5 shadow-sm md:p-6 ${selectedUseCase === "rent" ? "bg-amber-50 ring-1 ring-amber-200" : "bg-white ring-1 ring-neutral-200"}`}>
      <div className="mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-700" /><h2 className="text-xl font-medium">Rental warnings</h2></div>
      <div className="grid gap-3 text-sm">
        <WarningRow label="Backup size" value="L / A10 recommended" />
        <WarningRow label="Waist fit" value="Fitted, not tight" />
        <WarningRow label="Length" value="Review heel height" />
        <WarningRow label="Return risk" value="Low" />
      </div>
      <p className="mt-4 text-sm leading-6 text-neutral-700">For rental, confidence threshold is stricter. If event movement or all-day comfort matters, reserve the backup size.</p>
    </section>
  );
}

function StyleExplanation() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <div className="mb-4 flex items-center gap-2"><Palette className="h-5 w-5" /><h2 className="text-xl font-medium">Style explanation</h2></div>
      <div className="grid gap-3">
        <LightRow label="Color match" value="High" />
        <LightRow label="Modesty match" value="Good" />
        <LightRow label="Body-shape guidance" value="A-line recommended" />
      </div>
      <p className="mt-4 text-sm leading-6 text-neutral-600">The recommended styles favor soft waist definition, A-line movement, and colors that work with your saved neutral/warm preference profile.</p>
    </section>
  );
}

function NextActions({ selectedUseCase }: { selectedUseCase: string }) {
  const label = selectedUseCase === "rent" ? "Reserve recommended size" : selectedUseCase === "bridal" ? "Apply to bridal party" : "Shop recommended size";
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <h2 className="text-xl font-medium">Next step</h2>
      <p className="mt-3 text-sm leading-6 text-neutral-600">Save this recommendation to your profile and apply it across product pages, bridal party orders, rental reservations, and subscription curation.</p>
      <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">{label} <ArrowRight className="h-4 w-4" /></button>
    </section>
  );
}

function RecommendationReasoning({ openAccordion, setOpenAccordion }: { openAccordion: AccordionKey; setOpenAccordion: (value: AccordionKey) => void }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader eyebrow="Recommendation reasoning" title="Why Shahsi chose this size" copy="Transparent explanations increase trust and reduce returns." />
      <div className="mt-6 divide-y divide-neutral-200">
        <Accordion id="why" title="Why M / A8?" open={openAccordion} setOpen={setOpenAccordion}>
          <p className="text-sm leading-6 text-neutral-700">M / A8 has the best combined score across bust ease, waist ease, hip ease, garment length, body-shape compatibility, and preferred true-to-size fit.</p>
        </Accordion>
        <Accordion id="measurements" title="Measurement logic" open={openAccordion} setOpen={setOpenAccordion}>
          <p className="text-sm leading-6 text-neutral-700">The Fit Engine compares saved body measurements to garment measurements and applies fabric stretch and fit-type rules.</p>
        </Accordion>
        <Accordion id="rental" title="Rental safety logic" open={openAccordion} setOpen={setOpenAccordion}>
          <p className="text-sm leading-6 text-neutral-700">Rental recommendations prioritize high-confidence fit and comfort. Backup size L / A10 is recommended when comfort risk matters.</p>
        </Accordion>
        <Accordion id="style" title="Style explanation" open={openAccordion} setOpen={setOpenAccordion}>
          <p className="text-sm leading-6 text-neutral-700">Style signals favor A-line silhouettes, soft waist shaping, and color families aligned with your saved preference profile.</p>
        </Accordion>
      </div>
    </section>
  );
}

function RecommendedProducts() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Recommended products</p>
            <h2 className="mt-3 text-4xl font-medium tracking-tight">Shop styles in your best size.</h2>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-neutral-950 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em]">View all <ArrowRight className="h-4 w-4" /></button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedProducts.map((product) => (
            <article key={product.name} className="group overflow-hidden rounded-[1.75rem] bg-[#fbfaf6] shadow-sm ring-1 ring-neutral-200">
              <div className="relative overflow-hidden">
                <img src={product.image} alt={product.name} className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">Recommended</span>
                <button className="absolute right-3 top-3 rounded-full bg-white/90 p-3 shadow-sm backdrop-blur"><Heart className="h-4 w-4" /></button>
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-center gap-1">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-3.5 w-3.5 fill-neutral-950 text-neutral-950" />)}</div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="mt-1 text-sm text-neutral-500">{product.price} · Size {product.size} · {product.fit} confidence</p>
                <button className="mt-4 w-full rounded-full bg-neutral-950 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">View product</button>
              </div>
            </article>
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
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Smart Size Recommendation module map.</h2>
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

function SectionHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <div><p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{eyebrow}</p><h2 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">{title}</h2><p className="mt-3 max-w-3xl leading-7 text-neutral-600">{copy}</p></div>;
}

function ResultRow({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="flex gap-4 rounded-2xl bg-[#fbfaf6] p-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white">{icon}</div><div><p className="font-medium">{title}</p><p className="mt-1 text-sm leading-6 text-neutral-600">{copy}</p></div></div>;
}

function LightRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-2xl bg-[#fbfaf6] p-4 text-sm"><span className="text-neutral-600">{label}</span><strong>{value}</strong></div>;
}

function WarningRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-2xl bg-white/70 p-4"><span className="text-neutral-600">{label}</span><strong>{value}</strong></div>;
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[1.5rem] bg-[#f7f2ea] p-5"><p className="text-xs uppercase tracking-[0.16em] text-neutral-500">{label}</p><p className="mt-2 text-2xl font-medium">{value}</p></div>;
}

function Accordion({ id, title, open, setOpen, children }: { id: AccordionKey; title: string; open: AccordionKey; setOpen: (value: AccordionKey) => void; children: React.ReactNode }) {
  const isOpen = id === open;
  return <div className="py-4"><button onClick={() => setOpen(id)} className="flex w-full items-center justify-between text-left font-medium">{title}<ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} /></button>{isOpen && <div className="mt-3">{children}</div>}</div>;
}
