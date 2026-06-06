"use client";



import React, { useEffect, useMemo, useState } from "react";

import {
  getUserProfile,
  updateUserProfile,
  createUserProfile
} from "@/lib/api/userProfile.api";
import {
  ArrowRight,
  CheckCircle2,
  Info,
  Package,
  Palette,
  RefreshCcw,
  Ruler,
  Save,
  Search,
  Shirt,
  Sparkles,
  UserRound,
} from "lucide-react";

import { getFitRecommendation } from "@/lib/api/fitProfile.api";


type FitPreference = "snatched" | "true" | "relaxed";
type ModestyPreference = "low" | "moderate" | "high";
type SkinTone = "cool" | "neutral" | "warm" | "deep";
type BodyShape = "hourglass" | "pear" | "rectangle" | "apple" | "inverted";

type Measurements = {
  bust: number;
  waist: number;
  hip: number;
  heightFeet: number;
  heightInches: number;
  weight: number;
};

type FitResult = {
  recommendedSize: string;
  bodyShapeLabel: string;
  confidence: string;
  length: string;
};

const FIT_PROFILE_STORAGE_KEY = "shahsiFitProfile";

const savedSizes = [
  ["Shahsi", "M / A8", "High confidence"],
  ["Birdy-style sizing", "M", "Good match"],
  ["Azazie-style sizing", "A8", "High match"],
  ["Rental backup", "L / A10", "Comfort fallback"],
];

const colorPreferences = [
  ["Sage", "#9ba88f"],
  ["Emerald", "#1f6f5b"],
  ["Champagne", "#d8c4a2"],
  ["Dusty Blue", "#8eb9d6"],
  ["Merlot", "#6c1f2d"],
  ["Black", "#111111"],
];

const rentalHistory = [
  [
    "Sorrel Stretch Satin Dress",
    "Size L backup used",
    "Fit: comfortable",
    "Returned on time",
  ],
  ["Mira Chiffon Dress", "Size M", "Fit: perfect", "Kept for event"],
  ["Azra Bondi Dress", "Size A8", "Fit: waist fitted", "Recommend A10 backup"],
];

const returnFeedback = [
  [
    "Niamh Corset Dress",
    "Too snug",
    "Problem area: waist",
    "Fit Engine adjusted corset confidence",
  ],
  [
    "Rosewood Crepe Dress",
    "Color liked",
    "Style signal: high",
    "Style Engine prioritized warm pinks",
  ],
  [
    "Column Satin Dress",
    "Hip too fitted",
    "Problem area: hip",
    "Recommendation Engine lowered fitted column styles",
  ],
];

const moduleMap = [
  [
    "User Profile",
    "Measurements, height, body shape, fit preference, modesty, color and skin tone inputs",
  ],
  [
    "Fit Engine",
    "Body-shape classification, ease calculation, size scoring, fit confidence, length warnings",
  ],
  [
    "Style Engine",
    "Skin tone color matching, color preference, modesty match, body-shape style guidance",
  ],
  [
    "Recommendation Engine",
    "Uses this profile to rank products, sizes, colors, rental backup sizes, and subscription picks",
  ],
  ["Rental", "Uses confidence and backup sizing to reduce bad-fit shipments"],
  [
    "Subscription",
    "Uses fit and feedback history to personalize monthly Gownloop selections",
  ],
  [
    "Returns Feedback",
    "Return reasons and problem areas update future recommendations",
  ],
];

