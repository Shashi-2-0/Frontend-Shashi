"use client";

import React, { useMemo, useState } from "react";
import { Check, ChevronDown, Heart, Palette, ShoppingBag } from "lucide-react";

type Swatch = {
  id: string;
  name: string;
  hex?: string;
  image?: string;
};

type ColorFamily = {
  id: string;
  name: string;
  preview: string;
  swatches: Swatch[];
};

const colorFamilies: ColorFamily[] = [
  {
    id: "all",
    name: "All",
    preview:
      "conic-gradient(from 90deg, #e96565, #f2c94c, #6fcf97, #56ccf2, #9b51e0, #f299c1, #e96565)",
    swatches: [],
  },
  {
    id: "green",
    name: "Green",
    preview: "#b8c7ad",
    swatches: [
      { id: "dusty-sage", name: "Dusty Sage", hex: "#b8c7ad" },
      { id: "moss-green", name: "Moss Green", hex: "#b8ad8c" },
      { id: "agave", name: "Agave", hex: "#9caea8" },
      { id: "silver-sage", name: "NEW! Silver Sage", hex: "#8fa092" },
      { id: "matcha", name: "Matcha", hex: "#8aa184" },
      { id: "eucalyptus", name: "Eucalyptus", hex: "#648672" },
      { id: "sea-moss", name: "Sea Moss", hex: "#5f7d6d" },
      { id: "pistachio", name: "Pistachio", hex: "#868b69" },
      { id: "juniper", name: "Juniper", hex: "#526833" },
      { id: "basil", name: "Basil", hex: "#739858" },
      { id: "olive", name: "Olive", hex: "#7b6d3b" },
      { id: "willow-green", name: "Willow Green", hex: "#6d5f43" },
      { id: "lemongrass", name: "NEW! Lemongrass", hex: "#bec13f" },
      { id: "dark-green", name: "Dark Green", hex: "#0d5d52" },
      { id: "peacock", name: "Peacock", hex: "#076a73" },
      { id: "pine", name: "Pine", hex: "#075342" },
      { id: "emerald", name: "Emerald", hex: "#003f37" },
      {
        id: "green-fern-floral",
        name: "Green Fern Floral",
        image:
          "linear-gradient(135deg, #cbd9c2 0%, #eaf0e4 35%, #7f9a76 36%, #dfe8d5 60%, #8aa184 61%)",
      },
    ],
  },
  {
    id: "blue",
    name: "Blue",
    preview: "#8da4bb",
    swatches: [
      { id: "dusty-blue", name: "Dusty Blue", hex: "#9db6ca" },
      { id: "sky-blue", name: "Sky Blue", hex: "#9fcbe3" },
      { id: "steel-blue", name: "Steel Blue", hex: "#6e879b" },
      { id: "slate-blue", name: "Slate Blue", hex: "#586f86" },
      { id: "navy", name: "Navy", hex: "#152840" },
      { id: "ocean", name: "Ocean", hex: "#075c73" },
    ],
  },
  {
    id: "pink",
    name: "Pink",
    preview: "#dfb8b6",
    swatches: [
      { id: "blush", name: "Blush", hex: "#e7c4c1" },
      { id: "rose", name: "Rose", hex: "#d7a0a6" },
      { id: "dusty-rose", name: "Dusty Rose", hex: "#c98d93" },
      { id: "mauve", name: "Mauve", hex: "#b98591" },
      { id: "peony", name: "Peony", hex: "#f0b4c0" },
      { id: "watermelon", name: "Watermelon", hex: "#d9576b" },
    ],
  },
  {
    id: "purple",
    name: "Purple",
    preview: "#b99bbb",
    swatches: [
      { id: "lavender", name: "Lavender", hex: "#c9b4d4" },
      { id: "lilac", name: "Lilac", hex: "#b99bc8" },
      { id: "wisteria", name: "Wisteria", hex: "#a88ebd" },
      { id: "plum", name: "Plum", hex: "#68405f" },
      { id: "eggplant", name: "Eggplant", hex: "#47253f" },
      { id: "amethyst", name: "Amethyst", hex: "#7c5fa5" },
    ],
  },
  {
    id: "red",
    name: "Red",
    preview: "#b6102b",
    swatches: [
      { id: "cabernet", name: "Cabernet", hex: "#74182b" },
      { id: "burgundy", name: "Burgundy", hex: "#851e34" },
      { id: "merlot", name: "Merlot", hex: "#6c1f2d" },
      { id: "ruby", name: "Ruby", hex: "#a80f2d" },
      { id: "scarlet", name: "Scarlet", hex: "#c41e3a" },
      { id: "wine", name: "Wine", hex: "#5f1b2a" },
    ],
  },
  {
    id: "orange",
    name: "Orange",
    preview: "#ec8b63",
    swatches: [
      { id: "terracotta", name: "Terracotta", hex: "#c46f4f" },
      { id: "copper", name: "Copper", hex: "#b96f4a" },
      { id: "apricot", name: "Apricot", hex: "#f1a57d" },
      { id: "coral", name: "Coral", hex: "#ef7f69" },
      { id: "burnt-orange", name: "Burnt Orange", hex: "#b9562e" },
      { id: "peach", name: "Peach", hex: "#f3b092" },
    ],
  },
];

