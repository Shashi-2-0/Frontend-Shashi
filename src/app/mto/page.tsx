"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Heart,
  Info,
  Palette,
  Ruler,
  Save,
  Scissors,
  Search,
  Shirt,
  Sparkles,
  Star,
  Truck,
  UserRound,
  Wand2,
} from "lucide-react";

type FitPreference = "snatched" | "true" | "relaxed";
type LengthPreference = "petite" | "standard" | "tall" | "custom";
type FabricKey = "chiffon" | "matteSatin" | "stretchSatin" | "crepe" | "velvet";
type StyleOption = "sleeveless" | "capSleeve" | "longSleeve" | "vNeck" | "squareNeck" | "modestNeck";
type ApprovalStep = "measurements" | "fabric" | "style" | "timeline" | "approval";

const fabrics = [
  { id: "chiffon" as FabricKey, name: "Chiffon", copy: "Light, airy, bridal-party friendly", price: 0, color: "#d8c4a2" },
  { id: "matteSatin" as FabricKey, name: "Matte Satin", copy: "Elegant sheen, structured drape", price: 20, color: "#c8a78f" },
  { id: "stretchSatin" as FabricKey, name: "Stretch Satin", copy: "Closer fit with soft give", price: 28, color: "#9d6f63" },
  { id: "crepe" as FabricKey, name: "Crepe", copy: "Clean, modern, refined texture", price: 24, color: "#b8a996" },
  { id: "velvet" as FabricKey, name: "Velvet", copy: "Rich winter/event finish", price: 35, color: "#395142" },
];

const colors = [
  ["Sage", "#9ba88f"],
  ["Emerald", "#1f6f5b"],
  ["Champagne", "#d8c4a2"],
  ["Dusty Blue", "#8eb9d6"],
  ["Rosewood", "#9d5f68"],
  ["Black", "#111111"],
];

const timelineSteps = [
  ["Measurements approved", "Fit Engine validates body data", "Day 1"],
  ["Pattern preparation", "Custom length and fit preference applied", "Days 2–5"],
  ["Cut and sew", "Fabric enters production queue", "Weeks 2–5"],
  ["Quality check", "Final measurements and finish reviewed", "Week 6"],
  ["Ship custom order", "Tracking and delivery confirmation", "Weeks 6–8"],
];

const moduleMap = [
  ["Made-to-order", "Measurement intake, custom length, production timeline, fabric/style customization, final approval"],
  ["Fit Engine", "Body measurement validation, custom length calculation, fit preference, confidence scoring"],
  ["User Profile", "Saved bust, waist, hip, height, modesty, fit preference, color/style inputs"],
  ["Style Engine", "Color matching, modesty preference, body-shape style guidance, fabric/style recommendations"],
  ["Catalog", "Base dress, fabric options, color variants, style options, production metadata"],
  ["Orders", "MTO checkout, production state, fulfillment, delivery, order status"],
  ["Payments", "Deposit/full payment, rush fee, final-sale acknowledgement, Stripe checkout"],
];

