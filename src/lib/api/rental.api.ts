import { apiRequest } from "./client";

export type RentalAvailabilityParams = {
  productId?: string;
  eventDate?: string;
  startDate?: string;
  endDate?: string;
};

export type DailyBookingPayload = {
  productId: string;
  variantId?: string;
  eventDate: string;
  rentalWindow?: string;
  size?: string;
  backupSize?: string;
};

export type RentalRequestPayload = {
  productId: string;
  startDate: string;
  endDate: string;
};

function toQuery(params: Record<string, any>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export function getRentalAvailability(params: RentalAvailabilityParams = {}) {
  const query = toQuery(params);

  return apiRequest<any>(`/rental/availability${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export function createDailyRentalBooking(payload: DailyBookingPayload) {
  return apiRequest<any>("/rental/daily-booking", {
    method: "POST",
    body: payload,
  });
}

export function createRentalRequest(payload: RentalRequestPayload) {
  return apiRequest<any>("/rental/requests", {
    method: "POST",
    body: payload,
  });
}

export function getMyRentalRequests() {
  return apiRequest<any>("/rental/requests/my", {
    method: "GET",
  });
}