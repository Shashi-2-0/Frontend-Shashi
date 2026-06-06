"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Package,
  RefreshCcw,
  RotateCcw,
  Search,
  Shirt,
  Sparkles,
  Truck,
  Wand2,
} from "lucide-react";

import {
  getFeedbackInsights,
  submitFeedback,
} from "@/lib/api/feedback.api";

type ReturnReason =
  | "fit"
  | "color"
  | "style"
  | "quality"
  | "late"
  | "changedMind";

type FitResult =
  | "tooSmall"
  | "perfect"
  | "tooLarge"
  | "tooShort"
  | "tooLong";

type ProblemArea =
  | "bust"
  | "waist"
  | "hip"
  | "length"
  | "shoulder"
  | "none";

type Resolution = "refund" | "exchange" | "storeCredit" | "resale";
type ReturnTab = "start" | "feedback" | "exchange" | "status";

const returnItems = [
  {
    id: "ri-1",
    productId: "6f89f30a-6bb2-4f2b-9483-eace8ffda4fc",
    product: "Sorrel Stretch Satin Dress",
    type: "Rental",
    color: "Ganache",
    size: "A10",
    order: "SH-10188",
    eligible: true,
    deadline: "May 23, 2026",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "ri-2",
    productId: "a11dedab-31a8-4c99-9d07-f069a3cb6883",
    product: "Niamh Corset Dress",
    type: "Retail",
    color: "Rosewood",
    size: "M",
    order: "SH-10144",
    eligible: true,
    deadline: "June 2, 2026",
    image:
      "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "ri-3",
    productId: "12083e4c-45b1-4f50-bd54-f1aae41d5400",
    product: "Mira Pleated One Shoulder Gown",
    type: "Made-to-order",
    color: "Emerald",
    size: "Custom",
    order: "SH-10221",
    eligible: false,
    deadline: "Final sale after approval",
    image:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=900&auto=format&fit=crop",
  },
];

const returnHistory = [
  [
    "Niamh Corset Dress",
    "Exchange requested",
    "Waist too snug",
    "Fit Engine adjusted corset confidence",
  ],
  [
    "Rosewood Crepe Dress",
    "Returned",
    "Color liked, style not preferred",
    "Style Engine prioritized warmer pinks",
  ],
  [
    "Column Satin Dress",
    "Returned",
    "Hip too fitted",
    "Recommendation Engine lowered fitted column styles",
  ],
];