export default function ShahsiMadeToOrderPage() {
  const [measurements, setMeasurements] = useState({ bust: 36, waist: 29, hip: 39, heightFeet: 5, heightInches: 6 });
  const [fitPreference, setFitPreference] = useState<FitPreference>("true");
  const [lengthPreference, setLengthPreference] = useState<LengthPreference>("standard");
  const [customLength, setCustomLength] = useState(132);
  const [fabric, setFabric] = useState<FabricKey>("chiffon");
  const [selectedColor, setSelectedColor] = useState("Sage");
  const [styleOptions, setStyleOptions] = useState<StyleOption[]>(["vNeck", "sleeveless"]);
  const [approvalStep, setApprovalStep] = useState<ApprovalStep>("measurements");
  const [rushReview, setRushReview] = useState(false);
  const [finalApproved, setFinalApproved] = useState(false);

  const selectedFabric = fabrics.find((item) => item.id === fabric)!;
  const price = useMemo(() => 149 + selectedFabric.price + (rushReview ? 35 : 0), [selectedFabric.price, rushReview]);
  const fitSummary = useMemo(() => {
    const recommendedLength = lengthPreference === "custom" ? `${customLength} cm` : lengthPreference === "petite" ? "126 cm" : lengthPreference === "tall" ? "138 cm" : "132 cm";
    return {
      recommendedSize: "Custom M / A8 base",
      confidence: "High",
      length: recommendedLength,
      waistEase: fitPreference === "snatched" ? "Close fit" : fitPreference === "relaxed" ? "Relaxed ease" : "True fit",
    };
  }, [lengthPreference, customLength, fitPreference]);

  function updateMeasurement(key: string, value: number) {
    setMeasurements({ ...measurements, [key]: value });
  }

  function toggleStyle(option: StyleOption) {
    setStyleOptions((current) => current.includes(option) ? current.filter((item) => item !== option) : [...current, option]);
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <Hero price={price} fitSummary={fitSummary} />

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="grid gap-8">
            <ApprovalStepper approvalStep={approvalStep} setApprovalStep={setApprovalStep} />
            <MeasurementIntake measurements={measurements} updateMeasurement={updateMeasurement} />
            <CustomLength lengthPreference={lengthPreference} setLengthPreference={setLengthPreference} customLength={customLength} setCustomLength={setCustomLength} fitSummary={fitSummary} />
            <FitPreferenceCard fitPreference={fitPreference} setFitPreference={setFitPreference} />
            <FabricSelection fabric={fabric} setFabric={setFabric} />
            <StyleCustomization selectedColor={selectedColor} setSelectedColor={setSelectedColor} styleOptions={styleOptions} toggleStyle={toggleStyle} />
            <ProductionTimeline rushReview={rushReview} setRushReview={setRushReview} />
          </div>

          <aside className="grid gap-8 xl:sticky xl:top-28 xl:self-start">
            <OrderPreview price={price} selectedFabric={selectedFabric} selectedColor={selectedColor} fitSummary={fitSummary} styleOptions={styleOptions} />
            <FitEnginePanel fitSummary={fitSummary} measurements={measurements} />
            <FinalApproval finalApproved={finalApproved} setFinalApproved={setFinalApproved} price={price} />
          </aside>
        </div>
      </section>

      <MadeToOrderFlow />
      <ModuleOwnership />
    </main>
  );
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Made-to-order experience</span>
        <span>Measurement-led production</span>
        <span>Custom length · fabric · fit preference</span>
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
          <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 sm:block">Made-to-order atelier</p>
        </div>
        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Measurements</a>
          <a>Length</a>
          <a>Fabric</a>
          <a>Style</a>
          <a>Approval</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white"><Search className="h-4 w-4" /></button>
          <button className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white"><Save className="h-4 w-4" /> Save design</button>
        </div>
      </div>
    </header>
  );
}

