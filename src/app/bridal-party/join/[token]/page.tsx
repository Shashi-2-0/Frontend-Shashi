"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  Mail,
  PackageCheck,
  PartyPopper,
  Ruler,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { useToast } from "@/components/ui/AppToast";

import {
  createBridalPayment,
  getBridalEventStatus,
  joinBridalParty,
  submitBridalMemberSize,
} from "@/lib/api/bridalParty.api";

import {
  CatalogProduct,
  getCatalogProducts,
  unwrapCatalogProducts,
} from "@/lib/api/catalog.api";

import StripePaymentBox from "../../StripePaymentBox";

type MeasurementForm = {
  size: string;
  bust: string;
  waist: string;
  hip: string;
  height: string;
  preference: string;
};

type SizeGuideTab = "standard" | "petite" | "plus" | "maternity";

const heightGroups = [
  {
    label: "Petite",
    helper: "Select body type",
    values: [`4'11"`, `5'0"`, `5'1"`, `5'2"`, `5'3"`],
  },
  {
    label: "Standard",
    helper: "Select body type",
    values: [`5'4"`, `5'5"`, `5'6"`, `5'7"`],
  },
  {
    label: "Tall",
    helper: "Select body type",
    values: [`5'8"`, `5'9"`, `5'10"`],
  },
  {
    label: "Extra Tall",
    helper: "Select body type",
    values: [`5'11"`, `6'0"`, `6'1"`, `6'2"+`],
  },
];

const sizeGuideTabs = [
  { id: "standard", label: "Standard Sizing" },
  { id: "petite", label: "Petite" },
  { id: "plus", label: "Plus Sizing" },
  { id: "maternity", label: "Maternity" },
] as const;

const sizeGuideRows: Record<SizeGuideTab, string[][]> = {
  standard: [
    ["US Size", "00", "0 / 2", "4 / 6", "8 / 10", "12 / 14", "16"],
    ["UK Size", "4", "6 / 8", "10 / 12", "14 / 16", "18 / 20", "22"],
    ["Japan Size", "5", "7 / 9", "11 / 13", "15 / 17", "19 / 21", "23"],
    ["China Size", "XS", "S", "M", "L", "XL", "XXL"],
    ["EU Size", "32", "34 / 36", "38 / 40", "42 / 44", "46 / 48", "50"],
    ["Bust", "32", "33 / 34", "35 / 36", "37 / 38", "39.5 / 41", "42.5"],
    [
      "Natural Waist",
      "24",
      "25 / 26",
      "27 / 28",
      "29 / 30",
      "31.5 / 33",
      "34.5",
    ],
    ["Drop Waist", "26", "27 / 28", "29 / 30", "31 / 32", "33.5 / 35", "36.5"],
    ["Hips", "34", "35 / 36", "37 / 38", "39 / 40", "41.5 / 43", "44.5"],
  ],
  petite: [
    ["US Size", "00P", "0P / 2P", "4P / 6P", "8P / 10P", "12P / 14P", "16P"],
    [
      "Recommended Height",
      `4'11" - 5'1"`,
      `5'0" - 5'2"`,
      `5'1" - 5'3"`,
      `5'2" - 5'4"`,
      `5'2" - 5'4"`,
      `5'3" - 5'4"`,
    ],
    ["Bust", "31.5", "32.5 / 33.5", "34.5 / 35.5", "36.5 / 37.5", "39 / 40.5", "42"],
    [
      "Natural Waist",
      "23.5",
      "24.5 / 25.5",
      "26.5 / 27.5",
      "28.5 / 29.5",
      "31 / 32.5",
      "34",
    ],
    ["Drop Waist", "25.5", "26.5 / 27.5", "28.5 / 29.5", "30.5 / 31.5", "33 / 34.5", "36"],
    ["Hips", "33.5", "34.5 / 35.5", "36.5 / 37.5", "38.5 / 39.5", "41 / 42.5", "44"],
  ],
  plus: [
    ["US Size", "14W", "16W", "18W", "20W", "22W", "24W"],
    ["UK Size", "18", "20", "22", "24", "26", "28"],
    ["EU Size", "46", "48", "50", "52", "54", "56"],
    ["Bust", "43", "45", "47", "49", "51", "53"],
    ["Natural Waist", "36", "38", "40", "42", "44", "46"],
    ["Drop Waist", "38", "40", "42", "44", "46", "48"],
    ["Hips", "46", "48", "50", "52", "54", "56"],
  ],
  maternity: [
    ["Size", "XS", "S", "M", "L", "XL", "XXL"],
    ["Pre-pregnancy US Size", "0 / 2", "4 / 6", "8 / 10", "12 / 14", "16", "18"],
    ["Bust", "33 / 34", "35 / 36", "37 / 38", "39.5 / 41", "42.5", "44"],
    ["Natural Waist", "24 / 26", "26 / 28", "28 / 30", "30 / 32", "32 / 34", "34 / 36"],
    ["Hips", "34 / 36", "36 / 38", "38 / 40", "40 / 42", "42 / 44", "44 / 46"],
  ],
};

const sizeGuideMeasurementGuide: Record<
  SizeGuideTab,
  {
    title: string;
    items: {
      heading: string;
      text: string;
    }[];
  }
> = {
  standard: {
    title: "Measurement Guide",
    items: [
      {
        heading: "Bust",
        text: "Measure under your arms at the fuller part of your bust. Keep tape level across shoulder blades.",
      },
      {
        heading: "Natural Waist",
        text: "Measure around your natural waistline, keeping the tape comfortably loose.",
      },
      {
        heading: "Drop Waist",
        text: "Measure 1.5 inches below your natural waistline.",
      },
      {
        heading: "Hips",
        text: "Stand with your feet together and measure around the fullest part of your hips.",
      },
    ],
  },
  petite: {
    title: "Measurement Guide",
    items: [
      {
        heading: "Bust",
        text: "Measure under your arms at the fuller part of your bust. Keep tape level across shoulder blades.",
      },
      {
        heading: "Natural Waist",
        text: "Measure around your natural waistline, keeping the tape comfortably loose.",
      },
      {
        heading: "Drop Waist",
        text: "Measure 1.5 inches below your natural waistline.",
      },
      {
        heading: "Hips",
        text: "Stand with your feet together and measure around the fullest part of your hips.",
      },
    ],
  },
  plus: {
    title: "Measurement Guide",
    items: [
      {
        heading: "Bust",
        text: "Measure under your arms at the fuller part of your bust. Keep tape level across shoulder blades.",
      },
      {
        heading: "Natural Waist",
        text: "Measure around your natural waistline, keeping the tape comfortably loose.",
      },
      {
        heading: "Drop Waist",
        text: "Measure 1.5 inches below your natural waistline.",
      },
      {
        heading: "Hips",
        text: "Stand with your feet together and measure around the fullest part of your hips.",
      },
    ],
  },
  maternity: {
    title: "Measurement Guide",
    items: [
      {
        heading: "How to Choose Maternity Size",
        text: "Choose the size closest to your pre-pregnancy size. Maternity garments are typically designed with added ease to accommodate a growing bump.",
      },
      {
        heading: "Bust",
        text: "Measure under your arms at the fullest part of your bust and keep the tape level across your back.",
      },
      {
        heading: "Waist",
        text: "Measure around the fullest part of your bump for the most comfortable maternity fit.",
      },
      {
        heading: "Hips",
        text: "Stand with your feet together and measure around the fullest part of your hips.",
      },
    ],
  },
};

const actionButtonClass =
  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(23,17,13,0.18)] active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

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

