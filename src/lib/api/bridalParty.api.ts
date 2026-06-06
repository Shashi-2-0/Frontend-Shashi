import { apiRequest } from "./client";

export type BridalMember = {
  id?: string;
  memberId?: string;
  bridalMemberId?: string;
  bridalPartyMemberId?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  approval?: string;
  approvalStatus?: string;
  payment?: string;
  paymentStatus?: string;

  size?: string;
  dressSize?: string;
  submittedSize?: string;
  selectedSize?: string;
  bodySize?: string;
  bust?: string;
  waist?: string;
  hip?: string;
  hips?: string;
  height?: string;
  preference?: string;
  fitPreference?: string;
  notes?: string;

  productId?: string;
  dressId?: string;
  dress?: string;
  dressName?: string;
  productName?: string;
  variantId?: string;
  selectionId?: string;
  assignedDressId?: string;

  selection?: {
    id?: string;
    productId?: string;
    variantId?: string;
    status?: string;
    dressName?: string;
    productName?: string;
  } | null;

  assignedDress?: {
    id?: string;
    selectionId?: string;
    productId?: string;
    variantId?: string;
    status?: string;
    dressName?: string;
    productName?: string;
  } | null;

  measurements?: {
    size?: string;
    bust?: string;
    waist?: string;
    hip?: string;
    hips?: string;
    height?: string;
    preference?: string;
  } | null;

  measurement?: {
    size?: string;
    bust?: string;
    waist?: string;
    hip?: string;
    hips?: string;
    height?: string;
    preference?: string;
  } | null;

  data?: any;
};

export type BridalEventStatus = {
  id?: string;
  eventId?: string;
  name?: string;
  eventName?: string;
  brideName?: string;
  eventDate?: string;
  weddingDate?: string;
  weddingEventType?: string;
  weddingSeason?: string;
  palette?: string;
  paletteId?: string;
  paletteColors?: { name?: string; hex?: string }[];
  members?: BridalMember[];
  invites?: BridalMember[];
  bridalPartyMembers?: BridalMember[];
  sizeSubmitted?: number;
  approved?: number;
  paid?: number;
  event?: any;
  data?: any;
};

export type CreateBridalEventPayload = {
  name: string;
  eventDate: string;
  brideName?: string;
  weddingEventType?: string;
  weddingSeason?: string;
  palette?: string;
  paletteId?: string;
  paletteColors?: { name?: string; hex?: string }[];
};

export type BridalInviteChannel =
  | "email"
  | "whatsapp"
  | "facebook"
  | "instagram"
  | "copy-link";

export type InviteBridalMemberPayload = {
  eventId: string;
  channel: BridalInviteChannel;
  ceremonyType: string;
  name: string;
  email?: string;
  countryCode?: string;
  phoneNumber?: string;
  socialAccount?: string;
  role: string;
  message: string;
};

export type JoinBridalPartyPayload = {
  name?: string;
  email?: string;
  role?: string;
};

export type SubmitMemberSizePayload = {
  memberId: string;
  size: string;
  preference?: string;
  bust?: string;
  waist?: string;
  hip?: string;
  height?: string;
};

export type AssignDressPayload = {
  eventId: string;
  memberId: string;
  productId: string;
  variantId?: string;
};

export type SelectDressPayload = {
  memberId: string;
  productId: string;
  variantId: string;
};

export type ApproveDressPayload = {
  selectionId?: string;
  memberId?: string;
};

export type MarkPaymentPayload = {
  memberId: string;
  status?: string;
};

export type CreateShipmentPayload = {
  carrier?: string;
  trackingNumber?: string;
  status?: string;
  estimatedDelivery?: string;
};

export type UpdateShipmentStatusPayload = {
  status: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
};

export type CreateBridalPaymentPayload = {
  memberId: string;
  selectionId: string;
};

export type BridalPaymentSuccessPayload = {
  paymentId?: string;
  memberId?: string;
  selectionId?: string;
  stripePaymentIntentId?: string;
};