function Hero({ price, fitSummary }: { price: number; fitSummary: any }) {
  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid min-h-[680px] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">/made-to-order</p>
          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-7xl">Made for your measurements, timeline, and occasion.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Shahsi made-to-order turns body measurements, custom length, fabric selection, style preferences, and final approval into a production-ready order.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Start custom order <ArrowRight className="h-4 w-4" /></button>
            <button className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Book fit review</button>
          </div>
        </div>
        <div className="relative min-h-[520px]">
          <img src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1600&auto=format&fit=crop" alt="Shahsi made to order" className="h-full w-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-neutral-950/10 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 grid gap-3 md:grid-cols-3">
            <HeroCard icon={<Ruler className="h-4 w-4" />} title="Fit base" copy={fitSummary.recommendedSize} />
            <HeroCard icon={<Scissors className="h-4 w-4" />} title="Custom length" copy={fitSummary.length} />
            <HeroCard icon={<Shirt className="h-4 w-4" />} title="Starting at" copy={`$${price}`} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCard({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-2xl bg-white/90 p-4 text-neutral-950 shadow-sm backdrop-blur"><div className="mb-2 flex items-center gap-2">{icon}<p className="font-medium">{title}</p></div><p className="text-sm text-neutral-600">{copy}</p></div>;
}

function ApprovalStepper({ approvalStep, setApprovalStep }: { approvalStep: ApprovalStep; setApprovalStep: (step: ApprovalStep) => void }) {
  const steps: Array<[ApprovalStep, string]> = [["measurements", "Measurements"], ["fabric", "Fabric"], ["style", "Style"], ["timeline", "Timeline"], ["approval", "Approval"]];
  return (
    <section className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-neutral-200">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {steps.map(([id, label], index) => <button key={id} onClick={() => setApprovalStep(id)} className={`rounded-2xl px-4 py-4 text-sm font-medium ${approvalStep === id ? "bg-neutral-950 text-white" : "hover:bg-neutral-100"}`}><span className="mr-2 text-xs opacity-60">0{index + 1}</span>{label}</button>)}
      </div>
    </section>
  );
}

function MeasurementIntake({ measurements, updateMeasurement }: { measurements: any; updateMeasurement: (key: string, value: number) => void }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader eyebrow="Measurement intake" title="Production-ready body data" copy="Made-to-order relies more on body profile than standard sizes. These measurements become production inputs after final approval." />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <MeasurementInput label="Bust" value={measurements.bust} suffix="in" onChange={(value) => updateMeasurement("bust", value)} />
        <MeasurementInput label="Waist" value={measurements.waist} suffix="in" onChange={(value) => updateMeasurement("waist", value)} />
        <MeasurementInput label="Hip" value={measurements.hip} suffix="in" onChange={(value) => updateMeasurement("hip", value)} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <MeasurementInput label="Height feet" value={measurements.heightFeet} suffix="ft" onChange={(value) => updateMeasurement("heightFeet", value)} />
        <MeasurementInput label="Height inches" value={measurements.heightInches} suffix="in" onChange={(value) => updateMeasurement("heightInches", value)} />
      </div>
      <div className="mt-5 flex gap-3 rounded-2xl bg-[#f7f2ea] p-4 text-sm text-neutral-700"><Info className="mt-0.5 h-4 w-4 shrink-0" /><p>For production, Shahsi should require confirmation that measurements are current and taken using the measurement guide.</p></div>
    </section>
  );
}

function MeasurementInput({ label, value, suffix, onChange }: { label: string; value: number; suffix: string; onChange: (value: number) => void }) {
  return <label className="rounded-[1.5rem] border border-neutral-200 bg-[#fbfaf6] p-4"><span className="text-xs uppercase tracking-[0.16em] text-neutral-500">{label}</span><div className="mt-3 flex items-center gap-3"><input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full bg-transparent text-3xl font-medium outline-none" /><span className="text-sm text-neutral-500">{suffix}</span></div></label>;
}

function CustomLength({ lengthPreference, setLengthPreference, customLength, setCustomLength, fitSummary }: { lengthPreference: LengthPreference; setLengthPreference: (value: LengthPreference) => void; customLength: number; setCustomLength: (value: number) => void; fitSummary: any }) {
  const options: Array<[LengthPreference, string, string]> = [["petite", "Petite", "126 cm"], ["standard", "Standard", "132 cm"], ["tall", "Tall", "138 cm"], ["custom", "Custom", "Manual"]];
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader eyebrow="Custom length" title="Choose the length before production" copy="Fit Engine maps height, heel preference, modesty preference, and silhouette to a recommended custom length." />
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {options.map(([id, label, copy]) => <button key={id} onClick={() => setLengthPreference(id)} className={`rounded-2xl border p-4 text-left ${lengthPreference === id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-[#fbfaf6]"}`}><p className="font-medium">{label}</p><p className={`mt-1 text-sm ${lengthPreference === id ? "text-white/65" : "text-neutral-500"}`}>{copy}</p></button>)}
      </div>
      {lengthPreference === "custom" && <label className="mt-4 block rounded-[1.5rem] border border-neutral-200 bg-[#fbfaf6] p-4"><span className="text-xs uppercase tracking-[0.16em] text-neutral-500">Custom length in cm</span><input type="number" value={customLength} onChange={(event) => setCustomLength(Number(event.target.value))} className="mt-3 w-full bg-transparent text-3xl font-medium outline-none" /></label>}
      <div className="mt-5 rounded-2xl bg-[#f7f2ea] p-4 text-sm leading-6 text-neutral-700"><strong>Recommended length:</strong> {fitSummary.length}. This should be reviewed before final approval.</div>
    </section>
  );
}