function getEventIdFromJoinResponse(data: any) {
  return (
    data?.eventId ||
    data?.bridalEventId ||
    data?.event?.id ||
    data?.event?.eventId ||
    data?.bridalEvent?.id ||
    data?.bridalEvent?.eventId ||
    data?.data?.eventId ||
    data?.data?.bridalEventId ||
    data?.data?.event?.id ||
    data?.data?.event?.eventId ||
    data?.data?.bridalEvent?.id ||
    data?.data?.bridalEvent?.eventId ||
    data?.member?.eventId ||
    data?.member?.bridalEventId ||
    data?.data?.member?.eventId ||
    data?.data?.member?.bridalEventId ||
    ""
  );
}

function getMemberIdFromJoinResponse(data: any) {
  return (
    data?.memberId ||
    data?.bridalMemberId ||
    data?.bridalPartyMemberId ||
    data?.member?.id ||
    data?.member?.memberId ||
    data?.member?.bridalMemberId ||
    data?.member?.bridalPartyMemberId ||
    data?.data?.memberId ||
    data?.data?.bridalMemberId ||
    data?.data?.bridalPartyMemberId ||
    data?.data?.member?.id ||
    data?.data?.member?.memberId ||
    data?.data?.member?.bridalMemberId ||
    data?.data?.member?.bridalPartyMemberId ||
    ""
  );
}

function getMemberEmailFromJoinResponse(data: any) {
  return (
    data?.email ||
    data?.member?.email ||
    data?.member?.user?.email ||
    data?.data?.email ||
    data?.data?.member?.email ||
    data?.data?.member?.user?.email ||
    ""
  );
}

function getMemberNameFromJoinResponse(data: any) {
  return (
    data?.name ||
    data?.member?.name ||
    data?.member?.memberName ||
    data?.member?.user?.name ||
    data?.data?.name ||
    data?.data?.member?.name ||
    data?.data?.member?.memberName ||
    data?.data?.member?.user?.name ||
    "Bridesmaid"
  );
}

function getEventNameFromJoinResponse(data: any) {
  return (
    data?.eventName ||
    data?.name ||
    data?.event?.name ||
    data?.event?.eventName ||
    data?.bridalEvent?.name ||
    data?.member?.event?.name ||
    data?.member?.bridalEvent?.name ||
    data?.data?.eventName ||
    data?.data?.name ||
    data?.data?.event?.name ||
    data?.data?.event?.eventName ||
    data?.data?.bridalEvent?.name ||
    data?.data?.member?.event?.name ||
    data?.data?.member?.bridalEvent?.name ||
    "Bridal Party"
  );
}

function normalizeMembers(data: any): any[] {
  const raw =
    data?.members ||
    data?.data?.members ||
    data?.event?.members ||
    data?.data?.event?.members ||
    data?.bridalPartyMembers ||
    data?.data?.bridalPartyMembers ||
    data?.data?.event?.bridalPartyMembers ||
    data?.invites ||
    data?.data?.invites ||
    data?.data?.event?.invites ||
    [];

  return Array.isArray(raw) ? raw : [];
}

function getMemberId(member: any) {
  return (
    member?.id ||
    member?.memberId ||
    member?.bridalMemberId ||
    member?.bridalPartyMemberId ||
    member?.data?.id ||
    member?.data?.memberId ||
    member?.data?.bridalMemberId ||
    member?.data?.bridalPartyMemberId ||
    ""
  );
}

function getMemberEmail(member: any) {
  return String(
    member?.email ||
      member?.member?.email ||
      member?.user?.email ||
      member?.data?.email ||
      member?.data?.member?.email ||
      member?.data?.user?.email ||
      ""
  )
    .trim()
    .toLowerCase();
}

function getMemberStatus(member: any) {
  return (
    member?.status ||
    member?.approval ||
    member?.approvalStatus ||
    member?.selection?.status ||
    member?.assignedDress?.status ||
    member?.selectedDress?.status ||
    member?.data?.status ||
    member?.data?.approval ||
    member?.data?.approvalStatus ||
    member?.data?.selection?.status ||
    member?.data?.assignedDress?.status ||
    member?.data?.selectedDress?.status ||
    ""
  );
}

function getMeasurementSource(member: any) {
  const candidates = [
    member?.measurements,
    member?.measurement,
    member?.memberMeasurements,
    member?.memberMeasurement,
    member?.sizeMeasurement,
    member?.sizeMeasurements,
    member?.bodyMeasurements,
    member?.bodyMeasurement,
    member?.fitProfile,
    member?.fit,
    member?.profile,
    member?.sizePreference,
    member?.preferenceData,
    member?.bodyProfile,
    member?.memberSize,
    member?.sizeInfo,

    member?.data?.measurements,
    member?.data?.measurement,
    member?.data?.memberMeasurements,
    member?.data?.memberMeasurement,
    member?.data?.sizeMeasurement,
    member?.data?.sizeMeasurements,
    member?.data?.bodyMeasurements,
    member?.data?.bodyMeasurement,
    member?.data?.fitProfile,
    member?.data?.fit,
    member?.data?.profile,
    member?.data?.sizePreference,
    member?.data?.preferenceData,
    member?.data?.bodyProfile,
    member?.data?.memberSize,
    member?.data?.sizeInfo,
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

    if (typeof candidate === "object") return candidate;
  }

  return {};
}

function getMemberBodySize(member: any) {
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

    member?.size,
    member?.bodySize,
    member?.body_size,
    member?.submittedSize,
    member?.submitted_size,
    member?.selectedSize,
    member?.selected_size,
    member?.standardSize,
    member?.standard_size,
    member?.measurementSize,
    member?.measurement_size,
    member?.sizeValue,
    member?.size_value,

    member?.data?.size,
    member?.data?.bodySize,
    member?.data?.body_size,
    member?.data?.submittedSize,
    member?.data?.submitted_size,
    member?.data?.selectedSize,
    member?.data?.selected_size,
    member?.data?.standardSize,
    member?.data?.standard_size,
    member?.data?.measurementSize,
    member?.data?.measurement_size,
    member?.data?.sizeValue,
    member?.data?.size_value
  );
}

function getMemberBust(member: any) {
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

    member?.bust,
    member?.bustSize,
    member?.bust_size,
    member?.bustInches,
    member?.bust_inches,
    member?.chest,
    member?.chestSize,
    member?.chest_size,

    member?.data?.bust,
    member?.data?.bustSize,
    member?.data?.bust_size,
    member?.data?.bustInches,
    member?.data?.bust_inches,
    member?.data?.chest,
    member?.data?.chestSize,
    member?.data?.chest_size
  );
}

function getMemberWaist(member: any) {
  const source = getMeasurementSource(member);

  return readFirst(
    source?.waist,
    source?.waistSize,
    source?.waist_size,
    source?.waistInches,
    source?.waist_inches,

    member?.waist,
    member?.waistSize,
    member?.waist_size,
    member?.waistInches,
    member?.waist_inches,

    member?.data?.waist,
    member?.data?.waistSize,
    member?.data?.waist_size,
    member?.data?.waistInches,
    member?.data?.waist_inches
  );
}

function getMemberHip(member: any) {
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

    member?.hip,
    member?.hips,
    member?.hipSize,
    member?.hip_size,
    member?.hipsSize,
    member?.hips_size,
    member?.hipInches,
    member?.hip_inches,
    member?.hipsInches,
    member?.hips_inches,

    member?.data?.hip,
    member?.data?.hips,
    member?.data?.hipSize,
    member?.data?.hip_size,
    member?.data?.hipsSize,
    member?.data?.hips_size,
    member?.data?.hipInches,
    member?.data?.hip_inches,
    member?.data?.hipsInches,
    member?.data?.hips_inches
  );
}

