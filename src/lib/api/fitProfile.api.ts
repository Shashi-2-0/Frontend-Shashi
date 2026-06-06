import { apiRequest } from "./client";

export type UpdateMeasurementsPayload = {
  height: number;
  weight: number;
  chest: number;
  waist: number;
};

export type FitType = "regular" | "slim" | "oversized";

export type FitRecommendPayload = {
  height: number;
  weight: number;
  chest: number;
  waist: number;
  fitType: FitType;
  sizes: {
    label: string;
    chest: number;
    waist: number;
    fitType: FitType;
  }[];
};

export type FitRecommendResponse = {
  recommendedSize?: string;
  alternative?: string;
  confidence?: string;
  fitDetails?: Record<string, any>;
  explanation?: string;
  data?: any;
  result?: any;
};

export function updateUserMeasurements(payload: UpdateMeasurementsPayload) {
  return apiRequest<any>("/user-profile/measurements", {
    method: "PATCH",
    body: payload,
  });
}

export function getFitRecommendation(payload: FitRecommendPayload) {
  return apiRequest<FitRecommendResponse>("/fit/recommend", {
    method: "POST",
    body: payload,
  });
}

export function getProductFitRecommendation(
  productId: string,
  payload: UpdateMeasurementsPayload
) {
  return apiRequest<any>(`/fit/product/${productId}`, {
    method: "POST",
    body: payload,
  });
}

export function getCatalogFitRecommendation(
  productId: string,
  payload?: Record<string, any>
) {
  return apiRequest<any>(`/catalog/${productId}/fit`, {
    method: "POST",
    body: payload || {},
  });
}