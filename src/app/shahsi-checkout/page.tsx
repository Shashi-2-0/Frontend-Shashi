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
  Info,
  Lock,
  Package,
  RefreshCcw,
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

type CheckoutStep = "contact" | "shipping" | "payment" | "review";
type CommerceType = "buy" | "rent" | "mto" | "subscribe" | "resale";
type PaymentMode = "individual" | "organizer" | "split";
type AgreementKey = "rental" | "subscription" | "mto";

type CheckoutItem = {
  id: string;
  product: string;
  owner: string;
  type: CommerceType;
  color: string;
  size: string;
  price: number;
  image: string;
  status: string;
};

const items: CheckoutItem[] = [
  {
    id: "1",
    product: "Mira Chiffon Dress",
    owner: "Maya",
    type: "buy",
    color: "Sage",
    size: "M",
    price: 99,
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop",
    status: "Ready",
  },
  {
    id: "2",
    product: "Azra Bondi Ruffled Chiffon Dress",
    owner: "Aisha",
    type: "rent",
    color: "Sage",
    size: "A8",
    price: 44,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop",
    status: "Rental agreement required",
  },
  {
    id: "3",
    product: "Debra Convertible Chiffon Dress",
    owner: "Lina",
    type: "subscribe",
    color: "Champagne",
    size: "A6",
    price: 0,
    image: "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=900&auto=format&fit=crop",
    status: "Subscription enrollment required",
  },
  {
    id: "4",
    product: "Mira Pleated One Shoulder Gown",
    owner: "Bride Custom Order",
    type: "mto",
    color: "Emerald",
    size: "Custom",
    price: 169,
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=900&auto=format&fit=crop",
    status: "Production timeline warning",
  },
];

const splitPayments = [
  ["Maya", "Mira Chiffon Dress", "$99", "Pending"],
  ["Aisha", "Azra Bondi Rental", "$44", "Paid"],
  ["Lina", "Gownloop Subscription", "$0", "Included"],
  ["Bride", "MTO Custom Gown", "$169", "Pending"],
];

const moduleMap = [
  ["Orders", "Checkout state, line items, shipping coordination, fulfillment routing, order creation"],
  ["Payments", "Stripe payment intent, split payment, organizer payment, payment status, capture confirmation"],
  ["Rental", "Event date, rental agreement, backup size, return window, rental fees"],
  ["Subscription", "Gownloop enrollment, plan confirmation, box timing, recurring payment setup"],
  ["Made-to-order", "Production timeline, custom measurements, rush warning, final-sale acknowledgement"],
  ["Bridal Party", "Member ownership, group checkout, individual responsibility, payment readiness"],
  ["Reseller Marketplace", "Seller fulfillment, resale validation, condition acknowledgement"],
  ["Catalog", "Variant, color, size, inventory, image, business-model metadata"],
];

export default function ShahsiCheckoutPage() {
  const [step, setStep] = useState<CheckoutStep>("contact");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("split");
  const [agreements, setAgreements] = useState<Record<AgreementKey, boolean>>({ rental: false, subscription: false, mto: false });
  const [eventDate, setEventDate] = useState("2026-06-22");
  const [rushProduction, setRushProduction] = useState(false);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const shipping = 18;
    const rush = rushProduction ? 35 : 0;
    const service = 9;
    const total = subtotal + shipping + rush + service;
    return { subtotal, shipping, rush, service, total };
  }, [rushProduction]);

  const canPlaceOrder = agreements.rental && agreements.subscription && agreements.mto;

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <CheckoutHero step={step} setStep={setStep} totals={totals} canPlaceOrder={canPlaceOrder} />

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="grid gap-8">
            <CheckoutSteps step={step} setStep={setStep} />
            <MultiModelReview />
            <CheckoutMainForm step={step} eventDate={eventDate} setEventDate={setEventDate} paymentMode={paymentMode} setPaymentMode={setPaymentMode} rushProduction={rushProduction} setRushProduction={setRushProduction} />
            <RequiredAgreements agreements={agreements} setAgreements={setAgreements} />
          </div>

          <aside className="grid gap-8 xl:sticky xl:top-28 xl:self-start">
            <OrderSummary totals={totals} canPlaceOrder={canPlaceOrder} />
            <StripePaymentBox paymentMode={paymentMode} />
            <RiskAndTimingPanel eventDate={eventDate} rushProduction={rushProduction} />
          </aside>
        </div>
      </section>

      <FulfillmentRouting />
      <ModuleOwnership />
    </main>
  );
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Secure checkout</span>
        <span>Retail · rental · MTO · subscription</span>
        <span>Stripe payments + split payment ready</span>
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
          <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 sm:block">Modular checkout</p>
        </div>
        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Contact</a>
          <a>Shipping</a>
          <a>Agreements</a>
          <a>Payment</a>
          <a>Review</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white"><Search className="h-4 w-4" /></button>
          <button className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white"><Lock className="h-4 w-4" /> Secure</button>
        </div>
      </div>
    </header>
  );
}