function getMemberHeight(member: any) {
  const source = getMeasurementSource(member);

  const directHeight = readFirst(
    source?.height,
    source?.selectedHeight,
    source?.selected_height,
    source?.heightPreference,
    source?.height_preference,
    source?.heightInches,
    source?.height_inches,

    member?.height,
    member?.selectedHeight,
    member?.selected_height,
    member?.heightPreference,
    member?.height_preference,
    member?.heightInches,
    member?.height_inches,

    member?.data?.height,
    member?.data?.selectedHeight,
    member?.data?.selected_height,
    member?.data?.heightPreference,
    member?.data?.height_preference,
    member?.data?.heightInches,
    member?.data?.height_inches
  );

  if (directHeight) return directHeight;

  const feet = readFirst(
    source?.heightFeet,
    source?.height_feet,
    member?.heightFeet,
    member?.height_feet,
    member?.data?.heightFeet,
    member?.data?.height_feet
  );

  const inches = readFirst(
    source?.heightInch,
    source?.heightInches,
    source?.height_inch,
    source?.height_inches,
    member?.heightInch,
    member?.heightInches,
    member?.height_inch,
    member?.height_inches,
    member?.data?.heightInch,
    member?.data?.heightInches,
    member?.data?.height_inch,
    member?.data?.height_inches
  );

  if (feet && inches) return `${feet}'${inches}"`;
  if (feet) return feet;

  return "";
}

function getMemberPreference(member: any) {
  const source = getMeasurementSource(member);

  return readFirst(
    source?.preference,
    source?.fitPreference,
    source?.fit_preference,
    source?.notes,
    source?.note,
    source?.fit,

    member?.preference,
    member?.fitPreference,
    member?.fit_preference,
    member?.notes,
    member?.note,
    member?.fit,

    member?.data?.preference,
    member?.data?.fitPreference,
    member?.data?.fit_preference,
    member?.data?.notes,
    member?.data?.note,
    member?.data?.fit
  );
}

function getMemberProductId(member: any) {
  return (
    member?.productId ||
    member?.dressId ||
    member?.catalogProductId ||
    member?.assignedProductId ||
    member?.product?.id ||
    member?.selection?.productId ||
    member?.selection?.dressId ||
    member?.selection?.catalogProductId ||
    member?.selection?.product?.id ||
    member?.assignedDress?.productId ||
    member?.assignedDress?.dressId ||
    member?.assignedDress?.catalogProductId ||
    member?.assignedDress?.product?.id ||
    member?.selectedDress?.productId ||
    member?.selectedDress?.dressId ||
    member?.selectedDress?.catalogProductId ||
    member?.selectedDress?.product?.id ||
    member?.data?.productId ||
    member?.data?.dressId ||
    member?.data?.catalogProductId ||
    member?.data?.assignedProductId ||
    member?.data?.product?.id ||
    member?.data?.selection?.productId ||
    member?.data?.selection?.dressId ||
    member?.data?.selection?.catalogProductId ||
    member?.data?.selection?.product?.id ||
    member?.data?.assignedDress?.productId ||
    member?.data?.assignedDress?.dressId ||
    member?.data?.assignedDress?.catalogProductId ||
    member?.data?.assignedDress?.product?.id ||
    member?.data?.selectedDress?.productId ||
    member?.data?.selectedDress?.dressId ||
    member?.data?.selectedDress?.catalogProductId ||
    member?.data?.selectedDress?.product?.id ||
    ""
  );
}

function getMemberVariantId(member: any) {
  return (
    member?.variantId ||
    member?.selection?.variantId ||
    member?.assignedDress?.variantId ||
    member?.selectedDress?.variantId ||
    member?.data?.variantId ||
    member?.data?.selection?.variantId ||
    member?.data?.assignedDress?.variantId ||
    member?.data?.selectedDress?.variantId ||
    ""
  );
}

function getMemberDressName(member: any) {
  return (
    member?.dressName ||
    member?.dress ||
    member?.productName ||
    member?.catalogProductName ||
    member?.assignedProductName ||
    member?.product?.name ||
    member?.product?.title ||
    member?.selection?.dressName ||
    member?.selection?.productName ||
    member?.selection?.catalogProductName ||
    member?.selection?.product?.name ||
    member?.selection?.product?.title ||
    member?.assignedDress?.dressName ||
    member?.assignedDress?.productName ||
    member?.assignedDress?.catalogProductName ||
    member?.assignedDress?.product?.name ||
    member?.assignedDress?.product?.title ||
    member?.selectedDress?.dressName ||
    member?.selectedDress?.productName ||
    member?.selectedDress?.catalogProductName ||
    member?.selectedDress?.product?.name ||
    member?.selectedDress?.product?.title ||
    member?.data?.dressName ||
    member?.data?.dress ||
    member?.data?.productName ||
    member?.data?.catalogProductName ||
    member?.data?.assignedProductName ||
    member?.data?.product?.name ||
    member?.data?.product?.title ||
    member?.data?.selection?.dressName ||
    member?.data?.selection?.productName ||
    member?.data?.selection?.catalogProductName ||
    member?.data?.selection?.product?.name ||
    member?.data?.selection?.product?.title ||
    member?.data?.assignedDress?.dressName ||
    member?.data?.assignedDress?.productName ||
    member?.data?.assignedDress?.catalogProductName ||
    member?.data?.assignedDress?.product?.name ||
    member?.data?.assignedDress?.product?.title ||
    member?.data?.selectedDress?.dressName ||
    member?.data?.selectedDress?.productName ||
    member?.data?.selectedDress?.catalogProductName ||
    member?.data?.selectedDress?.product?.name ||
    member?.data?.selectedDress?.product?.title ||
    ""
  );
}

function getMemberDressColor(member: any) {
  return (
    member?.color ||
    member?.dressColor ||
    member?.variantColor ||
    member?.selection?.color ||
    member?.selection?.dressColor ||
    member?.selection?.variantColor ||
    member?.assignedDress?.color ||
    member?.assignedDress?.dressColor ||
    member?.assignedDress?.variantColor ||
    member?.selectedDress?.color ||
    member?.selectedDress?.dressColor ||
    member?.selectedDress?.variantColor ||
    member?.data?.color ||
    member?.data?.dressColor ||
    member?.data?.variantColor ||
    member?.data?.selection?.color ||
    member?.data?.selection?.dressColor ||
    member?.data?.selection?.variantColor ||
    member?.data?.assignedDress?.color ||
    member?.data?.assignedDress?.dressColor ||
    member?.data?.assignedDress?.variantColor ||
    member?.data?.selectedDress?.color ||
    member?.data?.selectedDress?.dressColor ||
    member?.data?.selectedDress?.variantColor ||
    ""
  );
}

function getMemberDressSize(member: any) {
  return (
    member?.dressSize ||
    member?.variantSize ||
    member?.assignedSize ||
    member?.selection?.size ||
    member?.selection?.dressSize ||
    member?.selection?.variantSize ||
    member?.assignedDress?.size ||
    member?.assignedDress?.dressSize ||
    member?.assignedDress?.variantSize ||
    member?.selectedDress?.size ||
    member?.selectedDress?.dressSize ||
    member?.selectedDress?.variantSize ||
    member?.data?.dressSize ||
    member?.data?.variantSize ||
    member?.data?.assignedSize ||
    member?.data?.selection?.size ||
    member?.data?.selection?.dressSize ||
    member?.data?.selection?.variantSize ||
    member?.data?.assignedDress?.size ||
    member?.data?.assignedDress?.dressSize ||
    member?.data?.assignedDress?.variantSize ||
    member?.data?.selectedDress?.size ||
    member?.data?.selectedDress?.dressSize ||
    member?.data?.selectedDress?.variantSize ||
    ""
  );
}