function FitPreferenceCard({ fitPreference, setFitPreference }: { fitPreference: FitPreference; setFitPreference: (value: FitPreference) => void }) {
  const options: Array<[FitPreference, string, string]> = [["snatched", "Snatched", "Closer waist and bodice fit"], ["true", "True fit", "Balanced production ease"], ["relaxed", "Relaxed", "More comfort and movement"]];
  return <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6"><SectionHeader eyebrow="Fit preference" title="How should the garment feel?" copy="Fit preference adjusts production ease and final explanation, while Fit Engine still validates against measurements." /><div className="mt-6 grid gap-3 md:grid-cols-3">{options.map(([id, label, copy]) => <button key={id} onClick={() => setFitPreference(id)} className={`rounded-2xl border p-5 text-left ${fitPreference === id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-[#fbfaf6]"}`}><p className="font-medium">{label}</p><p className={`mt-2 text-sm leading-6 ${fitPreference === id ? "text-white/65" : "text-neutral-600"}`}>{copy}</p></button>)}</div></section>;
}

function FabricSelection({ fabric, setFabric }: { fabric: FabricKey; setFabric: (value: FabricKey) => void }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader eyebrow="Fabric selection" title="Choose production fabric" copy="Fabric affects drape, stretch, comfort, style ranking, and production rules." />
      <div className="mt-6 grid gap-4 md:grid-cols-5">
        {fabrics.map((item) => <button key={item.id} onClick={() => setFabric(item.id)} className={`rounded-[1.5rem] border p-4 text-left ${fabric === item.id ? "border-neutral-950 bg-[#fbfaf6]" : "border-neutral-200"}`}><span className="block h-12 w-12 rounded-full border border-neutral-200" style={{ background: item.color }} /><p className="mt-4 font-medium">{item.name}</p><p className="mt-2 text-sm leading-6 text-neutral-600">{item.copy}</p>{item.price > 0 && <p className="mt-3 text-sm font-medium">+${item.price}</p>}</button>)}
      </div>
    </section>
  );
}

function StyleCustomization({ selectedColor, setSelectedColor, styleOptions, toggleStyle }: { selectedColor: string; setSelectedColor: (value: string) => void; styleOptions: StyleOption[]; toggleStyle: (option: StyleOption) => void }) {
  const options: Array<[StyleOption, string]> = [["sleeveless", "Sleeveless"], ["capSleeve", "Cap sleeve"], ["longSleeve", "Long sleeve"], ["vNeck", "V-neck"], ["squareNeck", "Square neck"], ["modestNeck", "Modest neckline"]];
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader eyebrow="Style customization" title="Customize color and neckline details" copy="Style Engine can guide color, modesty, and body-shape suitability before production approval." />
      <div className="mt-6">
        <p className="mb-3 font-medium">Color</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">{colors.map(([name, color]) => <button key={name} onClick={() => setSelectedColor(name)} className={`rounded-2xl border p-4 text-center ${selectedColor === name ? "border-neutral-950" : "border-neutral-200"}`}><span className="mx-auto block h-10 w-10 rounded-full border border-neutral-200" style={{ background: color }} /><span className="mt-3 block text-sm font-medium">{name}</span></button>)}</div>
      </div>
      <div className="mt-6">
        <p className="mb-3 font-medium">Style options</p>
        <div className="grid gap-3 md:grid-cols-3">{options.map(([id, label]) => <button key={id} onClick={() => toggleStyle(id)} className={`flex items-center justify-between rounded-2xl border p-4 text-left ${styleOptions.includes(id) ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-[#fbfaf6]"}`}><span>{label}</span>{styleOptions.includes(id) && <CheckCircle2 className="h-4 w-4" />}</button>)}</div>
      </div>
    </section>
  );
}