function CheckoutHero({ step, setStep, totals, canPlaceOrder }: { step: CheckoutStep; setStep: (step: CheckoutStep) => void; totals: any; canPlaceOrder: boolean }) {
  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">/checkout</p>
          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-6xl">One checkout for every Shahsi commerce flow.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Complete a multi-model order with retail purchases, rental agreements, made-to-order production warnings, subscription enrollment, split payments, and coordinated shipping.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => setStep("payment")} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Continue payment <ArrowRight className="h-4 w-4" /></button>
            <button onClick={() => setStep("review")} className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Review order</button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <HeroMetric icon={<ShoppingBag className="h-4 w-4" />} label="Order total" value={`$${totals.total}`} />
          <HeroMetric icon={<CreditCard className="h-4 w-4" />} label="Payment" value="Stripe ready" />
          <HeroMetric icon={<Package className="h-4 w-4" />} label="Rental agreement" value={canPlaceOrder ? "Signed" : "Required"} />
          <HeroMetric icon={<Truck className="h-4 w-4" />} label="Fulfillment" value="Multi-route" />
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl bg-white/10 p-5 backdrop-blur"><div className="mb-3 flex items-center gap-2 text-white/75">{icon}<span className="text-xs uppercase tracking-[0.14em]">{label}</span></div><p className="text-2xl font-medium">{value}</p></div>;
}