function getMemberDressHeight(member: any) {
  return (
    member?.selectedHeight ||
    member?.dressHeight ||
    member?.variantHeight ||
    member?.selection?.height ||
    member?.selection?.selectedHeight ||
    member?.selection?.dressHeight ||
    member?.selection?.variantHeight ||
    member?.assignedDress?.height ||
    member?.assignedDress?.selectedHeight ||
    member?.assignedDress?.dressHeight ||
    member?.assignedDress?.variantHeight ||
    member?.selectedDress?.height ||
    member?.selectedDress?.selectedHeight ||
    member?.selectedDress?.dressHeight ||
    member?.selectedDress?.variantHeight ||
    member?.data?.selectedHeight ||
    member?.data?.dressHeight ||
    member?.data?.variantHeight ||
    member?.data?.selection?.height ||
    member?.data?.selection?.selectedHeight ||
    member?.data?.selection?.dressHeight ||
    member?.data?.selection?.variantHeight ||
    member?.data?.assignedDress?.height ||
    member?.data?.assignedDress?.selectedHeight ||
    member?.data?.assignedDress?.dressHeight ||
    member?.data?.assignedDress?.variantHeight ||
    member?.data?.selectedDress?.height ||
    member?.data?.selectedDress?.selectedHeight ||
    member?.data?.selectedDress?.dressHeight ||
    member?.data?.selectedDress?.variantHeight ||
    ""
  );
}

function getMemberSelectionId(member: any) {
  return (
    member?.selectionId ||
    member?.assignedDressId ||
    member?.dressSelectionId ||
    member?.selection?.id ||
    member?.selection?.selectionId ||
    member?.selection?.dressSelectionId ||
    member?.assignedDress?.id ||
    member?.assignedDress?.selectionId ||
    member?.assignedDress?.dressSelectionId ||
    member?.selectedDress?.id ||
    member?.selectedDress?.selectionId ||
    member?.selectedDress?.dressSelectionId ||
    member?.data?.selectionId ||
    member?.data?.assignedDressId ||
    member?.data?.dressSelectionId ||
    member?.data?.selection?.id ||
    member?.data?.selection?.selectionId ||
    member?.data?.selection?.dressSelectionId ||
    member?.data?.assignedDress?.id ||
    member?.data?.assignedDress?.selectionId ||
    member?.data?.assignedDress?.dressSelectionId ||
    member?.data?.selectedDress?.id ||
    member?.data?.selectedDress?.selectionId ||
    member?.data?.selectedDress?.dressSelectionId ||
    ""
  );
}

function getMemberPaymentStatus(member: any) {
  return (
    member?.payment ||
    member?.paymentStatus ||
    member?.selection?.payment ||
    member?.selection?.paymentStatus ||
    member?.assignedDress?.payment ||
    member?.assignedDress?.paymentStatus ||
    member?.data?.payment ||
    member?.data?.paymentStatus ||
    member?.data?.selection?.payment ||
    member?.data?.selection?.paymentStatus ||
    member?.data?.assignedDress?.payment ||
    member?.data?.assignedDress?.paymentStatus ||
    "pending"
  );
}

function getCatalogProductId(product: CatalogProduct) {
  return String((product as any).id || (product as any).productId || "");
}

function getCatalogProductName(product: CatalogProduct) {
  return (product as any).name || (product as any).title || "Selected Dress";
}

