"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { useRouter } from "next/navigation";
import {
  BridalWorkspaceProvider,
  BridalWorkspaceButton,
  useBridalWorkspace,
  makeWorkspaceGown,
} from "@/components/BridalWorkspace";

import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gift,
  Heart,
  Mail,
  Menu,
  Package,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  User,
  Users,
  Wine,
  X,
  LogOut,
} from "lucide-react";

import {
  CatalogColorStory,
  getCatalogColorStories,
} from "@/lib/api/catalog.api";

const img = {
  hero:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600&auto=format&fit=crop",
  courtyard:
    "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1600&auto=format&fit=crop",
  ballroom:
    "https://images.unsplash.com/photo-1519167758481-83f29c9c7a6b?q=80&w=1800&auto=format&fit=crop",
  garden:
    "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=900&auto=format&fit=crop",
  burgundy:
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop",
  blue:
    "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=900&auto=format&fit=crop",
  black:
    "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=900&auto=format&fit=crop",
  white:
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop",
  bride:
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1800&auto=format&fit=crop",
  lavender:
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=900&auto=format&fit=crop",
  red:
    "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=900&auto=format&fit=crop",
  formal:
    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop",
  vineyard:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=900&auto=format&fit=crop",
  swatch:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop",
  clutch:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=900&auto=format&fit=crop",
  gettingReady:
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=900&auto=format&fit=crop",
  blueBridesmaids:
    "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=900&auto=format&fit=crop",
  bridalSlip:
    "https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=900&auto=format&fit=crop",
};

const actionButtonClass =
  "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(23,17,13,0.18)] active:translate-y-0 active:scale-[0.98]";

const cardHoverClass =
  "transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(23,17,13,0.14)]";

type Product = {
  tag: string;
  name: string;
  price: string;
  fabric: string;
  colorName: string;
  swatches: string[];
  image: string;
};

const heightOptions = [
  `4'10"`,
  `4'11"`,
  `5'0"`,
  `5'1"`,
  `5'2"`,
  `5'3"`,
  `5'4"`,
  `5'5"`,
  `5'6"`,
  `5'7"`,
  `5'8"`,
  `5'9"`,
  `5'10"`,
  `5'11"`,
  `6'0"`,
];

const productList: Product[] = [
  {
    tag: "Reception",
    name: "Aria Slip Gown",
    price: "$420",
    fabric: "Silk Charmeuse",
    colorName: "Champagne",
    swatches: ["#f3ead8", "#111111"],
    image: img.garden,
  },
  {
    tag: "Welcome Dinner",
    name: "Camille Silk Midi",
    price: "$380",
    fabric: "Silk",
    colorName: "Rose",
    swatches: ["#d99aac", "#a8b99f"],
    image: img.burgundy,
  },
  {
    tag: "After Party",
    name: "Odie Velvet ",
    price: "$540",
    fabric: "Velvet",
    colorName: "Navy",
    swatches: ["#1e304a", "#111111"],
    image: img.black,
  },
  {
    tag: "Bridal Shower",
    name: "Bijou Lace Bodice",
    price: "$295",
    fabric: "Lace",
    colorName: "Champagne",
    swatches: ["#f3ead8", "#c99aaa"],
    image: img.blue,
  },
  {
    tag: "Ceremony",
    name: "Margaux Satin ",
    price: "$395",
    fabric: "Matte Satin",
    colorName: "Olive",
    swatches: ["#536341", "#f0e6d2"],
    image: img.hero,
  },
  {
    tag: "Wedding",
    name: "Thea Silk Gown",
    price: "$460",
    fabric: "Silk Satin",
    colorName: "Ivory",
    swatches: ["#f6efe2", "#d8c2a2"],
    image: img.white,
  },
  {
    tag: "Black Tie",
    name: "Nora Wrap Dress",
    price: "$330",
    fabric: "Chiffon",
    colorName: "Black",
    swatches: ["#111111", "#b98262"],
    image: img.lavender,
  },
];

export default function HomePage() {
  return (
    <BridalWorkspaceProvider>
      <main className="min-h-screen overflow-x-hidden bg-[#fbf8f1] text-[#17110d]">
       <SiteHeader />

<div className="h-[148px] shrink-0 lg:h-[0px]" />

<Hero />
        <OccasionPanel />
        <FourDoors />
        <SeasonPalette />
        <SmsRibbon />
        <TrendingNow />
        <NewArrivals />
        <MomentFinder />
        <BridalDashboard />
        <FormalCollections />
        <SwatchSection />
        <EditorialEdits />
        <JustBeforeIDo />
        <TrustBand />
        <RentalWardrobe />
        <Footer />
        <BridalWorkspaceButton />
        <GlobalStyles />
      </main>
    </BridalWorkspaceProvider>
  );
}



function IconCounter({ icon }: { icon: React.ReactNode }) {
  return (
    <span className="relative inline-flex transition hover:-translate-y-0.5">
      {icon}

      <span className="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#b98262] text-xs text-white">
        0
      </span>
    </span>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#ded5c8] bg-[#fbf8f1]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(185,130,98,0.18),transparent_32%),radial-gradient(circle_at_85%_18%,rgba(21,16,12,0.08),transparent_30%)]" />

      <div className="relative grid lg:grid-cols-[1.12fr_0.88fr]">
<div className="relative h-[280px] overflow-hidden bg-[#e8dfd2] sm:h-[340px] lg:h-[420px] xl:h-[495px]">
          <img
            src={img.hero}
            alt="Shahsi editorial gown"
         className="h-full w-full object-cover object-[center_35%]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent lg:bg-gradient-to-r lg:from-black/30 lg:via-transparent lg:to-transparent" />

          <div className="absolute bottom-5 left-4 right-4 rounded-[28px] border border-white/20 bg-white/14 p-4 text-white shadow-2xl backdrop-blur-md sm:bottom-8 sm:left-8 sm:max-w-[430px] sm:p-6">
            <p className="text-[8px] uppercase tracking-[0.34em] text-white/75">
              Editorial fit preview
            </p>
            <p className="mt-2 font-serif text-[25px] italic leading-none">
              Styled for ceremonies, dinners and every after-hour.
            </p>
          </div>
        </div>

      <div className="flex h-[360px] flex-col justify-center px-5 py-6 sm:h-[380px] sm:px-8 lg:h-[420px] lg:px-12 xl:h-[440px] xl:px-16">
          <div className="animate-reveal">
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#b98262] sm:text-xs sm:tracking-[0.38em]">
              Autumn / Winter 26
            </p>

         <h1 className="mt-3 font-serif text-[40px] leading-[0.88] tracking-[-0.065em] sm:text-[52px] md:text-[62px] xl:text-[68px]">
  Escape <span className="italic text-[#b98262]">in</span>
  <br />
  Style.
</h1>

          <p className="mt-4 max-w-xl text-[14px] leading-[1.6] text-neutral-500 sm:text-[16px]">
              An editorial wardrobe for the woman who walks in, not past. Buy,
              commission, borrow or rent — every gown, one house.
            </p>

          <div className="mt-5 grid max-w-[420px] gap-3 sm:grid-cols-2">
              <a
                href="/collection"
                className={`inline-flex min-h-[54px] items-center justify-center rounded-full bg-[#15100c] px-5 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-white sm:text-[11px] ${actionButtonClass}`}
              >
                Discover
                <ArrowRight className="ml-2 inline h-4 w-4" />
              </a>

              <a
                href="/made-to-order"
                className={`inline-flex min-h-[54px] items-center justify-center rounded-full border border-[#15100c] bg-white/60 px-5 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#15100c] sm:text-[11px] ${actionButtonClass}`}
              >
                Atelier Visit
              </a>
            </div>

         <div className="mt-5 grid max-w-[460px] grid-cols-3 gap-3">
              <HeroStat label="Ships" value="4–8d" />
              <HeroStat label="Fits" value="AI" />
              <HeroStat label="Modes" value="Rent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e2d7c8] bg-white/70 p-3 shadow-sm backdrop-blur">
      <p className="text-[9px] uppercase tracking-[0.22em] text-[#8b867f]">
        {label}
      </p>

      <p className="mt-1.5 font-serif text-[18px] italic leading-none">
        {value}
      </p>
    </div>
  );
}