export function createBridalEvent(payload: CreateBridalEventPayload) {
  return apiRequest<any>("/bridal-party/event", {
    method: "POST",
    body: payload,
  });
}

export async function inviteBridalMember(payload: InviteBridalMemberPayload) {
  return apiRequest<any>("/bridal-party/invite", {
    method: "POST",
    body: payload,
  });
}

export function getBridalEventStatus(eventId: string) {
  return apiRequest<BridalEventStatus>(`/bridal-party/status/${eventId}`, {
    method: "GET",
  });
}

export function joinBridalParty(token: string, payload?: JoinBridalPartyPayload) {
  return apiRequest<any>(`/bridal-party/join/${token}`, {
    method: "POST",
    body: payload || {},
  });
}

export function submitMemberSize(payload: SubmitMemberSizePayload) {
  return apiRequest<any>("/bridal-party/size", {
    method: "POST",
    body: payload,
  });
}

/**
 * Alias for /bridal-party/page.tsx
 * Isko duplicate mat banana. Ye same submitMemberSize ko call karta hai.
 */
export function submitBridalMemberSize(payload: SubmitMemberSizePayload) {
  return submitMemberSize(payload);
}

export function selectDressForMember(payload: SelectDressPayload) {
  return apiRequest<any>("/bridal-party/select", {
    method: "POST",
    body: payload,
  });
}

export async function assignDressToMember(payload: AssignDressPayload) {
  return apiRequest<any>("/bridal-party/assign", {
    method: "POST",
    body: payload,
  });
}

export function selectAssignedDress(payload: SelectDressPayload) {
  return selectDressForMember(payload);
}

export function approveDressSelection(payload: ApproveDressPayload) {
  return apiRequest<any>("/bridal-party/approve", {
    method: "POST",
    body: payload,
  });
}

export function markMemberPayment(payload: MarkPaymentPayload) {
  return apiRequest<any>("/bridal-party/payment", {
    method: "POST",
    body: payload,
  });
}

export function createShipment(
  eventId: string,
  payload: CreateShipmentPayload = {}
) {
  return apiRequest<any>(`/bridal-party/shipment/${eventId}`, {
    method: "POST",
    body: payload,
  });
}

export function getShipment(eventId: string) {
  return apiRequest<any>(`/bridal-party/shipment/${eventId}`, {
    method: "GET",
  });
}

export function updateShipmentStatus(
  eventId: string,
  payload: UpdateShipmentStatusPayload
) {
  return apiRequest<any>(`/bridal-party/shipment/${eventId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function createBridalPayment(payload: CreateBridalPaymentPayload) {
  return apiRequest<any>("/bridal-party/payment/create", {
    method: "POST",
    body: payload,
  });
}

export function bridalPaymentSuccess(payload: BridalPaymentSuccessPayload) {
  return apiRequest<any>("/bridal-party/payment/success", {
    method: "POST",
    body: payload,
  });
}



export type BridalSetupOption = {
  id: string;
  label: string;
  value: string;
  isActive?: boolean;
  sortOrder?: number;
};

export type BridalPaletteColor = {
  id?: string;
  name: string;
  hex: string;
  isActive?: boolean;
  sortOrder?: number;
};

export type BridalPaletteOption = {
  id: string;
  label: string;
  value: string;
  name: string;
  isActive?: boolean;
  sortOrder?: number;
  colors: BridalPaletteColor[];
};

export type BridalEventSetupOptionsResponse = {
  success?: boolean;
  data?: {
    eventTypes?: BridalSetupOption[];
    seasons?: BridalSetupOption[];
    palettes?: BridalPaletteOption[];
  };
  error?: any;
};

export function getBridalEventSetupOptions() {
  return apiRequest<BridalEventSetupOptionsResponse>(
    "/bridal-party/event-setup-options",
    {
      method: "GET",
    }
  );
}