function getCatalogProductImage(product: CatalogProduct) {
  const item = product as any;
  const images = item.images;

  if (Array.isArray(images) && images.length) {
    const first = images[0];

    if (typeof first === "string") return first;

    return (
      first?.url ||
      first?.src ||
      first?.imageUrl ||
      item.imageUrl ||
      item.image ||
      ""
    );
  }

  return item.imageUrl || item.image || item.thumbnail || "";
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

function getCatalogProductVariants(product: CatalogProduct | null) {
  if (!product) return [];

  const item = product as any;

  const variants =
    item?.variants ||
    item?.productVariants ||
    item?.sizes ||
    item?.options ||
    item?.data?.variants ||
    item?.data?.productVariants ||
    item?.data?.sizes ||
    item?.data?.options ||
    [];

  return Array.isArray(variants) ? variants : [];
}

function findCatalogVariantById(
  product: CatalogProduct | null,
  variantId?: string
) {
  if (!product || !variantId) return null;

  const variants = getCatalogProductVariants(product);

  return (
    variants.find((variant: any) => {
      const id = String(
        variant?.id ||
          variant?.variantId ||
          variant?.productVariantId ||
          variant?.skuId ||
          ""
      );

      return id === String(variantId);
    }) || null
  );
}

function getVariantSize(variant: any) {
  return readFirst(
    variant?.size,
    variant?.dressSize,
    variant?.variantSize,
    variant?.label,
    variant?.name,
    variant?.title,
    variant?.data?.size,
    variant?.data?.dressSize,
    variant?.data?.variantSize,
    variant?.data?.label,
    variant?.data?.name,
    variant?.data?.title
  );
}

function getVariantColor(variant: any) {
  return readFirst(
    variant?.color,
    variant?.dressColor,
    variant?.variantColor,
    variant?.colour,
    variant?.data?.color,
    variant?.data?.dressColor,
    variant?.data?.variantColor,
    variant?.data?.colour
  );
}

function getVariantHeight(variant: any) {
  return readFirst(
    variant?.height,
    variant?.selectedHeight,
    variant?.dressHeight,
    variant?.variantHeight,
    variant?.data?.height,
    variant?.data?.selectedHeight,
    variant?.data?.dressHeight,
    variant?.data?.variantHeight
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

function formatStatus(value?: string) {
  const status = String(value || "pending").toLowerCase();

  const map: Record<string, string> = {
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
    approved: "Approved",
    assigned: "Assigned",
    invited: "Invite Sent",
    size_submitted: "Size Submitted",
    "size submitted": "Size Submitted",
    submitted: "Submitted",
  };

  return map[status] || status.replaceAll("_", " ");
}

export default function BridalPartyJoinPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const token = useMemo(() => {
    const rawToken = params?.token;
    if (Array.isArray(rawToken)) return rawToken[0] || "";
    return String(rawToken || "");
  }, [params]);

  const [state, setState] = useState({
    loading: false,
    savingSize: false,
    paymentLoading: false,
    refreshingStatus: false,
    error: "",
    success: "",
    joined: false,
    sizeSaved: false,
    eventId: "",
    memberId: "",
    eventName: "",
    memberName: "",
    email: "",
  });

  const [form, setForm] = useState<MeasurementForm>({
    size: "",
    bust: "",
    waist: "",
    hip: "",
    height: "",
    preference: "",
  });

  const [currentMember, setCurrentMember] = useState<any>(null);
  const [stripeClientSecret, setStripeClientSecret] = useState("");
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [measurementLocked, setMeasurementLocked] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeSizeGuideTab, setActiveSizeGuideTab] =
    useState<SizeGuideTab>("standard");

  const assignedProductId = currentMember ? getMemberProductId(currentMember) : "";
  const assignedVariantId = currentMember ? getMemberVariantId(currentMember) : "";

  const assignedCatalogProduct = useMemo(() => {
    return findCatalogProductById(catalogProducts, assignedProductId);
  }, [catalogProducts, assignedProductId]);

  const assignedCatalogVariant = useMemo(() => {
    return findCatalogVariantById(assignedCatalogProduct, assignedVariantId);
  }, [assignedCatalogProduct, assignedVariantId]);

  const selectionId = currentMember ? getMemberSelectionId(currentMember) : "";
  const backendDressName = currentMember ? getMemberDressName(currentMember) : "";

  const assignedDressName =
    currentMember && assignedCatalogProduct
      ? getCatalogProductName(assignedCatalogProduct)
      : backendDressName;

  const assignedDressImage = assignedCatalogProduct
    ? getCatalogProductImage(assignedCatalogProduct)
    : "";

  const assignedDressColor = currentMember
    ? getMemberDressColor(currentMember) ||
      getVariantColor(assignedCatalogVariant) ||
      "Not added"
    : "";

  const assignedDressSize = currentMember
    ? getMemberDressSize(currentMember) ||
      getVariantSize(assignedCatalogVariant) ||
      "Default"
    : "";

  const assignedDressHeight = currentMember
    ? getMemberDressHeight(currentMember) ||
      getVariantHeight(assignedCatalogVariant) ||
      getMemberHeight(currentMember) ||
      "Not added"
    : "";

  const paymentStatus = currentMember
    ? getMemberPaymentStatus(currentMember)
    : "pending";

  const hasAssignedDress = Boolean(
    currentMember &&
      (assignedProductId ||
        selectionId ||
        backendDressName ||
        currentMember?.selection ||
        currentMember?.assignedDress ||
        currentMember?.selectedDress ||
        String(getMemberStatus(currentMember)).toLowerCase() === "assigned")
  );

  const isPaid = String(paymentStatus).toLowerCase() === "paid";
  const isPaymentReady = Boolean(stripeClientSecret);

  useEffect(() => {
    let mounted = true;

    async function loadCatalog() {
      try {
        const response = await getCatalogProducts();
        const products = unwrapCatalogProducts(response);

        if (!mounted) return;

        setCatalogProducts(products);
      } catch (error) {
        console.error("Join page catalog load failed:", error);
      }
    }

    loadCatalog();

    return () => {
      mounted = false;
    };
  }, []);

  async function refreshMemberStatus(eventId: string, memberId: string) {
    if (!eventId || !memberId) return null;

    try {
      setState((prev) => ({
        ...prev,
        refreshingStatus: true,
      }));

      const status = await getBridalEventStatus(eventId);
      const members = normalizeMembers(status);

      const currentEmail = String(state.email || "").trim().toLowerCase();

      const foundMember =
        members.find((member) => String(getMemberId(member)) === String(memberId)) ||
        members.find((member) => {
          const email = getMemberEmail(member);
          return currentEmail && email === currentEmail;
        }) ||
        null;

      console.log("JOIN PAGE STATUS:", status);
      console.log("JOIN PAGE MEMBERS:", members);
      console.log("JOIN PAGE FOUND MEMBER:", foundMember);
      console.log("JOIN PAGE FOUND MEMBER FULL:", JSON.stringify(foundMember, null, 2));
      console.log("JOIN ASSIGNED PRODUCT ID:", foundMember ? getMemberProductId(foundMember) : "");
      console.log("JOIN ASSIGNED VARIANT ID:", foundMember ? getMemberVariantId(foundMember) : "");

      setCurrentMember(foundMember);

      if (foundMember) {
        setForm((prev) => ({
          size: getMemberBodySize(foundMember) || prev.size,
          bust: getMemberBust(foundMember) || prev.bust,
          waist: getMemberWaist(foundMember) || prev.waist,
          hip: getMemberHip(foundMember) || prev.hip,
          height: getMemberHeight(foundMember) || prev.height,
          preference: getMemberPreference(foundMember) || prev.preference,
        }));
      }

      setState((prev) => ({
        ...prev,
        refreshingStatus: false,
      }));

      return foundMember;
    } catch (error) {
      console.warn("Join page status refresh failed:", error);

      setState((prev) => ({
        ...prev,
        refreshingStatus: false,
      }));

      return null;
    }
  }

  async function handleAcceptInvite() {
    if (!token) {
      const message =
        "Invite token missing hai. Please bride se invite link dobara mang lo.";

      toast.error("Invite token missing", message);

      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
        success: "",
      }));
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: "",
        success: "",
      }));

      const response = await joinBridalParty(token);

      console.log("JOIN ACCEPT RAW RESPONSE:", response);

      const eventId = getEventIdFromJoinResponse(response);
      const memberId = getMemberIdFromJoinResponse(response);
      const eventName = getEventNameFromJoinResponse(response);
      const memberName = getMemberNameFromJoinResponse(response);
      const email = getMemberEmailFromJoinResponse(response);

      if (!eventId || !memberId) {
        console.log("JOIN RESPONSE WITHOUT EVENT/MEMBER ID:", response);

        const message =
          "Invite accept ho gaya lag raha hai, lekin backend response me eventId/memberId nahi mila. Real backend-only flow ke liye ye dono required hain.";

        toast.error("Invite response incomplete", message);

        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
          success: "",
        }));

        return;
      }

      setState({
        loading: false,
        savingSize: false,
        paymentLoading: false,
        refreshingStatus: false,
        error: "",
        success: "Invite accepted. Ab apni measurements submit karo.",
        joined: true,
        sizeSaved: false,
        eventId,
        memberId,
        eventName,
        memberName,
        email,
      });

      toast.success("Invite accepted", "Ab measurements submit karo.");

      await refreshMemberStatus(eventId, memberId);
    } catch (error: any) {
      const message =
        error?.message ||
        "Invite accept nahi ho paya. Link expired ya invalid ho sakta hai.";

      toast.error("Invite accept nahi hua", message);

      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
        success: "",
      }));
    }
  }

  async function handleSaveMeasurements(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!state.memberId) {
      const message = "Member ID missing hai. Pehle invite accept karo.";

      toast.error("Member ID missing", message);

      setState((prev) => ({
        ...prev,
        error: message,
        success: "",
      }));
      return;
    }

    if (state.savingSize || measurementLocked) {
      toast.info(
        "Measurements already saved",
        "Change karoge tab dobara save hoga."
      );
      return;
    }

    if (!form.size.trim()) {
      toast.error("Body size required");

      setState((prev) => ({
        ...prev,
        error: "Body size required hai.",
        success: "",
      }));
      return;
    }

    if (!form.height.trim()) {
      toast.error("Height required", "Please select your height.");

      setState((prev) => ({
        ...prev,
        error: "Height required hai. Please apni height select karo.",
        success: "",
      }));
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        savingSize: true,
        error: "",
        success: "",
      }));

      const payload = {
        memberId: state.memberId,
        size: form.size.trim(),
        bust: form.bust.trim() || undefined,
        waist: form.waist.trim() || undefined,
        hip: form.hip.trim() || undefined,
        height: form.height.trim() || undefined,
        preference: form.preference.trim() || undefined,
      };

      const response = await submitBridalMemberSize(payload);

      setMeasurementLocked(true);

      toast.success(
        "Measurements saved",
        "Bride dashboard me tumhari size details update ho gayi hain."
      );

      setState((prev) => ({
        ...prev,
        savingSize: false,
        sizeSaved: true,
        error: "",
        success:
          response?.message ||
          "Measurements saved successfully. Bride dashboard me update ho jayega.",
      }));

      await refreshMemberStatus(state.eventId, state.memberId);
    } catch (error: any) {
      const message = error?.message || "Measurements save nahi ho payi.";

      toast.error("Measurements save nahi hui", message);

      setState((prev) => ({
        ...prev,
        savingSize: false,
        error: message,
        success: "",
      }));
    }
  }

  async function handleRefreshAssignedDress() {
    if (!state.eventId || !state.memberId) {
      const message =
        "Event/member details missing hain. Real backend-only flow me invite accept ke baad hi assigned dress refresh hoga.";

      toast.error("Assigned dress refresh nahi hua", message);

      setState((prev) => ({
        ...prev,
        error: message,
        success: "",
      }));
      return;
    }

    const member = await refreshMemberStatus(state.eventId, state.memberId);

    if (!member) {
      const message =
        "Assigned dress abhi nahi mili. Backend status API me current member/assigned selection nahi aa raha.";

      toast.error("Assigned dress nahi mili", message);

      setState((prev) => ({
        ...prev,
        error: message,
        success: "",
      }));
      return;
    }

    toast.success("Assigned dress refreshed", "Latest backend status load ho gaya.");

    setState((prev) => ({
      ...prev,
      error: "",
      success: "Assigned dress status refreshed.",
    }));
  }

  async function handlePayNow() {
    if (!state.memberId) {
      const message = "Member ID missing hai. Pehle invite accept karo.";

      toast.error("Member ID missing", message);

      setState((prev) => ({
        ...prev,
        error: message,
        success: "",
      }));
      return;
    }

    if (!selectionId) {
      const message =
        "Payment start nahi ho sakta. Backend status API me selectionId missing hai.";

      toast.error("Selection ID missing", message);

      setState((prev) => ({
        ...prev,
        error: message,
        success: "",
      }));
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        paymentLoading: true,
        error: "",
        success: "",
      }));

      const paymentPayload = {
        memberId: state.memberId,
        selectionId,
      };

      console.log("BRIDESMAID PAYMENT PAYLOAD:", paymentPayload);

      const paymentData = await createBridalPayment(paymentPayload);

      console.log("BRIDESMAID PAYMENT RESPONSE:", paymentData);

      const checkoutUrl = getStripeCheckoutUrl(paymentData);
      const clientSecret = getStripeClientSecret(paymentData);

      if (checkoutUrl && typeof window !== "undefined") {
        window.location.href = checkoutUrl;
        return;
      }

      if (clientSecret) {
        setStripeClientSecret(clientSecret);

        toast.success("Payment ready", "Card details enter karke payment complete karo.");

        setState((prev) => ({
          ...prev,
          paymentLoading: false,
          success:
            "Payment ready. Card details enter karke payment complete karo.",
        }));

        return;
      }

      const message =
        "Payment response me checkoutUrl/clientSecret nahi mila. Backend payment/create response check karna hoga.";

      toast.error("Payment response incomplete", message);

      setState((prev) => ({
        ...prev,
        paymentLoading: false,
        error: message,
        success: "",
      }));
    } catch (error: any) {
      const message = error?.message || "Payment start nahi ho paya.";

      toast.error("Payment start nahi hua", message);

      setState((prev) => ({
        ...prev,
        paymentLoading: false,
        error: message,
        success: "",
      }));
    }
  }

  function handleOpenBridalParty() {
    router.push("/bridal-party");
  }

  function handleOpenDresses() {
    router.push("/bridesmaid");
  }

  function updateMeasurementField(key: keyof MeasurementForm, value: string) {
    setMeasurementLocked(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <main className="min-h-screen bg-[#fbf8f1] px-4 py-6 text-[#17110d] sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1240px] items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="relative hidden overflow-hidden rounded-[34px] bg-[#17110d] text-white shadow-[0_22px_70px_rgba(31,22,15,0.16)] lg:sticky lg:top-6 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(185,130,98,0.22),transparent_32%),linear-gradient(135deg,#17110d,#35231a)]" />

          <div className="relative z-10 flex min-h-[610px] flex-col justify-between p-8 xl:p-9">
            <div>
              <p className="text-[10px] uppercase tracking-[0.42em] text-[#d7a078]">
                Shahsi Bridal Party
              </p>

              <h1 className="mt-10 max-w-[320px] font-serif text-[48px] italic leading-[0.95] tracking-[-0.06em] xl:text-[56px]">
                Join the
                <br />
                celebration.
              </h1>

              <p className="mt-6 max-w-[310px] text-[14px] leading-7 text-white/68">
                Bride ne tumhe apni bridal party me invite kiya hai. Invite
                accept karo, measurements submit karo aur assigned dress ka
                payment complete karo.
              </p>
            </div>

            <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur">
              <div className="grid gap-3">
                <FeatureRow
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Private invite"
                  text="Sirf invite link wale member join kar sakte hain."
                />

                <FeatureRow
                  icon={<Ruler className="h-4 w-4" />}
                  title="Submit measurements"
                  text="Body size, bust, waist, hip aur height bride dashboard me jayegi."
                />

                <FeatureRow
                  icon={<CreditCard className="h-4 w-4" />}
                  title="Pay assigned dress"
                  text="Bride dress assign karegi, payment bridesmaid complete karegi."
                />
              </div>
            </div>
          </div>
        </aside>

        <section className="rounded-[34px] border border-[#ded5c8] bg-white px-5 py-8 shadow-[0_22px_70px_rgba(31,22,15,0.08)] sm:px-8 lg:px-10 xl:px-12">
          <div className="mx-auto w-full max-w-[700px]">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#f7f2ea] text-[#17110d] sm:h-20 sm:w-20">
              {isPaid ? (
                <PackageCheck className="h-8 w-8 text-emerald-700" />
              ) : state.sizeSaved ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-700" />
              ) : state.joined ? (
                <Ruler className="h-8 w-8" />
              ) : (
                <PartyPopper className="h-8 w-8" />
              )}
            </div>

            <p className="mt-9 text-[10px] uppercase tracking-[0.42em] text-[#b98262]">
              Bridal Party Invite
            </p>

            <h2 className="mt-4 font-serif text-[46px] italic leading-[0.98] tracking-[-0.055em] text-[#17110d] sm:text-[62px]">
              {isPaid
                ? "Payment done."
                : state.sizeSaved
                  ? "All set."
                  : state.joined
                    ? "Your measurements."
                    : "Accept invite."}
            </h2>

            <p className="mt-6 max-w-[590px] text-[16px] leading-8 text-neutral-600">
              {isPaid
                ? "Payment complete ho gaya hai. Shipment update bride dashboard aur workspace me show hoga."
                : state.sizeSaved
                  ? "Measurements save ho gayi hain. Bride dress assign karegi, uske baad yahin Pay Now dikhega."
                  : state.joined
                    ? "Invite accept ho gaya. Ab apna body size aur measurements submit karo."
                    : "You have been invited to join a bridal party. Invite accept karke apna size aur outfit progress manage karo."}
            </p>

            {state.error ? (
              <div className="mt-7 rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
                {state.error}
              </div>
            ) : null}

            {state.success ? (
              <div className="mt-7 rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
                {state.success}
              </div>
            ) : null}

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <InviteInfoCard
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={state.email || "After accepting"}
              />

              <InviteInfoCard
                icon={<Users className="h-4 w-4" />}
                label="Member"
                value={state.memberName || "Bridesmaid"}
              />

              <InviteInfoCard
                icon={<Sparkles className="h-4 w-4" />}
                label="Event"
                value={state.eventName || "Bridal Party"}
              />
            </div>

            {!state.joined ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-[1fr_auto]">
                <button
                  type="button"
                  onClick={handleAcceptInvite}
                  disabled={state.loading}
                  className={`inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#17110d] px-8 text-[11px] font-semibold uppercase tracking-[0.32em] text-white hover:bg-black ${actionButtonClass}`}
                >
                  {state.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {state.loading ? "Accepting..." : "Accept Invite"}
                  {!state.loading ? <ArrowRight className="h-4 w-4" /> : null}
                </button>

                <button
                  type="button"
                  onClick={handleOpenBridalParty}
                  className={`inline-flex h-14 items-center justify-center rounded-full border border-[#ded5c8] px-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#17110d] hover:border-[#17110d] ${actionButtonClass}`}
                >
                  Open Bridal Party
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSaveMeasurements}
                className={`mt-10 rounded-[30px] border border-[#eadfce] bg-[#fbf8f1] p-5 transition-all sm:p-6 ${
                  isPaymentReady ? "opacity-75" : ""
                }`}
              >
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#17110d] text-white">
                    <Ruler className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.32em] text-[#b98262]">
                      Submit Measurements
                    </p>
                    <p className="mt-1 text-sm leading-6 text-neutral-500">
                      Ye details bride dashboard me show hongi. Galti ho to edit
                      karke dobara save kar sakte ho.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Body Size"
                    value={form.size}
                    placeholder="A8 / S / M"
                    required
                    onChange={(value) => updateMeasurementField("size", value)}
                  />

                  <div className="sm:col-span-2">
                    <HeightSelector
                      value={form.height}
                      onChange={(value) => updateMeasurementField("height", value)}
                      onOpenSizeGuide={() => setSizeGuideOpen(true)}
                    />
                  </div>

                  <Input
                    label="Bust"
                    value={form.bust}
                    placeholder="34"
                    inputMode="numeric"
                    onChange={(value) => updateMeasurementField("bust", value)}
                  />

                  <Input
                    label="Waist"
                    value={form.waist}
                    placeholder="28"
                    inputMode="numeric"
                    onChange={(value) => updateMeasurementField("waist", value)}
                  />

                  <Input
                    label="Hip"
                    value={form.hip}
                    placeholder="36"
                    inputMode="numeric"
                    onChange={(value) => updateMeasurementField("hip", value)}
                  />

                  <Input
                    label="Fit Preference"
                    value={form.preference}
                    placeholder="Regular fit, loose fit, color note..."
                    onChange={(value) =>
                      updateMeasurementField("preference", value)
                    }
                  />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
                  <button
                    type="submit"
                    disabled={state.savingSize || measurementLocked}
                    className={`inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#17110d] px-8 text-[11px] font-semibold uppercase tracking-[0.3em] text-white hover:bg-black ${actionButtonClass}`}
                  >
                    {state.savingSize ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {state.savingSize
                      ? "Saving..."
                      : measurementLocked
                        ? "Saved"
                        : "Save Measurements"}
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenDresses}
                    className={`inline-flex h-14 items-center justify-center rounded-full border border-[#ded5c8] px-8 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#17110d] hover:border-[#17110d] ${actionButtonClass}`}
                  >
                    Browse Dresses
                  </button>
                </div>
              </form>
            )}

            {state.joined ? (
              <div className="mt-8 rounded-[28px] border border-[#eadfce] bg-white p-5 sm:p-6">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#17110d] text-white">
                    <CreditCard className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.32em] text-[#b98262]">
                      Assigned Dress & Payment
                    </p>
                    <p className="mt-1 text-sm leading-6 text-neutral-500">
                      Bride dress assign karegi. Dress assign hone ke baad
                      payment bridesmaid complete karegi.
                    </p>
                  </div>
                </div>

                {state.refreshingStatus ? (
                  <div className="rounded-[22px] bg-[#fbf8f1] p-5 text-sm text-neutral-500 ring-1 ring-[#eadfce]">
                    Latest assigned dress status load ho raha hai...
                  </div>
                ) : hasAssignedDress ? (
                  <div className="rounded-[24px] bg-[#fbf8f1] p-5 ring-1 ring-[#eadfce]">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-400">
                      Assigned Dress
                    </p>

                    <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                      {assignedDressImage ? (
                        <div className="h-32 w-full overflow-hidden rounded-[22px] bg-white shadow-sm ring-1 ring-[#eadfce] sm:h-28 sm:w-24 sm:shrink-0">
                          <img
                            src={assignedDressImage}
                            alt={assignedDressName || "Assigned dress"}
                            className="h-full w-full object-cover object-top"
                          />
                        </div>
                      ) : null}

                      <div className="min-w-0">
                        <h3 className="font-serif text-[34px] italic leading-tight text-[#17110d]">
                          {assignedDressName || "Selected Dress"}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-neutral-500">
                          Bride ne ye outfit tumhare liye assign kiya hai.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <InfoBadge
                        label="Size"
                        value={assignedDressSize || "Not added"}
                      />

                      <InfoBadge
                        label="Color"
                        value={assignedDressColor || "Not added"}
                      />

                      <InfoBadge
                        label="Height"
                        value={assignedDressHeight || "Not added"}
                      />

                      <InfoBadge
                        label="Payment"
                        value={formatStatus(paymentStatus)}
                      />
                    </div>

                    {isPaid ? (
                      <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        Payment complete hai. Shipment update soon available
                        hoga.
                      </div>
                    ) : !stripeClientSecret ? (
                      <div className="mt-6 flex flex-col gap-3 border-t border-[#eadfce] pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#17110d]">
                            Ready to secure this dress?
                          </p>

                          <p className="mt-1 text-sm text-neutral-500">
                            Payment bridesmaid complete karegi.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handlePayNow}
                          disabled={state.paymentLoading}
                          className={`inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#17110d] px-8 text-xs font-semibold uppercase tracking-[0.24em] text-white ${actionButtonClass}`}
                        >
                          {state.paymentLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : null}

                          {state.paymentLoading ? "Starting..." : "Pay Now"}
                        </button>
                      </div>
                    ) : null}

                    {stripeClientSecret ? (
                      <div className="mt-6 rounded-[24px] border border-[#ded5c8] bg-white p-4 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.28em] text-[#b98262]">
                              Secure Payment
                            </p>

                            <p className="mt-1 text-sm text-neutral-500">
                              Card details enter karke payment complete karo.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setStripeClientSecret("")}
                            className={`rounded-full border border-[#eadfce] px-4 py-2 text-xs font-semibold text-[#17110d] ${actionButtonClass}`}
                          >
                            Cancel
                          </button>
                        </div>

                        <StripePaymentBox
                          clientSecret={stripeClientSecret}
                          onSuccess={async () => {
                            setStripeClientSecret("");

                            toast.success(
                              "Payment successful",
                              "Status refresh ho raha hai."
                            );

                            setState((prev) => ({
                              ...prev,
                              success:
                                "Payment successful. Status refresh ho raha hai.",
                            }));

                            await refreshMemberStatus(
                              state.eventId,
                              state.memberId
                            );
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-[24px] bg-[#fbf8f1] p-5 ring-1 ring-[#eadfce]">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-400">
                      Waiting for bride
                    </p>

                    <h3 className="mt-2 text-lg font-semibold text-[#17110d]">
                      Dress abhi assign nahi hui hai.
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                      Bride tumhari measurements review karke dress assign
                      karegi. Assign hone ke baad yahin dress details aur Pay
                      Now button show hoga.
                    </p>

                    <button
                      type="button"
                      onClick={handleRefreshAssignedDress}
                      disabled={state.refreshingStatus}
                      className={`mt-5 inline-flex h-11 items-center justify-center rounded-full border border-[#ded5c8] px-6 text-xs font-semibold text-[#17110d] ${actionButtonClass}`}
                    >
                      {state.refreshingStatus
                        ? "Refreshing..."
                        : "Refresh Assigned Dress"}
                    </button>
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleOpenBridalParty}
                    className={`inline-flex h-11 items-center justify-center rounded-full border border-[#ded5c8] px-6 text-xs font-semibold text-[#17110d] ${actionButtonClass}`}
                  >
                    Open Bridal Party
                  </button>

                  <Link
                    href="/login"
                    className={`inline-flex h-11 items-center justify-center rounded-full border border-[#ded5c8] px-6 text-xs font-semibold text-[#17110d] ${actionButtonClass}`}
                  >
                    Login with another account
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {sizeGuideOpen ? (
        <SizeGuidePopup
          activeTab={activeSizeGuideTab}
          onChangeTab={setActiveSizeGuideTab}
          onClose={() => setSizeGuideOpen(false)}
        />
      ) : null}
    </main>
  );
}

function FeatureRow({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl p-2 transition hover:bg-white/[0.04]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/10">
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs leading-5 text-white/60">{text}</p>
      </div>
    </div>
  );
}

function InviteInfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-[22px] border border-[#eadfce] bg-[#fbf8f1] p-4">
      <div className="mb-3 flex items-center gap-2 text-[#b98262]">
        {icon}
        <span className="text-[9px] uppercase tracking-[0.26em]">{label}</span>
      </div>

      <p className="truncate text-sm font-semibold text-[#17110d]">{value}</p>
    </div>
  );
}

function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-white px-4 py-2 text-xs text-neutral-700 ring-1 ring-[#eadfce]">
      <b className="text-[#17110d]">{label}:</b> {value}
    </span>
  );
}

function HeightSelector({
  value,
  onChange,
  onOpenSizeGuide,
}: {
  value: string;
  onChange: (value: string) => void;
  onOpenSizeGuide: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-[#eadfce] bg-white p-4 sm:p-5">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
            Height
          </p>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Apni closest height select karo. Ye dress fit aur variant matching me use hogi.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenSizeGuide}
          className={`inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-[#e2d6c8] bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6f5a48] hover:border-[#17110d] hover:text-[#17110d] ${actionButtonClass}`}
        >
          Size Guide
        </button>
      </div>

      <div className="space-y-8">
        {heightGroups.map((group) => (
          <div key={group.label} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[13px] font-medium uppercase tracking-[0.34em] text-[#596078]">
                {group.label}
              </p>

              <span className="rounded-full bg-[#f3eee8] px-5 py-2 text-sm text-[#8a725d]">
                {group.helper}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {group.values.map((height) => {
                const isSelected = value === height;

                return (
                  <button
                    key={height}
                    type="button"
                    onClick={() => onChange(height)}
                    className={[
                      "h-[66px] rounded-[24px] border text-[20px] font-medium transition-all duration-200 sm:h-[70px] sm:text-[22px]",
                      "hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(23,17,13,0.10)] active:scale-[0.98]",
                      isSelected
                        ? "border-[#17110d] bg-[#17110d] text-white shadow-[0_14px_32px_rgba(23,17,13,0.18)]"
                        : "border-[#e0d4c8] bg-white text-[#17110d]",
                    ].join(" ")}
                  >
                    {height}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SizeGuidePopup({
  activeTab,
  onChangeTab,
  onClose,
}: {
  activeTab: SizeGuideTab;
  onChangeTab: (value: SizeGuideTab) => void;
  onClose: () => void;
}) {
  const rows = sizeGuideRows[activeTab];
  const activeLabel =
    sizeGuideTabs.find((tab) => tab.id === activeTab)?.label || "Standard Sizing";
  const measurementGuide = sizeGuideMeasurementGuide[activeTab];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[30px] border border-[#e2d6c8] bg-white shadow-[0_30px_100px_rgba(23,17,13,0.25)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#eadfce] px-5 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#b98262]">
              Bridesmaid Fit Guide
            </p>

            <h3 className="mt-2 font-serif text-[30px] italic leading-none text-[#17110d] sm:text-[40px]">
              Size Guide
            </h3>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Measurements inches me hain. Closest body measurement select karo.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e3d6c7] text-xl text-neutral-500 transition hover:bg-neutral-950 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(92vh-135px)] overflow-y-auto px-5 py-5 sm:px-7">
          <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#d8d1c8] sm:grid-cols-4">
            {sizeGuideTabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onChangeTab(tab.id)}
                  className={[
                    "h-14 border-[#d8d1c8] px-3 text-xs font-semibold uppercase tracking-[0.24em] transition sm:text-sm",
                    "border-b sm:border-b-0 sm:border-r last:border-r-0",
                    isActive
                      ? "bg-[#fbfaf6] text-[#17110d] shadow-[inset_0_0_0_2px_rgba(23,17,13,0.12)]"
                      : "bg-white text-neutral-600 hover:bg-[#fbfaf6]",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <h4 className="mb-4 text-2xl font-semibold text-[#17110d]">
            {activeLabel}
          </h4>

          <div className="overflow-x-auto rounded-2xl border border-[#ded8d0]">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="bg-[#f5f3ef]">
                  <th className="border border-[#ded8d0] px-5 py-4 text-left font-semibold text-neutral-900">
                    Measurement
                  </th>
                  <th className="border border-[#ded8d0] px-5 py-4 text-center font-semibold text-neutral-900">
                    XXS
                  </th>
                  <th className="border border-[#ded8d0] px-5 py-4 text-center font-semibold text-neutral-900">
                    XS
                  </th>
                  <th className="border border-[#ded8d0] px-5 py-4 text-center font-semibold text-neutral-900">
                    S
                  </th>
                  <th className="border border-[#ded8d0] px-5 py-4 text-center font-semibold text-neutral-900">
                    M
                  </th>
                  <th className="border border-[#ded8d0] px-5 py-4 text-center font-semibold text-neutral-900">
                    L
                  </th>
                  <th className="border border-[#ded8d0] px-5 py-4 text-center font-semibold text-neutral-900">
                    XL
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row[0]} className="bg-white">
                    {row.map((cell, index) => (
                      <td
                        key={`${row[0]}-${index}`}
                        className={[
                          "border border-[#ded8d0] px-5 py-4",
                          index === 0
                            ? "font-semibold text-neutral-900"
                            : "text-center text-neutral-800",
                        ].join(" ")}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 border-t border-[#ded8d0] pt-8">
            <h4 className="text-2xl font-semibold text-[#17110d]">
              {measurementGuide.title}
            </h4>

            <div className="mt-7 space-y-7">
              {measurementGuide.items.map((item) => (
                <div key={item.heading}>
                  <h5 className="text-lg font-semibold text-[#17110d]">
                    {item.heading}
                  </h5>

                  <p className="mt-3 text-base leading-7 text-[#17110d]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
            Fit note: Agar measurement do sizes ke beech me hai, comfortable fit ke liye larger size select karo.
          </p>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  required,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
        {label}
      </span>

      <input
        type="text"
        value={value}
        required={required}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-[#eadfce] bg-white px-4 text-sm outline-none transition focus:border-[#17110d]"
      />
    </label>
  );
}