function OccasionPanel() {
  const items = [
    ["Black Tie", Sparkles],
    ["Bridal", Gift],
    ["Cocktail Hour", Wine],
    ["Wedding Guest", Heart],
    ["After Party", Package],
  ] as const;

  return (
    <section className="relative min-h-[620px] overflow-hidden sm:min-h-[560px] lg:h-[520px] lg:min-h-0">
      <img
        src="https://plus.unsplash.com/premium_photo-1674235766088-80d8410f9523?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Wedding ballroom"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/25" />

      <div className="relative mx-auto flex min-h-[620px] max-w-[1700px] items-center justify-center px-4 py-10 sm:min-h-[560px] sm:px-6 lg:h-full lg:min-h-0 lg:py-0">
        <div className="animate-reveal w-full max-w-[720px] rounded-[36px] border border-white/15 bg-[#2f251f]/80 px-5 py-8 text-center text-white shadow-2xl backdrop-blur-xl sm:px-8 sm:py-10 lg:px-12">
          <div className="mx-auto mb-5 flex max-w-[250px] items-center justify-center gap-4 text-[8px] uppercase tracking-[0.34em] text-[#d6a27f] sm:tracking-[0.45em]">
            <span className="h-px flex-1 bg-[#d6a27f]" />
            The Occasion
            <span className="h-px flex-1 bg-[#d6a27f]" />
          </div>

          <h2 className="font-serif text-[38px] italic leading-none tracking-[-0.05em] sm:text-[50px] md:text-[60px]">
            I&apos;m getting dressed for...
          </h2>

          <p className="mx-auto mt-5 max-w-[520px] text-[13px] leading-6 text-white/75">
            From candlelit vows to midnight after-parties — a gown for every
            chapter of the evening.
          </p>

          <div className="mx-auto mt-8 grid max-w-[580px] grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5 md:gap-6">
            {items.map(([title, Icon]) => (
              <a key={title} href="/collection" className="group">
                <span className="mx-auto flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#fff8ec] text-[#17110d] shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:scale-105 sm:h-[68px] sm:w-[68px]">
                  <Icon className="h-6 w-6 stroke-[1.7] sm:h-7 sm:w-7" />
                </span>

                <span className="mt-3 block text-[8px] font-semibold uppercase leading-4 tracking-[0.2em] text-white sm:tracking-[0.24em]">
                  {title}
                </span>
              </a>
            ))}
          </div>

          <a
            href="/collection"
            className={`mt-8 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#d8a17e] px-7 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#15100c] sm:px-10 sm:tracking-[0.34em] ${actionButtonClass}`}
          >
            Browse all styles
            <ArrowRight className="ml-3 h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function FourDoors() {
  const items = [
    {
      title: "Shop",
      tag: "Ready, in season",
      copy: "The current collection — finished pieces, in stock, ready to ship.",
      image: img.garden,
      href: "/collection",
    },
    {
      title: "Made to Order",
      tag: "Cut just for you",
      copy: "Atelier commissions in your size, fabric and length. 6–8 weeks from sketch to doorstep.",
      image: img.burgundy,
      href: "/made-to-order",
    },
    {
      title: "Shop by Palette",
      tag: "Start with colour",
      copy: "Browse by tone — champagne, emerald, midnight — and build a look that lives together.",
      image: img.blue,
      href: "/swatches",
    },
    {
      title: "Bridal Dashboard",
      tag: "For the party",
      copy: "One private room to align dresses, sizes, payments and chat.",
      image: img.black,
      href: "/bridal-party",
    },
  ];

  return (
    <section className="overflow-x-hidden bg-[#fbf8f1] px-4 py-[56px] sm:px-6 lg:py-[70px]">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-[42px] grid items-end gap-6 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="mb-3 text-[8px] uppercase tracking-[0.42em] text-[#b98262]">
              Four ways into Shahsi
            </p>

            <h2 className="font-serif text-[38px] leading-none tracking-[-0.055em] text-[#15100c] sm:text-[52px]">
              One house. Four doors in.
            </h2>
          </div>

          <p className="text-[13px] font-light leading-6 text-[#6d6760]">
            Shop the collection, have it made, browse by colour, or bring the
            whole bridal party into one private room.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
           <a
  key={item.title}
  href={item.href}
  className="group text-center"
  style={{ animationDelay: `${index * 80}ms` }}
>
  <div className="mx-auto h-[190px] w-[190px] overflow-hidden rounded-full bg-[#e7dfd4] shadow-[0_18px_40px_rgba(0,0,0,0.1)] sm:h-[210px] sm:w-[210px]">
    <img
      src={item.image}
      alt={item.title}
      className="h-full w-full object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
    />
  </div>

  <span className="-mt-[10px] inline-block rounded-full border border-[#ded5c8] bg-[#fbf8f1] px-5 py-[8px] text-[8px] uppercase tracking-[0.28em] text-[#4f4944] shadow-sm">
    {item.tag}
  </span>

  <h3 className="mt-4 font-serif text-[26px] italic leading-[1.1] tracking-[-0.035em] text-[#15100c]">
    {item.title}
    <span className="ml-2 not-italic text-[#b98262]">→</span>
  </h3>

  <p className="mx-auto mt-3 max-w-[235px] text-[12px] font-light leading-5 text-[#7a746e]">
    {item.copy}
  </p>
</a>
          ))}
        </div>
      </div>
    </section>
  );
}

