import { apiRequest } from "./client";

export type FeedbackPayload = {
  userId: string;
  productId: string;
  size: string;
  result: string;
  issueArea: string;
};

export function submitFeedback(payload: FeedbackPayload) {
  return apiRequest<any>("/feedback", {
    method: "POST",
    body: payload,
  });
}

export function getFeedbackInsights(productId: string) {
  return apiRequest<any>(
    `/feedback/insights?productId=${encodeURIComponent(productId)}`,
    {
      method: "GET",
    }
  );
}