import { apiRequest } from "@/lib/api/client";

export type CheckoutPromoCart = {
  subtotal?: number;
  discount?: number;
  shippingDiscount?: number;
  finalShipping?: number;
  total?: number;
};

export type CheckoutPromoResponse = {
  success?: boolean;
  message?: string;
  error?: any;
  data?: {
    promoCode?: string;
    discountId?: string;
    discount?: number;
    shippingDiscount?: number;
    cart?: CheckoutPromoCart;
  };
};

export async function applyCheckoutPromoCode(promoCode: string) {
  return apiRequest<CheckoutPromoResponse>("/checkout/promo-code", {
    method: "POST",
    body: JSON.stringify({
      promoCode,
    }),
  });
}

export async function removeCheckoutPromoCode() {
  return apiRequest<CheckoutPromoResponse>("/checkout/promo-code", {
    method: "DELETE",
  });
}

export async function getCheckoutSession() {
  return apiRequest<any>("/checkout/session", {
    method: "GET",
  });
}