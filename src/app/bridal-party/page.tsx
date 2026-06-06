


"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Link2,
  Loader2,
  Mail,
  MessageSquare,
  Plus,
  RefreshCcw,
  Ruler,
 
  Sparkles,
  Truck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

import { useToast } from "@/components/ui/AppToast";

import {
  BridalEventStatus,
  BridalMember,
  BridalPaletteOption,
  BridalSetupOption,
  assignDressToMember,
  createBridalEvent,
  createBridalPayment,
  getBridalEventSetupOptions,
  getBridalEventStatus,
  getShipment,
  inviteBridalMember,
  submitBridalMemberSize,
} from "@/lib/api/bridalParty.api";

import {
  CatalogProduct,
  getCatalogRecommendations,
} from "@/lib/api/catalog.api";

import StripePaymentBox from "./StripePaymentBox";

type ApiState = {
  loading: boolean;
  error: string;
  success: string;
};

type LocalAssignedSelectionSnapshot = {
  productId?: string;
  variantId?: string;
  dressName?: string;
  imageUrl?: string;
  size?: string;
  color?: string;
  height?: string;
  updatedAt?: string;
};

type SizeFormState = {
  size: string;
  bust: string;
  waist: string;
  hip: string;
  height: string;
  preference: string;
};

type InviteChannel = "email" | "whatsapp" | "facebook" | "instagram" | "copy-link";


type InviteFieldKey =
  | "name"
  | "email"
  | "countryCode"
  | "phoneNumber"
  | "socialAccount"
  | "role"
  | "message";

type InviteChannelConfig = {
  id: InviteChannel;
  label: string;
  title: string;
  subtitle: string;
  requiredFields: InviteFieldKey[];
  optionalFields?: InviteFieldKey[];
  note: string;
};

const INVITE_CHANNEL_CONFIGS: InviteChannelConfig[] = [
  {
    id: "email",
    label: "Email",
    title: "Invite via Email",
    subtitle: "Send a bridal party invite to their email address.",
    requiredFields: ["name", "email"],
    optionalFields: ["role", "message"],
    note: "Email invite ke liye name aur email required hai.",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    title: "Invite via WhatsApp",
    subtitle: "Create a backend invite and share it on WhatsApp.",
    requiredFields: ["name", "countryCode", "phoneNumber"],
    optionalFields: ["role", "message"],
    note: "WhatsApp invite ke liye country code aur phone number required hai.",
  },
  {
    id: "facebook",
    label: "Facebook",
    title: "Invite via Facebook",
    subtitle: "Create a backend invite for Facebook sharing.",
    requiredFields: ["name", "socialAccount"],
    optionalFields: ["role", "message"],
    note: "Facebook invite ke liye profile/account required hai.",
  },
  {
    id: "instagram",
    label: "Instagram",
    title: "Invite via Instagram",
    subtitle: "Create a backend invite for Instagram sharing.",
    requiredFields: ["name", "socialAccount"],
    optionalFields: ["role", "message"],
    note: "Instagram invite ke liye username/account required hai.",
  },
];


const weddingPaletteFamilies = [
  {
    id: "neutrals",
    name: "Neutrals",
    colors: [
      { name: "White", hex: "#F5F5F2" },
      { name: "Ivory / Cloud Dancer", hex: "#E9E2D8" },
      { name: "Champagne", hex: "#DCCB94" },
      { name: "Taupe", hex: "#B7A796" },
      { name: "Chocolate / Expresso", hex: "#6E4332" },
    ],
  },
  {
    id: "rose-red",
    name: "Rose & Red",
    colors: [
      { name: "Blush Pink", hex: "#E9C0C6" },
      { name: "Dusty Rose", hex: "#C48A8E" },
      { name: "Ruby Red", hex: "#A81534" },
      { name: "Burgundy", hex: "#7C1C2A" },
    ],
  },
  {
    id: "purple",
    name: "Purple",
    colors: [
      { name: "Lavender", hex: "#BCAFD4" },
      { name: "Amethyst", hex: "#6E53A0" },
      { name: "Lilac", hex: "#C8B5DD" },
      { name: "Plum", hex: "#46114D" },
    ],
  },
  {
    id: "blue",
    name: "Blue",
    colors: [
      { name: "Ice", hex: "#C4CCE4" },
      { name: "Sky Blue / Baby Blue", hex: "#B8CCE2" },
      { name: "Steel Blue", hex: "#879DC0" },
      { name: "Dusty Blue", hex: "#95A4B5" },
      { name: "Powder Blue", hex: "#A9B9D3" },
      { name: "Sapphire Blue", hex: "#2D46A0" },
      { name: "Midnight Navy", hex: "#22345B" },
      { name: "Black", hex: "#000000" },
    ],
  },
  {
    id: "green",
    name: "Green",
    colors: [
      { name: "Olive", hex: "#7B7244" },
      { name: "Sage Green", hex: "#A0B18A" },
      { name: "Emerald", hex: "#197661" },
      { name: "Rich Teal", hex: "#05444A" },
    ],
  },
  {
    id: "warm-earth",
    name: "Warm Earth",
    colors: [
      { name: "Butterscotch", hex: "#C5913B" },
      { name: "Bronzer", hex: "#BC845F" },
      { name: "Cinnamon", hex: "#BB6E42" },
      { name: "Sienna", hex: "#AA5A2F" },
    ],
  },
  {
    id: "pink",
    name: "Pink",
    colors: [
      { name: "Blushing Pink", hex: "#DCCCCC" },
      { name: "Candy Pink", hex: "#D0AFCA" },
      { name: "Barbie Pink", hex: "#D34B9E" },
      { name: "Fuchsia", hex: "#BC3A8C" },
    ],
  },
];

const actionButtonClass =
  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(23,17,13,0.18)] active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

const ENABLE_BACKEND_EVENT_EXTRA_FIELDS = true;
const ENABLE_BACKEND_CEREMONY_INVITES = true;
const ENABLE_BACKEND_RECOMMENDATIONS = true;

function readFirst(...values: any[]) {
  for (const value of values) {
    if (value === undefined || value === null) continue;

    const text = String(value).trim();

    if (!text) continue;
    if (text.toLowerCase() === "null") continue;
    if (text.toLowerCase() === "undefined") continue;

    return text;
  }

  return "";
}

