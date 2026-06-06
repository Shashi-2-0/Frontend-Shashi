"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Heart,
  Image,
  Mail,
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

type EditorialCategory = "all" | "colors" | "bridesmaids" | "guest" | "trends" | "planning";
type Mood = "garden" | "classic" | "jewel" | "romantic" | "minimal";

const featuredStories = [
  {
    id: "f1",
    title: "The Sage Bridesmaid Dress Guide",
    category: "colors" as EditorialCategory,
    mood: "garden" as Mood,
    kicker: "Color Story",
    excerpt: "How to build a soft green palette with sage, eucalyptus, champagne, and ivory for outdoor ceremonies.",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1400&auto=format&fit=crop",
    readTime: "6 min read",
  },
  {
    id: "f2",
    title: "How to Mix Bridesmaid Dresses Without Looking Random",
    category: "bridesmaids" as EditorialCategory,
    mood: "classic" as Mood,
    kicker: "Styling Guide",
    excerpt: "A Shahsi framework for mixing silhouette, neckline, fabric, and color while keeping one cohesive bridal party look.",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1400&auto=format&fit=crop",
    readTime: "8 min read",
  },
  {
    id: "f3",
    title: "Jewel Tone Wedding Guest Looks for Evening Ceremonies",
    category: "guest" as EditorialCategory,
    mood: "jewel" as Mood,
    kicker: "Occasion Edit",
    excerpt: "Emerald, merlot, navy, black, and satin textures styled for formal wedding evenings.",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1400&auto=format&fit=crop",
    readTime: "5 min read",
  },
];

const editorialCards = [
  {
    title: "Best Chiffon Bridesmaid Dresses for Summer Weddings",
    category: "bridesmaids" as EditorialCategory,
    mood: "garden" as Mood,
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop",
    tag: "SEO Guide",
    cta: "Read guide",
  },
  {
    title: "Champagne Bridesmaid Dresses: What Colors Pair Best?",
    category: "colors" as EditorialCategory,
    mood: "classic" as Mood,
    image: "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=900&auto=format&fit=crop",
    tag: "Palette Guide",
    cta: "Build palette",
  },
  {
    title: "The 2026 Wedding Color Forecast",
    category: "trends" as EditorialCategory,
    mood: "romantic" as Mood,
    image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=900&auto=format&fit=crop",
    tag: "Trend Report",
    cta: "Explore trends",
  },
  {
    title: "What Bridesmaids Should Order First: Swatches, Fit Profile, or Dress?",
    category: "planning" as EditorialCategory,
    mood: "minimal" as Mood,
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=900&auto=format&fit=crop",
    tag: "Planning",
    cta: "Start checklist",
  },
  {
    title: "Wedding Guest Dresses That Can Be Rented, Kept, or Resold",
    category: "guest" as EditorialCategory,
    mood: "jewel" as Mood,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop",
    tag: "Gownloop",
    cta: "Shop edit",
  },
  {
    title: "How to Choose Dresses for Different Body Shapes",
    category: "bridesmaids" as EditorialCategory,
    mood: "classic" as Mood,
    image: "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?q=80&w=900&auto=format&fit=crop",
    tag: "Fit Engine",
    cta: "Use Smart Fit",
  },
];

const colorBoards = [
  ["Garden Sage", "#9ba88f", "#89a08f", "#d8c4a2", "#eee8dc"],
  ["Jewel Evening", "#1f6f5b", "#6c1f2d", "#111111", "#1f324f"],
  ["Soft Romance", "#d7a0a6", "#9d5f68", "#eee8dc", "#d8c4a2"],
  ["Modern Neutral", "#111111", "#b9b7ad", "#d6c4aa", "#eee8dc"],
];

const shoppableEdits = [
  {
    name: "Garden Ceremony Edit",
    copy: "Sage chiffon, soft florals, champagne accents, and breathable silhouettes.",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
    products: "24 products",
  },
  {
    name: "Black Tie Jewel Edit",
    copy: "Emerald, merlot, black satin, and structured evening silhouettes.",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop",
    products: "18 products",
  },
  {
    name: "Romantic Bridesmaid Edit",
    copy: "Rosewood, English rose, chiffon, drape, and soft neckline options.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    products: "31 products",
  },
];

const seoTopics = [
  "sage bridesmaid dresses",
  "chiffon bridesmaid dresses",
  "wedding guest dresses for summer",
  "champagne bridesmaid dress palette",
  "mismatched bridesmaid dresses",
  "rental wedding guest dresses",
  "modest bridesmaid dresses",
  "A-line bridesmaid dresses",
  "plus size bridesmaid dresses",
  "maid of honor dress ideas",
  "garden wedding color palette",
  "black tie wedding guest dresses",
];

const moduleMap = [
  ["Editorial / SEO", "Search-friendly articles, trend guides, color stories, planning content, internal linking"],
  ["Catalog", "Shoppable products, collections, variants, swatches, image and product metadata"],
  ["Style Engine", "Palette guidance, color matching, wedding mood, modesty and body-shape suggestions"],
  ["Recommendation Engine", "Personalized shoppable edits, related products, next-best content and conversion paths"],
  ["Swatches", "Color confidence, palette boards, fabric samples, group approval"],
  ["Bridal Party", "Shareable boards, wedding workspace, bridesmaid coordination, status visibility"],
];