export default function ShahsiFitProfilePage() {
  const [measurements, setMeasurements] = useState<Measurements>({
    bust: 36,
    waist: 29,
    hip: 39,
    heightFeet: 5,
    heightInches: 6,
    weight: 68,
  });

  const [bodyShape, setBodyShape] = useState<BodyShape>("pear");
  const [fitPreference, setFitPreference] = useState<FitPreference>("true");
  const [modesty, setModesty] = useState<ModestyPreference>("moderate");
  const [skinTone, setSkinTone] = useState<SkinTone>("neutral");
  const [selectedColors, setSelectedColors] = useState<string[]>([
    "Sage",
    "Emerald",
    "Champagne",
  ]);

  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [loadedAt, setLoadedAt] = useState("");
  const [backendRecommendation, setBackendRecommendation] =
    useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fitResult = useMemo<FitResult>(() => {
    const hipEase = measurements.hip - measurements.waist;

    let recommendedSize = "M / A8";

    if (
      measurements.bust > 38 ||
      measurements.waist > 32 ||
      measurements.hip > 42
    ) {
      recommendedSize = "L / A10";
    }

    if (
      measurements.bust > 42 ||
      measurements.waist > 36 ||
      measurements.hip > 46
    ) {
      recommendedSize = "XL / A12";
    }

    const bodyShapeLabel =
      bodyShape === "hourglass"
        ? "Hourglass"
        : bodyShape === "rectangle"
          ? "Rectangle"
          : bodyShape === "apple"
            ? "Apple"
            : bodyShape === "inverted"
              ? "Inverted triangle"
              : hipEase >= 9
                ? "Pear / balanced pear"
                : "Balanced pear";

    const length =
      measurements.heightFeet <= 5 && measurements.heightInches <= 4
        ? "Petite length warning"
        : "Standard length works with heels";

    return {
      recommendedSize,
      bodyShapeLabel,
      confidence: "High",
      length,
    };
  }, [measurements, bodyShape]);

  useEffect(() => {
    const saved = localStorage.getItem(FIT_PROFILE_STORAGE_KEY);

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      if (parsed.measurements) {
        setMeasurements({
          bust: Number(parsed.measurements.bust ?? 36),
          waist: Number(parsed.measurements.waist ?? 29),
          hip: Number(parsed.measurements.hip ?? 39),
          heightFeet: Number(parsed.measurements.heightFeet ?? 5),
          heightInches: Number(parsed.measurements.heightInches ?? 6),
          weight: Number(parsed.measurements.weight ?? 68),
        });
      }

      if (parsed.bodyShape) setBodyShape(parsed.bodyShape);
      if (parsed.fitPreference) setFitPreference(parsed.fitPreference);
      if (parsed.modesty) setModesty(parsed.modesty);
      if (parsed.skinTone) setSkinTone(parsed.skinTone);

      if (Array.isArray(parsed.selectedColors)) {
        setSelectedColors(parsed.selectedColors);
      }

      if (parsed.backendRecommendation) {
        setBackendRecommendation(parsed.backendRecommendation);
      }

      if (parsed.updatedAt) {
        setLoadedAt(parsed.updatedAt);
      }
    } catch (error) {
      console.error("Fit profile parse failed:", error);
    }
  }, []);

  function toggleColor(color: string) {
    setSelectedColors((current) =>
      current.includes(color)
        ? current.filter((item) => item !== color)
        : [...current, color]
    );
  }

  function inchesToCm(value: number) {
    return Math.round(value * 2.54);
  }

  function heightToCm(feet: number, inches: number) {
    const totalInches = feet * 12 + inches;
    return Math.round(totalInches * 2.54);
  }

  function getBackendMeasurements() {
    return {
      height: heightToCm(
        Number(measurements.heightFeet) || 5,
        Number(measurements.heightInches) || 6
      ),
      weight: Number(measurements.weight) || 68,
      chest: inchesToCm(Number(measurements.bust) || 36),
      waist: inchesToCm(Number(measurements.waist) || 29),
    };
  }

  function getFitType() {
    if (fitPreference === "snatched") return "slim" as const;
    if (fitPreference === "relaxed") return "oversized" as const;
    return "regular" as const;
  }

  async function handleSaveProfile() {
    setIsSaving(true);
    setSaveMessage("");
    setSaveError("");

    const payload = {
      measurements,
      bodyShape,
      fitPreference,
      modesty,
      skinTone,
      selectedColors,
      fitResult,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(FIT_PROFILE_STORAGE_KEY, JSON.stringify(payload));

    try {
      const backendMeasurements = getBackendMeasurements();

      await updateUserProfile({
  ...backendMeasurements,
  bodyType: bodyShape,
  fitPreference: getFitType(),
});

      const recommendation = await getFitRecommendation({
        ...backendMeasurements,
        fitType: getFitType(),
        sizes: [
          {
            label: "S",
            chest: 94,
            waist: 80,
            fitType: "slim",
          },
          {
            label: "M",
            chest: 98,
            waist: 85,
            fitType: "regular",
          },
          {
            label: "L",
            chest: 104,
            waist: 90,
            fitType: "oversized",
          },
        ],
      });

      setBackendRecommendation(recommendation);

      const updatedPayload = {
        ...payload,
        backendMeasurements,
        backendRecommendation: recommendation,
      };

      localStorage.setItem(
        FIT_PROFILE_STORAGE_KEY,
        JSON.stringify(updatedPayload)
      );

      setLoadedAt(payload.updatedAt);
     setSaveMessage("Full fit profile saved to backend successfully");
    } catch (error: any) {
      console.error("Fit profile backend save failed:", error);

      setLoadedAt(payload.updatedAt);
      setSaveError(
        "Fit profile saved locally. Backend save failed: " +
          (error?.message || "Unknown error")
      );
    } finally {
      setIsSaving(false);

      setTimeout(() => {
        setSaveMessage("");
        setSaveError("");
      }, 4500);
    }
  }

  function handleResetProfile() {
    localStorage.removeItem(FIT_PROFILE_STORAGE_KEY);

    setMeasurements({
      bust: 36,
      waist: 29,
      hip: 39,
      heightFeet: 5,
      heightInches: 6,
      weight: 68,
    });

    setBodyShape("pear");
    setFitPreference("true");
    setModesty("moderate");
    setSkinTone("neutral");
    setSelectedColors(["Sage", "Emerald", "Champagne"]);
    setBackendRecommendation(null);
    setLoadedAt("");
    setSaveError("");
    setSaveMessage("Fit profile reset");

    setTimeout(() => {
      setSaveMessage("");
    }, 2500);
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header onSave={handleSaveProfile} isSaving={isSaving} />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <Hero fitResult={fitResult} />

        {saveMessage && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            {saveMessage}
          </div>
        )}

        {saveError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {saveError}
          </div>
        )}

        {loadedAt && (
          <div className="mt-4 rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm text-neutral-600">
            Last saved: {new Date(loadedAt).toLocaleString()}
          </div>
        )}

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-8">
            <MeasurementsCard
              measurements={measurements}
              setMeasurements={setMeasurements}
            />

            <BodyShapeCard
              bodyShape={bodyShape}
              setBodyShape={setBodyShape}
              fitResult={fitResult}
            />

            <PreferencesCard
              fitPreference={fitPreference}
              setFitPreference={setFitPreference}
              modesty={modesty}
              setModesty={setModesty}
            />

            <ColorAndSkinToneCard
              skinTone={skinTone}
              setSkinTone={setSkinTone}
              selectedColors={selectedColors}
              toggleColor={toggleColor}
            />
          </div>

          <aside className="grid gap-8 xl:sticky xl:top-28 xl:self-start">
            <FitEngineSummary
              fitResult={fitResult}
              backendRecommendation={backendRecommendation}
            />

            <StyleEngineSummary
              skinTone={skinTone}
              modesty={modesty}
              selectedColors={selectedColors}
            />

            <SavedSizesCard />

            <ProfileActions
              onSave={handleSaveProfile}
              onReset={handleResetProfile}
              isSaving={isSaving}
            />
          </aside>
        </div>
      </section>

      <HistorySection />
      <ModuleOwnership />
    </main>
  );
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Fit Profile</span>
        <span>Measurements · style preferences · recommendations</span>
        <span>Used across retail, rental, subscription, resale, and MTO</span>
      </div>
    </div>
  );
}