function CheckoutSteps({ step, setStep }: { step: CheckoutStep; setStep: (step: CheckoutStep) => void }) {
  const steps: Array<[CheckoutStep, string]> = [["contact", "Contact"], ["shipping", "Shipping"], ["payment", "Payment"], ["review", "Review"]];
  return (
    <section className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-neutral-200">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {steps.map(([id, label], index) => (
          <button key={id} onClick={() => setStep(id)} className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-4 text-sm font-medium ${step === id ? "bg-neutral-950 text-white" : "hover:bg-neutral-100"}`}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-current/10 text-xs">{index + 1}</span>
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

function MultiModelReview() {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader eyebrow="Multi-model checkout" title="Items in this checkout" copy="Each line item keeps its business model, owner, price, agreement status, and fulfillment routing." />
      <div className="mt-6 grid gap-4">
        {items.map((item) => <CheckoutItemCard key={item.id} item={item} />)}
      </div>
    </section>
  );
}

function CheckoutItemCard({ item }: { item: CheckoutItem }) {
  return (
    <article className="grid gap-4 rounded-[1.5rem] border border-neutral-200 p-4 md:grid-cols-[104px_1fr_auto] md:items-center">
      <img src={item.image} alt={item.product} className="h-28 w-full rounded-2xl object-cover md:h-24 md:w-24" />
      <div>
        <div className="mb-2 flex flex-wrap gap-2"><CommerceBadge type={item.type} /><span className="rounded-full bg-[#f7f2ea] px-3 py-1 text-xs font-medium">{item.status}</span></div>
        <h3 className="font-medium">{item.product}</h3>
        <p className="mt-1 text-sm text-neutral-500">{item.owner} · {item.color} · Size {item.size}</p>
      </div>
      <p className="text-xl font-medium">${item.price}</p>
    </article>
  );
}

function CheckoutMainForm({ step, eventDate, setEventDate, paymentMode, setPaymentMode, rushProduction, setRushProduction }: { step: CheckoutStep; eventDate: string; setEventDate: (value: string) => void; paymentMode: PaymentMode; setPaymentMode: (value: PaymentMode) => void; rushProduction: boolean; setRushProduction: (value: boolean) => void }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      {step === "contact" && <ContactStep />}
      {step === "shipping" && <ShippingStep eventDate={eventDate} setEventDate={setEventDate} rushProduction={rushProduction} setRushProduction={setRushProduction} />}
      {step === "payment" && <PaymentStep paymentMode={paymentMode} setPaymentMode={setPaymentMode} />}
      {step === "review" && <ReviewStep />}
    </section>
  );
}

function ContactStep() {
  return (
    <div>
      <SectionHeader eyebrow="Contact" title="Contact and group ownership" copy="Checkout preserves organizer, member, and line-item ownership so group orders stay clear." />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Input label="Organizer email" value="bride@example.com" />
        <Input label="Phone" value="+1 555 0148" />
        <Input label="Bride / organizer" value="Sofia" />
        <Input label="Party name" value="Sofia Wedding" />
      </div>
    </div>
  );
}

function ShippingStep({ eventDate, setEventDate, rushProduction, setRushProduction }: { eventDate: string; setEventDate: (value: string) => void; rushProduction: boolean; setRushProduction: (value: boolean) => void }) {
  return (
    <div>
      <SectionHeader eyebrow="Shipping coordination" title="Shipping, event date, and production timing" copy="Orders module coordinates shipping while Rental and MTO modules add event-date and production-timeline checks." />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Input label="Shipping name" value="Sofia Wedding Party" />
        <Input label="Address" value="123 Garden Ave, New York, NY" />
        <label className="rounded-[1.5rem] border border-neutral-200 bg-[#fbfaf6] p-4">
          <span className="text-xs uppercase tracking-[0.16em] text-neutral-500">Event date</span>
          <input type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} className="mt-3 w-full bg-transparent text-2xl font-medium outline-none" />
        </label>
        <label className="flex items-center justify-between rounded-[1.5rem] border border-neutral-200 bg-[#fbfaf6] p-4">
          <div><p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Rush production</p><p className="mt-1 font-medium">Add rush review +$35</p></div>
          <input type="checkbox" checked={rushProduction} onChange={(event) => setRushProduction(event.target.checked)} className="h-5 w-5" />
        </label>
      </div>
    </div>
  );
}

function PaymentStep({ paymentMode, setPaymentMode }: { paymentMode: PaymentMode; setPaymentMode: (value: PaymentMode) => void }) {
  return (
    <div>
      <SectionHeader eyebrow="Payments" title="Stripe payment setup" copy="Choose whether members pay individually, the organizer pays everything, or the group uses split payment." />
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <PaymentModeButton id="individual" label="Individual" copy="Each member pays own line" value={paymentMode} setValue={setPaymentMode} />
        <PaymentModeButton id="organizer" label="Organizer pays" copy="Bride pays all items" value={paymentMode} setValue={setPaymentMode} />
        <PaymentModeButton id="split" label="Split payment" copy="Mixed paid/pending state" value={paymentMode} setValue={setPaymentMode} />
      </div>
      <div className="mt-6 rounded-[1.5rem] border border-neutral-200 p-5">
        <div className="mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5" /><h3 className="font-medium">Stripe card element placeholder</h3></div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Card number" value="4242 4242 4242 4242" />
          <Input label="Name on card" value="Sofia Bride" />
          <Input label="Expiry" value="04 / 30" />
          <Input label="CVC" value="123" />
        </div>
      </div>
    </div>
  );
}

function ReviewStep() {
  return (
    <div>
      <SectionHeader eyebrow="Review" title="Final order review" copy="Review all agreements, payment state, shipment routing, and fulfillment warnings before placing the order." />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ReviewBox title="Group ownership" copy="4 line items mapped to individual members and organizer." />
        <ReviewBox title="Fulfillment routing" copy="Retail, rental, subscription, and MTO items route separately." />
        <ReviewBox title="Payment state" copy="Split payment is enabled with paid and pending members." />
        <ReviewBox title="Warnings" copy="Rental agreement and MTO production warning required." />
      </div>
    </div>
  );
}

function RequiredAgreements({ agreements, setAgreements }: { agreements: Record<AgreementKey, boolean>; setAgreements: (value: Record<AgreementKey, boolean>) => void }) {
  function toggle(key: AgreementKey) {
    setAgreements({ ...agreements, [key]: !agreements[key] });
  }
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <SectionHeader eyebrow="Required agreements" title="Rental, subscription, and MTO confirmations" copy="These are required because this checkout includes multiple commerce models." />
      <div className="mt-6 grid gap-4">
        <AgreementRow icon={<Package className="h-5 w-5" />} title="Rental agreement flow" copy="I accept rental return deadline, damage policy, and backup-size recommendation." checked={agreements.rental} onClick={() => toggle("rental")} />
        <AgreementRow icon={<RefreshCcw className="h-5 w-5" />} title="Subscription enrollment" copy="I authorize Gownloop subscription enrollment and recurring billing where applicable." checked={agreements.subscription} onClick={() => toggle("subscription")} />
        <AgreementRow icon={<Scissors className="h-5 w-5" />} title="MTO production warning" copy="I understand production requires 6–8 weeks and rush is not guaranteed." checked={agreements.mto} onClick={() => toggle("mto")} />
      </div>
    </section>
  );
}

function OrderSummary({ totals, canPlaceOrder }: { totals: any; canPlaceOrder: boolean }) {
  return (
    <section className="rounded-[1.75rem] bg-neutral-950 p-5 text-white shadow-sm md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">Order summary</p>
      <h2 className="mt-2 text-3xl font-medium tracking-tight">Place order</h2>
      <div className="mt-6 grid gap-3">
        <DarkRow label="Subtotal" value={`$${totals.subtotal}`} />
        <DarkRow label="Shipping" value={`$${totals.shipping}`} />
        <DarkRow label="Rush production" value={`$${totals.rush}`} />
        <DarkRow label="Service" value={`$${totals.service}`} />
        <DarkRow label="Total" value={`$${totals.total}`} />
      </div>
      <button disabled={!canPlaceOrder} className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold uppercase tracking-[0.16em] ${canPlaceOrder ? "bg-white text-neutral-950" : "bg-white/20 text-white/50"}`}>Place order <ArrowRight className="h-4 w-4" /></button>
      {!canPlaceOrder && <p className="mt-4 text-center text-xs leading-5 text-white/60">Complete required agreements before final checkout.</p>}
    </section>
  );
}