function getAllSwatches() {
  return colorFamilies
    .filter((family) => family.id !== "all")
    .flatMap((family) =>
      family.swatches.map((swatch) => ({
        ...swatch,
        familyName: family.name,
      }))
    );
}

export default function ColorFamilySwatchSelector() {
  const [activeFamilyId, setActiveFamilyId] = useState("green");
  const [selectedSwatchId, setSelectedSwatchId] = useState("dusty-sage");

  const activeFamily = colorFamilies.find(
    (family) => family.id === activeFamilyId
  );

  const visibleSwatches = useMemo(() => {
    if (activeFamilyId === "all") {
      return getAllSwatches();
    }

    return activeFamily?.swatches ?? [];
  }, [activeFamilyId, activeFamily]);

  const selectedSwatch =
    visibleSwatches.find((swatch) => swatch.id === selectedSwatchId) ??
    visibleSwatches[0];

  function handleFamilyClick(familyId: string) {
    setActiveFamilyId(familyId);

    const family = colorFamilies.find((item) => item.id === familyId);

    if (familyId === "all") {
      const first = getAllSwatches()[0];
      setSelectedSwatchId(first?.id ?? "");
      return;
    }

    setSelectedSwatchId(family?.swatches[0]?.id ?? "");
  }

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-12 lg:px-8">
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Shop by color
          </p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight md:text-5xl">
            Choose color family, then select exact swatch.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
            Customer pehle color family choose karega, phir us family ke andar
            exact shade / fabric swatch select karega.
          </p>
        </div>

        {selectedSwatch && (
          <div className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-neutral-200">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
              Selected swatch
            </p>
            <div className="mt-3 flex items-center gap-3">
              <SwatchCircle swatch={selectedSwatch} size="small" />
              <div>
                <p className="font-medium">{selectedSwatch.name}</p>
                <p className="text-sm text-neutral-500">
                  {activeFamilyId === "all"
                    ? "Mixed family"
                    : activeFamily?.name}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative rounded-[2.5rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-8">
        <div className="mb-8 flex gap-6 overflow-x-auto pb-3">
          {colorFamilies.map((family) => {
            const isActive = activeFamilyId === family.id;

            return (
              <button
                key={family.id}
                onClick={() => handleFamilyClick(family.id)}
                className="min-w-[78px] text-center"
              >
                <span
                  className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full transition ${
                    isActive
                      ? "border-2 border-neutral-950 p-1"
                      : "border border-transparent p-1"
                  }`}
                >
                  <span
                    className="block h-full w-full rounded-full shadow-inner"
                    style={{ background: family.preview }}
                  />
                </span>

                <span className="mt-3 block text-base font-medium">
                  {family.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative rounded-[2rem] border border-neutral-200 bg-[#fbfaf6] p-5 md:p-7">
          <div className="absolute -top-4 left-12 h-8 w-8 rotate-45 border-l border-t border-neutral-200 bg-[#fbfaf6]" />

          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600 ring-1 ring-neutral-200">
                <Palette className="h-4 w-4" />
                {activeFamilyId === "all"
                  ? "All Swatches"
                  : `${activeFamily?.name} Swatches`}
              </div>

              <h3 className="mt-4 text-2xl font-medium tracking-tight">
                {visibleSwatches.length} shades available
              </h3>
            </div>

            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white">
              <ShoppingBag className="h-4 w-4" />
              Order swatches
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {visibleSwatches.map((swatch) => {
              const isSelected = selectedSwatchId === swatch.id;

              return (
                <button
                  key={swatch.id}
                  onClick={() => setSelectedSwatchId(swatch.id)}
                  className="group text-center"
                >
                  <span
                    className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition group-hover:scale-105 ${
                      isSelected
                        ? "ring-2 ring-neutral-950 ring-offset-4 ring-offset-[#fbfaf6]"
                        : "ring-1 ring-neutral-200"
                    }`}
                  >
                    <SwatchCircle swatch={swatch} size="large" />

                    {isSelected && (
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-950 text-white">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </span>

                  <span className="mt-3 block text-sm font-medium leading-5">
                    {swatch.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedSwatch && (
          <div className="mt-6 grid gap-4 rounded-[2rem] bg-neutral-950 p-5 text-white md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex items-center gap-4">
              <SwatchCircle swatch={selectedSwatch} size="small" />
              <div>
                <p className="text-lg font-medium">
                  {selectedSwatch.name} selected
                </p>
                <p className="text-sm text-white/60">
                  Is swatch ko product variant, bridal party palette aur
                  checkout cart me save kar sakte ho.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-950">
                <Heart className="h-4 w-4" />
                Save
              </button>

              <button className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white">
                View dresses
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SwatchCircle({
  swatch,
  size,
}: {
  swatch: Swatch;
  size: "small" | "large";
}) {
  const className =
    size === "small"
      ? "block h-12 w-12 rounded-full ring-1 ring-white/20"
      : "block h-16 w-16 rounded-2xl";

  return (
    <span
      className={className}
      style={{
        background: swatch.image || swatch.hex,
      }}
    />
  );
}