function Header({
  onSave,
  isSaving,
}: {
  onSave: () => void;
  isSaving: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#fbfaf6]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-5 lg:px-8">
        <div>
          <p className="text-2xl font-semibold tracking-tight">Shahsi</p>
          <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 sm:block">
            Fit profile system
          </p>
        </div>

        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Measurements</a>
          <a>Style</a>
          <a>Saved Sizes</a>
          <a>Rental History</a>
          <a>Returns Feedback</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white">
            <Search className="h-4 w-4" />
          </button>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ fitResult }: { fitResult: FitResult }) {
  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">
            /profile/fit
          </p>

          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-6xl">
            Your fit and style intelligence profile.
          </h1>

          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Save your measurements, body shape, fit preference, modesty
            preference, color preferences, and skin tone to improve every Shahsi
            recommendation.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#measurements"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950"
            >
              Update measurements
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="#fit-engine-summary"
              className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white"
            >
              View recommendations
            </a>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <HeroMetric
            icon={<Ruler className="h-4 w-4" />}
            label="Recommended size"
            value={fitResult.recommendedSize}
          />

          <HeroMetric
            icon={<Sparkles className="h-4 w-4" />}
            label="Fit confidence"
            value={fitResult.confidence}
          />

          <HeroMetric
            icon={<UserRound className="h-4 w-4" />}
            label="Body shape"
            value={fitResult.bodyShapeLabel}
          />

          <HeroMetric
            icon={<Palette className="h-4 w-4" />}
            label="Style status"
            value="Ready"
          />
        </div>
      </div>
    </section>
  );
}

function HeroMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
      <div className="mb-3 flex items-center gap-2 text-white/75">
        {icon}
        <span className="text-xs uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="text-2xl font-medium">{value}</p>
    </div>
  );
}

function MeasurementsCard({
  measurements,
  setMeasurements,
}: {
  measurements: Measurements;
  setMeasurements: React.Dispatch<React.SetStateAction<Measurements>>;
}) {
  function update(key: keyof Measurements, value: number) {
    setMeasurements((current) => ({
      ...current,
      [key]: Number.isFinite(value) ? value : 0,
    }));
  }

  return (
    <section
      id="measurements"
      className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6"
    >
      <SectionHeader
        eyebrow="Body measurements"
        title="Bust, waist, hip, height, and weight"
        copy="These values are owned by User Profile and used by the Fit Engine for size recommendation, length warnings, and rental confidence."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <MeasurementInput
          label="Bust"
          value={measurements.bust}
          suffix="in"
          onChange={(value) => update("bust", value)}
        />

        <MeasurementInput
          label="Waist"
          value={measurements.waist}
          suffix="in"
          onChange={(value) => update("waist", value)}
        />

        <MeasurementInput
          label="Hip"
          value={measurements.hip}
          suffix="in"
          onChange={(value) => update("hip", value)}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <MeasurementInput
          label="Height feet"
          value={measurements.heightFeet}
          suffix="ft"
          onChange={(value) => update("heightFeet", value)}
        />

        <MeasurementInput
          label="Height inches"
          value={measurements.heightInches}
          suffix="in"
          onChange={(value) => update("heightInches", value)}
        />

        <MeasurementInput
          label="Weight"
          value={measurements.weight}
          suffix="kg"
          onChange={(value) => update("weight", value)}
        />
      </div>

      <div className="mt-5 flex gap-3 rounded-2xl bg-[#f7f2ea] p-4 text-sm text-neutral-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          For rental and made-to-order, measurements must be current within 90
          days for high confidence.
        </p>
      </div>
    </section>
  );
}

function MeasurementInput({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="rounded-[1.5rem] border border-neutral-200 bg-[#fbfaf6] p-4">
      <span className="text-xs uppercase tracking-[0.16em] text-neutral-500">
        {label}
      </span>

      <div className="mt-3 flex items-center gap-3">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full bg-transparent text-3xl font-medium outline-none"
        />

        <span className="text-sm text-neutral-500">{suffix}</span>
      </div>
    </label>
  );
}

function BodyShapeCard({
  bodyShape,
  setBodyShape,
  fitResult,
}: {
  bodyShape: BodyShape;
  setBodyShape: (value: BodyShape) => void;
  fitResult: FitResult;
}) {
  const shapes: Array<[BodyShape, string]> = [
    ["hourglass", "Hourglass"],
    ["pear", "Pear"],
    ["rectangle", "Rectangle"],
    ["apple", "Apple"],
    ["inverted", "Inverted Triangle"],
  ];

  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader
        eyebrow="Body shape classification"
        title="Shape guidance"
        copy="Body shape helps the Style Engine explain why silhouettes work, while Fit Engine still uses actual measurements for sizing."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {shapes.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setBodyShape(key)}
            className={`rounded-2xl border p-4 text-left ${
              bodyShape === key
                ? "border-neutral-950 bg-neutral-950 text-white"
                : "border-neutral-200 bg-[#fbfaf6] hover:border-neutral-400"
            }`}
          >
            <UserRound className="mb-3 h-5 w-5" />
            <p className="font-medium">{label}</p>
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-[#f7f2ea] p-4 text-sm leading-6 text-neutral-700">
        <strong>Current interpretation:</strong> {fitResult.bodyShapeLabel}.
        A-line, wrap, and softly structured waist styles should rank higher.
      </div>
    </section>
  );
}

function PreferencesCard({
  fitPreference,
  setFitPreference,
  modesty,
  setModesty,
}: {
  fitPreference: FitPreference;
  setFitPreference: (value: FitPreference) => void;
  modesty: ModestyPreference;
  setModesty: (value: ModestyPreference) => void;
}) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader
        eyebrow="Fit and modesty preference"
        title="How should clothes feel and cover?"
        copy="These preferences adjust explanations and ranking without replacing measurement-based fit logic."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <PreferenceGroup
          title="Preferred fit"
          value={fitPreference}
          options={[
            ["snatched", "Snatched"],
            ["true", "True to size"],
            ["relaxed", "Relaxed"],
          ]}
          onChange={setFitPreference}
        />

        <PreferenceGroup
          title="Modesty preference"
          value={modesty}
          options={[
            ["low", "Low coverage"],
            ["moderate", "Moderate"],
            ["high", "High coverage"],
          ]}
          onChange={setModesty}
        />
      </div>
    </section>
  );
}