function StripePaymentBox({ paymentMode }: { paymentMode: PaymentMode }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <div className="mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5" /><h2 className="text-xl font-medium">Stripe payments</h2></div>
      <p className="text-sm leading-6 text-neutral-600">Payment mode: <strong>{paymentMode}</strong>. Backend should create payment intents with metadata for order ID, member owner, and commerce type.</p>
      <div className="mt-5 grid gap-3">
        <LightRow label="Payment provider" value="Stripe" />
        <LightRow label="Capture mode" value="Authorize + capture" />
        <LightRow label="Split state" value="Member-level metadata" />
      </div>
    </section>
  );
}

function RiskAndTimingPanel({ eventDate, rushProduction }: { eventDate: string; rushProduction: boolean }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <div className="mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-700" /><h2 className="text-xl font-medium">Timing warnings</h2></div>
      <div className="grid gap-3">
        <LightRow label="Event date" value={eventDate} />
        <LightRow label="Rental return" value="4 days after event" />
        <LightRow label="MTO timeline" value="6–8 weeks" />
        <LightRow label="Rush review" value={rushProduction ? "Requested" : "Not selected"} />
      </div>
      <p className="mt-4 text-sm leading-6 text-neutral-600">MTO and rental items should show clear warnings before payment to reduce order support issues.</p>
    </section>
  );
}