function SeasonPalette() {
  const router = useRouter();

  const [backendColorStories, setBackendColorStories] = useState<
    CatalogColorStory[]
  >([]);
  const [colorStoriesLoading, setColorStoriesLoading] = useState(false);
  const [colorStoriesError, setColorStoriesError] = useState("");

  const [selectedFamily, setSelectedFamily] = useState("All");
  const [selectedShade, setSelectedShade] = useState("");
  const [hoveredFamily, setHoveredFamily] = useState<string | null>(null);

  const { addPalette } = useBridalWorkspace();

  function normalizeFilterValue(value?: string | null) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/\//g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  useEffect(() => {
    let mounted = true;

    async function loadColorStories() {
      try {
        setColorStoriesLoading(true);
        setColorStoriesError("");

        // Homepage ke liye global endpoint.
        // Isme category nahi bhejni hai.
        const response = await getCatalogColorStories();
        const stories = Array.isArray(response?.data) ? response.data : [];

        if (!mounted) return;

        setBackendColorStories(stories);
      } catch (error: any) {
        console.error("Homepage global color stories load failed:", error);

        if (!mounted) return;

        setBackendColorStories([]);
        setColorStoriesError(error?.message || "Color stories load failed");
      } finally {
        if (mounted) {
          setColorStoriesLoading(false);
        }
      }
    }

    loadColorStories();

    return () => {
      mounted = false;
    };
  }, []);

  const colorFamilies = useMemo(() => {
    const mapped = backendColorStories
      .filter((story) => story?.active !== false)
      .map((story) => {
        const storySlug = normalizeFilterValue(story.name);

        return {
          name: story.name,
          description: story.description || "",
          color: story.displayColor || "#ddd5c9",
          filterValue: storySlug,
          shades: Array.isArray(story.shades)
            ? story.shades
                .filter((shade) => shade?.active !== false)
                .map((shade) => ({
                  name: shade.name,
                  color: shade.hex || "#ddd5c9",
                  filterValue:
                    shade.filterValue ||
                    normalizeFilterValue(shade.name) ||
                    shade.name,
                }))
            : [],
        };
      });

    return [
      {
        name: "All",
        description: "All colors",
        color:
          "conic-gradient(#d674a8, #f2d45c, #7ed6c7, #6f8ed8, #d674a8)",
        filterValue: "",
        shades: [],
      },
      ...mapped.filter((item) => normalizeFilterValue(item.name) !== "all"),
    ];
  }, [backendColorStories]);

  function openGlobalColorStory(family: {
    name: string;
    color: string;
    filterValue?: string;
  }) {
    if (family.name === "All") {
      router.push("/collection");
      return;
    }

    // Parent swatch global filter.
    // Example: Neutrals => /collection?colorStory=neutrals
    const value = normalizeFilterValue(family.name);

    router.push(`/collection?colorStory=${encodeURIComponent(value)}`);
  }

  function openGlobalShade(shade: {
    name: string;
    color: string;
    filterValue?: string;
  }) {
    // Shade global filter.
    // Example: Ivory => /collection?color=ivory
    const value = shade.filterValue || normalizeFilterValue(shade.name);

    router.push(`/collection?color=${encodeURIComponent(value)}`);
  }

  function applyPalette(
    familyName: string,
    shade?: { name: string; color: string; filterValue?: string },
  ) {
    setSelectedFamily(familyName);

    const selectedFamilyData = colorFamilies.find(
      (item) => item.name === familyName,
    );

    if (shade) {
      setSelectedShade(shade.name);
      setHoveredFamily(null);

      addPalette({
        family: familyName,
        name: shade.name,
        color: shade.color,
      });

      openGlobalShade(shade);
      return;
    }

    if (!selectedFamilyData) return;

    setSelectedShade("");
    setHoveredFamily(null);

    addPalette({
      family: familyName,
      name: familyName,
      color: selectedFamilyData.color || "#f6efe2",
    });

    openGlobalColorStory(selectedFamilyData);
  }

  return (
    <section className="relative z-20 overflow-visible bg-[#fbf8f1] px-4 py-[42px] sm:px-6 md:px-[70px]">
      <div className="mx-auto max-w-[1540px] text-center">
        <p className="text-[9px] uppercase tracking-[0.42em] text-[#b98262]">
          The Season Palette
        </p>

        <h2 className="mt-2 font-serif text-[28px] italic leading-tight tracking-[-0.04em] text-[#15100c] sm:text-[38px]">
          Build the palette before the order.
        </h2>

        <div className="mx-auto mt-3 max-w-[720px] text-[13px] leading-5 text-[#7a746e]">
          Select a color family, then choose a shade to explore the full catalog.
        </div>

        {colorStoriesLoading ? (
          <p className="mt-4 text-[11px] text-[#8b867f]">
            Loading global color stories...
          </p>
        ) : null}

        {colorStoriesError ? (
          <p className="mt-4 text-[11px] text-red-600">
            Global color stories API error: {colorStoriesError}
          </p>
        ) : null}

        {!colorStoriesLoading && !colorStoriesError && colorFamilies.length <= 1 ? (
          <div className="mx-auto mt-8 max-w-[720px] rounded-[18px] border border-amber-200 bg-amber-50 px-5 py-4 text-[13px] text-amber-800">
            Global color stories empty aa rahi hain. Backend me{" "}
            <strong>GET /catalog/color-stories</strong> ko active global color
            stories return karni hongi.
          </div>
        ) : null}

        {colorFamilies.length > 1 ? (
          <div className="relative z-[60] mt-[28px] flex flex-wrap items-start justify-center gap-x-[28px] gap-y-[22px] overflow-visible pb-[105px] lg:gap-x-[38px]">
            {colorFamilies.map((family) => {
              const isSelected = selectedFamily === family.name;
              const isHovered = hoveredFamily === family.name;

              return (
                <div
                  key={family.name}
                  className="relative flex w-[96px] shrink-0 flex-col items-center pb-[26px]"
                  onMouseEnter={() => {
                    if (family.shades.length) {
                      setHoveredFamily(family.name);
                    }
                  }}
                >
                  <button
                    type="button"
                    onClick={() => applyPalette(family.name)}
                    className="group flex flex-col items-center outline-none"
                  >
                    <span
                      className={[
                        "h-[64px] w-[64px] rounded-full shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition duration-300 group-hover:-translate-y-1 group-hover:scale-105",
                        isSelected
                          ? "ring-[3px] ring-[#15100c] ring-offset-[5px] ring-offset-[#fbf8f1]"
                          : "",
                      ].join(" ")}
                      style={{
                        background:
                          family.name === "All"
                            ? family.color
                            : `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.28), transparent 28%), ${family.color}`,
                      }}
                    />

                    <span className="mt-[10px] text-[12px] font-light text-[#15100c]">
                      {family.name}
                    </span>
                  </button>

                  {isHovered && family.shades.length ? (
                    <div
                      onMouseEnter={() => setHoveredFamily(family.name)}
                      onMouseLeave={() => setHoveredFamily(null)}
                      className="absolute left-1/2 top-[calc(100%+4px)] z-[9999] w-[360px] -translate-x-1/2"
                    >
                      <div className="animate-popover relative rounded-[18px] border border-[#cfc6ba] bg-white p-[18px] shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
                        <div className="absolute -top-[18px] left-0 right-0 h-[20px]" />

                        <div className="absolute -top-[9px] left-1/2 h-[18px] w-[18px] -translate-x-1/2 rotate-45 border-l border-t border-[#cfc6ba] bg-white" />

                        <div className="grid grid-cols-4 gap-x-[14px] gap-y-[16px]">
                          {family.shades.map((shade) => {
                            const isShadeSelected =
                              selectedFamily === family.name &&
                              selectedShade === shade.name;

                            return (
                              <button
                                key={`${family.name}-${shade.name}`}
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  applyPalette(family.name, shade);
                                }}
                                className="flex flex-col items-center text-center outline-none"
                              >
                                <span
                                  className={[
                                    "h-[40px] w-[40px] rounded-full border border-[#c7c0b7] transition hover:scale-105",
                                    isShadeSelected
                                      ? "ring-[2px] ring-[#15100c] ring-offset-[3px]"
                                      : "",
                                  ].join(" ")}
                                  style={{ background: shade.color }}
                                />

                                <span className="mt-[8px] text-[10px] leading-[1.15] text-[#15100c]">
                                  {shade.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SmsRibbon() {
  return (
    <section className="bg-[#e98673] px-4 py-[24px] sm:px-6 sm:py-[20px]">
      <div className="mx-auto flex max-w-[1500px] flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <h3 className="font-serif text-[26px] font-semibold uppercase leading-none tracking-[-0.02em] text-white sm:text-[34px] md:text-[25px]">
          Can we get your number?
        </h3>

        <p className="hidden flex-1 text-center text-[18px] font-light text-white md:block">
          Sign up for SMS for first access to new arrivals, events & private
          trunk shows.
        </p>

        <a
          href="/signup"
          className={`rounded-full border border-white/40 px-5 py-3 text-[15px] font-light text-white sm:whitespace-nowrap sm:text-[18px] ${actionButtonClass}`}
        >
          right this way
        </a>
      </div>
    </section>
  );
}

function TrendingNow() {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  return (
    <ProductCarousel
      title="Trending Now"
      subtitle="Chosen by bridal parties this week"
      products={productList}
      carouselRef={carouselRef}
    />
  );
}

function ProductCarousel({
  title,
  subtitle,
  products,
  carouselRef,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  carouselRef: React.RefObject<HTMLDivElement | null>;
}) {
    const [activeIndex, setActiveIndex] = useState(0);
     const scrollCarousel = (direction: "prev" | "next") => {
    const container = carouselRef.current;
    if (!container || !products.length) return;

    const firstCard = container.querySelector("article") as HTMLElement | null;
    const cardWidth = firstCard?.getBoundingClientRect().width || 250;
    const gap = window.innerWidth >= 640 ? 26 : 18;
    const step = cardWidth + gap;

    const nextIndex =
      direction === "next"
        ? (activeIndex + 1) % products.length
        : (activeIndex - 1 + products.length) % products.length;

    container.scrollTo({
      left: nextIndex * step,
      behavior: "smooth",
    });

    setActiveIndex(nextIndex);
  };

  return (
    <section className="overflow-hidden bg-[#fbf8f1] px-4 py-[56px] sm:px-6">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-[30px] flex flex-col justify-between gap-4 border-b border-[#d8cfc2] pb-[20px] sm:flex-row sm:items-end">
          <div>
            <h2 className="font-serif text-[36px] italic leading-none tracking-[-0.045em] text-[#15100c] sm:text-[48px]">
              {title}
            </h2>

            {subtitle ? (
              <p className="mt-2 text-sm text-[#7a746e]">{subtitle}</p>
            ) : null}
          </div>

          <a
            href="/collection"
            className="w-fit text-[10px] uppercase tracking-[0.3em] text-[#b98262]"
          >
            Shop all →
          </a>
        </div>

        <div className="relative overflow-hidden">
          <CarouselArrow
            direction="left"
            onClick={() => scrollCarousel("prev")}
          />

          <div
            ref={carouselRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-[18px] overflow-x-auto scroll-smooth px-[52px] sm:gap-[26px]"
          >
                       {products.map((product, index) => (
              <ProductCard
                key={product.name}
                product={product}
              />
            ))}
          </div>

          <CarouselArrow
            direction="right"
            onClick={() => scrollCarousel("next")}
          />
        </div>
      </div>
    </section>
  );
}

function CarouselArrow({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        `absolute top-[150px] z-20 flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white text-[#3f3832] shadow-[0_8px_24px_rgba(0,0,0,0.18)] sm:top-[180px] lg:top-[245px] ${actionButtonClass}`,
        direction === "left" ? "left-0" : "right-0",
      ].join(" ")}
      aria-label={direction === "left" ? "Previous" : "Next"}
    >
      {direction === "left" ? (
        <ChevronLeft className="h-6 w-6" />
      ) : (
        <ChevronRight className="h-6 w-6" />
      )}
    </button>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addGown } = useBridalWorkspace();

  return (
    <article
      className={`group w-[230px] shrink-0 snap-start border border-[#e3d8c9] bg-white p-2 shadow-sm sm:w-[250px] ${cardHoverClass}`}
    >
      <div className="relative h-[245px] overflow-hidden bg-[#e5ddd0] sm:h-[280px]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />

        <span className="absolute left-[10px] top-[10px] bg-white/95 px-[12px] py-[6px] text-[8px] uppercase tracking-[0.28em] text-[#4f4944] shadow-sm">
          {product.tag}
        </span>

        <button
          type="button"
          onClick={() => addGown(makeWorkspaceGown(product))}
          className={`absolute right-[10px] top-[10px] flex h-[38px] w-[38px] items-center justify-center bg-white text-[#15100c] shadow-[0_4px_14px_rgba(0,0,0,0.14)] ${actionButtonClass}`}
          aria-label="Wishlist"
        >
          <Heart className="h-[19px] w-[19px] stroke-[1.6]" />
        </button>
      </div>

      <div className="px-1 pt-[9px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 font-serif text-[18px] italic leading-tight text-[#15100c]">
              {product.name}
            </h3>

            <p className="mt-[4px] truncate text-[11px] font-light text-[#6d6760]">
              {product.fabric}
            </p>
          </div>

          <p className="shrink-0 bg-[#fbf8f1] px-3 py-1.5 font-serif text-[13px] text-[#b98262]">
            {product.price}
          </p>
        </div>

        <div className="mt-[10px] flex items-center gap-[7px]">
          {product.swatches.map((color, index) => (
            <span
              key={`${product.name}-${color}`}
              className={[
                "h-[18px] w-[18px] rounded-full border border-[#b8afa4]",
                index === 0 ? "ring-1 ring-[#15100c] ring-offset-[2px]" : "",
              ].join(" ")}
              style={{ backgroundColor: color }}
            />
          ))}

          <span className="ml-[6px] truncate text-[10px] font-light text-[#7a746e]">
            {product.colorName}
          </span>
        </div>

        <div className="mt-[9px] grid grid-cols-6 gap-[5px]">
          {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
            <button
              key={size}
              type="button"
              className={`h-[25px] border border-[#d8cfc2] bg-[#fbf8f1] text-[9px] uppercase text-[#6d6760] hover:border-[#15100c] hover:text-[#15100c] ${actionButtonClass}`}
            >
              {size}
            </button>
          ))}
        </div>

        <div className="mt-[9px] grid grid-cols-[58px_1fr] items-center gap-[8px]">
          <label className="text-[8px] uppercase tracking-[0.24em] text-[#5f5a55]">
            Height
          </label>

          <select
            defaultValue={`5'5"`}
            className="h-[34px] w-full border border-[#d8cfc2] bg-[#fbf8f1] px-[10px] text-[11px] text-[#15100c] outline-none"
          >
            {heightOptions.map((height) => (
              <option key={height} value={height}>
                {height}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-[9px] grid grid-cols-[1fr_36px] gap-[8px]">
          <button
            type="button"
            className={`h-[36px] border border-[#15100c] bg-[#15100c] text-[9px] uppercase tracking-[0.22em] text-white ${actionButtonClass}`}
          >
            Add to bag
          </button>

          <button
            type="button"
            onClick={() => addGown(makeWorkspaceGown(product))}
            className={`h-[36px] border border-[#15100c] bg-white text-[22px] leading-none text-[#15100c] hover:bg-[#15100c] hover:text-white ${actionButtonClass}`}
            aria-label="Add gown to bridal workspace"
            title="Add to Bridal Workspace"
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}

function NewArrivals() {
  const [activeTab, setActiveTab] = useState("New Arrivals");
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const products = useMemo(() => {
    if (activeTab === "New Arrivals") return productList;

    if (activeTab === "Ready to Ship") {
      return productList.slice(1, 6);
    }

    return productList.slice(2);
  }, [activeTab]);

  return (
    <section className="overflow-hidden bg-[#fbf8f1] px-4 py-[56px] sm:px-6">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-[30px] flex flex-col gap-5 border-b border-[#d8cfc2] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-2 sm:gap-x-[46px]">
            {["New Arrivals", "Ready to Ship", "Made to Order"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  requestAnimationFrame(() => {
                    carouselRef.current?.scrollTo({
                      left: 0,
                      behavior: "smooth",
                    });
                  });
                }}
                className={[
                  "pb-[16px] text-[11px] uppercase tracking-[0.28em] transition sm:pb-[20px] sm:text-[14px] sm:tracking-[0.34em]",
                  activeTab === tab
                    ? "border-b-2 border-[#15100c] text-[#15100c]"
                    : "text-[#7a746e] hover:text-[#15100c]",
                ].join(" ")}
              >
                {tab}
              </button>
            ))}
          </div>

          <a
            href="/collection"
            className="pb-[18px] text-[10px] uppercase tracking-[0.3em] text-[#b98262]"
          >
            Shop all →
          </a>
        </div>

        <div className="relative overflow-hidden">
          <div
            ref={carouselRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-[18px] overflow-x-auto scroll-smooth px-[2px] sm:gap-[26px]"
          >
            {products.map((product) => (
              <ProductCard key={`${activeTab}-${product.name}`} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MomentFinder() {
  const edits = [
    {
      title: "Ready to Ship",
      copy: "For fast timelines",
      image: img.blue,
      href: "/collection",
    },
    {
      title: "Under $100",
      copy: "Budget-friendly bridal",
      image: img.white,
      href: "/collection",
    },
    {
      title: "Best Sellers",
      copy: "Group-approved favorites",
      image: img.hero,
      href: "/collection",
    },
    {
      title: "Plus Size",
      copy: "Fit confidence included",
      image: img.black,
      href: "/collection",
    },
    {
      title: "Maternity",
      copy: "Tailored for every trimester",
      image: img.blue,
      href: "/collection",
    },
  ];

  return (
    <section className="overflow-x-hidden bg-[#fbf8f1] pt-[42px]">
      <div className="mb-[34px] flex flex-col gap-5 px-4 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-[42px]">
        <div>
          <p className="mb-[16px] text-[13px] uppercase tracking-[0.38em] text-[#b98262]">
            Shop by edit
          </p>

          <h2 className="font-serif text-[38px] italic leading-none tracking-[-0.05em] text-[#15100c] md:text-[44px]">
            Find your gown by moment.
          </h2>
        </div>

        <a
          href="/collection"
          className="hidden border-b border-[#15100c] pb-[5px] text-[12px] uppercase tracking-[0.34em] text-[#15100c] md:block"
        >
          View all edits
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {edits.map((edit) => (
          <a
            key={edit.title}
            href={edit.href}
            className="group relative h-[340px] overflow-hidden bg-[#ded5c8] sm:h-[430px]"
          >
            <img
              src={edit.image}
              alt={edit.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

            <div className="absolute bottom-[30px] left-[24px] right-[20px] text-white sm:left-[28px]">
              <h3 className="font-serif text-[30px] leading-none tracking-[-0.04em] md:text-[34px]">
                {edit.title}
              </h3>

              <p className="mt-[12px] text-[13px] font-light leading-5 text-white/90">
                {edit.copy}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function BridalDashboard() {
  const eventImages = [img.hero, img.garden, img.black, img.white];
  const moodImages = [img.hero, img.garden, img.black, img.white];

  return (
    <section className="overflow-x-hidden bg-[#eee7dc] px-4 py-[56px] sm:px-6 sm:py-[72px]">
      <div className="mx-auto max-w-[1180px]">
        <div className="mx-auto mb-[48px] max-w-[820px] text-center">
          <p className="mb-[14px] text-[19px] uppercase tracking-[0.42em] text-[#b98262]">
            Bridal Party Dashboard
          </p>

          <h2 className="font-serif text-[36px] leading-[1.05] tracking-[-0.05em] text-[#15100c] sm:text-[48px] md:text-[42px]">
            One coordinated space for the bride,
            <br className="hidden sm:block" />
            bridesmaids, and every ceremony.
          </h2>
        </div>

        <div className="grid gap-[22px] md:grid-cols-2 xl:grid-cols-3">
          <DashboardInviteCard />
          <DashboardTaskCard />

          <div className="space-y-[22px] md:col-span-2 xl:col-span-1">
            <div className="rounded-[28px] border border-[#d8cfc2] bg-[#fbf8f1] p-[22px] shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-serif text-[24px] leading-none text-[#15100c]">
                  Wedding Events
                </h3>

                <a href="/bridal-party" className="text-[10px] text-[#b98262]">
                  View Timeline →
                </a>
              </div>

              <div className="mt-[18px] grid grid-cols-4 gap-[10px]">
                {["Welcome", "Shower", "Wedding", "After"].map(
                  (event, index) => (
                    <img
                      key={event}
                      src={eventImages[index]}
                      alt={event}
                      className="h-[78px] w-full rounded-[14px] object-cover"
                    />
                  )
                )}
              </div>

              <div className="mt-[18px] h-[6px] overflow-hidden rounded-full bg-[#e4dbcf]">
                <div className="h-full w-[62%] rounded-full bg-[#b98262]" />
              </div>

              <div className="mt-[24px] flex items-center justify-between">
                <h4 className="font-serif text-[22px] leading-none text-[#15100c]">
                  Moodboard
                </h4>

                <a className="text-[10px] text-[#b98262]">See All →</a>
              </div>

              <div className="mt-[14px] grid grid-cols-5 gap-[10px]">
                {moodImages.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt="Moodboard"
                    className="h-[68px] w-full rounded-[14px] object-cover"
                  />
                ))}

                <button className="flex h-[68px] flex-col items-center justify-center rounded-[14px] border border-dashed border-[#d8cfc2] text-[18px] text-[#7a746e]">
                  +
                  <span className="mt-[2px] text-[8px]">Add</span>
                </button>
              </div>
            </div>

            <GroupActivityCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardInviteCard() {
  return (
    <div className={`rounded-[28px] border border-[#d8cfc2] bg-[#fbf8f1] p-[22px] shadow-sm sm:p-[26px] ${cardHoverClass}`}>
      <div className="text-center">
        <p className="text-[9px] uppercase tracking-[0.38em] text-[#b98262]">
          You&apos;ve been invited!
        </p>

        <h3 className="mt-[14px] font-serif text-[31px] leading-[1.08] tracking-[-0.035em] text-[#15100c]">
          Join Emily&apos;s
          <br />
          Wedding Party
        </h3>

        <Heart className="mx-auto mt-[14px] h-[20px] w-[20px] fill-[#b98262] text-[#b98262]" />
      </div>

      <div className="mt-[30px] space-y-[14px]">
        <FormField label="Email" value="jessicamiller@email.com" />
        <SelectField
          label="Role"
          defaultValue="Bridesmaid"
          options={["Bridesmaid", "Bride", "Maid of Honor", "Mother of Bride"]}
        />
        <FormField label="Password optional" value="••••••••" />
      </div>

      <a
        href="/bridal-party"
        className={`mt-[16px] inline-flex h-[48px] w-full items-center justify-center rounded-full bg-[#15100c] text-[10px] uppercase tracking-[0.25em] text-white ${actionButtonClass}`}
      >
        Join the party
      </a>

      <p className="mt-[22px] text-center text-[10px] font-light text-[#7a746e]">
        By joining, you agree to our{" "}
        <span className="underline">Terms & Privacy Policy</span>.
      </p>
    </div>
  );
}

function DashboardTaskCard() {
  return (
    <div className={`rounded-[28px] border border-[#d8cfc2] bg-[#fbf8f1] p-[22px] shadow-sm ${cardHoverClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-serif text-[28px] leading-none tracking-[-0.03em] text-[#15100c]">
            Hi Jessica! 👋
          </h3>

          <p className="mt-[8px] text-[12px] leading-5 text-[#7a746e]">
            Here&apos;s what&apos;s happening in
            <br />
            <strong className="font-medium text-[#15100c]">
              Emily&apos;s Wedding Party
            </strong>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-[8px]">
          <span className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#eee7dc]">
            <Bell className="h-[15px] w-[15px]" />
            <span className="absolute -right-[1px] -top-[4px] h-[8px] w-[8px] rounded-full bg-[#b98262]" />
          </span>

          <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#15100c] text-[12px] font-medium text-white">
            J
          </span>
        </div>
      </div>

      <div className="relative mt-[18px] h-[165px] overflow-hidden rounded-[20px]">
        <img
          src={img.vineyard}
          alt="Wedding dashboard"
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/25" />

        <div className="absolute bottom-[16px] left-[18px] text-white">
          <h4 className="font-serif text-[25px] leading-none">
            Napa Valley Wedding
          </h4>

          <p className="mt-[5px] text-[12px]">June 22, 2026</p>
        </div>
      </div>

      <div className="mt-[18px]">
        <h4 className="font-serif text-[22px] leading-none text-[#15100c]">
          Your Tasks
        </h4>

        <p className="mt-[4px] text-[10px] text-[#7a746e]">
          2 of 5 completed
        </p>

        <div className="mt-[14px] space-y-[13px] text-[12px] text-[#4f4944]">
          <TaskRow done label="Enter Your Sizes" />
          <TaskRow done label="RSVP to Events" />
          <TaskRow label="Select Dress for Welcome Dinner" />
          <TaskRow label="Approve Color Palette" />
          <TaskRow label="Complete Payment" />
        </div>

        <button className={`mt-[20px] h-[44px] w-full rounded-full bg-[#eee7dc] text-[12px] text-[#4f4944] ${actionButtonClass}`}>
          View All Tasks
        </button>
      </div>
    </div>
  );
}

function GroupActivityCard() {
  return (
    <div className="rounded-[28px] border border-[#d8cfc2] bg-[#fbf8f1] p-[22px] shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-[24px] leading-none text-[#15100c]">
          Group Activity
        </h3>

        <a className="text-[10px] text-[#b98262]">See All →</a>
      </div>

      <div className="mt-[18px] space-y-[14px]">
        {[
          ["S", "Sofia loved a dress", "2m ago"],
          ["A", "Ava commented on a look", "1h ago"],
          ["E", "Emily approved a dress", "2h ago"],
        ].map(([letter, text, time]) => (
          <div key={text} className="flex items-center gap-[12px]">
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#eee7dc] text-[12px] text-[#15100c]">
              {letter}
            </span>

            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[#15100c]">{text}</p>

              <p className="mt-[1px] text-[10px] text-[#7a746e]">{time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-[10px] font-light text-[#7a746e]">{label}</span>

      <input
        defaultValue={value}
        className="mt-[6px] h-[46px] w-full rounded-[14px] border border-[#d8cfc2] bg-white px-[14px] text-[13px] outline-none focus:border-[#15100c]"
      />
    </label>
  );
}

function SelectField({
  label,
  defaultValue,
  options,
}: {
  label: string;
  defaultValue: string;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-light text-[#7a746e]">{label}</span>

      <select
        defaultValue={defaultValue}
        className="mt-[6px] h-[46px] w-full rounded-[14px] border border-[#d8cfc2] bg-white px-[14px] text-[13px] outline-none focus:border-[#15100c]"
      >
        {options.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}

function TaskRow({ label, done = false }: { label: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-[10px]">
      <span
        className={[
          "flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full border",
          done
            ? "border-[#15100c] bg-[#15100c] text-white"
            : "border-[#cfc6ba] bg-transparent",
        ].join(" ")}
      >
        {done ? <CheckCircle2 className="h-[12px] w-[12px]" /> : null}
      </span>

      <span className={done ? "text-[#7a746e] line-through" : ""}>
        {label}
      </span>
    </div>
  );
}

function FormalCollections() {
  const collections = [
    { title: "Cocktail Dresses", image: img.white },
    { title: "Evening Dresses", image: img.blue },
    { title: "Prom Dresses", image: img.hero },
    { title: "Corset Dresses", image: img.black },
    { title: "Summer Dresses", image: img.lavender },
    { title: "Floral Dresses", image: img.garden },
  ];

  return (
    <section className="overflow-x-hidden bg-[#fbf8f1] px-4 py-[56px] sm:px-6">
      <div className="mx-auto max-w-[1040px]">
        <h2 className="mb-[38px] text-center font-serif text-[38px] leading-none tracking-[-0.045em] text-[#15100c] md:text-[52px]">
          Trending Formal Collections
        </h2>

        <div className="grid items-start gap-[26px] lg:grid-cols-[minmax(0,540px)_1fr]">
          <a href="/collection" className={`group rounded-[32px] bg-white p-3 shadow-sm ${cardHoverClass}`}>
            <div className="h-[360px] overflow-hidden rounded-[26px] bg-[#ded5c8] sm:h-[470px] lg:h-[555px]">
              <img
                src={img.formal}
                alt="Formal Dresses"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
              />
            </div>

            <h3 className="mt-[16px] text-center text-[13px] font-semibold text-[#15100c]">
              Formal Dresses
            </h3>
          </a>

          <div className="grid grid-cols-2 gap-x-[14px] gap-y-[24px] sm:grid-cols-3 sm:gap-x-[18px] sm:gap-y-[28px]">
            {collections.map((item) => (
              <a key={item.title} href="/collection" className={`group rounded-[24px] bg-white p-2 shadow-sm ${cardHoverClass}`}>
                <div className="h-[145px] overflow-hidden rounded-[18px] bg-[#ded5c8] sm:h-[155px]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
                  />
                </div>

                <h3 className="mt-[10px] text-center text-[12px] font-semibold text-[#15100c]">
                  {item.title}
                </h3>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SwatchSection() {
  const swatchTags = [
    { label: "Greens", color: "#8fa083" },
    { label: "Blues", color: "#b8d3e2" },
    { label: "Pinks", color: "#e9c6c9" },
    { label: "Neutrals", color: "#d9c79f" },
    { label: "Reds", color: "#9f2626" },
    { label: "Browns", color: "#8a5627" },
    { label: "Blacks", color: "#111111" },
    { label: "Purples", color: "#b995d4" },
    { label: "Yellows", color: "#d3aa43" },
  ];

  return (
    <section className="overflow-x-hidden bg-[#eee7dc] px-4 py-[64px] sm:px-6 lg:py-[84px]">
      <div className="mx-auto grid max-w-[1250px] items-center gap-[48px] lg:grid-cols-[0.95fr_1.05fr] lg:gap-[64px]">
        <div>
          <p className="mb-[24px] text-[15px] uppercase tracking-[0.42em] text-[#6f6a65]">
            — Free Swatches
          </p>

          <h2 className="max-w-[650px] font-serif text-[42px] leading-[1] tracking-[-0.06em] text-[#17110d] sm:text-[58px] md:text-[52px]">
            Test color, fabric, and
            <br />
            <span className="italic">camera-read</span> before
            <br />
            ordering.
          </h2>

          <p className="mt-[30px] max-w-[560px] text-[20px] font-light leading-7 text-[#5f5a55]">
            Order swatches by palette, fabric, or bridal group. Shahsi can
            attach swatches to a bridal workspace so every member sees the
            selected palette.
          </p>

          <div className="mt-[34px] flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-[22px]">
            <a
              href="/swatches"
              className={`inline-flex h-[50px] items-center justify-center rounded-full bg-[#15100c] px-[26px] text-center text-[12px] font-semibold uppercase tracking-[0.26em] text-white sm:px-[36px] ${actionButtonClass}`}
            >
              Order Free Swatches
              <ArrowRight className="ml-4 h-4 w-4" />
            </a>

            <a
              href="/swatches"
              className="w-fit border-b border-[#b98262] pb-[5px] text-[12px] uppercase tracking-[0.34em] text-[#8b6b57]"
            >
              Request Custom Dye
            </a>
          </div>

          <div className="mt-[34px] flex max-w-[620px] flex-wrap gap-[12px]">
            {swatchTags.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`inline-flex h-[36px] items-center gap-[10px] rounded-full border border-[#d1c7bb] bg-[#fbf8f1] px-[14px] text-[9px] uppercase tracking-[0.28em] text-[#15100c] shadow-sm ${actionButtonClass}`}
              >
                <span
                  className="h-[20px] w-[20px] rounded-full border border-[#d4cabe]"
                  style={{ background: item.color }}
                />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative h-[430px] overflow-hidden rounded-[40px] shadow-[0_25px_70px_rgba(23,17,13,0.15)] sm:h-[540px] lg:h-[630px]">
          <img
            src={img.swatch}
            alt="Summer Bridesmaids"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />

          <div className="absolute left-[7%] top-[38%] z-10 text-white">
            <h3 className="font-serif text-[46px] font-semibold leading-[0.98] tracking-[-0.05em] text-white drop-shadow-sm sm:text-[64px] md:text-[66px]">
              Summer
              <br />
              Bridesmaids
            </h3>

            <a
              href="/collection"
              className="mt-[24px] inline-block border-b border-white pb-[4px] font-serif text-[20px] text-white"
            >
              Shop All
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function EditorialEdits() {
  const edits = [
    {
      title: "Garden Wedding Edit",
      copy: "Soft greens, blues, and breathable chiffon for outdoor ceremonies.",
      image: img.black,
    },
    {
      title: "Storybook Wedding",
      copy: "Romantic palettes, soft draping, florals, and dreamy silhouettes.",
      image: img.burgundy,
    },
    {
      title: "Jewel Tone Moment",
      copy: "Emerald, merlot, navy, and rich satin for evening ceremonies.",
      image: img.hero,
    },
  ];

  return (
    <section className="overflow-x-hidden bg-[#fbf8f1] px-4 py-[64px] sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-[38px]">
          <p className="mb-[14px] text-[15px] uppercase tracking-[0.42em] text-[#6f6a65]">
            Editorial Edits
          </p>

          <h2 className="max-w-[760px] font-serif text-[42px] leading-[1] tracking-[-0.06em] text-[#17110d] sm:text-[58px] md:text-[52px]">
            Curated looks for every
            <br className="hidden sm:block" />
            ceremony mood.
          </h2>
        </div>

        <div className="grid gap-[22px] md:grid-cols-3">
          {edits.map((edit) => (
            <a
              key={edit.title}
              href="/collection"
              className={`group relative h-[380px] overflow-hidden rounded-[36px] bg-[#ded5c8] sm:h-[440px] ${cardHoverClass}`}
            >
              <img
                src={edit.image}
                alt={edit.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-black/12 to-transparent" />

              <div className="absolute bottom-[28px] left-[22px] right-[22px] text-white sm:left-[26px] sm:right-[24px]">
                <h3 className="font-serif text-[29px] leading-none tracking-[-0.035em] text-white">
                  {edit.title}
                </h3>

                <p className="mt-[14px] max-w-[320px] text-[13px] font-light leading-5 text-white/90">
                  {edit.copy}
                </p>

                <span className="mt-[22px] inline-flex h-[40px] items-center justify-center rounded-full bg-[#fbf8f1] px-[28px] text-[9px] font-semibold uppercase tracking-[0.35em] text-[#15100c]">
                  Shop Edit
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function JustBeforeIDo() {
  const looks = [
    {
      title: "getting ready looks",
      image: img.gettingReady,
      href: "/collection",
    },
    {
      title: "something blue for bridesmaids",
      image: img.blueBridesmaids,
      href: "/collection",
    },
    {
      title: "bridal slip dresses",
      image: img.bridalSlip,
      href: "/collection",
    },
  ];

  return (
    <section className="overflow-x-hidden bg-[#fbf8f1] px-4 py-[60px] sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-[34px] flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-[24px]">
          <h2 className="font-serif text-[18px] uppercase tracking-[0.24em] text-[#15100c] sm:whitespace-nowrap sm:text-[24px] sm:tracking-[0.32em]">
            Just us before “I do”
          </h2>

          <span className="h-px flex-1 bg-[#cfc6ba]" />
        </div>

        <div className="grid gap-[34px] md:grid-cols-3">
          {looks.map((look) => (
            <a key={look.title} href={look.href} className="group text-center">
              <div className={`h-[370px] overflow-hidden rounded-[36px] bg-[#ded5c8] sm:h-[440px] ${cardHoverClass}`}>
                <img
                  src={look.image}
                  alt={look.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
                />
              </div>

              <p className="mt-[22px] font-serif text-[18px] italic text-[#15100c] underline underline-offset-[5px]">
                {look.title}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustBand() {
  const trustItems = [
    {
      icon: Truck,
      title: "Complimentary Shipping",
      copy: "On all U.S. orders over $200",
    },
    {
      icon: RefreshCcw,
      title: "Easy 30-Day Returns",
      copy: "Resize, restyle, or refund",
    },
    {
      icon: ShieldCheck,
      title: "Insured Rentals",
      copy: "Damage protection included",
    },
    {
      icon: Star,
      title: "Atelier Crafted",
      copy: "Hand-finished by master tailors",
    },
    {
      icon: ShoppingBag,
      title: "Secure Checkout",
      copy: "256-bit encrypted payments",
    },
    {
      icon: Mail,
      title: "Concierge Styling",
      copy: "7 days a week, by appointment",
    },
  ];

  return (
    <section className="border-y border-[#d8cfc2] bg-[#eee7dc] px-4 py-[58px] sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-[34px] text-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`rounded-[28px] bg-[#fbf8f1]/60 p-5 ${cardHoverClass}`}
              >
                <Icon className="mx-auto h-[24px] w-[24px] stroke-[1.45] text-[#17110d]" />

                <h3 className="mt-[18px] font-serif text-[16px] leading-none text-[#15100c]">
                  {item.title}
                </h3>

                <p className="mx-auto mt-[10px] max-w-[150px] text-[9px] uppercase leading-[1.8] tracking-[0.36em] text-[#8b867f]">
                  {item.copy}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-[52px] h-px max-w-[1060px] bg-[#d4cabd]" />

        <div className="mt-[34px] flex flex-wrap items-center justify-center gap-x-[32px] gap-y-[14px] text-center sm:gap-x-[42px]">
          <span className="text-[9px] uppercase tracking-[0.42em] text-[#8b867f]">
            As seen in
          </span>

          {["Vogue", "Harper's Bazaar", "Brides", "Martha Stewart", "The Knot"].map(
            (item, index) => (
              <span
                key={item}
                className={[
                  "font-serif text-[18px] text-[#15100c]",
                  index % 2 ? "italic" : "",
                ].join(" ")}
              >
                {item}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function RentalWardrobe() {
  const rentalImages = [
    img.clutch,
    img.garden,
    img.black,
    img.burgundy,
    img.hero,
    img.white,
    img.blue,
    img.lavender,
  ];

  return (
    <section className="overflow-x-hidden bg-[#fbf8f1] px-4 py-[64px] text-center sm:px-6">
      <div className="mx-auto max-w-[1500px]">
        <p className="mb-[12px] text-[13px] uppercase tracking-[0.42em] text-[#b98262]">
          Own your day
        </p>

        <h2 className="font-serif text-[38px] italic leading-none tracking-[-0.04em] text-[#15100c] md:text-[52px]">
          Rent your occasion wardrobe
        </h2>

        <div className="relative mt-[42px] overflow-hidden">
          <div className="flex w-max animate-rental-scroll gap-[18px] sm:gap-[24px]">
            {[...rentalImages, ...rentalImages].map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="group h-[260px] w-[205px] shrink-0 overflow-hidden  bg-[#ded5c8] shadow-sm sm:h-[330px] sm:w-[265px]"
              >
                <img
                  src={src}
                  alt="Rental wardrobe"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>

        <a
          href="/rental"
          className={`mt-[42px] inline-flex h-[50px] items-center justify-center rounded-full bg-[#15100c] px-[38px] text-[10px] font-semibold uppercase tracking-[0.28em] text-white sm:px-[46px] ${actionButtonClass}`}
        >
          Shop all rental
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <section className="bg-[#15100c] px-4 py-[50px] text-white sm:px-6">
        <div className="mx-auto grid max-w-[1250px] items-center gap-10 lg:grid-cols-[1fr_0.95fr]">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-[26px]">
            <Mail className="h-[42px] w-[42px] shrink-0 stroke-[1.15] sm:h-[46px] sm:w-[46px]" />

            <div>
              <h2 className="font-serif text-[30px] leading-none tracking-[-0.03em] md:text-[38px]">
                Here to brighten up your inbox.
              </h2>

              <p className="mt-[12px] text-[13px] font-light text-white/85">
                Emails are the fastest way to learn about new styles, sales, and
                more.
              </p>
            </div>
          </div>

          <div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-[24px]">
              <input
                placeholder="Email Address"
                className="h-[50px] w-full rounded-full bg-[#fbf8f1] px-[22px] text-[13px] text-[#15100c] outline-none placeholder:text-[#8b867f]"
              />

              <button className={`h-[50px] rounded-full bg-[#b98262] px-[22px] text-[13px] text-white sm:bg-transparent ${actionButtonClass}`}>
                Submit
              </button>
            </div>

            <p className="mt-[16px] text-left text-[10px] font-light text-white/85 sm:text-right">
              By clicking submit, you agree to our{" "}
              <span className="underline">Terms of Service</span> and{" "}
              <span className="underline">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </section>

      <section className="relative bg-[#fbf8f1] px-4 py-[48px] sm:px-6">
        <div className="mx-auto flex max-w-[1250px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <h3 className="font-serif text-[30px] leading-none tracking-[-0.03em] text-[#15100c]">
            Shahsi
          </h3>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-light text-[#5f5a55] md:justify-center md:gap-[34px]">
            <a href="/stockists">Stockists</a>
            <a href="/atelier">The Atelier</a>
            <a href="/care-repair">Care & Repair</a>
            <a href="/authenticity">Authenticity</a>
            <a href="/contact">Contact</a>
          </nav>

          <p className="text-[13px] font-light text-[#5f5a55]">
            © 2026 Shahsi Atelier
          </p>
        </div>
      </section>
    </footer>
  );
}

function GlobalStyles() {
  return (
    <style jsx global>{`
      .no-scrollbar {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }

      @keyframes rental-scroll {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(-50%);
        }
      }

      .animate-rental-scroll {
        animation: rental-scroll 44s linear infinite;
      }

      .animate-rental-scroll:hover {
        animation-play-state: paused;
      }

      @keyframes reveal-up {
        from {
          opacity: 0;
          transform: translateY(24px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-reveal {
        animation: reveal-up 720ms ease-out both;
      }

      @keyframes mobile-menu {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-mobile-menu {
        animation: mobile-menu 220ms ease-out both;
      }

      @keyframes popover {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .animate-popover {
        animation: popover 180ms ease-out both;
      }

      html {
        scroll-behavior: smooth;
      }
    `}</style>
  );
}