function PreferenceGroup<T extends string>({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: T;
  options: Array<[T, string]>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-neutral-200 p-4">
      <p className="mb-3 font-medium">{title}</p>

      <div className="grid gap-2">
        {options.map(([key, label]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm ${
              value === key
                ? "bg-neutral-950 text-white"
                : "bg-[#fbfaf6] hover:bg-[#f7f2ea]"
            }`}
          >
            <span>{label}</span>
            {value === key && <CheckCircle2 className="h-4 w-4" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorAndSkinToneCard({
  skinTone,
  setSkinTone,
  selectedColors,
  toggleColor,
}: {
  skinTone: SkinTone;
  setSkinTone: (value: SkinTone) => void;
  selectedColors: string[];
  toggleColor: (color: string) => void;
}) {
  const skinTones: Array<[SkinTone, string, string]> = [
    ["cool", "Cool", "#d8b7aa"],
    ["neutral", "Neutral", "#c99675"],
    ["warm", "Warm", "#a96f4f"],
    ["deep", "Deep", "#5a3528"],
  ];

  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader
        eyebrow="Style inputs"
        title="Color preference and skin tone"
        copy="Skin tone belongs to Style Engine. It improves color matching and explanation quality."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="mb-3 font-medium">Skin tone selection</p>

          <div className="grid grid-cols-2 gap-3">
            {skinTones.map(([key, label, color]) => (
              <button
                key={key}
                onClick={() => setSkinTone(key)}
                className={`rounded-2xl border p-4 text-left ${
                  skinTone === key
                    ? "border-neutral-950"
                    : "border-neutral-200"
                }`}
              >
                <span
                  className="block h-10 w-10 rounded-full border border-neutral-200"
                  style={{ background: color }}
                />
                <span className="mt-3 block font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 font-medium">Color preferences</p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {colorPreferences.map(([name, color]) => (
              <button
                key={name}
                onClick={() => toggleColor(name)}
                className={`rounded-2xl border bg-[#fbfaf6] p-4 text-left ${
                  selectedColors.includes(name)
                    ? "border-neutral-950"
                    : "border-neutral-200"
                }`}
              >
                <span
                  className="block h-10 w-10 rounded-full border border-neutral-200"
                  style={{ background: color }}
                />

                <span className="mt-3 flex items-center justify-between font-medium">
                  {name}
                  {selectedColors.includes(name) && (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FitEngineSummary({
  fitResult,
  backendRecommendation,
}: {
  fitResult: FitResult;
  backendRecommendation: any;
}) {
  const backendSize =
    backendRecommendation?.recommendedSize ||
    backendRecommendation?.data?.recommendedSize ||
    backendRecommendation?.result?.recommendedSize ||
    "";

  const backendAlternative =
    backendRecommendation?.alternative ||
    backendRecommendation?.data?.alternative ||
    backendRecommendation?.result?.alternative ||
    "";

  const backendConfidence =
    backendRecommendation?.confidence ||
    backendRecommendation?.data?.confidence ||
    backendRecommendation?.result?.confidence ||
    "";

  const backendExplanation =
    backendRecommendation?.explanation ||
    backendRecommendation?.data?.explanation ||
    backendRecommendation?.result?.explanation ||
    "";

  return (
    <section
      id="fit-engine-summary"
      className="rounded-[1.75rem] bg-neutral-950 p-5 text-white shadow-sm md:p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5" />
        <h2 className="text-xl font-medium">Fit Engine Summary</h2>
      </div>

      <div className="grid gap-3">
        <DarkRow
          label="Local recommended size"
          value={fitResult.recommendedSize}
        />
        <DarkRow label="Local confidence" value={fitResult.confidence} />
        <DarkRow label="Body shape" value={fitResult.bodyShapeLabel} />
        <DarkRow label="Length guidance" value={fitResult.length} />

        {backendRecommendation && (
          <>
            <div className="my-2 border-t border-white/10" />

            <DarkRow
              label="Backend recommended size"
              value={backendSize || "Not returned"}
            />

            <DarkRow
              label="Backend alternative"
              value={backendAlternative || "Not returned"}
            />

            <DarkRow
              label="Backend confidence"
              value={backendConfidence || "Not returned"}
            />
          </>
        )}
      </div>

      {backendExplanation && (
        <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-white/75">
          <p className="mb-1 font-semibold text-white">Backend explanation</p>
          <p>{backendExplanation}</p>
        </div>
      )}

      {backendRecommendation && (
        <details className="mt-4 rounded-2xl bg-white/10 p-4 text-sm">
          <summary className="cursor-pointer font-semibold">
            View raw backend response
          </summary>

          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-all text-xs text-white/80">
            {JSON.stringify(backendRecommendation, null, 2)}
          </pre>
        </details>
      )}

      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">
        View smart recommendations
        <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  );
}

function StyleEngineSummary({
  skinTone,
  modesty,
  selectedColors,
}: {
  skinTone: SkinTone;
  modesty: ModestyPreference;
  selectedColors: string[];
}) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Palette className="h-5 w-5" />
        <h2 className="text-xl font-medium">Style Engine Summary</h2>
      </div>

      <div className="grid gap-3">
        <LightRow label="Skin tone" value={capitalize(skinTone)} />
        <LightRow label="Modesty" value={capitalize(modesty)} />
        <LightRow label="Favorite colors" value={selectedColors.join(", ")} />
        <LightRow label="Best silhouettes" value="A-line, wrap, soft waist" />
      </div>
    </section>
  );
}

function SavedSizesCard() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Shirt className="h-5 w-5" />
        <h2 className="text-xl font-medium">Saved sizes</h2>
      </div>

      <div className="grid gap-3">
        {savedSizes.map(([system, size, note]) => (
          <div key={system} className="rounded-2xl bg-[#fbfaf6] p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{system}</p>
              <span className="font-semibold">{size}</span>
            </div>

            <p className="mt-1 text-sm text-neutral-500">{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProfileActions({
  onSave,
  onReset,
  isSaving,
}: {
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
}) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
        Profile Actions
      </p>

      <h2 className="mt-2 text-2xl font-medium tracking-tight">
        Save or reset fit data
      </h2>

      <p className="mt-2 text-sm leading-6 text-neutral-600">
       Core fit profile is saved in backend database. Extra style inputs are also kept locally for Shahsi recommendations.
      </p>

      <div className="mt-5 grid gap-3">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Profile"}
        </button>

        <button
          onClick={onReset}
          disabled={isSaving}
          className="rounded-full border border-neutral-950 px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          Reset Profile
        </button>
      </div>
    </section>
  );
}

function HistorySection() {
  return (
    <section className="bg-[#f7f2ea] py-14">
      <div className="mx-auto grid max-w-[1500px] gap-8 px-4 lg:grid-cols-2 lg:px-8">
        <HistoryCard
          icon={<Package className="h-5 w-5" />}
          eyebrow="Rental fit history"
          title="Rental outcomes"
          items={rentalHistory}
        />

        <HistoryCard
          icon={<RefreshCcw className="h-5 w-5" />}
          eyebrow="Return feedback history"
          title="Learning signals"
          items={returnFeedback}
        />
      </div>
    </section>
  );
}

function HistoryCard({
  icon,
  eyebrow,
  title,
  items,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  items: string[][];
}) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <div className="mb-5 flex items-center gap-2">
        {icon}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-3xl font-medium tracking-tight">{title}</h2>
        </div>
      </div>

      <div className="grid gap-3">
        {items.map(([name, result, detail, impact]) => (
          <div key={name} className="rounded-2xl bg-[#fbfaf6] p-4">
            <p className="font-medium">{name}</p>
            <p className="mt-1 text-sm text-neutral-600">
              {result} · {detail}
            </p>
            <p className="mt-2 text-sm font-medium">{impact}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ModuleOwnership() {
  return (
    <section className="bg-neutral-950 py-14 text-white">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-white/50">
            Modular Monolith Ownership
          </p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">
            Fit Profile module map.
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

function SectionHeader({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl leading-7 text-neutral-600">{copy}</p>
    </div>
  );
}

function DarkRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/10 p-4 text-sm">
      <span className="text-white/65">{label}</span>
      <strong className="text-right">{value}</strong>
    </div>
  );
}

function LightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#fbfaf6] p-4 text-sm">
      <span className="text-neutral-600">{label}</span>
      <strong className="text-right">{value}</strong>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}