export default function ReturnsPage() {
  const [activeTab, setActiveTab] = useState<ReturnTab>("start");
  const [selectedItemId, setSelectedItemId] = useState("ri-1");
  const [returnReason, setReturnReason] = useState<ReturnReason>("fit");
  const [fitResult, setFitResult] = useState<FitResult>("tooSmall");
  const [problemArea, setProblemArea] = useState<ProblemArea>("waist");
  const [resolution, setResolution] = useState<Resolution>("exchange");
  const [colorLiked, setColorLiked] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [insights, setInsights] = useState<any>(null);

  const selectedItem =
    returnItems.find((item) => item.id === selectedItemId) || returnItems[0];

  const feedbackScore = useMemo(() => {
    let score = 40;
    if (returnReason) score += 15;
    if (fitResult) score += 15;
    if (problemArea) score += 15;
    if (resolution) score += 15;
    return Math.min(score, 100);
  }, [returnReason, fitResult, problemArea, resolution]);

  useEffect(() => {
    async function loadInsights() {
      try {
        const res = await getFeedbackInsights(selectedItem.productId);
        setInsights(res?.data || res);
      } catch {
        setInsights(null);
      }
    }

    loadInsights();
  }, [selectedItem.productId]);

  async function handleSubmitReturn() {
    try {
      setSubmitting(true);
      setSubmitMessage("");

      await submitFeedback({
        userId: "current-user",
        productId: selectedItem.productId,
        size: selectedItem.size,
        result: apiFitResult(fitResult),
        issueArea: problemArea,
      });

      setSubmitMessage("Return feedback submitted successfully.");
      setActiveTab("status");

      const insightRes = await getFeedbackInsights(selectedItem.productId);
      setInsights(insightRes?.data || insightRes);
    } catch (err: any) {
      setSubmitMessage(err?.message || "Feedback submit nahi hua.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <Hero feedbackScore={feedbackScore} selectedItem={selectedItem} />

        <ReturnTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {submitMessage && (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 text-sm font-medium">
            {submitMessage}
          </div>
        )}

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <section className="grid gap-8">
            {(activeTab === "start" || activeTab === "feedback") && (
              <>
                <ReturnItemSelector
                  selectedItemId={selectedItemId}
                  setSelectedItemId={setSelectedItemId}
                />

                <FeedbackCapture
                  returnReason={returnReason}
                  setReturnReason={setReturnReason}
                  fitResult={fitResult}
                  setFitResult={setFitResult}
                  problemArea={problemArea}
                  setProblemArea={setProblemArea}
                  colorLiked={colorLiked}
                  setColorLiked={setColorLiked}
                />
              </>
            )}

            {(activeTab === "exchange" || activeTab === "start") && (
              <ResolutionOptions
                resolution={resolution}
                setResolution={setResolution}
                selectedItem={selectedItem}
              />
            )}

            {(activeTab === "status" || activeTab === "start") && (
              <ReturnStatus />
            )}
          </section>

          <aside className="grid gap-8 xl:sticky xl:top-28 xl:self-start">
            <ReturnSummary
              selectedItem={selectedItem}
              feedbackScore={feedbackScore}
              resolution={resolution}
              onSubmit={handleSubmitReturn}
              submitting={submitting}
            />

            <RecommendationLearning
              returnReason={returnReason}
              fitResult={fitResult}
              problemArea={problemArea}
              colorLiked={colorLiked}
              insights={insights}
            />

            <ReturnHistory />
          </aside>
        </div>
      </section>

      <LearningFlow />
      <ModuleOwnership />
    </main>
  );
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Returns / Exchange Center</span>
        <span>Returns feed the recommendation system</span>
        <span>Fit · style · color · problem-area feedback</span>
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
            Returns intelligence
          </p>
        </div>

        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Start Return</a>
          <a>Exchange</a>
          <a>Feedback</a>
          <a>Status</a>
          <a>History</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white">
            <Search className="h-4 w-4" />
          </button>

          <button className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">
            Start return
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({
  feedbackScore,
  selectedItem,
}: {
  feedbackScore: number;
  selectedItem: (typeof returnItems)[number];
}) {
  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">
            /returns
          </p>

          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-6xl">
            Return, exchange, and teach Shahsi what fits better next time.
          </h1>

          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Capture fit, color, style, and problem-area feedback so Fit Engine,
            Style Engine, and Recommendation Engine improve every future product,
            rental, and subscription pick.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">
              Continue return <ArrowRight className="h-4 w-4" />
            </button>

            <button className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">
              Exchange instead
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <HeroMetric label="Selected item" value={selectedItem.product} />
          <HeroMetric
            label="Eligibility"
            value={selectedItem.eligible ? "Eligible" : "Final sale"}
          />
          <HeroMetric label="Feedback quality" value={`${feedbackScore}%`} />
          <HeroMetric label="Deadline" value={selectedItem.deadline} />
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-white/50">
        {label}
      </p>
      <p className="mt-3 text-xl font-semibold">{value}</p>
    </div>
  );
}

function ReturnTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: ReturnTab;
  setActiveTab: (tab: ReturnTab) => void;
}) {
  const tabs: Array<[ReturnTab, string]> = [
    ["start", "Start"],
    ["feedback", "Feedback"],
    ["exchange", "Exchange"],
    ["status", "Status"],
  ];

  return (
    <div className="mt-6 rounded-[1.5rem] bg-white p-2 shadow-sm ring-1 ring-neutral-200">
      <div className="flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`rounded-full px-5 py-3 text-sm font-semibold ${
              activeTab === id
                ? "bg-neutral-950 text-white"
                : "border border-neutral-200 hover:bg-[#fbfaf6]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReturnItemSelector({
  selectedItemId,
  setSelectedItemId,
}: {
  selectedItemId: string;
  setSelectedItemId: (id: string) => void;
}) {
  return (
    <section className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      <SectionHeader
        eyebrow="Start return"
        title="Choose item to return or exchange"
        copy="Eligibility rules depend on item type: retail, rental, made-to-order, subscription, or resale."
      />

      <div className="mt-6 grid gap-4">
        {returnItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItemId(item.id)}
            className={`grid gap-4 rounded-[1.4rem] border p-4 text-left md:grid-cols-[84px_1fr_auto] md:items-center ${
              selectedItemId === item.id
                ? "border-neutral-950"
                : "border-neutral-200"
            }`}
          >
            <img
              src={item.image}
              alt={item.product}
              className="h-24 w-24 rounded-2xl object-cover"
            />

            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge>{item.type}</Badge>
                <Badge>{item.eligible ? "Eligible" : "Final sale"}</Badge>
              </div>
              <h3 className="font-semibold">{item.product}</h3>
              <p className="mt-1 text-sm text-neutral-500">
                {item.order} · {item.color} · Size {item.size}
              </p>
            </div>

            <p className="text-sm font-semibold">{item.deadline}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function FeedbackCapture(props: {
  returnReason: ReturnReason;
  setReturnReason: (value: ReturnReason) => void;
  fitResult: FitResult;
  setFitResult: (value: FitResult) => void;
  problemArea: ProblemArea;
  setProblemArea: (value: ProblemArea) => void;
  colorLiked: boolean;
  setColorLiked: (value: boolean) => void;
}) {
  return (
    <section className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      <SectionHeader
        eyebrow="Recommendation feedback"
        title="Tell Shahsi why this did not work"
        copy="This feedback becomes structured learning data for fit, style, color, rental, subscription, and future recommendations."
      />

      <div className="mt-6 grid gap-5">
        <OptionGroup
          title="Primary reason"
          value={props.returnReason}
          onChange={props.setReturnReason as any}
          options={[
            ["fit", "Fit issue"],
            ["color", "Color issue"],
            ["style", "Style not right"],
            ["quality", "Quality issue"],
            ["late", "Arrived late"],
            ["changedMind", "Changed mind"],
          ]}
        />

        <OptionGroup
          title="Fit result"
          value={props.fitResult}
          onChange={props.setFitResult as any}
          options={[
            ["tooSmall", "Too small"],
            ["perfect", "Fit was perfect"],
            ["tooLarge", "Too large"],
            ["tooShort", "Too short"],
            ["tooLong", "Too long"],
          ]}
        />

        <OptionGroup
          title="Problem area"
          value={props.problemArea}
          onChange={props.setProblemArea as any}
          options={[
            ["bust", "Bust"],
            ["waist", "Waist"],
            ["hip", "Hip"],
            ["length", "Length"],
            ["shoulder", "Shoulder"],
            ["none", "None"],
          ]}
        />

        <div>
          <p className="mb-3 font-semibold">Did you like the color?</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => props.setColorLiked(true)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                props.colorLiked
                  ? "border-neutral-950 bg-neutral-950 text-white"
                  : "border-neutral-200"
              }`}
            >
              Yes, color worked
            </button>
            <button
              onClick={() => props.setColorLiked(false)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                !props.colorLiked
                  ? "border-neutral-950 bg-neutral-950 text-white"
                  : "border-neutral-200"
              }`}
            >
              No, avoid this color
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function OptionGroup({
  title,
  value,
  onChange,
  options,
}: {
  title: string;
  value: string;
  onChange: (value: any) => void;
  options: [string, string][];
}) {
  return (
    <div>
      <p className="mb-3 font-semibold">{title}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map(([id, label]) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
              value === id
                ? "border-neutral-950 bg-neutral-950 text-white"
                : "border-neutral-200 hover:bg-[#fbfaf6]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResolutionOptions({
  resolution,
  setResolution,
  selectedItem,
}: {
  resolution: Resolution;
  setResolution: (value: Resolution) => void;
  selectedItem: (typeof returnItems)[number];
}) {
  const options: Array<[Resolution, string, string]> = [
    ["exchange", "Exchange", "Choose a better size, color, or style"],
    ["refund", "Refund", "Return to original payment method"],
    ["storeCredit", "Store credit", "Fastest reusable credit option"],
    ["resale", "List for resale", "For final-sale or lightly worn items"],
  ];

  return (
    <section className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      <SectionHeader
        eyebrow="Resolution"
        title="Choose return outcome"
        copy="Recommended outcome depends on eligibility, item model, final-sale status, and customer intent."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {options.map(([id, title, copy]) => (
          <button
            key={id}
            disabled={!selectedItem.eligible && id !== "resale"}
            onClick={() => setResolution(id)}
            className={`rounded-2xl border p-5 text-left disabled:cursor-not-allowed disabled:opacity-50 ${
              resolution === id
                ? "border-neutral-950 bg-neutral-950 text-white"
                : "border-neutral-200"
            }`}
          >
            <h3 className="font-semibold">{title}</h3>
            <p
              className={`mt-2 text-sm ${
                resolution === id ? "text-white/65" : "text-neutral-500"
              }`}
            >
              {copy}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

function ReturnSummary({
  selectedItem,
  feedbackScore,
  resolution,
  onSubmit,
  submitting,
}: {
  selectedItem: (typeof returnItems)[number];
  feedbackScore: number;
  resolution: Resolution;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <section className="rounded-[1.75rem] bg-neutral-950 p-6 text-white shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
        Return summary
      </p>
      <h2 className="mt-2 text-3xl font-semibold">{selectedItem.product}</h2>

      <img
        src={selectedItem.image}
        alt={selectedItem.product}
        className="mt-6 aspect-[4/5] w-full rounded-2xl object-cover"
      />

      <div className="mt-5 grid gap-3">
        <DarkRow label="Order" value={selectedItem.order} />
        <DarkRow
          label="Eligibility"
          value={selectedItem.eligible ? "Eligible" : "Final sale"}
        />
        <DarkRow label="Resolution" value={resolutionLabel(resolution)} />
        <DarkRow label="Feedback quality" value={`${feedbackScore}%`} />
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting || !selectedItem.eligible}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Submitting
          </>
        ) : (
          <>
            Submit return <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </section>
  );
}

function RecommendationLearning({
  returnReason,
  fitResult,
  problemArea,
  colorLiked,
  insights,
}: {
  returnReason: ReturnReason;
  fitResult: FitResult;
  problemArea: ProblemArea;
  colorLiked: boolean;
  insights: any;
}) {
  return (
    <section className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="h-5 w-5" />
        <h2 className="text-2xl font-semibold">Learning signals</h2>
      </div>

      <div className="grid gap-3">
        <LightRow label="Reason" value={reasonLabel(returnReason)} />
        <LightRow label="Fit result" value={fitLabel(fitResult)} />
        <LightRow label="Problem area" value={areaLabel(problemArea)} />
        <LightRow
          label="Color signal"
          value={colorLiked ? "Color liked" : "Avoid color"}
        />
      </div>

      <div className="mt-5 rounded-2xl bg-[#f7f2ea] p-4 text-sm leading-6 text-neutral-700">
        <strong>Insight:</strong>{" "}
        {insights?.message ||
          insights?.summary ||
          "Future size, silhouette, color, rental backup, and subscription recommendations should adjust from these signals."}
      </div>
    </section>
  );
}

function ReturnHistory() {
  return (
    <section className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
        History
      </p>
      <h2 className="mt-2 text-2xl font-semibold">Past return learning</h2>

      <div className="mt-5 grid gap-3">
        {returnHistory.map(([product, status, issue, learning]) => (
          <div key={product} className="rounded-2xl bg-[#fbfaf6] p-4">
            <h3 className="font-semibold">{product}</h3>
            <p className="mt-1 text-sm text-neutral-500">
              {status} · {issue}
            </p>
            <p className="mt-2 text-sm font-semibold">{learning}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReturnStatus() {
  const steps = [
    ["Request started", "Return created and feedback captured"],
    ["Label generated", "Return shipping label ready"],
    ["In transit", "Carrier scan pending"],
    ["Received", "Warehouse inspection pending"],
    ["Resolved", "Refund, exchange, or credit issued"],
  ];

  return (
    <section className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      <SectionHeader
        eyebrow="Return status"
        title="Track return or exchange"
        copy="Orders module tracks labels, transit, inspection, refund/exchange creation, and feedback ingestion."
      />

      <div className="mt-6 grid gap-3">
        {steps.map(([title, copy], index) => (
          <div
            key={title}
            className="flex gap-4 rounded-2xl border border-neutral-200 p-4"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                index === 0 ? "bg-emerald-600 text-white" : "bg-[#f7f2ea]"
              }`}
            >
              {index === 0 ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Package className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-neutral-500">{copy}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LearningFlow() {
  const flow = [
    [RotateCcw, "Return", "Capture issue"],
    [RulerIcon, "Fit", "Measure signal"],
    [Wand2, "Style", "Preference signal"],
    [RefreshCcw, "Rental", "Backup logic"],
    [Truck, "Order", "Resolve outcome"],
  ];

  return (
    <section className="bg-[#f7f2ea] py-14">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
          Recommendation learning flow
        </p>
        <h2 className="mt-3 text-4xl font-semibold">
          Returns are not failure. They are intelligence.
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {flow.map(([Icon, title, copy]: any) => (
            <div
              key={title}
              className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm ring-1 ring-neutral-200"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f2ea]">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-sm text-neutral-500">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModuleOwnership() {
  const moduleMap = [
    ["Returns Feedback", "Return reasons, fit result, problem area, color/style signals"],
    ["Fit Engine", "Learns too small/perfect/too large and body-zone issues"],
    ["Style Engine", "Learns color liked/disliked and silhouette preference"],
    ["Recommendation Engine", "Updates future ranking based on returns and exchanges"],
    ["Orders", "Eligibility, label generation, return status, exchange order creation"],
    ["Rental", "Rental returns, deadline, late risk, condition check"],
    ["Payments", "Refunds, store credit, exchange balances"],
    ["Reseller Marketplace", "Suggest resale path for ineligible final-sale items"],
  ];

  return (
    <section className="bg-neutral-950 py-14 text-white">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <p className="text-xs uppercase tracking-[0.22em] text-white/50">
          Modular monolith ownership
        </p>
        <h2 className="mt-3 text-4xl font-semibold">
          Returns / Exchange Center module map.
        </h2>

        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {moduleMap.map(([title, copy]) => (
            <div key={title} className="rounded-2xl border border-white/10 p-5">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">{copy}</p>
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
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-3 max-w-3xl leading-7 text-neutral-600">{copy}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#f7f2ea] px-3 py-1 text-xs font-semibold">
      {children}
    </span>
  );
}

function DarkRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4 text-sm">
      <span className="text-white/60">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#fbfaf6] p-4 text-sm">
      <span className="text-neutral-600">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function reasonLabel(value: ReturnReason) {
  return {
    fit: "Fit issue",
    color: "Color issue",
    style: "Style not right",
    quality: "Quality issue",
    late: "Arrived late",
    changedMind: "Changed mind",
  }[value];
}

function fitLabel(value: FitResult) {
  return {
    tooSmall: "Too small",
    perfect: "Perfect",
    tooLarge: "Too large",
    tooShort: "Too short",
    tooLong: "Too long",
  }[value];
}

function areaLabel(value: ProblemArea) {
  return {
    bust: "Bust",
    waist: "Waist",
    hip: "Hip",
    length: "Length",
    shoulder: "Shoulder",
    none: "None",
  }[value];
}

function resolutionLabel(value: Resolution) {
  return {
    refund: "Refund",
    exchange: "Exchange",
    storeCredit: "Store credit",
    resale: "List for resale",
  }[value];
}

function apiFitResult(value: FitResult) {
  return {
    tooSmall: "too_small",
    perfect: "perfect",
    tooLarge: "too_large",
    tooShort: "too_short",
    tooLong: "too_long",
  }[value];
}

function RulerIcon({ className }: { className?: string }) {
  return <Sparkles className={className} />;
}