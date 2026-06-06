import { apiRequest } from "./client";

const RESALE_BASE = "/marketplace/resale";

export function getResaleListings() {
  return apiRequest<any>(`${RESALE_BASE}/listings`, {
    method: "GET",
  });
}

export function createResaleListing(payload: Record<string, any>) {
  return apiRequest<any>(`${RESALE_BASE}/listings`, {
    method: "POST",
    body: payload,
  });
}

export function getResaleListing(id: string) {
  return apiRequest<any>(`${RESALE_BASE}/listings/${id}`, {
    method: "GET",
  });
}

export function getRelatedResaleListings(id: string) {
  return apiRequest<any>(`${RESALE_BASE}/listings/${id}/related`, {
    method: "GET",
  });
}

export function getSellerCloset(sellerId: string) {
  return apiRequest<any>(`${RESALE_BASE}/sellers/${sellerId}/closet`, {
    method: "GET",
  });
}

export function likeResaleListing(id: string) {
  return apiRequest<any>(`${RESALE_BASE}/listings/${id}/like`, {
    method: "POST",
    body: {},
  });
}

export function unlikeResaleListing(id: string) {
  return apiRequest<any>(`${RESALE_BASE}/listings/${id}/like`, {
    method: "DELETE",
  });
}

export function getSavedResaleListings() {
  return apiRequest<any>(`${RESALE_BASE}/saved`, {
    method: "GET",
  });
}

export function reportResaleListing(id: string, payload: Record<string, any>) {
  return apiRequest<any>(`${RESALE_BASE}/listings/${id}/report`, {
    method: "POST",
    body: payload,
  });
}

export function makeResaleOffer(id: string, payload: Record<string, any>) {
  return apiRequest<any>(`${RESALE_BASE}/listings/${id}/offers`, {
    method: "POST",
    body: payload,
  });
}

export function getMyResaleOffers() {
  return apiRequest<any>(`${RESALE_BASE}/offers/my`, {
    method: "GET",
  });
}

export function acceptResaleOffer(offerId: string) {
  return apiRequest<any>(`${RESALE_BASE}/offers/${offerId}/accept`, {
    method: "PATCH",
    body: {},
  });
}

export function declineResaleOffer(offerId: string) {
  return apiRequest<any>(`${RESALE_BASE}/offers/${offerId}/decline`, {
    method: "PATCH",
    body: {},
  });
}

export function counterResaleOffer(
  offerId: string,
  payload: Record<string, any>
) {
  return apiRequest<any>(`${RESALE_BASE}/offers/${offerId}/counter`, {
    method: "PATCH",
    body: payload,
  });
}

export function acceptCounterResaleOffer(offerId: string) {
  return apiRequest<any>(`${RESALE_BASE}/offers/${offerId}/accept-counter`, {
    method: "PATCH",
    body: {},
  });
}

export function buyNowResaleListing(id: string) {
  return apiRequest<any>(`${RESALE_BASE}/listings/${id}/buy-now`, {
    method: "POST",
    body: {},
  });
}

export function checkoutResaleOffer(offerId: string) {
  return apiRequest<any>(`${RESALE_BASE}/offers/${offerId}/checkout`, {
    method: "POST",
    body: {},
  });
}