function WeddingPaletteFamilySelector({
  selectedPalette,
  onSelectPalette,
  palettes = weddingPaletteFamilies,
}: {
  selectedPalette: string;
  onSelectPalette: (value: string) => void;
  palettes?: {
    id: string;
    name: string;
    value?: string;
    label?: string;
    backendId?: string;
    colors: { name: string; hex: string }[];
  }[];
}) {
  const [openFamily, setOpenFamily] = useState<string>("");
  const [selectedShade, setSelectedShade] = useState<{
    familyId: string;
    familyName: string;
    shadeName: string;
    hex: string;
  } | null>(null);

  const selectedFamily = palettes.find((family) => {
    const familyValue = family.value || family.id;

    return (
      familyValue === selectedPalette ||
      family.id === selectedPalette ||
      family.name === selectedPalette
    );
  });

  const activeShade =
    selectedShade && selectedShade.familyId === selectedPalette
      ? selectedShade
      : selectedFamily
        ? {
            familyId: selectedFamily.value || selectedFamily.id,
            familyName: selectedFamily.name,
            shadeName: selectedFamily.colors[0]?.name || selectedFamily.name,
            hex: selectedFamily.colors[0]?.hex || "#17110d",
          }
        : null;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif text-[30px] leading-none text-[#17110d] sm:text-[36px]">
          Wedding Color Palette
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#7a746e]">
          Choose a main color. Click any circle to open its shade family.
        </p>
      </div>

      <div className="relative flex flex-wrap gap-4 sm:gap-5">
        {palettes.map((family, familyIndex) => {
          const familyValue = family.value || family.id;
          const familyName = family.name || family.label || familyValue;
          const isSelected =
            selectedPalette === familyValue || selectedPalette === family.id;
          const isOpen = openFamily === familyValue;
          const mainColor = family.colors[0]?.hex || "#17110d";

          const forceRightPopup =
            familyValue === "warm-earth" ||
            familyValue === "pink" ||
            familyValue === "pink-fuchsia";

          const isLeftEdge = familyIndex <= 1 || forceRightPopup;
          const isRightEdge =
            familyIndex >= palettes.length - 2 && !forceRightPopup;

          return (
            <div key={familyValue} className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenFamily((prev) =>
                    prev === familyValue ? "" : familyValue
                  );
                  onSelectPalette(familyValue);
                }}
                className={[
                  "group relative flex h-[64px] w-[64px] items-center justify-center rounded-full bg-transparent transition-all duration-300 hover:-translate-y-1 sm:h-[76px] sm:w-[76px]",
                  isSelected ? "scale-105" : "",
                ].join(" ")}
                title={familyName}
                aria-label={`Open ${familyName} palette`}
              >
                <span
                  className={[
                    "h-[50px] w-[50px] rounded-full border-[3px] border-white shadow-[0_8px_22px_rgba(23,17,13,0.16)] transition-all duration-300 sm:h-[58px] sm:w-[58px]",
                    isSelected ? "ring-[3px] ring-[#17110d]/20" : "",
                  ].join(" ")}
                  style={{ backgroundColor: mainColor }}
                />

                {isSelected ? (
                  <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#17110d] text-xs font-bold text-white shadow-[0_8px_20px_rgba(23,17,13,0.24)]">
                    ✓
                  </span>
                ) : null}

                <span className="pointer-events-none absolute -bottom-9 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-[#17110d] px-3 py-1.5 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:flex group-hover:opacity-100">
                  {familyName}
                </span>
              </button>

              {isOpen ? (
                <div
                  className={[
                    "absolute top-[86px] z-50 w-[min(340px,calc(100vw-32px))] rounded-[28px] border border-[#e1d2c5] bg-white p-4 shadow-[0_26px_70px_rgba(23,17,13,0.22)]",
                    isLeftEdge
                      ? "left-0 translate-x-0"
                      : isRightEdge
                        ? "right-0 translate-x-0"
                        : "left-1/2 -translate-x-1/2",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "absolute -top-2 h-4 w-4 rotate-45 border-l border-t border-[#e1d2c5] bg-white",
                      isLeftEdge
                        ? "left-8"
                        : isRightEdge
                          ? "right-8"
                          : "left-1/2 -translate-x-1/2",
                    ].join(" ")}
                  />

                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.28em] text-[#b98262]">
                        Palette Family
                      </p>

                      <h4 className="mt-1 font-serif text-[24px] italic leading-none text-[#17110d]">
                        {familyName}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpenFamily("")}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e4d8ca] text-sm text-[#7a746e] transition hover:bg-[#17110d] hover:text-white"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {family.colors.map((color) => {
                      const isShadeSelected =
                        selectedShade?.familyId === familyValue &&
                        selectedShade?.shadeName === color.name;

                      return (
                        <button
                          key={`${familyValue}-${color.name}`}
                          type="button"
                          onClick={() => {
                            onSelectPalette(familyValue);
                            setSelectedShade({
                              familyId: familyValue,
                              familyName,
                              shadeName: color.name,
                              hex: color.hex,
                            });
                            setOpenFamily("");
                          }}
                          className={[
                            "flex items-center gap-3 rounded-2xl border bg-[#fffdf9] px-3 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                            isShadeSelected
                              ? "border-[#17110d] ring-2 ring-[#17110d]/10"
                              : "border-[#eadfce]",
                          ].join(" ")}
                        >
                          <span
                            className="h-8 w-8 shrink-0 rounded-full border-2 border-white shadow-[0_5px_14px_rgba(23,17,13,0.16)]"
                            style={{ backgroundColor: color.hex }}
                          />

                          <span className="text-[12px] font-semibold leading-4 text-[#3e332d]">
                            {color.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {activeShade ? (
        <div className="rounded-[26px] border border-[#e5d8ca] bg-[#fffdf9] p-4 shadow-[0_12px_32px_rgba(23,17,13,0.05)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#b98262]">
                Selected Color
              </p>

              <h4 className="mt-2 font-serif text-[26px] italic leading-none text-[#17110d]">
                {activeShade.shadeName}
              </h4>

              <p className="mt-2 text-sm leading-6 text-[#7a746e]">
                Family: {activeShade.familyName}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="h-14 w-14 rounded-full border-4 border-white shadow-[0_8px_24px_rgba(23,17,13,0.18)]"
                style={{ backgroundColor: activeShade.hex }}
              />

              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#8b867f]">
                  Hex
                </p>

                <p className="mt-1 text-sm font-semibold text-[#17110d]">
                  {activeShade.hex}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getEventIdFromResponse(data: any) {
  return (
    data?.eventId ||
    data?.id ||
    data?.event?.id ||
    data?.event?.eventId ||
    data?.data?.eventId ||
    data?.data?.id ||
    data?.data?.event?.id ||
    data?.data?.event?.eventId ||
    data?.data?.bridalEvent?.id ||
    data?.data?.bridalEvent?.eventId ||
    ""
  );
}

function getLocalAssignedSelection(productId?: string) {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("bridalLastAssignedSelection");
    if (!raw) return null;

    const parsed = JSON.parse(raw) as LocalAssignedSelectionSnapshot;

    if (productId && parsed?.productId && parsed.productId !== productId) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function getMeasurementSource(member: BridalMember) {
  const item = member as any;

  const candidates = [
    item?.measurements,
    item?.measurement,
    item?.memberMeasurements,
    item?.memberMeasurement,
    item?.sizeMeasurement,
    item?.sizeMeasurements,
    item?.bodyMeasurements,
    item?.bodyMeasurement,
    item?.fitProfile,
    item?.fit,
    item?.profile,
    item?.sizePreference,
    item?.preferenceData,
    item?.bodyProfile,
    item?.memberSize,
    item?.sizeInfo,

    item?.data?.measurements,
    item?.data?.measurement,
    item?.data?.memberMeasurements,
    item?.data?.memberMeasurement,
    item?.data?.sizeMeasurement,
    item?.data?.sizeMeasurements,
    item?.data?.bodyMeasurements,
    item?.data?.bodyMeasurement,
    item?.data?.fitProfile,
    item?.data?.fit,
    item?.data?.profile,
    item?.data?.sizePreference,
    item?.data?.preferenceData,
    item?.data?.bodyProfile,
    item?.data?.memberSize,
    item?.data?.sizeInfo,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    if (Array.isArray(candidate)) {
      const lastObject = [...candidate]
        .reverse()
        .find((entry) => entry && typeof entry === "object");

      if (lastObject) return lastObject;
      continue;
    }

    if (typeof candidate === "object") {
      return candidate;
    }
  }

  return {};
}

function normalizeMembers(data: any): BridalMember[] {
  const raw =
    data?.members ||
    data?.data?.members ||
    data?.event?.members ||
    data?.data?.event?.members ||
    data?.bridalPartyMembers ||
    data?.data?.bridalPartyMembers ||
    data?.data?.event?.bridalPartyMembers ||
    data?.data?.invites ||
    data?.invites ||
    data?.data?.event?.invites ||
    [];

  if (!Array.isArray(raw)) return [];

  const uniqueMap = new Map<string, BridalMember>();

  raw.forEach((member: BridalMember, index: number) => {
    const item = member as any;

    const email = String(
      item?.email || item?.data?.email || item?.member?.email || ""
    )
      .trim()
      .toLowerCase();

    const id = String(
      item?.id ||
        item?.memberId ||
        item?.bridalMemberId ||
        item?.bridalPartyMemberId ||
        item?.data?.id ||
        item?.data?.memberId ||
        ""
    );

    const key = email || id || `member-${index}`;
    const existing = uniqueMap.get(key);

    if (!existing) {
      uniqueMap.set(key, member);
      return;
    }

    const existingStatus = String(getMemberApproval(existing)).toLowerCase();
    const currentStatus = String(getMemberApproval(member)).toLowerCase();

    const statusRank: Record<string, number> = {
      invited: 1,
      pending: 1,
      size_submitted: 2,
      submitted: 2,
      assigned: 3,
      approved: 4,
      paid: 5,
    };

    const existingRank = statusRank[existingStatus] || 0;
    const currentRank = statusRank[currentStatus] || 0;

    if (currentRank >= existingRank) {
      uniqueMap.set(key, member);
    }
  });

  return Array.from(uniqueMap.values());
}

function formatStatusLabel(value?: string) {
  const status = String(value || "pending").trim().toLowerCase();

  const map: Record<string, string> = {
    invited: "Invite Sent",
    pending: "Pending",
    size_submitted: "Size Submitted",
    "size submitted": "Size Submitted",
    submitted: "Submitted",
    assigned: "Assigned",
    approved: "Approved",
    paid: "Paid",
    failed: "Failed",
    cancelled: "Cancelled",
    shipped: "Shipped",
    delivered: "Delivered",
    "not created yet": "Not created yet",
  };

  return map[status] || status.replaceAll("_", " ");
}

function getCatalogProductId(product: CatalogProduct) {
  return String((product as any).id || (product as any).productId || "");
}

function getCatalogProductName(product: CatalogProduct) {
  return (product as any).name || (product as any).title || "Selected Dress";
}

function getCatalogProductImage(product: CatalogProduct) {
  const item = product as any;

  return (
    item?.imageUrl ||
    item?.image ||
    item?.thumbnail ||
    item?.photo ||
    item?.secureUrl ||
    item?.primaryImage ||
    item?.coverImage ||
    item?.images?.[0]?.secureUrl ||
    item?.images?.[0]?.url ||
    item?.images?.[0]?.src ||
    item?.images?.[0]?.imageUrl ||
    item?.data?.imageUrl ||
    item?.data?.image ||
    item?.data?.thumbnail ||
    item?.data?.images?.[0]?.secureUrl ||
    item?.data?.images?.[0]?.url ||
    item?.data?.images?.[0]?.src ||
    item?.product?.imageUrl ||
    item?.product?.image ||
    item?.product?.images?.[0]?.secureUrl ||
    item?.product?.images?.[0]?.url ||
    ""
  );
}

function getRecommendedProductVariantId(product: CatalogProduct) {
  const item = product as any;

  const variants =
    item?.variants ||
    item?.data?.variants ||
    item?.productVariants ||
    item?.data?.productVariants ||
    item?.inventory ||
    item?.data?.inventory ||
    [];

  const availableVariant = Array.isArray(variants)
    ? variants.find((variant: any) => {
        const status = String(
          variant?.status ||
            variant?.availabilityStatus ||
            variant?.inventoryStatus ||
            ""
        ).toLowerCase();

        return (
          variant?.available === true ||
          variant?.isAvailable === true ||
          status === "available" ||
          status === "active" ||
          status === "in_stock" ||
          status === ""
        );
      }) || variants[0]
    : null;

  return readFirst(
    item?.variantId,
    item?.defaultVariantId,
    item?.selectedVariantId,
    item?.data?.variantId,
    item?.data?.defaultVariantId,
    item?.data?.selectedVariantId,
    availableVariant?.id,
    availableVariant?.variantId,
    availableVariant?.data?.id,
    availableVariant?.data?.variantId
  );
}

function unwrapRecommendedProducts(response: any): CatalogProduct[] {
  console.log("UNWRAP RECOMMENDATION RAW:", response);

  const products =
    response?.data?.products ||
    response?.products ||
    response?.data?.data?.products ||
    response?.data?.items ||
    response?.items ||
    response?.data?.catalog ||
    response?.catalog ||
    [];

  console.log("UNWRAP RECOMMENDATION PRODUCTS:", products);

  return Array.isArray(products) ? products : [];
}

function findCatalogProductById(
  catalogProducts: CatalogProduct[],
  productId?: string
) {
  if (!productId) return null;

  return (
    catalogProducts.find((product) => {
      const id = getCatalogProductId(product);
      return id === productId;
    }) || null
  );
}

function getMemberProductId(member: BridalMember) {
  const item = member as any;

  return (
    item?.productId ||
    item?.dressId ||
    item?.catalogProductId ||
    item?.assignedProductId ||
    item?.product?.id ||
    item?.selection?.productId ||
    item?.selection?.dressId ||
    item?.selection?.catalogProductId ||
    item?.selection?.product?.id ||
    item?.assignedDress?.productId ||
    item?.assignedDress?.dressId ||
    item?.assignedDress?.catalogProductId ||
    item?.assignedDress?.product?.id ||
    item?.selectedDress?.productId ||
    item?.selectedDress?.dressId ||
    item?.selectedDress?.catalogProductId ||
    item?.selectedDress?.product?.id ||
    item?.data?.productId ||
    item?.data?.dressId ||
    item?.data?.catalogProductId ||
    item?.data?.assignedProductId ||
    item?.data?.product?.id ||
    item?.data?.selection?.productId ||
    item?.data?.selection?.dressId ||
    item?.data?.selection?.catalogProductId ||
    item?.data?.selection?.product?.id ||
    item?.data?.assignedDress?.productId ||
    item?.data?.assignedDress?.dressId ||
    item?.data?.assignedDress?.catalogProductId ||
    item?.data?.assignedDress?.product?.id ||
    item?.data?.selectedDress?.productId ||
    item?.data?.selectedDress?.dressId ||
    item?.data?.selectedDress?.catalogProductId ||
    item?.data?.selectedDress?.product?.id ||
    ""
  );
}


function getMemberAssignedDressObject(member: BridalMember) {
  const item = member as any;

  return (
    item?.assignedDress ||
    item?.selectedDress ||
    item?.selection ||
    item?.dress ||
    item?.product ||
    item?.data?.assignedDress ||
    item?.data?.selectedDress ||
    item?.data?.selection ||
    item?.data?.dress ||
    item?.data?.product ||
    null
  );
}

function getMemberAssignedDressImage(member: BridalMember) {
  const item = member as any;
  const assignedDress = getMemberAssignedDressObject(member);

  return (
    getProductImageUrl(assignedDress) ||
    getProductImageUrl(assignedDress?.product) ||
    getProductImageUrl(assignedDress?.dress) ||
    getProductImageUrl(assignedDress?.selectedDress) ||
    getProductImageUrl(assignedDress?.assignedDress) ||
    item?.dressImage ||
    item?.productImage ||
    item?.imageUrl ||
    item?.image ||
    item?.thumbnail ||
    item?.data?.dressImage ||
    item?.data?.productImage ||
    item?.data?.imageUrl ||
    item?.data?.image ||
    ""
  );
}

function getMemberId(member: BridalMember) {
  const item = member as any;

  return (
    item?.id ||
    item?.memberId ||
    item?.bridalMemberId ||
    item?.bridalPartyMemberId ||
    item?.data?.id ||
    item?.data?.memberId ||
    item?.data?.bridalMemberId ||
    item?.data?.bridalPartyMemberId ||
    ""
  );
}

function getMemberStatus(member: BridalMember) {
  const item = member as any;

  return (
    item?.status ||
    item?.approval ||
    item?.approvalStatus ||
    item?.selection?.status ||
    item?.sizeStatus ||
    item?.measurementStatus ||
    item?.data?.status ||
    item?.data?.approval ||
    item?.data?.approvalStatus ||
    item?.data?.selection?.status ||
    item?.data?.sizeStatus ||
    item?.data?.measurementStatus ||
    ""
  );
}

function getMemberBodySize(member: BridalMember) {
  const item = member as any;
  const source = getMeasurementSource(member);

  return readFirst(
    source?.size,
    source?.bodySize,
    source?.body_size,
    source?.dressSize,
    source?.dress_size,
    source?.submittedSize,
    source?.submitted_size,
    source?.selectedSize,
    source?.selected_size,
    source?.standardSize,
    source?.standard_size,
    source?.label,

    item?.bodySize,
    item?.body_size,
    item?.submittedSize,
    item?.submitted_size,
    item?.selectedSize,
    item?.selected_size,
    item?.standardSize,
    item?.standard_size,
    item?.measurementSize,
    item?.measurement_size,
    item?.sizeValue,
    item?.size_value,
    item?.size,

    item?.data?.bodySize,
    item?.data?.body_size,
    item?.data?.submittedSize,
    item?.data?.submitted_size,
    item?.data?.selectedSize,
    item?.data?.selected_size,
    item?.data?.standardSize,
    item?.data?.standard_size,
    item?.data?.measurementSize,
    item?.data?.measurement_size,
    item?.data?.sizeValue,
    item?.data?.size_value,
    item?.data?.size
  );
}

function getMemberSize(member: BridalMember) {
  const actualSize = getMemberBodySize(member);

  if (actualSize) return actualSize;

  const item = member as any;

  const sizeStatus = String(
    item?.sizeStatus ||
      item?.measurementStatus ||
      item?.status ||
      item?.approval ||
      item?.approvalStatus ||
      item?.data?.sizeStatus ||
      item?.data?.measurementStatus ||
      item?.data?.status ||
      item?.data?.approval ||
      item?.data?.approvalStatus ||
      ""
  ).toLowerCase();

  if (
    sizeStatus.includes("submitted") ||
    sizeStatus.includes("size_submitted") ||
    sizeStatus.includes("measured") ||
    sizeStatus.includes("assigned") ||
    sizeStatus.includes("approved") ||
    sizeStatus.includes("paid")
  ) {
    return "Submitted";
  }

  return "Pending";
}

function getMemberBust(member: BridalMember) {
  const item = member as any;
  const source = getMeasurementSource(member);

  return readFirst(
    source?.bust,
    source?.bustSize,
    source?.bust_size,
    source?.bustInches,
    source?.bust_inches,
    source?.chest,
    source?.chestSize,
    source?.chest_size,

    item?.bust,
    item?.bustSize,
    item?.bust_size,
    item?.bustInches,
    item?.bust_inches,
    item?.chest,
    item?.chestSize,
    item?.chest_size,

    item?.data?.bust,
    item?.data?.bustSize,
    item?.data?.bust_size,
    item?.data?.bustInches,
    item?.data?.bust_inches,
    item?.data?.chest,
    item?.data?.chestSize,
    item?.data?.chest_size
  );
}

function getMemberWaist(member: BridalMember) {
  const item = member as any;
  const source = getMeasurementSource(member);

  return readFirst(
    source?.waist,
    source?.waistSize,
    source?.waist_size,
    source?.waistInches,
    source?.waist_inches,

    item?.waist,
    item?.waistSize,
    item?.waist_size,
    item?.waistInches,
    item?.waist_inches,

    item?.data?.waist,
    item?.data?.waistSize,
    item?.data?.waist_size,
    item?.data?.waistInches,
    item?.data?.waist_inches
  );
}

function getMemberHip(member: BridalMember) {
  const item = member as any;
  const source = getMeasurementSource(member);

  return readFirst(
    source?.hip,
    source?.hips,
    source?.hipSize,
    source?.hip_size,
    source?.hipsSize,
    source?.hips_size,
    source?.hipInches,
    source?.hip_inches,
    source?.hipsInches,
    source?.hips_inches,

    item?.hip,
    item?.hips,
    item?.hipSize,
    item?.hip_size,
    item?.hipsSize,
    item?.hips_size,
    item?.hipInches,
    item?.hip_inches,
    item?.hipsInches,
    item?.hips_inches,

    item?.data?.hip,
    item?.data?.hips,
    item?.data?.hipSize,
    item?.data?.hip_size,
    item?.data?.hipsSize,
    item?.data?.hips_size,
    item?.data?.hipInches,
    item?.data?.hip_inches,
    item?.data?.hipsInches,
    item?.data?.hips_inches
  );
}

function getMemberHeight(member: BridalMember) {
  const item = member as any;
  const source = getMeasurementSource(member);

  const directHeight = readFirst(
    source?.height,
    source?.selectedHeight,
    source?.selected_height,
    source?.heightPreference,
    source?.height_preference,
    source?.heightInches,
    source?.height_inches,

    item?.height,
    item?.selectedHeight,
    item?.selected_height,
    item?.heightPreference,
    item?.height_preference,
    item?.heightInches,
    item?.height_inches,

    item?.data?.height,
    item?.data?.selectedHeight,
    item?.data?.selected_height,
    item?.data?.heightPreference,
    item?.data?.height_preference,
    item?.data?.heightInches,
    item?.data?.height_inches
  );

  if (directHeight) return directHeight;

  const feet = readFirst(
    source?.heightFeet,
    source?.height_feet,
    item?.heightFeet,
    item?.height_feet,
    item?.data?.heightFeet,
    item?.data?.height_feet
  );

  const inches = readFirst(
    source?.heightInch,
    source?.heightInches,
    source?.height_inch,
    source?.height_inches,
    item?.heightInch,
    item?.heightInches,
    item?.height_inch,
    item?.height_inches,
    item?.data?.heightInch,
    item?.data?.heightInches,
    item?.data?.height_inch,
    item?.data?.height_inches
  );

  if (feet && inches) return `${feet}'${inches}"`;
  if (feet) return feet;

  return "";
}

function getMemberPreference(member: BridalMember) {
  const item = member as any;
  const source = getMeasurementSource(member);

  return readFirst(
    source?.preference,
    source?.fitPreference,
    source?.fit_preference,
    source?.notes,
    source?.note,
    source?.fit,

    item?.preference,
    item?.fitPreference,
    item?.fit_preference,
    item?.notes,
    item?.note,
    item?.fit,

    item?.data?.preference,
    item?.data?.fitPreference,
    item?.data?.fit_preference,
    item?.data?.notes,
    item?.data?.note,
    item?.data?.fit
  );
}

function hasAnyMeasurement(member: BridalMember) {
  return Boolean(
    getMemberBodySize(member) ||
      getMemberBust(member) ||
      getMemberWaist(member) ||
      getMemberHip(member) ||
      getMemberHeight(member) ||
      getMemberPreference(member)
  );
}

function hasSubmittedSizeStatus(member: BridalMember) {
  const item = member as any;

  const status = String(
    item?.sizeStatus ||
      item?.measurementStatus ||
      item?.status ||
      item?.approval ||
      item?.approvalStatus ||
      item?.selection?.status ||
      item?.assignedDress?.status ||
      item?.data?.sizeStatus ||
      item?.data?.measurementStatus ||
      item?.data?.status ||
      item?.data?.approval ||
      item?.data?.approvalStatus ||
      item?.data?.selection?.status ||
      item?.data?.assignedDress?.status ||
      ""
  ).toLowerCase();

  return (
    status.includes("submitted") ||
    status.includes("size_submitted") ||
    status.includes("measured") ||
    status.includes("assigned") ||
    status.includes("approved") ||
    status.includes("paid")
  );
}

function getMemberApproval(member: BridalMember) {
  const item = member as any;

  return (
    item?.approval ||
    item?.selection?.status ||
    item?.status ||
    item?.approvalStatus ||
    item?.data?.approval ||
    item?.data?.selection?.status ||
    item?.data?.status ||
    item?.data?.approvalStatus ||
    "pending"
  );
}

function getMemberPayment(member: BridalMember) {
  const item = member as any;

  return (
    item?.payment ||
    item?.paymentStatus ||
    item?.data?.payment ||
    item?.data?.paymentStatus ||
    "pending"
  );
}

function getMemberDress(member: BridalMember) {
  const item = member as any;

  return (
    item?.dress ||
    item?.dressName ||
    item?.productName ||
    item?.assignedDress?.dressName ||
    item?.assignedDress?.productName ||
    item?.assignedDress?.product?.name ||
    item?.selection?.dressName ||
    item?.selection?.productName ||
    item?.selection?.product?.name ||
    item?.selection?.productId ||
    item?.data?.dress ||
    item?.data?.dressName ||
    item?.data?.productName ||
    item?.data?.assignedDress?.dressName ||
    item?.data?.assignedDress?.productName ||
    item?.data?.assignedDress?.product?.name ||
    item?.data?.selection?.dressName ||
    item?.data?.selection?.productName ||
    item?.data?.selection?.product?.name ||
    item?.data?.selection?.productId ||
    "Not selected"
  );
}

function getAssignedDressSize(member: BridalMember) {
  const item = member as any;

  return readFirst(
    item?.dressSize,
    item?.variantSize,
    item?.assignedDress?.size,
    item?.selection?.size,
    item?.selectedDress?.size,
    item?.data?.dressSize,
    item?.data?.variantSize,
    item?.data?.assignedDress?.size,
    item?.data?.selection?.size,
    item?.data?.selectedDress?.size
  );
}

function getAssignedDressColor(member: BridalMember) {
  const item = member as any;

  return readFirst(
    item?.color,
    item?.dressColor,
    item?.variantColor,
    item?.assignedDress?.color,
    item?.selection?.color,
    item?.selectedDress?.color,
    item?.data?.color,
    item?.data?.dressColor,
    item?.data?.variantColor,
    item?.data?.assignedDress?.color,
    item?.data?.selection?.color,
    item?.data?.selectedDress?.color
  );
}

function getAssignedDressHeight(member: BridalMember) {
  const item = member as any;

  return readFirst(
    item?.selectedHeight,
    item?.dressHeight,
    item?.variantHeight,
    item?.assignedDress?.height,
    item?.selection?.height,
    item?.selectedDress?.height,
    item?.data?.selectedHeight,
    item?.data?.dressHeight,
    item?.data?.variantHeight,
    item?.data?.assignedDress?.height,
    item?.data?.selection?.height,
    item?.data?.selectedDress?.height
  );
}

function formatDisplayDate(value?: string) {
  if (!value) return "Not added";

  const raw = String(value).trim();
  if (!raw) return "Not added";

  const date = new Date(raw);

  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return raw;
}

function getTodayDateInputValue() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isPastDate(dateValue: string) {
  if (!dateValue) return false;

  const selectedDate = new Date(dateValue);
  const today = new Date();

  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return selectedDate < today;
}

function isValidEmail(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(cleanEmail);
}

function getDashboardWeddingDate(eventStatus: any, eventForm: any) {
  return (
    eventStatus?.eventDate ||
    eventStatus?.weddingDate ||
    eventStatus?.data?.eventDate ||
    eventStatus?.data?.weddingDate ||
    eventStatus?.event?.weddingDate ||
    eventStatus?.data?.event?.weddingDate ||
    eventForm.weddingDate ||
    ""
  );
}

function getEventExtraDetails(eventStatus: any, eventId?: string) {
  const backendDetails = {
    brideName: readFirst(
      eventStatus?.brideName,
      eventStatus?.data?.brideName,
      eventStatus?.event?.brideName,
      eventStatus?.data?.event?.brideName
    ),
    weddingEventType: readFirst(
      eventStatus?.weddingEventType,
      eventStatus?.data?.weddingEventType,
      eventStatus?.event?.weddingEventType,
      eventStatus?.data?.event?.weddingEventType
    ),
    weddingSeason: readFirst(
      eventStatus?.weddingSeason,
      eventStatus?.data?.weddingSeason,
      eventStatus?.event?.weddingSeason,
      eventStatus?.data?.event?.weddingSeason
    ),
    palette: readFirst(
      eventStatus?.palette,
      eventStatus?.data?.palette,
      eventStatus?.event?.palette,
      eventStatus?.data?.event?.palette
    ),
    paletteId: readFirst(
      eventStatus?.paletteId,
      eventStatus?.data?.paletteId,
      eventStatus?.event?.paletteId,
      eventStatus?.data?.event?.paletteId
    ),
    paletteColors:
      eventStatus?.paletteColors ||
      eventStatus?.data?.paletteColors ||
      eventStatus?.event?.paletteColors ||
      eventStatus?.data?.event?.paletteColors ||
      [],
  };

  if (
    backendDetails.brideName ||
    backendDetails.weddingEventType ||
    backendDetails.weddingSeason ||
    backendDetails.palette ||
    backendDetails.paletteId ||
    backendDetails.paletteColors?.length
  ) {
    return backendDetails;
  }

  if (typeof window === "undefined" || !eventId) {
    return backendDetails;
  }

  try {
    const stored = localStorage.getItem(`bridalEventDetails:${eventId}`);
    if (!stored) return backendDetails;

    return {
      ...backendDetails,
      ...JSON.parse(stored),
    };
  } catch {
    return backendDetails;
  }
}

function getInviteToken(data: any) {
  return (
    data?.token ||
    data?.inviteToken ||
    data?.joinToken ||
    data?.invite?.token ||
    data?.data?.token ||
    data?.data?.inviteToken ||
    data?.data?.joinToken ||
    data?.data?.invite?.token ||
    ""
  );
}

function getStripeCheckoutUrl(data: any) {
  return (
    data?.checkoutUrl ||
    data?.url ||
    data?.sessionUrl ||
    data?.checkout_url ||
    data?.data?.checkoutUrl ||
    data?.data?.url ||
    data?.data?.sessionUrl ||
    data?.data?.checkout_url ||
    data?.session?.url ||
    data?.data?.session?.url ||
    ""
  );
}

function getStripeClientSecret(data: any) {
  return (
    data?.clientSecret ||
    data?.data?.clientSecret ||
    data?.paymentIntent?.client_secret ||
    data?.data?.paymentIntent?.client_secret ||
    ""
  );
}

function createSizeFormFromMember(member: BridalMember | null): SizeFormState {
  if (!member) {
    return {
      size: "",
      bust: "",
      waist: "",
      hip: "",
      height: "",
      preference: "",
    };
  }

  return {
    size: String(getMemberBodySize(member) || ""),
    bust: String(getMemberBust(member) || ""),
    waist: String(getMemberWaist(member) || ""),
    hip: String(getMemberHip(member) || ""),
    height: String(getMemberHeight(member) || ""),
    preference: String(getMemberPreference(member) || ""),
  };
}

export default function BridalPartyPage() {
  const toast = useToast();
  const inviteCardRef = useRef<HTMLDivElement | null>(null);

  const [apiState, setApiState] = useState<ApiState>({
    loading: false,
    error: "",
    success: "",
  });

  const [joinToken, setJoinToken] = useState("");
const [activeShareChannel, setActiveShareChannel] =
  useState<InviteChannel | "">("");
const [invitePopupOpen, setInvitePopupOpen] = useState(false);

const [setupEventTypes, setSetupEventTypes] = useState<BridalSetupOption[]>([]);
const [setupSeasons, setSetupSeasons] = useState<BridalSetupOption[]>([]);
const [setupPalettes, setSetupPalettes] = useState<BridalPaletteOption[]>([]);
const [setupOptionsLoading, setSetupOptionsLoading] = useState(false);

const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);




  const [recommendedDresses, setRecommendedDresses] = useState<CatalogProduct[]>(
  []
);
const [recommendationLoading, setRecommendationLoading] = useState(false);
const [recommendationError, setRecommendationError] = useState("");
const [savedDressIds, setSavedDressIds] = useState<string[]>([]);
const [approvedDressIds, setApprovedDressIds] = useState<string[]>([]);
  const [assignedSelectionSnapshot, setAssignedSelectionSnapshot] =
    useState<LocalAssignedSelectionSnapshot | null>(null);

  const [eventId, setEventId] = useState("");
  const [eventStatus, setEventStatus] = useState<BridalEventStatus | null>(
    null
  );

  const [shipment, setShipment] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState("");
  const [stripePaymentId, setStripePaymentId] = useState("");
  const [editingMember, setEditingMember] = useState<BridalMember | null>(null);

  const [isEditingSize, setIsEditingSize] = useState(false);
  const [sizeForm, setSizeForm] = useState<SizeFormState>({
    size: "",
    bust: "",
    waist: "",
    hip: "",
    height: "",
    preference: "",
  });

const [eventForm, setEventForm] = useState({
  brideName: "",
  weddingDate: "",
  weddingEventType: "Wedding Ceremony",
  weddingSeason: "Summer",
  palette: "neutral-classics",
});

  const [inviteForm, setInviteForm] = useState({
  name: "",
  email: "",
  countryCode: "+91",
  phoneNumber: "",
  socialAccount: "",
  role: "BRIDESMAID",
  message: "",
});

  const [memberAction, setMemberAction] = useState({
    memberId: "",
    productId: "",
    variantId: "",
    selectionId: "",
    dressName: "",
    color: "Sage",
    size: "A8",
    bust: "",
    waist: "",
    hip: "",
    height: "",
    preference: "",
  });

  const members = useMemo(() => normalizeMembers(eventStatus), [eventStatus]);

  const selectedActionMember = useMemo(() => {
    if (!memberAction.memberId) return null;

    return (
      members.find((member) => getMemberId(member) === memberAction.memberId) ||
      null
    );
  }, [members, memberAction.memberId]);

  const selectedActionMemberProductId = selectedActionMember
    ? getMemberProductId(selectedActionMember)
    : "";

  const selectedActionEffectiveProductId =
    selectedActionMemberProductId || memberAction.productId || "";

  const selectedActionProduct = useMemo(() => {
    return findCatalogProductById(
      catalogProducts,
      selectedActionEffectiveProductId
    );
  }, [catalogProducts, selectedActionEffectiveProductId]);

  const selectedActionHasDress = Boolean(selectedActionEffectiveProductId);

  const selectedMemberHasSize =
  selectedActionMember ? hasAnyMeasurement(selectedActionMember) : false;

const canShowRecommendations =
  Boolean(eventId) &&
  Boolean(memberAction.memberId) &&
  selectedMemberHasSize;

  const selectedActionVariantSnapshot =
    assignedSelectionSnapshot?.productId === selectedActionEffectiveProductId
      ? assignedSelectionSnapshot
      : getLocalAssignedSelection(selectedActionEffectiveProductId);

  const selectedActionDressName =
    selectedActionHasDress && selectedActionProduct
      ? getCatalogProductName(selectedActionProduct)
      : selectedActionHasDress && memberAction.dressName
        ? memberAction.dressName
        : "No dress selected";

const selectedActionAssignedImage = selectedActionMember
  ? getMemberAssignedDressImage(selectedActionMember)
  : "";

const selectedActionDressImage =
  selectedActionHasDress && selectedActionProduct
    ? getCatalogProductImage(selectedActionProduct) ||
      selectedActionAssignedImage ||
      selectedActionVariantSnapshot?.imageUrl ||
      ""
    : selectedActionAssignedImage ||
      selectedActionVariantSnapshot?.imageUrl ||
      "";

  const selectedAssignedDressSize =
    selectedActionMember && getAssignedDressSize(selectedActionMember)
      ? getAssignedDressSize(selectedActionMember)
      : selectedActionVariantSnapshot?.size || "Default";

  const selectedAssignedDressColor =
    selectedActionMember && getAssignedDressColor(selectedActionMember)
      ? getAssignedDressColor(selectedActionMember)
      : selectedActionVariantSnapshot?.color ||
        memberAction.color ||
        "Not selected";

  const selectedAssignedDressHeight =
    selectedActionMember && getAssignedDressHeight(selectedActionMember)
      ? getAssignedDressHeight(selectedActionMember)
      : selectedActionVariantSnapshot?.height || "Not added";

 const dashboardTitle =
  (eventStatus as any)?.eventName ||
  (eventStatus as any)?.name ||
  (eventStatus as any)?.data?.eventName ||
  (eventStatus as any)?.data?.name ||
  (eventStatus as any)?.event?.name ||
  (eventStatus as any)?.data?.event?.eventName ||
  (eventStatus as any)?.data?.event?.name ||
  eventForm.weddingEventType ||
  "Bridal Party";

  const eventExtraDetails = getEventExtraDetails(eventStatus, eventId);

  const displayWeddingEventType =
    eventExtraDetails.weddingEventType || eventForm.weddingEventType;

  const displayWeddingSeason =
    eventExtraDetails.weddingSeason || eventForm.weddingSeason;

 const selectedPaletteForDisplay =
  setupPalettes.find((palette) => palette.value === eventForm.palette) ||
  setupPalettes.find((palette) => palette.id === eventForm.palette);

const fallbackPaletteForDisplay = weddingPaletteFamilies.find(
  (family) => family.id === eventForm.palette
);

const displayPaletteName =
  eventExtraDetails.palette ||
  selectedPaletteForDisplay?.name ||
  selectedPaletteForDisplay?.label ||
  fallbackPaletteForDisplay?.name ||
  eventForm.palette;

const displayPaletteId =
  eventExtraDetails.paletteId ||
  selectedPaletteForDisplay?.value ||
  fallbackPaletteForDisplay?.id ||
  eventForm.palette;

const eventTypeOptions = setupEventTypes.length
  ? setupEventTypes.map((item) => item.value)
  : [
      "Wedding Ceremony",
      "Haldi",
      "Mehendi",
      "Sangeet",
      "Reception",
      "Engagement Party",
      "Bridal Shower",
      "Rehearsal Dinner",
      "Bachelorette Party",
      "Cocktail Party",
    ];

const seasonOptions = setupSeasons.length
  ? setupSeasons.map((item) => item.value)
  : ["Spring", "Summer", "Fall", "Winter", "Holiday Season"];

const paletteFamiliesForUi = setupPalettes.length
  ? setupPalettes.map((palette) => ({
      id: palette.value,
      backendId: palette.id,
      name: palette.name || palette.label,
      label: palette.label,
      value: palette.value,
      colors: (palette.colors || []).map((color) => ({
        name: color.name,
        hex: color.hex,
      })),
    }))
  : weddingPaletteFamilies.map((palette) => ({
      ...palette,
      backendId: palette.id,
      label: palette.name,
      value: palette.id,
    }));

  useEffect(() => {
  let mounted = true;

  async function loadSetupOptions() {
    try {
      setSetupOptionsLoading(true);

      const response = await getBridalEventSetupOptions();

      const eventTypes = (response?.data?.eventTypes || [])
        .filter((item) => item.isActive !== false)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      const seasons = (response?.data?.seasons || [])
        .filter((item) => item.isActive !== false)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      const palettes = (response?.data?.palettes || [])
        .filter((item) => item.isActive !== false)
        .map((palette) => ({
          ...palette,
          colors: (palette.colors || [])
            .filter((color) => color.isActive !== false)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
        }))
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      if (!mounted) return;

      setSetupEventTypes(eventTypes);
      setSetupSeasons(seasons);
      setSetupPalettes(palettes);

      setEventForm((prev) => ({
        ...prev,
        weddingEventType: eventTypes[0]?.value || prev.weddingEventType,
        weddingSeason: seasons[0]?.value || prev.weddingSeason,
        palette: palettes[0]?.value || prev.palette,
      }));
    } catch (error) {
      console.error("Event setup options load failed:", error);
      toast.error(
        "Setup options failed",
        "Backend se event setup options load nahi ho paaye. Fallback options use honge."
      );
    } finally {
      if (mounted) {
        setSetupOptionsLoading(false);
      }
    }
  }

  loadSetupOptions();

  return () => {
    mounted = false;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem("bridalLastAssignedSelection");

    if (!raw) {
      setAssignedSelectionSnapshot(null);
      return;
    }

    try {
      setAssignedSelectionSnapshot(JSON.parse(raw));
    } catch {
      setAssignedSelectionSnapshot(null);
    }
  }, [selectedActionEffectiveProductId]);

  useEffect(() => {
    const savedEventId =
      typeof window !== "undefined"
        ? sessionStorage.getItem("bridalEventId") || ""
        : "";

    if (savedEventId) {
      setEventId(savedEventId);
      refreshDashboard(savedEventId, false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (eventId && typeof window !== "undefined") {
      sessionStorage.setItem("bridalEventId", eventId);
      localStorage.setItem("bridalEventId", eventId);
    }
  }, [eventId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");

    if (paymentStatus === "success") {
      setApiState({
        loading: false,
        error: "",
        success: "Payment completed. Refreshing order status.",
      });

      toast.success("Payment completed", "Refreshing order status.");

      if (eventId) {
        refreshDashboard(eventId, false);
        refreshShipment(eventId);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  useEffect(() => {
    setInviteForm((prev) => {
      const defaultMessage = `Hi, I would love for you to join my ${eventForm.weddingEventType}.`;

      if (
        !prev.message ||
        prev.message.includes("I would love for you to join")
      ) {
        return {
          ...prev,
          message: defaultMessage,
        };
      }

      return prev;
    });
  }, [eventForm.weddingEventType]);

useEffect(() => {
  if (!ENABLE_BACKEND_RECOMMENDATIONS) return;

  if (!canShowRecommendations) {
    setRecommendedDresses([]);
    setRecommendationError("");
    return;
  }

  loadRecommendedDresses();

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [
  canShowRecommendations,
  memberAction.memberId,
  displayWeddingEventType,
  displayWeddingSeason,
  displayPaletteId,
]);

  async function runAction<T>(action: () => Promise<T>, successMessage: string) {
    try {
      setApiState({ loading: true, error: "", success: "" });

      const result = await action();

      setApiState({
        loading: false,
        error: "",
        success: successMessage,
      });

      toast.success(successMessage);

      return result;
    } catch (error: any) {
      const message = error?.message || "Something went wrong";

      setApiState({
        loading: false,
        error: message,
        success: "",
      });

      toast.error("Action failed", message);

      return null;
    }
  }

  async function refreshShipment(id = eventId) {
    if (!id) return;

    try {
      const data = await getShipment(id);
      setShipment(data);
    } catch {
      console.warn("Shipment not available yet.");
      setShipment(null);
    }
  }

  async function refreshDashboard(id = eventId, showToast = true) {
    if (!id) {
      const message = "Pehle bridal party event create karo.";

      setApiState({
        loading: false,
        error: message,
        success: "",
      });

      toast.error("Event missing", message);
      return null;
    }

    try {
      setApiState({
        loading: true,
        error: "",
        success: "",
      });

      const data = await getBridalEventStatus(id);

      console.log("BRIDAL STATUS RAW RESPONSE:", data);
      console.log("BRIDAL STATUS MEMBERS:", normalizeMembers(data));
      console.log("RAW MEMBERS FULL:", JSON.stringify(normalizeMembers(data), null, 2));

      setEventStatus(data);

      setApiState({
        loading: false,
        error: "",
        success: "Dashboard refreshed",
      });

      if (showToast) {
        toast.success("Workspace refreshed");
      }

      return data;
    } catch (error: any) {
      console.error("BRIDAL STATUS API FAILED:", error);

      const message =
        "Dashboard status backend se load nahi ho raha. Backend /bridal-party/status API check karo.";

      setApiState({
        loading: false,
        error: message,
        success: id ? `Active Event ID: ${id}` : "",
      });

      toast.error("Workspace refresh failed", error?.message || message);

      return null;
    }
  }

  async function loadRecommendedDresses() {
  if (!ENABLE_BACKEND_RECOMMENDATIONS) return;

    if (!canShowRecommendations) {
    setRecommendedDresses([]);
    setRecommendationError("");
    return;
  }

  try {
    setRecommendationLoading(true);
    setRecommendationError("");

    const response = await getCatalogRecommendations({
      eventType: displayWeddingEventType,
      season: displayWeddingSeason,
      paletteId: displayPaletteId,
      limit: 9,
    });

    console.log("CATALOG RECOMMENDATIONS RESPONSE:", response);

    const products = unwrapRecommendedProducts(response);

console.log("FINAL RECOMMENDED PRODUCTS LENGTH:", products.length);
console.log("FINAL RECOMMENDED PRODUCTS:", products);

setRecommendedDresses(products);
  } catch (error: any) {
    console.error("Recommendations load failed:", error);

    setRecommendedDresses([]);
    setRecommendationError(
      error?.message || "Recommended dresses load nahi ho paayi."
    );
  } finally {
    setRecommendationLoading(false);
  }
}

async function handleAssignRecommendedDress(product: CatalogProduct) {
  if (!memberAction.memberId) {
    toast.error(
      "Member select karo",
      "Pehle Members section me kisi member ke saamne Select dabao."
    );
    return;
  }

const productId = getCatalogProductId(product);
const dressName = getCatalogProductName(product);
const dressImage = getCatalogProductImage(product);

if (!productId) {
  toast.error("Product ID missing", "Recommendation response me product id nahi mila.");
  return;
}

const payload = {
  eventId,
  memberId: memberAction.memberId,
  productId,
};

  const data = await runAction(
    () => assignDressToMember(payload),
    "Recommended dress assigned successfully"
  );

  if (!data) return;

  setMemberAction((prev) => ({
  ...prev,
  productId,
  variantId: "",
  dressName,
}));

  if (typeof window !== "undefined") {
   localStorage.setItem(
  "bridalLastAssignedSelection",
  JSON.stringify({
    productId,
    dressName,
    imageUrl: dressImage,
    updatedAt: new Date().toISOString(),
  })
);
  }

  await refreshDashboard(eventId, false);
}

 function createLocalEventStatusFallback(newEventId: string) {
 const selectedPaletteFamily =
  setupPalettes.find((palette) => palette.value === eventForm.palette) ||
  setupPalettes.find((palette) => palette.id === eventForm.palette) ||
  weddingPaletteFamilies.find((family) => family.id === eventForm.palette);

  const eventDate = eventForm.weddingDate
    ? new Date(eventForm.weddingDate).toISOString()
    : "";

  const eventNameForBackend =
    eventForm.weddingEventType || "Wedding Ceremony";

const paletteDetails = {
  palette: selectedPaletteFamily?.name || eventForm.palette,
  paletteId:
    (selectedPaletteFamily as any)?.value ||
    selectedPaletteFamily?.id ||
    eventForm.palette,
  paletteColors: (selectedPaletteFamily?.colors || []).map((color: any) => ({
    name: color.name,
    hex: color.hex,
  })),
};

  return {
    eventId: newEventId,
    id: newEventId,
    name: eventNameForBackend,
    eventName: eventNameForBackend,
    brideName: eventForm.brideName.trim(),
    weddingDate: eventForm.weddingDate,
    eventDate,
    weddingEventType: eventForm.weddingEventType,
    weddingSeason: eventForm.weddingSeason,
    ...paletteDetails,
    members: [],
    sizeSubmitted: 0,
    approved: 0,
    paid: 0,
    data: {
      eventId: newEventId,
      id: newEventId,
      name: eventNameForBackend,
      eventName: eventNameForBackend,
      brideName: eventForm.brideName.trim(),
      weddingDate: eventForm.weddingDate,
      eventDate,
      weddingEventType: eventForm.weddingEventType,
      weddingSeason: eventForm.weddingSeason,
      ...paletteDetails,
      members: [],
      sizeSubmitted: 0,
      approved: 0,
      paid: 0,
    },
  } as any;
}

function resetWorkspaceForNewEvent() {
  setJoinToken("");
  setActiveShareChannel("");
  setInvitePopupOpen(false);

  setRecommendedDresses([]);
  setRecommendationError("");
  setRecommendationLoading(false);

  setSavedDressIds([]);
  setApprovedDressIds([]);
  setAssignedSelectionSnapshot(null);

  setShipment(null);
  setPaymentLoading(false);
  setStripeClientSecret("");
  setStripePaymentId("");

  setEditingMember(null);
  setIsEditingSize(false);

  setSizeForm({
    size: "",
    bust: "",
    waist: "",
    hip: "",
    height: "",
    preference: "",
  });

  setInviteForm({
    name: "",
    email: "",
    countryCode: "+91",
    phoneNumber: "",
    socialAccount: "",
    role: "BRIDESMAID",
    message: `Hi, I would love for you to join my ${
      eventForm.weddingEventType || "Wedding Ceremony"
    }.`,
  });

  setMemberAction({
    memberId: "",
    productId: "",
    variantId: "",
    selectionId: "",
    dressName: "",
    color: "",
    size: "",
    bust: "",
    waist: "",
    hip: "",
    height: "",
    preference: "",
  });

  if (typeof window !== "undefined") {
    sessionStorage.removeItem("bridalSelectedMemberId");
    localStorage.removeItem("bridalSelectedMemberId");
    localStorage.removeItem("bridalSelectedMember");
    localStorage.removeItem("bridalLastAssignedSelection");
    sessionStorage.removeItem("stripePaymentEventId");
    sessionStorage.removeItem("stripePaymentMemberId");
    sessionStorage.removeItem("stripePaymentSelectionId");
  }
}

  async function handleCreateEvent() {
   

    if (!eventForm.weddingDate) {
      toast.error("Wedding date missing");

      setApiState({
        loading: false,
        error: "Wedding date missing hai.",
        success: "",
      });
      return;
    }

    if (isPastDate(eventForm.weddingDate)) {
      const message =
        "Wedding date aaj ya future date honi chahiye. Purani date allowed nahi hai.";

      toast.error("Invalid wedding date", message);

      setApiState({
        loading: false,
        error: message,
        success: "",
      });
      return;
    }

const selectedPaletteFamily =
  setupPalettes.find((palette) => palette.value === eventForm.palette) ||
  setupPalettes.find((palette) => palette.id === eventForm.palette) ||
  weddingPaletteFamilies.find((family) => family.id === eventForm.palette);

const eventNameForBackend =
  eventForm.weddingEventType || "Wedding Ceremony";

const payload = {
  name: eventNameForBackend,
  eventDate: new Date(eventForm.weddingDate).toISOString(),

  weddingEventType: eventForm.weddingEventType,
  weddingSeason: eventForm.weddingSeason,
  brideName: eventForm.brideName.trim(),

  palette: selectedPaletteFamily?.name || eventForm.palette,
  paletteId:
    (selectedPaletteFamily as any)?.value ||
    selectedPaletteFamily?.id ||
    eventForm.palette,
  paletteColors: (selectedPaletteFamily?.colors || []).map((color: any) => ({
    name: color.name,
    hex: color.hex,
  })),
};

    const data = await runAction(
      () => createBridalEvent(payload),
      "Bridal party event created"
    );

    if (!data) return;

    const newEventId = getEventIdFromResponse(data);

    if (!newEventId) {
      console.log("CREATE EVENT RESPONSE WITHOUT EVENT ID:", data);

      const message =
        "Event create API 201 de rahi hai, lekin response me eventId nahi mil raha. Backend create event response check karna hoga.";

      toast.error("Event ID missing", message);

      setApiState({
        loading: false,
        error: message,
        success: "",
      });

      return;
    }

resetWorkspaceForNewEvent();

const localStatus = createLocalEventStatusFallback(newEventId);

setEventId(newEventId);
setEventStatus(localStatus);

    if (typeof window !== "undefined") {
      sessionStorage.setItem("bridalEventId", newEventId);
      localStorage.setItem("bridalEventId", newEventId);
    }

    setApiState({
      loading: false,
      error: "",
      success: `Event created successfully. Event ID: ${newEventId}`,
    });

    const statusData = await refreshDashboard(newEventId, false);

    if (!statusData) {
      setEventStatus(localStatus);

      setApiState({
        loading: false,
        error:
          "Event create ho gaya hai, lekin dashboard status API backend se error de rahi hai. Invite/member actions tab bhi try kar sakte ho.",
        success: `Event created successfully. Event ID: ${newEventId}`,
      });
    }
  }

 async function handleInvite() {
  if (!eventId) {
    const message = "Pehle event create karo, phir member invite karo.";

    toast.error("Event missing", message);

    setApiState({
      loading: false,
      error: message,
      success: "",
    });

    return;
  }

  const channel: InviteChannel =
    activeShareChannel === "email" ||
    activeShareChannel === "whatsapp" ||
    activeShareChannel === "facebook" ||
    activeShareChannel === "instagram" ||
    activeShareChannel === "copy-link"
      ? activeShareChannel
      : "email";

  const channelConfig =
    INVITE_CHANNEL_CONFIGS.find((item) => item.id === channel) ||
    INVITE_CHANNEL_CONFIGS[0];

  const name = inviteForm.name.trim();
  const email = inviteForm.email.trim();
  const countryCode = inviteForm.countryCode.trim() || "+91";
  const phoneNumber = inviteForm.phoneNumber.replace(/[^\d]/g, "");
  const socialAccount = inviteForm.socialAccount.trim();
  const role = inviteForm.role || "BRIDESMAID";

  const ceremonyType =
    eventForm.weddingEventType || displayWeddingEventType || "Wedding Ceremony";

  const message =
    inviteForm.message.trim() ||
    `Hi ${name || "there"}, I would love for you to join my ${ceremonyType}.`;

  if (channelConfig.requiredFields.includes("name") && !name) {
    toast.error("Name required", "Bridesmaid ka name daalo.");
    return;
  }

  if (channelConfig.requiredFields.includes("email") && !isValidEmail(email)) {
    toast.error("Invalid email", "Please enter a valid email address.");
    return;
  }

  if (
    channelConfig.requiredFields.includes("countryCode") &&
    !countryCode
  ) {
    toast.error("Country code required", "Country code required hai.");
    return;
  }

  if (
    channelConfig.requiredFields.includes("phoneNumber") &&
    !phoneNumber
  ) {
    toast.error(
      "Phone required",
      "WhatsApp invite ke liye phone number required hai."
    );
    return;
  }

  if (
    channelConfig.requiredFields.includes("socialAccount") &&
    !socialAccount
  ) {
    toast.error(
      "Account required",
      `${channelConfig.label} invite ke liye account/profile required hai.`
    );
    return;
  }

  const invitePayload = {
    eventId,
    channel,
    ceremonyType,
    name,
    role,
    message,

    ...(channel === "email" ? { email } : {}),
    ...(channel === "whatsapp"
      ? {
          countryCode,
          phoneNumber,
        }
      : {}),
    ...(channel === "facebook" || channel === "instagram"
      ? {
          socialAccount,
        }
      : {}),
  };

  const inviteData = await runAction(
    () => inviteBridalMember(invitePayload),
    editingMember
      ? "Invite updated and resent successfully"
      : "Invite sent successfully"
  );

  if (!inviteData) return;

  const token = getInviteToken(inviteData);

  if (token) {
    setJoinToken(token);
  }

  const invitedMember = {
    id:
      inviteData?.id ||
      inviteData?.memberId ||
      inviteData?.data?.id ||
      inviteData?.data?.memberId ||
      inviteData?.invite?.id ||
      inviteData?.data?.invite?.id ||
      email ||
      phoneNumber ||
      socialAccount,
    memberId:
      inviteData?.memberId ||
      inviteData?.id ||
      inviteData?.data?.memberId ||
      inviteData?.data?.id ||
      inviteData?.invite?.id ||
      inviteData?.data?.invite?.id ||
      email ||
      phoneNumber ||
      socialAccount,
    name,
    email,
    phoneNumber,
    countryCode,
    socialAccount,
    role,
    channel,
    status: "invited",
    approval: "invited",
    payment: "pending",
  } as any;

  setEventStatus((prev: any) => {
    const base = prev || createLocalEventStatusFallback(eventId);
    const oldMembers = normalizeMembers(base);

    const filteredMembers = oldMembers.filter((member) => {
      const memberEmail = String((member as any)?.email || "")
        .trim()
        .toLowerCase();

      const memberPhone = String((member as any)?.phoneNumber || "")
        .replace(/[^\d]/g, "");

      if (email && memberEmail === email.toLowerCase()) return false;
      if (phoneNumber && memberPhone === phoneNumber) return false;

      return true;
    });

    return {
      ...base,
      members: [...filteredMembers, invitedMember],
      data: {
        ...(base?.data || {}),
        members: [...filteredMembers, invitedMember],
      },
    };
  });

  setInviteForm({
    name: "",
    email: "",
    countryCode: "+91",
    phoneNumber: "",
    socialAccount: "",
    role: "BRIDESMAID",
    message: "",
  });

  setEditingMember(null);
  setInvitePopupOpen(false);
  setActiveShareChannel("");

  const statusData = await refreshDashboard(eventId, false);

  if (!statusData) {
    setApiState({
      loading: false,
      error:
        "Invite sent ho gaya, lekin status API backend se error de rahi hai. Local UI me member temporarily show kar diya hai.",
      success: token
        ? `Invite sent successfully. Join token: ${token}`
        : "Invite sent successfully.",
    });
  }
}

  async function handleResendInvite(member: BridalMember) {
    if (!eventId) {
      const message = "Event missing hai. Pehle event create/load karo.";

      toast.error("Event missing", message);

      setApiState({
        loading: false,
        error: message,
        success: "",
      });
      return;
    }

    const email = (member as any).email || "";
    const name = (member as any).name || "";

    if (!email) {
      const message = "Member email missing hai. Invite resend nahi ho sakta.";

      toast.error("Email missing", message);

      setApiState({
        loading: false,
        error: message,
        success: "",
      });
      return;
    }

  const invitePayload = {
  eventId,
  ceremonyType: eventForm.weddingEventType || displayWeddingEventType || "Wedding Ceremony",
  channel: "email" as InviteChannel,
  name: name || "Bridesmaid",
  email,
  role: (member as any).role || "BRIDESMAID",
  message: `Hi ${
    name || "there"
  }, I would love for you to join my ${
    eventForm.weddingEventType || displayWeddingEventType || "Wedding Ceremony"
  }.`,
};

    const inviteData = await runAction(
      () => inviteBridalMember(invitePayload),
      "Invite resent successfully"
    );

    const token = getInviteToken(inviteData);

    if (token) {
      setJoinToken(token);
    }

    await refreshDashboard(eventId, false);
  }

  function handleEditMember(member: BridalMember) {
    setEditingMember(member);

   setInviteForm({
  name: (member as any).name || "",
  email: (member as any).email || "",
  countryCode:
    (member as any).countryCode ||
    (member as any).data?.countryCode ||
    "+91",
  phoneNumber:
    (member as any).phoneNumber ||
    (member as any).phone ||
    (member as any).data?.phoneNumber ||
    (member as any).data?.phone ||
    "",
  socialAccount:
    (member as any).socialAccount ||
    (member as any).instagram ||
    (member as any).facebook ||
    (member as any).data?.socialAccount ||
    "",
  role: (member as any).role || "BRIDESMAID",
  message: `Hi ${
    (member as any).name || "there"
  }, I would love for you to join my bridal party.`,
});

    setApiState({
      loading: false,
      error: "",
      success:
        "Member details invite form me load ho gaye. Changes karke Update & Resend Invite dabao.",
    });

    toast.info("Member loaded", "Invite form me details load ho gayi hain.");

    setTimeout(() => {
      inviteCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  function handleCancelEdit() {
    setEditingMember(null);

 setInviteForm({
  name: "",
  email: "",
  countryCode: "+91",
  phoneNumber: "",
  socialAccount: "",
  role: "BRIDESMAID",
  message: "",
});

    setApiState({
      loading: false,
      error: "",
      success: "Edit cancelled.",
    });

    toast.info("Edit cancelled");
  }

  function getInviteShareUrl() {
  if (typeof window === "undefined") return "";

  if (joinToken) {
    return `${window.location.origin}/bridal-party/join/${joinToken}`;
  }

  return `${window.location.origin}/bridal-party`;
}

function handleCopyInviteLink() {
  const url = getInviteShareUrl();

  if (!url) {
    toast.error("Invite link missing", "Pehle invite send karo.");
    return;
  }

  navigator.clipboard
    .writeText(url)
    .then(() => {
      toast.success("Invite link copied");
    })
    .catch(() => {
      toast.error("Copy failed", "Link copy nahi ho paya.");
    });
}

function openShareChannel(channel: InviteChannel) {
  if (!eventId) {
    toast.error("Event missing", "Pehle bridal party event create karo.");
    return;
  }

  setActiveShareChannel(channel);
  setInvitePopupOpen(true);
}

  function handleSelectMember({
    member,
    memberId,
    hasAssignedDress,
    dressName,
  }: {
    member: BridalMember;
    memberId: string;
    hasAssignedDress: boolean;
    dressName: string;
  }) {
    const item = member as any;
    const memberPreference = getMemberPreference(member);

    setStripeClientSecret("");
    setStripePaymentId("");
    setIsEditingSize(false);

    const nextSizeForm = createSizeFormFromMember(member);
    setSizeForm(nextSizeForm);

    const backendDressSize = getAssignedDressSize(member);
    const backendDressColor = getAssignedDressColor(member);
    const backendDressHeight = getAssignedDressHeight(member);

    setMemberAction({
      memberId: memberId || "",

      selectionId:
        item?.selectionId ||
        item?.assignedDressId ||
        item?.assignedDress?.id ||
        item?.assignedDress?.selectionId ||
        item?.selection?.id ||
        item?.data?.selectionId ||
        item?.data?.assignedDressId ||
        item?.data?.assignedDress?.id ||
        item?.data?.assignedDress?.selectionId ||
        item?.data?.selection?.id ||
        "",

      productId:
        item?.productId ||
        item?.dressId ||
        item?.assignedDress?.productId ||
        item?.selection?.productId ||
        item?.data?.productId ||
        item?.data?.dressId ||
        item?.data?.assignedDress?.productId ||
        item?.data?.selection?.productId ||
        "",

      variantId:
        item?.variantId ||
        item?.assignedDress?.variantId ||
        item?.selection?.variantId ||
        item?.data?.variantId ||
        item?.data?.assignedDress?.variantId ||
        item?.data?.selection?.variantId ||
        "",

      dressName: hasAssignedDress && dressName ? dressName : "",

      size: String(getMemberBodySize(member) || ""),
      color: backendDressColor || item?.color || item?.data?.color || "",

      bust: String(getMemberBust(member) || ""),
      waist: String(getMemberWaist(member) || ""),
      hip: String(getMemberHip(member) || ""),
      height: String(getMemberHeight(member) || ""),
      preference: String(memberPreference || ""),
    });

    if (typeof window !== "undefined") {
      sessionStorage.setItem("bridalSelectedMemberId", memberId || "");
      sessionStorage.setItem("bridalEventId", eventId || "");

      localStorage.setItem("bridalSelectedMemberId", memberId || "");
      localStorage.setItem("bridalEventId", eventId || "");

      localStorage.setItem(
        "bridalSelectedMember",
        JSON.stringify({
          memberId,
          eventId,
          email: item?.email || "",
          name: item?.name || "",
          size: getMemberBodySize(member),
          approval: getMemberApproval(member),
          assignedDressSize: backendDressSize,
          assignedDressColor: backendDressColor,
          assignedDressHeight: backendDressHeight,
        })
      );
    }

    setApiState({
      loading: false,
      error: "",
      success:
        "Member selected. Ab /bridesmaid page se dress Add to workspace kar sakte ho.",
    });

    toast.success(
      "Member selected",
      "Ab /bridesmaid page se dress Add to workspace kar sakte ho."
    );
  }

  function handleEditSize() {
    if (!memberAction.memberId) {
      const message = "Pehle member select karo.";

      toast.error("Member missing", message);

      setApiState({
        loading: false,
        error: message,
        success: "",
      });
      return;
    }

    setSizeForm({
      size: memberAction.size || "",
      bust: memberAction.bust || "",
      waist: memberAction.waist || "",
      hip: memberAction.hip || "",
      height: memberAction.height || "",
      preference: memberAction.preference || "",
    });

    setIsEditingSize(true);
  }

  function handleCancelEditSize() {
    setIsEditingSize(false);

    setSizeForm({
      size: memberAction.size || "",
      bust: memberAction.bust || "",
      waist: memberAction.waist || "",
      hip: memberAction.hip || "",
      height: memberAction.height || "",
      preference: memberAction.preference || "",
    });

    setApiState({
      loading: false,
      error: "",
      success: "Size edit cancelled.",
    });

    toast.info("Size edit cancelled");
  }

  async function handleSaveSize() {
    if (!memberAction.memberId) {
      const message = "Pehle member select karo.";

      toast.error("Member missing", message);

      setApiState({
        loading: false,
        error: message,
        success: "",
      });
      return;
    }

    if (!sizeForm.size.trim()) {
      toast.error("Body size required");

      setApiState({
        loading: false,
        error: "Body size required hai.",
        success: "",
      });
      return;
    }

    const payload = {
      memberId: memberAction.memberId,
      size: sizeForm.size.trim(),
      bust: sizeForm.bust.trim() || undefined,
      waist: sizeForm.waist.trim() || undefined,
      hip: sizeForm.hip.trim() || undefined,
      height: sizeForm.height.trim() || undefined,
      preference: sizeForm.preference.trim() || undefined,
    };

    const data = await runAction(
      () => submitBridalMemberSize(payload),
      "Member size updated successfully"
    );

    if (!data) return;

    setMemberAction((prev) => ({
      ...prev,
      size: payload.size,
      bust: payload.bust || "",
      waist: payload.waist || "",
      hip: payload.hip || "",
      height: payload.height || "",
      preference: payload.preference || "",
    }));

    setIsEditingSize(false);

    toast.success("Size updated", "Member measurements update ho gayi hain.");

    await refreshDashboard(eventId, false);
  }

  async function handlePayNow() {
    if (!eventId) {
      const message = "Event missing hai. Pehle event create/load karo.";

      toast.error("Event missing", message);

      setApiState({
        loading: false,
        error: message,
        success: "",
      });
      return;
    }

    if (!memberAction.memberId) {
      const message = "Pehle member select karo.";

      toast.error("Member missing", message);

      setApiState({
        loading: false,
        error: message,
        success: "",
      });
      return;
    }

    if (!memberAction.selectionId) {
      const message =
        "Selection ID missing hai. Pehle member ke liye dress assign karo, phir Pay Now dabao.";

      toast.error("Selection ID missing", message);

      setApiState({
        loading: false,
        error: message,
        success: "",
      });
      return;
    }

    try {
      setPaymentLoading(true);
      setApiState({ loading: false, error: "", success: "" });

      const paymentPayload = {
        memberId: memberAction.memberId,
        selectionId: memberAction.selectionId,
      };

      console.log("Bridal payment create payload:", paymentPayload);

      const paymentData = await createBridalPayment(paymentPayload);

      console.log("Bridal payment create response:", paymentData);

      const checkoutUrl = getStripeCheckoutUrl(paymentData);
      const clientSecret = getStripeClientSecret(paymentData);

      if (checkoutUrl) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("stripePaymentEventId", eventId);
          sessionStorage.setItem("stripePaymentMemberId", memberAction.memberId);
          sessionStorage.setItem(
            "stripePaymentSelectionId",
            memberAction.selectionId
          );

          window.location.href = checkoutUrl;
        }

        return;
      }

      if (clientSecret) {
        setStripeClientSecret(clientSecret);
        setStripePaymentId(
          paymentData?.paymentId || paymentData?.data?.paymentId || ""
        );

        setApiState({
          loading: false,
          error: "",
          success: "Payment ready. Card details enter karke payment complete karo.",
        });

        toast.success(
          "Payment ready",
          "Card details enter karke payment complete karo."
        );

        return;
      }

      const message =
        "Stripe checkout URL/clientSecret response me nahi mila. Backend payment/create response check karo.";

      setApiState({
        loading: false,
        error: message,
        success: "",
      });

      toast.error("Payment response incomplete", message);
    } catch (error: any) {
      console.error("PAYMENT CREATE EXACT ERROR:", error);

      const message =
        error?.message ||
        "Payment start nahi ho paya. Backend payment API check karo.";

      setApiState({
        loading: false,
        error: message,
        success: "",
      });

      toast.error("Payment start nahi hua", message);
    } finally {
      setPaymentLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] px-4 py-8 text-neutral-950 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
              Shahsi Bridal Party
            </p>

            <h1 className="mt-1 text-2xl font-semibold">
              Bridal Party Workspace
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              Manage bridal party members, sizes, dresses and order progress.
            </p>
          </div>

          <button
            onClick={() => refreshDashboard()}
            className={`inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white ${actionButtonClass}`}
          >
            {apiState.loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Refresh Status
          </button>
        </div>

        {apiState.error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiState.error}
          </div>
        ) : null}

        {apiState.success ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {apiState.success}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-5">
            <Card>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-full bg-neutral-950 p-3 text-white">
                  <Users className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold">
                    Bridal Party Workspace
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Your event summary and outfit progress
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] bg-neutral-950 p-6 text-white">
                <p className="text-[10px] uppercase tracking-[0.34em] text-white/50">
                  Active Event
                </p>

                <h3 className="mt-2 text-2xl font-semibold">
                  {dashboardTitle}
                </h3>

                <p className="mt-2 text-sm text-white/65">
                  Wedding Date:{" "}
                  {formatDisplayDate(
                    getDashboardWeddingDate(eventStatus, eventForm)
                  )}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-2 text-xs text-white/75">
                    Type: {displayWeddingEventType}
                  </span>

                  <span className="rounded-full bg-white/10 px-3 py-2 text-xs text-white/75">
                    Season: {displayWeddingSeason}
                  </span>

                  <span className="rounded-full bg-white/10 px-3 py-2 text-xs text-white/75">
                    Palette: {displayPaletteName}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <SummaryMini label="Members" value={members.length} />

                  <SummaryMini
                    label="Size Done"
                    value={
                      members.filter((member) => getMemberSize(member) !== "Pending")
                        .length
                    }
                  />

                  <SummaryMini
                    label="Approved"
                    value={
                      members.filter((member) => {
                        const approval = String(getMemberApproval(member)).toLowerCase();
                        return approval === "approved" || approval === "assigned";
                      }).length
                    }
                  />

                  <SummaryMini
                    label="Paid"
                    value={
                      members.filter(
                        (member) =>
                          String(getMemberPayment(member)).toLowerCase() === "paid"
                      ).length
                    }
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <a
                  href="/bridesmaid"
                  className={`inline-flex h-12 items-center justify-center rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white ${actionButtonClass}`}
                >
                  Browse Bridesmaid Dresses
                </a>

                <button
                  type="button"
                  onClick={() => refreshDashboard(eventId)}
                  className={`inline-flex h-12 items-center justify-center gap-2 rounded-full border border-neutral-950 px-5 text-sm font-semibold ${actionButtonClass}`}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh Workspace
                </button>
              </div>
            </Card>

            <Card>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-full bg-[#f7f2ea] p-3">
                  <Plus className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold">Event Setup</h2>
                  <p className="text-sm text-neutral-500">
                    Create a new bridal party event
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                {setupOptionsLoading ? (
  <p className="rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
    Loading backend event setup options...
  </p>
) : null}
                

                <Input
                  label="Bride Name"
                  value={eventForm.brideName}
                  onChange={(value) =>
                    setEventForm((prev) => ({ ...prev, brideName: value }))
                  }
                />

                <Input
                  label="Wedding Date"
                  type="date"
                  min={getTodayDateInputValue()}
                  value={eventForm.weddingDate}
                  onChange={(value) =>
                    setEventForm((prev) => ({ ...prev, weddingDate: value }))
                  }
                />

<SelectInput
  label="Wedding Event Type"
  value={eventForm.weddingEventType}
  onChange={(value) =>
    setEventForm((prev) => ({
      ...prev,
      weddingEventType: value,
    }))
  }
  options={eventTypeOptions}
/>

<SelectInput
  label="Wedding Season"
  value={eventForm.weddingSeason}
  onChange={(value) =>
    setEventForm((prev) => ({
      ...prev,
      weddingSeason: value,
    }))
  }
  options={seasonOptions}
/>

        <WeddingPaletteFamilySelector
  selectedPalette={eventForm.palette}
  palettes={paletteFamiliesForUi}
  onSelectPalette={(value) =>
    setEventForm((prev) => ({
      ...prev,
      palette: value,
    }))
  }
/>

                <button
                  onClick={handleCreateEvent}
                  disabled={apiState.loading}
                  className={`rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white ${actionButtonClass}`}
                >
                  Create Bridal Party Event
                </button>
              </div>
            </Card>

            <div ref={inviteCardRef}>
  {eventId ? (
    <Card>
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
  <div className="flex items-center gap-3">
    <div className="rounded-full bg-[#f7f2ea] p-3">
      <UserPlus className="h-5 w-5" />
    </div>

    <div>
      <h2 className="text-xl font-semibold">Invite Member</h2>
      <p className="text-sm text-neutral-500">
        Choose how you want to invite a bridesmaid
      </p>
    </div>
  </div>

  {joinToken ? (
    <button
      type="button"
      onClick={handleCopyInviteLink}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#e3d6c7] bg-white px-5 text-sm font-semibold text-neutral-800 hover:border-neutral-950 ${actionButtonClass}`}
    >
      <Link2 className="h-4 w-4" />
      Copy Link
    </button>
  ) : (
    <button
      type="button"
      onClick={() =>
        toast.info("Invite link not ready", "Pehle kisi channel se invite create karo.")
      }
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#e3d6c7] bg-white px-5 text-sm font-semibold text-neutral-500 ${actionButtonClass}`}
    >
      <Link2 className="h-4 w-4" />
      Copy Link
    </button>
  )}
</div>

      <div className="rounded-[24px] border border-[#eadfce] bg-[#fbfaf6] p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-neutral-700">
            Share the invite across your preferred channel
          </p>

         
        </div>

       <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
  {INVITE_CHANNEL_CONFIGS.map((channel) => (
    <ShareInviteButton
      key={channel.id}
      icon={
        channel.id === "email" ? (
          <Mail className="h-4 w-4" />
        ) : channel.id === "whatsapp" ? (
          <MessageSquare className="h-4 w-4" />
        ) : channel.id === "facebook" ? (
          <span className="flex h-4 w-4 items-center justify-center text-sm font-bold">
            f
          </span>
        ) : (
          <span className="flex h-4 w-4 items-center justify-center text-base font-bold">
            ◎
          </span>
        )
      }
      label={channel.label}
      onClick={() => openShareChannel(channel.id)}
    />
  ))}
</div>

        <p className="mt-4 text-xs leading-5 text-neutral-500">
          Kisi bhi channel par click karo. Uske according invite form popup me open hoga.
        </p>
      </div>

      {joinToken ? (
        <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />

            <div>
              <p className="font-semibold text-emerald-900">
                Last invite sent successfully
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-800">
                Invite accept karne ke baad bridesmaid ka size aur status dashboard me update ho jayega.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  ) : null}
</div>
          </div>

          <div className="space-y-5">
            <DashboardSummary
              title={dashboardTitle}
              eventStatus={eventStatus}
              members={members}
            />

            <Card>
  <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-[#f7f2ea] p-3">
        <Sparkles className="h-5 w-5" />
      </div>

      <div>
        <h2 className="text-xl font-semibold">Recommended Dresses</h2>
        <p className="text-sm text-neutral-500">
  {memberAction.memberId && selectedActionMember
    ? `Based on ${selectedActionMember?.name || selectedActionMember?.email || "selected member"} measurements, ${displayWeddingEventType}, ${displayWeddingSeason}, ${displayPaletteName}`
    : `Invite/select a member to see fit-ready recommendations.`}
</p>
      </div>
    </div>

    <button
      type="button"
      onClick={loadRecommendedDresses}
      disabled={recommendationLoading}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border border-neutral-300 px-4 text-xs font-semibold text-neutral-700 ${actionButtonClass}`}
    >
      {recommendationLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCcw className="h-4 w-4" />
      )}
      Refresh
    </button>
  </div>

  {recommendationError ? (
    <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {recommendationError}
    </div>
  ) : null}

{!eventId ? (
  <div className="rounded-[24px] border border-dashed border-neutral-300 bg-[#fbfaf6] p-8 text-center">
    <p className="font-serif text-2xl italic text-neutral-950">
      Create event first
    </p>
    <p className="mt-2 text-sm text-neutral-500">
      Pehle bridal party event create karo. Uske baad invite aur recommendations flow start hoga.
    </p>
  </div>
) : !memberAction.memberId ? (
  <div className="rounded-[24px] border border-dashed border-neutral-300 bg-[#fbfaf6] p-8 text-center">
    <p className="font-serif text-2xl italic text-neutral-950">
      Select a member first
    </p>
    <p className="mt-2 text-sm text-neutral-500">
      Members section me kisi bridesmaid ko Select karo. Size submit hone ke baad fit-ready recommendations show hongi.
    </p>
  </div>
) : !selectedMemberHasSize ? (
  <div className="rounded-[24px] border border-dashed border-neutral-300 bg-[#fbfaf6] p-8 text-center">
    <p className="font-serif text-2xl italic text-neutral-950">
      Waiting for measurements
    </p>
    <p className="mt-2 text-sm text-neutral-500">
      Selected member ne abhi size/measurements submit nahi kiya. Measurements submit hote hi recommended dresses show hongi.
    </p>
  </div>
) : recommendationLoading ? (
  <div className="rounded-[24px] border border-neutral-200 bg-[#fbfaf6] p-8 text-center text-sm text-neutral-500">
    <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
    Recommendations load ho rahi hain...
  </div>
) : recommendedDresses.length ? (
  <div className="grid gap-4 md:grid-cols-2">
    {recommendedDresses.map((product) => {
      const productId = getCatalogProductId(product);
      const variantId = getRecommendedProductVariantId(product);
      const name = getCatalogProductName(product);
      const image = getCatalogProductImage(product);
      const item = product as any;

      const isSaved = savedDressIds.includes(productId);
      const isApproved = approvedDressIds.includes(productId);

      const price =
        item?.listingPrice ||
        item?.price ||
        item?.rentPrice ||
        item?.rentalPrice ||
        item?.data?.listingPrice ||
        item?.data?.price ||
        "";

      return (
        <div
          key={productId || name}
          className="overflow-hidden rounded-[24px] border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(23,17,13,0.10)]"
        >
          <div className="relative h-52 bg-[#f7f2ea]">
            {image ? (
              <img
                src={image}
                alt={name}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl">
                👗
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setSavedDressIds((prev) =>
                  prev.includes(productId)
                    ? prev.filter((id) => id !== productId)
                    : [...prev, productId]
                )
              }
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm shadow"
            >
              {isSaved ? "♥" : "♡"}
            </button>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-serif text-[22px] italic leading-tight text-neutral-950">
                  {name}
                </h3>

                <p className="mt-1 text-xs text-neutral-500">
                  {readFirst(
                    item?.fabric,
                    item?.material,
                    item?.category,
                    "Recommended"
                  )}
                </p>
              </div>

              {price ? (
                <p className="shrink-0 text-sm font-semibold text-[#7b614d]">
                  ₹{price}
                </p>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {readFirst(item?.primaryColor, item?.color) ? (
                <span className="rounded-full bg-[#f7f2ea] px-3 py-1.5 text-[11px] text-neutral-700">
                  {readFirst(item?.primaryColor, item?.color)}
                </span>
              ) : null}

              {readFirst(item?.productType, item?.type) ? (
                <span className="rounded-full bg-[#f7f2ea] px-3 py-1.5 text-[11px] text-neutral-700">
                  {readFirst(item?.productType, item?.type)}
                </span>
              ) : null}

            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] text-emerald-700">
  Backend match ready
</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setApprovedDressIds((prev) =>
                    prev.includes(productId)
                      ? prev.filter((id) => id !== productId)
                      : [...prev, productId]
                  )
                }
                className={`h-10 rounded-full text-xs font-semibold ${
                  isApproved
                    ? "bg-emerald-700 text-white"
                    : "bg-[#8a725d] text-white"
                } ${actionButtonClass}`}
              >
                {isApproved ? "Approved" : "Approve"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setSavedDressIds((prev) =>
                    prev.includes(productId)
                      ? prev.filter((id) => id !== productId)
                      : [...prev, productId]
                  )
                }
                className={`h-10 rounded-full border border-neutral-300 text-xs font-semibold text-neutral-700 ${actionButtonClass}`}
              >
                {isSaved ? "Saved" : "Save"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleAssignRecommendedDress(product)}
             disabled={!memberAction.memberId || apiState.loading}
              className={`mt-3 h-11 w-full rounded-full bg-neutral-950 text-xs font-semibold text-white ${actionButtonClass}`}
            >
             {!memberAction.memberId
  ? "Select Member First"
  : "Assign to Selected Member"}
            </button>
          </div>
        </div>
      );
    })}
  </div>
) : (
  <div className="rounded-[24px] border border-dashed border-neutral-300 bg-[#fbfaf6] p-8 text-center">
    <p className="font-serif text-2xl italic text-neutral-950">
      No recommendations found
    </p>
    <p className="mt-2 text-sm text-neutral-500">
      Backend se selected member aur event setup ke liye recommendations nahi mili.
    </p>
  </div>
)}
</Card>

            <Card>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-full bg-[#f7f2ea] p-3">
                  <Users className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold">Members</h2>
                  <p className="text-sm text-neutral-500">
                    Bridesmaids and outfit progress
                  </p>
                </div>
              </div>

              {members.length ? (
                <div className="space-y-3">
                  {members.map((member, index) => {
                    const memberId = getMemberId(member);
                    const productId = getMemberProductId(member);

                    const catalogProduct = findCatalogProductById(
                      catalogProducts,
                      productId
                    );

                    const rawDressName = getMemberDress(member);
                    const dressName = catalogProduct
                      ? getCatalogProductName(catalogProduct)
                      : rawDressName;

                   const dressImage = catalogProduct
  ? getCatalogProductImage(catalogProduct) ||
    getMemberAssignedDressImage(member)
  : getMemberAssignedDressImage(member);

                    const hasAssignedDress =
                      Boolean(productId) &&
                      Boolean(dressName) &&
                      dressName !== "Not selected";

                    const bodySize = getMemberBodySize(member);
                    const height = getMemberHeight(member);
                    const sizeDisplay =
                      bodySize && height
                        ? `${bodySize} · ${height}`
                        : bodySize || getMemberSize(member);

                    return (
                      <div
                        key={memberId || (member as any).email || index}
                        className="rounded-2xl bg-[#fbfaf6] p-4 ring-1 ring-neutral-200"
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <p className="font-semibold">
                              {(member as any).name ||
                                (member as any).email ||
                                "Unnamed member"}
                            </p>

                            <p className="text-sm text-neutral-500">
                              {(member as any).role || "Bridesmaid"} ·{" "}
                              {(member as any).email || "No email"}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditMember(member)}
                              className={`rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-950 hover:text-neutral-950 ${actionButtonClass}`}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleResendInvite(member)}
                              disabled={apiState.loading}
                              className={`rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-950 hover:text-neutral-950 ${actionButtonClass}`}
                            >
                              Resend
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleSelectMember({
                                  member,
                                  memberId,
                                  hasAssignedDress,
                                  dressName,
                                })
                              }
                              className={`rounded-full border border-neutral-950 px-4 py-2 text-xs font-semibold ${actionButtonClass}`}
                            >
                              Select
                            </button>
                          </div>
                        </div>

                        {hasAssignedDress ? (
                          <div className="mt-3 flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-3">
                            {dressImage ? (
                              <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                                <img
                                  src={dressImage}
                                  alt={dressName}
                                  className="h-full w-full object-cover object-top"
                                />
                              </div>
                            ) : (
                              <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                                Dress
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-400">
                                Selected Dress
                              </p>

                              <p className="mt-1 truncate font-serif text-[18px] italic text-neutral-950">
                                {dressName}
                              </p>

                              <p className="mt-1 text-xs capitalize text-neutral-500">
                                {formatStatusLabel(getMemberApproval(member))}
                              </p>
                            </div>
                          </div>
                        ) : null}

                        <div className="mt-3 grid gap-2 md:grid-cols-4">
                          <StatusPill
                            label="Dress"
                            value={hasAssignedDress ? dressName : "Not selected"}
                          />

                          <StatusPill label="Size" value={sizeDisplay} />

                          <StatusPill
                            label="Approval"
                            value={getMemberApproval(member)}
                          />

                          <StatusPill
                            label="Payment"
                            value={getMemberPayment(member)}
                          />
                        </div>

                        {hasAnyMeasurement(member) ? (
                          <div className="mt-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-xs text-neutral-600">
                            <div className="flex flex-wrap gap-x-5 gap-y-2">
                              {getMemberBust(member) ? (
                                <span>
                                  <b className="text-neutral-950">Bust:</b>{" "}
                                  {getMemberBust(member)}
                                </span>
                              ) : null}

                              {getMemberWaist(member) ? (
                                <span>
                                  <b className="text-neutral-950">Waist:</b>{" "}
                                  {getMemberWaist(member)}
                                </span>
                              ) : null}

                              {getMemberHip(member) ? (
                                <span>
                                  <b className="text-neutral-950">Hip:</b>{" "}
                                  {getMemberHip(member)}
                                </span>
                              ) : null}

                              {getMemberHeight(member) ? (
                                <span>
                                  <b className="text-neutral-950">Height:</b>{" "}
                                  {getMemberHeight(member)}
                                </span>
                              ) : null}

                              {getMemberPreference(member) ? (
                                <span>
                                  <b className="text-neutral-950">
                                    Preference:
                                  </b>{" "}
                                  {getMemberPreference(member)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        ) : hasSubmittedSizeStatus(member) ? (
                          <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-800">
                            Size submitted ho chuka hai. Backend values pending
                            hote hi yahan show hongi.
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState text="No members yet. Send an invite to get started." />
              )}
            </Card>

            <Card>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-full bg-[#f7f2ea] p-3">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold">Member Overview</h2>
                  <p className="text-sm text-neutral-500">
                    Selected member dress, size and payment details
                  </p>
                </div>
              </div>

              {!memberAction.memberId ? (
                <div className="rounded-[24px] border border-dashed border-neutral-300 bg-[#fbfaf6] px-5 py-8 text-center">
                  <p className="font-serif text-2xl italic text-neutral-950">
                    No member selected
                  </p>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                    Member card me kisi member ke saamne <b>Select</b> dabao.
                    Us member ki size, dress aur payment details yahan show
                    hongi.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[24px] border border-neutral-200 bg-[#fbfaf6] p-5">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-400">
                        Selected Member
                      </p>

                      <p className="mt-2 text-lg font-semibold text-neutral-950">
                        {(selectedActionMember as any)?.name ||
                          (selectedActionMember as any)?.email ||
                          "Selected member"}
                      </p>

                      <p className="mt-1 text-sm text-neutral-500">
                        {(selectedActionMember as any)?.role || "Bridesmaid"}
                        {(selectedActionMember as any)?.email
                          ? ` · ${(selectedActionMember as any).email}`
                          : ""}
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-neutral-200 bg-[#fbfaf6] p-5">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-400">
                        Current Status
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <MiniStatus
                          label="Approval"
                          value={
                            selectedActionMember
                              ? getMemberApproval(selectedActionMember)
                              : "pending"
                          }
                        />

                        <MiniStatus
                          label="Payment"
                          value={
                            selectedActionMember
                              ? getMemberPayment(selectedActionMember)
                              : "pending"
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-neutral-200 bg-white p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {selectedActionDressImage ? (
                        <div className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                          <img
                            src={selectedActionDressImage}
                            alt={selectedActionDressName}
                            className="h-full w-full object-cover object-top"
                          />
                        </div>
                      ) : (
                        <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                          Dress
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-400">
                          Selected Dress
                        </p>

                        <p className="mt-1 truncate font-serif text-[24px] italic leading-tight text-neutral-950">
                          {selectedActionDressName}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#f7f2ea] px-3 py-2 text-xs text-neutral-700">
                            Dress Variant: {selectedAssignedDressSize}
                          </span>

                          <span className="rounded-full bg-[#f7f2ea] px-3 py-2 text-xs text-neutral-700">
                            Color: {selectedAssignedDressColor}
                          </span>

                          <span className="rounded-full bg-[#f7f2ea] px-3 py-2 text-xs text-neutral-700">
                            Selected Height: {selectedAssignedDressHeight}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-neutral-200 bg-[#fbfaf6] p-5">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-400">
                          Fit Summary
                        </p>

                        <p className="mt-1 text-sm text-neutral-500">
                          Member body measurements and fit profile.
                        </p>
                      </div>

                      {!isEditingSize ? (
                        <button
                          type="button"
                          onClick={handleEditSize}
                          className={`inline-flex h-10 items-center justify-center rounded-full border border-neutral-300 px-5 text-xs font-semibold text-neutral-700 hover:border-neutral-950 hover:text-neutral-950 ${actionButtonClass}`}
                        >
                          Edit Size
                        </button>
                      ) : null}
                    </div>

                    {!isEditingSize ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-5">
                        <FitBox label="Body Size" value={memberAction.size || "-"} />
                        <FitBox label="Bust" value={memberAction.bust || "-"} />
                        <FitBox label="Waist" value={memberAction.waist || "-"} />
                        <FitBox label="Hip" value={memberAction.hip || "-"} />
                        <FitBox label="Height" value={memberAction.height || "-"} />
                      </div>
                    ) : (
                      <div className="mt-4 grid gap-3">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                          <Input
                            label="Body Size"
                            value={sizeForm.size}
                            placeholder="A0"
                            onChange={(value) =>
                              setSizeForm((prev) => ({
                                ...prev,
                                size: value,
                              }))
                            }
                          />

                          <Input
                            label="Bust"
                            value={sizeForm.bust}
                            placeholder="10"
                            onChange={(value) =>
                              setSizeForm((prev) => ({
                                ...prev,
                                bust: value,
                              }))
                            }
                          />

                          <Input
                            label="Waist"
                            value={sizeForm.waist}
                            placeholder="20"
                            onChange={(value) =>
                              setSizeForm((prev) => ({
                                ...prev,
                                waist: value,
                              }))
                            }
                          />

                          <Input
                            label="Hip"
                            value={sizeForm.hip}
                            placeholder="30"
                            onChange={(value) =>
                              setSizeForm((prev) => ({
                                ...prev,
                                hip: value,
                              }))
                            }
                          />

                          <Input
                            label="Height"
                            value={sizeForm.height}
                            placeholder="5"
                            onChange={(value) =>
                              setSizeForm((prev) => ({
                                ...prev,
                                height: value,
                              }))
                            }
                          />
                        </div>

                        <Input
                          label="Preference"
                          value={sizeForm.preference}
                          placeholder="Regular fit"
                          onChange={(value) =>
                            setSizeForm((prev) => ({
                              ...prev,
                              preference: value,
                            }))
                          }
                        />

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handleSaveSize}
                            disabled={apiState.loading}
                            className={`inline-flex h-11 items-center justify-center rounded-full bg-neutral-950 px-6 text-xs font-semibold text-white ${actionButtonClass}`}
                          >
                            {apiState.loading ? "Saving..." : "Save Size"}
                          </button>

                          <button
                            type="button"
                            onClick={handleCancelEditSize}
                            className={`inline-flex h-11 items-center justify-center rounded-full border border-neutral-300 px-6 text-xs font-semibold text-neutral-700 ${actionButtonClass}`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-[24px] border border-neutral-200 bg-white p-5">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-400">
                      Next Step
                    </p>

                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {selectedActionDressName === "No dress selected"
                        ? "Ab /bridesmaid page se dress choose karke selected member ke workspace me add karo."
                        : selectedActionMember &&
                            String(getMemberPayment(selectedActionMember)).toLowerCase() ===
                              "paid"
                          ? "Payment complete hai. Shipment details yahan update hongi."
                          : "Dress assigned hai. Payment complete karne ke liye Pay Now dabao."}
                    </p>

                    {selectedActionDressName === "No dress selected" ? (
                      <a
                        href="/bridesmaid"
                        className={`mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#17110d] px-6 text-[10px] uppercase tracking-[0.28em] text-white ${actionButtonClass}`}
                      >
                        Open Bridesmaid Dresses
                      </a>
                    ) : null}

                    {selectedActionDressName !== "No dress selected" ? (
                      <div className="mt-4 flex flex-wrap gap-3">
                        {selectedActionMember &&
                        String(
                          getMemberPayment(selectedActionMember)
                        ).toLowerCase() === "paid" ? (
                          <span className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-700 px-6 text-xs font-semibold text-white">
                            Payment Complete
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handlePayNow}
                            disabled={paymentLoading}
                            className={`inline-flex h-11 items-center justify-center rounded-full bg-neutral-950 px-6 text-xs font-semibold text-white ${actionButtonClass}`}
                          >
                            {paymentLoading ? "Starting Payment..." : "Pay Now"}
                          </button>
                        )}
                      </div>
                    ) : null}

                    {stripeClientSecret ? (
                      <StripePaymentBox
                        clientSecret={stripeClientSecret}
                        onSuccess={async () => {
                          setApiState({
                            loading: false,
                            error: "",
                            success:
                              "Payment successful. Dashboard refresh ho raha hai.",
                          });

                          toast.success(
                            "Payment successful",
                            "Dashboard refresh ho raha hai."
                          );

                          setStripeClientSecret("");
                          setStripePaymentId("");

                          await refreshDashboard(eventId, false);
                          await refreshShipment(eventId);
                        }}
                      />
                    ) : null}
                  </div>
                </div>
              )}
            </Card>

            <Card>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-full bg-[#f7f2ea] p-3">
                  <Truck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold">Shipment Status</h2>
                  <p className="text-sm text-neutral-500">
                    Shipping progress and tracking details
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-neutral-200 bg-[#fbfaf6] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-400">
                      Current Status
                    </p>

                    <p className="mt-2 text-lg font-semibold text-neutral-950">
                      {formatStatusLabel(
                        shipment?.status ||
                          shipment?.data?.status ||
                          "Not created yet"
                      )}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-neutral-500">
                      Payment complete hone ke baad shipment tracking available
                      hote hi yahan show hogi.
                    </p>

                    {shipment?.estimatedDelivery ||
                    shipment?.data?.estimatedDelivery ? (
                      <p className="mt-2 text-xs text-neutral-500">
                        ETA:{" "}
                        {formatDisplayDate(
                          shipment?.estimatedDelivery ||
                            shipment?.data?.estimatedDelivery
                        )}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl bg-white px-5 py-4 ring-1 ring-neutral-200">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400">
                      Tracking
                    </p>

                    <p className="mt-1 text-sm font-semibold text-neutral-950">
                      {shipment?.trackingNumber ||
                        shipment?.data?.trackingNumber ||
                        "Awaiting shipment"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {invitePopupOpen && activeShareChannel ? (
 <InviteChannelPopup
  channel={activeShareChannel as InviteChannel}
  inviteForm={inviteForm}
  setInviteForm={setInviteForm}
  eventType={eventForm.weddingEventType || displayWeddingEventType}
  apiLoading={apiState.loading}
  joinToken={joinToken}
  inviteUrl={getInviteShareUrl()}
  onClose={() => {
    setInvitePopupOpen(false);
    setActiveShareChannel("");
  }}
  onSendInvite={handleInvite}
  onCopyLink={handleCopyInviteLink}
/>
) : null}
      </div>

      
    </main>
  );
}

function getProductImageUrl(product: any) {
  return (
    product?.imageUrl ||
    product?.image ||
    product?.thumbnail ||
    product?.photo ||
    product?.secureUrl ||
    product?.images?.[0]?.secureUrl ||
    product?.images?.[0]?.url ||
    product?.product?.imageUrl ||
    product?.product?.image ||
    product?.product?.images?.[0]?.secureUrl ||
    product?.product?.images?.[0]?.url ||
    product?.dress?.imageUrl ||
    product?.dress?.image ||
    product?.dress?.images?.[0]?.secureUrl ||
    product?.dress?.images?.[0]?.url ||
    ""
  );
}

function DashboardSummary({
  title,
  eventStatus,
  members,
}: {
  title: string;
  eventStatus: BridalEventStatus | null;
  members: BridalMember[];
}) {
  const sizeDone = members.filter(
    (member) => getMemberSize(member) !== "Pending"
  ).length;

  const approved = members.filter((member) => {
    const approval = String(getMemberApproval(member)).toLowerCase();
    return approval === "approved" || approval === "assigned";
  }).length;

  const paid = members.filter(
    (member) => String(getMemberPayment(member)).toLowerCase() === "paid"
  ).length;

  const date =
    (eventStatus as any)?.eventDate ||
    (eventStatus as any)?.weddingDate ||
    (eventStatus as any)?.data?.eventDate ||
    (eventStatus as any)?.data?.weddingDate ||
    "";

  return (
    <section className="rounded-[2rem] bg-neutral-950 p-6 text-white">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Event Dashboard
          </p>

          <h2 className="mt-2 text-3xl font-semibold">{title}</h2>

          <p className="mt-2 text-sm text-white/60">
            Wedding Date: {formatDisplayDate(date)}
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold">
          Workspace Active
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <SummaryTile icon={<Users />} label="Members" value={members.length} />
        <SummaryTile icon={<Ruler />} label="Size Done" value={sizeDone} />
        <SummaryTile
          icon={<CheckCircle2 />}
          label="Approved"
          value={approved}
        />
        <SummaryTile icon={<CreditCard />} label="Paid" value={paid} />
      </div>
    </section>
  );
}

function SummaryMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-5">
      <div className="mb-3 flex items-center gap-2 text-white/70">
        <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        <span className="text-xs uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      {children}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  inputMode,
  autoComplete,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  min?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </span>

      <input
        type={type}
        value={value}
        min={min}
        required={required}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 text-sm outline-none focus:border-neutral-950"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </span>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={4}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 text-sm outline-none focus:border-neutral-950"
      />
    </label>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  const displayValue =
    label.toLowerCase() === "approval" || label.toLowerCase() === "payment"
      ? formatStatusLabel(value)
      : value;

  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-neutral-200">
      <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium capitalize">
        {displayValue}
      </p>
    </div>
  );
}

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-neutral-200">
      <p className="text-[9px] uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-neutral-950">
        {formatStatusLabel(value)}
      </p>
    </div>
  );
}

function FitBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-neutral-200">
      <p className="text-[9px] uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-neutral-950">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-[#fbfaf6] p-6 text-center text-sm text-neutral-500 ring-1 ring-neutral-200">
      <XCircle className="mx-auto mb-2 h-5 w-5" />
      {text}
    </div>
  );
}


function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 text-sm outline-none transition focus:border-neutral-950"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ShareInviteButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#e3d6c7] bg-white px-4 text-sm font-medium text-neutral-800 hover:border-neutral-950 ${actionButtonClass}`}
    >
      <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      {label}
    </button>
  );
}

function InviteChannelPopup({
  channel,
  inviteForm,
  setInviteForm,
  eventType,
  apiLoading,
  joinToken,
  inviteUrl,
  onClose,
  onSendInvite,
  onCopyLink,
}: {
  channel: InviteChannel;
  inviteForm: {
    name: string;
    email: string;
    countryCode: string;
    phoneNumber: string;
    socialAccount: string;
    role: string;
    message: string;
  };
  setInviteForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      countryCode: string;
      phoneNumber: string;
      socialAccount: string;
      role: string;
      message: string;
    }>
  >;
  eventType: string;
  apiLoading: boolean;
  joinToken: string;
  inviteUrl: string;
  onClose: () => void;
  onSendInvite: () => void;
  onCopyLink: () => void;
}) {
  const current =
    INVITE_CHANNEL_CONFIGS.find((item) => item.id === channel) ||
    INVITE_CHANNEL_CONFIGS[0];

  const fields = new Set([
    ...current.requiredFields,
    ...(current.optionalFields || []),
  ]);

  function openChannelShare() {
    if (!inviteUrl) return;

    const text = `${
      inviteForm.message || `Hi, I would love for you to join my ${eventType}.`
    }\n${inviteUrl}`;

    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(inviteUrl);
    const cleanPhone = inviteForm.phoneNumber.replace(/[^\d]/g, "");
    const instagramHandle = inviteForm.socialAccount.trim().replace("@", "");

    const urls: Record<InviteChannel, string> = {
      email: `mailto:${inviteForm.email || ""}?subject=${encodeURIComponent(
        "Bridal Party Invite"
      )}&body=${encodedText}`,
      whatsapp: cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodedText}`
        : `https://wa.me/?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      instagram: instagramHandle
        ? `https://www.instagram.com/${instagramHandle}/`
        : `https://www.instagram.com/`,
      "copy-link": inviteUrl,
    };

    if (channel === "copy-link") {
      onCopyLink();
      return;
    }

    const url = urls[channel];

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[32px] border border-[#e6d8c8] bg-white p-5 shadow-[0_30px_90px_rgba(23,17,13,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f7f2ea] text-neutral-950">
              {channel === "email" ? (
                <Mail className="h-5 w-5" />
              ) : channel === "whatsapp" ? (
                <MessageSquare className="h-5 w-5" />
              ) : channel === "facebook" ? (
                <span className="text-base font-bold">f</span>
              ) : channel === "instagram" ? (
                <span className="text-base font-bold">◎</span>
              ) : (
                <Link2 className="h-5 w-5" />
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-950">
                {current.title}
              </h3>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                {current.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-lg text-neutral-500 transition hover:bg-neutral-950 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          {fields.has("name") ? (
            <Input
              label="Name"
              value={inviteForm.name}
              placeholder="Bridesmaid name"
              onChange={(value) =>
                setInviteForm((prev) => ({ ...prev, name: value }))
              }
            />
          ) : null}

          {fields.has("email") ? (
            <Input
              label="Email Address"
              type="email"
              inputMode="email"
              value={inviteForm.email}
              placeholder="bridesmaid@example.com"
              onChange={(value) =>
                setInviteForm((prev) => ({ ...prev, email: value }))
              }
            />
          ) : null}

          {fields.has("countryCode") || fields.has("phoneNumber") ? (
            <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
              {fields.has("countryCode") ? (
                <Input
                  label="Country Code"
                  value={inviteForm.countryCode}
                  placeholder="+91"
                  onChange={(value) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      countryCode: value,
                    }))
                  }
                />
              ) : null}

              {fields.has("phoneNumber") ? (
                <Input
                  label="WhatsApp Number"
                  type="tel"
                  inputMode="tel"
                  value={inviteForm.phoneNumber}
                  placeholder="8570055054"
                  onChange={(value) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      phoneNumber: value,
                    }))
                  }
                />
              ) : null}
            </div>
          ) : null}

          {fields.has("socialAccount") ? (
            <Input
              label={
                channel === "instagram"
                  ? "Instagram Username"
                  : "Facebook Profile / Account"
              }
              value={inviteForm.socialAccount}
              placeholder={
                channel === "instagram"
                  ? "@username"
                  : "Facebook profile name or URL"
              }
              onChange={(value) =>
                setInviteForm((prev) => ({
                  ...prev,
                  socialAccount: value,
                }))
              }
            />
          ) : null}

          {fields.has("role") ? (
            <Input
              label="Role"
              value={inviteForm.role}
              onChange={(value) =>
                setInviteForm((prev) => ({ ...prev, role: value }))
              }
            />
          ) : null}

          {fields.has("message") ? (
            <Textarea
              label="Invite Message"
              value={inviteForm.message}
              placeholder={`Hi, I would love for you to join my ${eventType}.`}
              onChange={(value) =>
                setInviteForm((prev) => ({ ...prev, message: value }))
              }
            />
          ) : null}

          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
            {current.note}
          </div>

          {joinToken ? (
            <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Invite Link Ready
              </p>

              <p className="mt-2 break-all text-sm leading-6 text-emerald-900">
                {inviteUrl}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onCopyLink}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border border-emerald-300 bg-white px-4 text-xs font-semibold text-emerald-800 ${actionButtonClass}`}
                >
                  <Link2 className="h-4 w-4" />
                  Copy Link
                </button>

                <button
                  type="button"
                  onClick={openChannelShare}
                  className={`inline-flex h-10 items-center justify-center rounded-full bg-emerald-700 px-4 text-xs font-semibold text-white ${actionButtonClass}`}
                >
                  Open {current.label}
                </button>
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onSendInvite}
              disabled={apiLoading}
              className={`inline-flex h-12 items-center justify-center rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white ${actionButtonClass}`}
            >
              {apiLoading ? "Creating Invite..." : `Create ${current.label} Invite`}
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`inline-flex h-12 items-center justify-center rounded-full border border-neutral-300 px-5 text-sm font-semibold text-neutral-700 ${actionButtonClass}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}