function ProductionTimeline({ rushReview, setRushReview }: { rushReview: boolean; setRushReview: (value: boolean) => void }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader eyebrow="Production timeline" title="6–8 week production estimate" copy="Made-to-order needs clear timing before payment. Rush review can be requested but should not be guaranteed." />
      <div className="mt-6 grid gap-3">
        {timelineSteps.map(([title, copy, time]) => <div key={title} className="flex gap-4 rounded-2xl border border-neutral-200 p-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white"><Clock className="h-4 w-4" /></div><div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-neutral-500">{copy} · {time}</p></div></div>)}
      </div>
      <label className="mt-5 flex items-center justify-between rounded-2xl bg-amber-50 p-4 text-amber-900"><div className="flex gap-3"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="font-medium">Rush production review</p><p className="text-sm">Adds +$35 review fee. Rush is not guaranteed.</p></div></div><input type="checkbox" checked={rushReview} onChange={(event) => setRushReview(event.target.checked)} className="h-5 w-5" /></label>
    </section>
  );
}

function OrderPreview({ price, selectedFabric, selectedColor, fitSummary, styleOptions }: { price: number; selectedFabric: any; selectedColor: string; fitSummary: any; styleOptions: StyleOption[] }) {
  return (
    <section className="rounded-[1.75rem] bg-neutral-950 p-5 text-white shadow-sm md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">Custom order preview</p>
      <h2 className="mt-2 text-3xl font-medium tracking-tight">Mira Made-to-Order Gown</h2>
      <div className="mt-6 overflow-hidden rounded-[1.5rem]"><img src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=900&auto=format&fit=crop" alt="MTO preview" className="aspect-[4/5] w-full object-cover" /></div>
      <div className="mt-5 grid gap-3"><DarkRow label="Fabric" value={selectedFabric.name} /><DarkRow label="Color" value={selectedColor} /><DarkRow label="Fit base" value={fitSummary.recommendedSize} /><DarkRow label="Length" value={fitSummary.length} /><DarkRow label="Style options" value={`${styleOptions.length} selected`} /><DarkRow label="Estimated total" value={`$${price}`} /></div>
      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Continue to checkout <ArrowRight className="h-4 w-4" /></button>
    </section>
  );
}

function FitEnginePanel({ fitSummary, measurements }: { fitSummary: any; measurements: any }) {
  return <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6"><div className="mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5" /><h2 className="text-xl font-medium">Fit Engine production summary</h2></div><div className="grid gap-3"><LightRow label="Bust / waist / hip" value={`${measurements.bust} / ${measurements.waist} / ${measurements.hip}`} /><LightRow label="Base size" value={fitSummary.recommendedSize} /><LightRow label="Custom length" value={fitSummary.length} /><LightRow label="Waist ease" value={fitSummary.waistEase} /><LightRow label="Confidence" value={fitSummary.confidence} /></div></section>;
}

function FinalApproval({ finalApproved, setFinalApproved, price }: { finalApproved: boolean; setFinalApproved: (value: boolean) => void; price: number }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <div className="mb-4 flex items-center gap-2"><BadgeCheck className="h-5 w-5" /><h2 className="text-xl font-medium">Final approval</h2></div>
      <p className="text-sm leading-6 text-neutral-600">Customer must approve measurements, length, fabric, style options, production timeline, and final-sale policy before checkout.</p>
      <label className="mt-5 flex items-start gap-3 rounded-2xl bg-[#f7f2ea] p-4 text-sm"><input type="checkbox" checked={finalApproved} onChange={(event) => setFinalApproved(event.target.checked)} className="mt-1 h-4 w-4" /><span>I approve my measurements, customization choices, production timeline, and made-to-order final-sale policy.</span></label>
      <button disabled={!finalApproved} className={`mt-5 w-full rounded-full py-4 text-sm font-semibold uppercase tracking-[0.16em] ${finalApproved ? "bg-neutral-950 text-white" : "bg-neutral-200 text-neutral-400"}`}>Approve and pay ${price}</button>
    </section>
  );
}

function MadeToOrderFlow() {
  return <section className="bg-[#f7f2ea] py-14"><div className="mx-auto max-w-[1500px] px-4 lg:px-8"><div className="mb-8 max-w-3xl"><p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Made-to-order flow</p><h2 className="mt-3 text-4xl font-medium tracking-tight">From body data to production-ready order.</h2></div><div className="grid gap-4 md:grid-cols-5"><FlowStep icon={<Ruler className="h-5 w-5" />} title="Measure" copy="Collect body profile" /><FlowStep icon={<Scissors className="h-5 w-5" />} title="Customize" copy="Length, fabric, style" /><FlowStep icon={<Sparkles className="h-5 w-5" />} title="Validate" copy="Fit Engine checks" /><FlowStep icon={<BadgeCheck className="h-5 w-5" />} title="Approve" copy="Final customer signoff" /><FlowStep icon={<Truck className="h-5 w-5" />} title="Produce" copy="6–8 week timeline" /></div></div></section>;
}

function ModuleOwnership() {
  return <section className="bg-neutral-950 py-14 text-white"><div className="mx-auto max-w-[1500px] px-4 lg:px-8"><div className="mb-8 max-w-3xl"><p className="text-xs uppercase tracking-[0.22em] text-white/50">Modular Monolith Ownership</p><h2 className="mt-3 text-4xl font-medium tracking-tight">Made-to-order page module map.</h2></div><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">{moduleMap.map(([title, copy]) => <div key={title} className="rounded-2xl border border-white/10 p-5"><h3 className="font-medium">{title}</h3><p className="mt-3 text-sm leading-6 text-white/70">{copy}</p></div>)}</div></div></section>;
}

function SectionHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) { return <div><p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{eyebrow}</p><h2 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">{title}</h2><p className="mt-3 max-w-3xl leading-7 text-neutral-600">{copy}</p></div>; }
function DarkRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4 text-sm"><span className="text-white/65">{label}</span><strong className="text-right">{value}</strong></div>; }
function LightRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between rounded-2xl bg-[#fbfaf6] p-4 text-sm"><span className="text-neutral-600">{label}</span><strong className="text-right">{value}</strong></div>; }
function FlowStep({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) { return <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm ring-1 ring-neutral-200"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f2ea]">{icon}</div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-neutral-500">{copy}</p></div>; }