function FulfillmentRouting() {
  return (
    <section className="bg-[#f7f2ea] py-14">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Fulfillment routing</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">One checkout creates multiple fulfillment paths.</h2>
          <p className="mt-4 leading-7 text-neutral-600">Orders module creates a unified order while each business module handles its own fulfillment rules.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <FlowStep icon={<ShoppingBag className="h-5 w-5" />} title="Retail" copy="Standard shipment" />
          <FlowStep icon={<Package className="h-5 w-5" />} title="Rental" copy="Event window + return" />
          <FlowStep icon={<Scissors className="h-5 w-5" />} title="MTO" copy="Production queue" />
          <FlowStep icon={<RefreshCcw className="h-5 w-5" />} title="Subscription" copy="Gownloop box" />
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
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Checkout module map.</h2>
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

function Input({ label, value }: { label: string; value: string }) {
  return <label className="rounded-[1.5rem] border border-neutral-200 bg-[#fbfaf6] p-4"><span className="text-xs uppercase tracking-[0.16em] text-neutral-500">{label}</span><input defaultValue={value} className="mt-3 w-full bg-transparent text-lg font-medium outline-none" /></label>;
}

function CommerceBadge({ type }: { type: CommerceType }) {
  const map: Record<CommerceType, [string, React.ReactNode]> = {
    buy: ["Retail", <ShoppingBag className="h-3.5 w-3.5" />],
    rent: ["Rental", <Package className="h-3.5 w-3.5" />],
    mto: ["MTO", <Scissors className="h-3.5 w-3.5" />],
    subscribe: ["Subscription", <RefreshCcw className="h-3.5 w-3.5" />],
    resale: ["Resale", <Shirt className="h-3.5 w-3.5" />],
  };
  const [label, icon] = map[type];
  return <span className="inline-flex items-center gap-1 rounded-full bg-[#f7f2ea] px-3 py-1 text-xs font-medium">{icon}{label}</span>;
}

function PaymentModeButton({ id, label, copy, value, setValue }: { id: PaymentMode; label: string; copy: string; value: PaymentMode; setValue: (value: PaymentMode) => void }) {
  return <button onClick={() => setValue(id)} className={`rounded-[1.5rem] border p-5 text-left ${value === id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-[#fbfaf6]"}`}><p className="font-medium">{label}</p><p className={`mt-2 text-sm ${value === id ? "text-white/70" : "text-neutral-600"}`}>{copy}</p></button>;
}

function AgreementRow({ icon, title, copy, checked, onClick }: { icon: React.ReactNode; title: string; copy: string; checked: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`flex gap-4 rounded-[1.5rem] border p-5 text-left ${checked ? "border-neutral-950 bg-[#fbfaf6]" : "border-neutral-200"}`}><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${checked ? "bg-neutral-950 text-white" : "bg-[#f7f2ea]"}`}>{checked ? <CheckCircle2 className="h-5 w-5" /> : icon}</div><div><p className="font-medium">{title}</p><p className="mt-2 text-sm leading-6 text-neutral-600">{copy}</p></div></button>;
}

function ReviewBox({ title, copy }: { title: string; copy: string }) {
  return <div className="rounded-[1.5rem] bg-[#fbfaf6] p-5"><p className="font-medium">{title}</p><p className="mt-2 text-sm leading-6 text-neutral-600">{copy}</p></div>;
}

function DarkRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4 text-sm"><span className="text-white/65">{label}</span><strong>{value}</strong></div>;
}

function LightRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-2xl bg-[#fbfaf6] p-4 text-sm"><span className="text-neutral-600">{label}</span><strong>{value}</strong></div>;
}

function FlowStep({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm ring-1 ring-neutral-200"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f2ea]">{icon}</div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-neutral-500">{copy}</p></div>;
}