export default function ShahsiEditorialInspirationPage() {
  const [category, setCategory] = useState<EditorialCategory>("all");
  const [mood, setMood] = useState<Mood | "all">("all");

  const visibleCards = useMemo(() => {
    return editorialCards.filter((card) => {
      const categoryMatch = category === "all" || card.category === category;
      const moodMatch = mood === "all" || card.mood === mood;
      return categoryMatch && moodMatch;
    });
  }, [category, mood]);

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        <Hero />
        <EditorialSearch />
        <FeaturedStories />
        <FilterBar category={category} setCategory={setCategory} mood={mood} setMood={setMood} />
        <EditorialGrid cards={visibleCards} />
        <ColorStoryBoards />
        <ShoppableEdits />
      </section>

      <PinterestHybrid />
      <SeoContentHub />
      <ConversionBand />
      <ModuleOwnership />
    </main>
  );
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Wedding inspiration</span>
        <span>Color stories · styling guides · shoppable edits</span>
        <span>From editorial idea to bridal party order</span>
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
          <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 sm:block">Editorial studio</p>
        </div>
        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Color Stories</a>
          <a>Bridesmaids</a>
          <a>Wedding Guest</a>
          <a>Trends</a>
          <a>Planning</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white"><Search className="h-4 w-4" /></button>
          <button className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">Create board</button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid min-h-[670px] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">/editorial</p>
          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-7xl">Wedding inspiration that turns into a finished look.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            A Pinterest-style editorial hub for wedding color stories, bridesmaid styling, guest edits, trend reports, planning guides, swatches, and shoppable Shahsi recommendations.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Explore inspiration <ArrowRight className="h-4 w-4" /></button>
            <button className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Build palette</button>
          </div>
        </div>
        <div className="relative min-h-[520px]">
          <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600&auto=format&fit=crop" alt="Shahsi wedding editorial" className="h-full w-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-neutral-950/10 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 grid gap-3 md:grid-cols-3">
            <HeroCard icon={<Palette className="h-4 w-4" />} title="Color stories" copy="Palette-led discovery" />
            <HeroCard icon={<BookOpen className="h-4 w-4" />} title="SEO guides" copy="Search-ready content" />
            <HeroCard icon={<ShoppingBag className="h-4 w-4" />} title="Shoppable edits" copy="Convert inspiration" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCard({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-2xl bg-white/90 p-4 text-neutral-950 shadow-sm backdrop-blur"><div className="mb-2 flex items-center gap-2">{icon}<p className="font-medium">{title}</p></div><p className="text-sm text-neutral-600">{copy}</p></div>;
}

function EditorialSearch() {
  return (
    <section className="mt-8 rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-neutral-200">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex items-center gap-3 rounded-full bg-[#fbfaf6] px-5 py-4">
          <Search className="h-5 w-5 text-neutral-500" />
          <input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Search sage dresses, mismatched bridesmaids, garden palette, black tie guest looks..." />
        </div>
        <button className="rounded-full bg-neutral-950 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Search inspiration</button>
      </div>
    </section>
  );
}

function FeaturedStories() {
  return (
    <section className="mt-14">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionHeader eyebrow="Featured editorial" title="Start with the story, finish with the outfit." copy="Each story should connect SEO traffic to palette boards, swatches, collections, product pages, and bridal party actions." />
        <button className="inline-flex items-center gap-2 rounded-full border border-neutral-950 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em]">View all stories <ArrowRight className="h-4 w-4" /></button>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {featuredStories.map((story, index) => <FeaturedCard key={story.id} story={story} large={index === 0} />)}
      </div>
    </section>
  );
}

function FeaturedCard({ story, large }: { story: typeof featuredStories[number]; large?: boolean }) {
  return (
    <article className={`group relative overflow-hidden rounded-[2rem] bg-neutral-100 ${large ? "lg:col-span-1" : ""}`}>
      <img src={story.image} alt={story.title} className="h-[540px] w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-white/65">{story.kicker} · {story.readTime}</p>
        <h3 className="mt-3 text-3xl font-medium leading-tight">{story.title}</h3>
        <p className="mt-3 text-sm leading-6 text-white/75">{story.excerpt}</p>
        <button className="mt-5 rounded-full bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-950">Read story</button>
      </div>
    </article>
  );
}

function FilterBar({ category, setCategory, mood, setMood }: { category: EditorialCategory; setCategory: (category: EditorialCategory) => void; mood: Mood | "all"; setMood: (mood: Mood | "all") => void }) {
  const categories: Array<[EditorialCategory, string]> = [["all", "All"], ["colors", "Colors"], ["bridesmaids", "Bridesmaids"], ["guest", "Wedding Guest"], ["trends", "Trends"], ["planning", "Planning"]];
  const moods: Array<[Mood | "all", string]> = [["all", "All moods"], ["garden", "Garden"], ["classic", "Classic"], ["jewel", "Jewel"], ["romantic", "Romantic"], ["minimal", "Minimal"]];
  return (
    <section className="mt-10 rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-neutral-200">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(([id, label]) => <button key={id} onClick={() => setCategory(id)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${category === id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white"}`}>{label}</button>)}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:justify-end">
          {moods.map(([id, label]) => <button key={id} onClick={() => setMood(id)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${mood === id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white"}`}>{label}</button>)}
        </div>
      </div>
    </section>
  );
}

function EditorialGrid({ cards }: { cards: typeof editorialCards }) {
  return (
    <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <article key={card.title} className="group overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-neutral-200">
          <div className="relative overflow-hidden">
            <img src={card.image} alt={card.title} className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
            <button className="absolute right-3 top-3 rounded-full bg-white/90 p-3 shadow-sm backdrop-blur"><Heart className="h-4 w-4" /></button>
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">{card.tag}</span>
          </div>
          <div className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">{card.category} · {card.mood}</p>
            <h3 className="mt-2 min-h-[64px] text-xl font-medium leading-7">{card.title}</h3>
            <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">{card.cta} <ArrowRight className="h-4 w-4" /></button>
          </div>
        </article>
      ))}
    </section>
  );
}

function ColorStoryBoards() {
  return (
    <section className="mt-14 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionHeader eyebrow="Color story boards" title="Palette-first discovery" copy="Editorial pages should convert inspiration into swatch orders, collection filters, and bridal party palette boards." />
        <button className="inline-flex items-center gap-2 rounded-full border border-neutral-950 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em]">Build palette <Palette className="h-4 w-4" /></button>
      </div>
      <div className="grid gap-5 md:grid-cols-4">
        {colorBoards.map(([title, ...colors]) => (
          <article key={title} className="rounded-[1.5rem] bg-[#fbfaf6] p-5">
            <div className="mb-5 flex gap-2">
              {colors.map((color) => <span key={color} className="h-12 w-12 rounded-full border border-neutral-200" style={{ background: color }} />)}
            </div>
            <h3 className="font-medium">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">Save as a board, order swatches, or apply to bridesmaid dresses.</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ShoppableEdits() {
  return (
    <section className="mt-14">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionHeader eyebrow="Shoppable edits" title="Editorial that converts" copy="Each inspiration edit should lead directly into collection pages, swatches, product recommendations, or bridal party assignments." />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {shoppableEdits.map((edit) => (
          <article key={edit.name} className="group relative min-h-[540px] overflow-hidden rounded-[2rem] bg-neutral-100">
            <img src={edit.image} alt={edit.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">{edit.products}</p>
              <h3 className="mt-2 text-3xl font-medium">{edit.name}</h3>
              <p className="mt-3 text-sm leading-6 text-white/75">{edit.copy}</p>
              <button className="mt-5 rounded-full bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-950">Shop edit</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PinterestHybrid() {
  return (
    <section className="bg-[#f7f2ea] py-14">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Pinterest / editorial hybrid</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Save inspiration into a real wedding workflow.</h2>
          <p className="mt-4 leading-7 text-neutral-600">Unlike a normal blog, Shahsi editorial content should be actionable: save to board, order swatches, assign to party, or shop the edit.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <FlowStep icon={<Image className="h-5 w-5" />} title="Save image" copy="Pinterest-style boards" />
          <FlowStep icon={<SwatchBook className="h-5 w-5" />} title="Order swatch" copy="Color confidence" />
          <FlowStep icon={<Users className="h-5 w-5" />} title="Share party" copy="Collaborative planning" />
          <FlowStep icon={<ShoppingBag className="h-5 w-5" />} title="Shop edit" copy="Convert to order" />
        </div>
      </div>
    </section>
  );
}

function SeoContentHub() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-14 lg:px-8">
      <div className="grid gap-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">SEO content hub</p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Build pages around high-intent wedding searches.</h2>
          <p className="mt-4 leading-7 text-neutral-600">Editorial should capture search demand and internally link to collection pages, swatches, fit profile, product pages, and bridal party workflows.</p>
          <button className="mt-8 rounded-full bg-neutral-950 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Plan SEO cluster</button>
        </div>
        <div className="flex flex-wrap gap-2 content-start">
          {seoTopics.map((topic) => <span key={topic} className="rounded-full bg-[#fbfaf6] px-4 py-2 text-sm font-medium ring-1 ring-neutral-200">{topic}</span>)}
        </div>
      </div>
    </section>
  );
}

function ConversionBand() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 pb-14 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] bg-neutral-950 p-6 text-white md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/50">Conversion path</p>
            <h2 className="mt-3 text-4xl font-medium tracking-tight">Turn inspiration into a Shahsi wedding workspace.</h2>
            <p className="mt-4 max-w-3xl leading-7 text-white/70">Save color stories, order swatches, invite bridesmaids, assign dresses, and track group checkout from one editorial-to-commerce flow.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">Create board</button>
            <button className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">Shop dresses</button>
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
          <h2 className="mt-3 text-4xl font-medium tracking-tight">Editorial page module map.</h2>
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

function FlowStep({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm ring-1 ring-neutral-200"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f2ea]">{icon}</div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-neutral-500">{copy}</p></div>;
}


