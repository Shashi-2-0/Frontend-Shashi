
import { apiRequest } from "./client";

export type CheckoutAddress = {
  country?: string;
  countryCode?: string;
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  postalCode?: string;
  phoneCountryCode?: string;
  phone?: string;
};

export type CheckoutContactPayload = {
  email: string;
  emailOffers?: boolean;
  smsOffers?: boolean;
};

export type CheckoutShippingAddressPayload = CheckoutAddress;

export type CheckoutShippingMethodPayload = {
  shippingMethodId: string;
};

export type CheckoutBillingAddressPayload = {
  sameAsShipping: boolean;
  billingAddress?: CheckoutAddress;
};

export type CheckoutPromoCodePayload = {
  promoCode: string;
};

export type CheckoutPaymentIntentPayload = {
  paymentMethod?: string;
  billingAddressSameAsShipping?: boolean;
};

export type CheckoutPlaceOrderPayload = {
  paymentMethod?: string;
  paymentIntentId?: string;
  billingAddressSameAsShipping?: boolean;
  confirmAccuracy?: boolean;
};

export type CheckoutSessionResponse = {
  success?: boolean;
  data?: any;
  error?: string | string[] | null;
};

export type CheckoutMutationResponse = {
  success?: boolean;
  message?: string;
  data?: any;
  error?: string | string[] | null;
};

export function getCheckoutSession() {
  return apiRequest<CheckoutSessionResponse>("/checkout/session", {
    method: "GET",
  });
}

export function saveCheckoutContact(payload: CheckoutContactPayload) {
  return apiRequest<CheckoutMutationResponse>("/checkout/contact", {
    method: "PATCH",
    body: payload,
  });
}

export function saveCheckoutShippingAddress(
  payload: CheckoutShippingAddressPayload
) {
  return apiRequest<CheckoutMutationResponse>("/checkout/shipping-address", {
    method: "PATCH",
    body: payload,
  });
}

export function saveCheckoutShippingMethod(
  payload: CheckoutShippingMethodPayload
) {
  return apiRequest<CheckoutMutationResponse>("/checkout/shipping-method", {
    method: "PATCH",
    body: payload,
  });
}

export function saveCheckoutBillingAddress(
  payload: CheckoutBillingAddressPayload
) {
  return apiRequest<CheckoutMutationResponse>("/checkout/billing-address", {
    method: "PATCH",
    body: payload,
  });
}

export function applyCheckoutPromoCode(payload: CheckoutPromoCodePayload) {
  return apiRequest<CheckoutMutationResponse>("/checkout/promo-code", {
    method: "POST",
    body: payload,
  });
}

export function createCheckoutPaymentIntent(
  payload: CheckoutPaymentIntentPayload = {}
) {
  return apiRequest<CheckoutMutationResponse>("/checkout/payment-intent", {
    method: "POST",
    body: payload,
  });
}

export function placeCheckoutOrder(payload: CheckoutPlaceOrderPayload = {}) {
  return apiRequest<CheckoutMutationResponse>("/checkout/place-order", {
    method: "POST",
    body: payload,
  });
}

export function legacyCreateCheckout(payload: any = {}) {
  return apiRequest<CheckoutMutationResponse>("/checkout", {
    method: "POST",
    body: payload,
  });
}

export function unwrapCheckoutSession(response: any) {
  return response?.data || response || {};
}

export function unwrapCheckoutCart(sessionOrResponse: any) {
  const session = unwrapCheckoutSession(sessionOrResponse);

  return (
    session?.cart ||
    session?.checkout?.cart ||
    session?.data?.cart ||
    session?.data?.checkout?.cart ||
    {}
  );
}

export function unwrapCheckoutItems(sessionOrResponse: any) {
  const session = unwrapCheckoutSession(sessionOrResponse);
  const cart = unwrapCheckoutCart(session);

  if (Array.isArray(cart?.items)) return cart.items;
  if (Array.isArray(session?.items)) return session.items;
  if (Array.isArray(session?.data?.items)) return session.data.items;

  return [];
}

export function unwrapCheckoutTotals(sessionOrResponse: any) {
  const session = unwrapCheckoutSession(sessionOrResponse);
  const cart = unwrapCheckoutCart(session);

  return {
    subtotal: Number(cart?.subtotal ?? session?.subtotal ?? 0),
    shipping: Number(cart?.shipping ?? session?.shipping ?? 0),
    tax: Number(cart?.tax ?? session?.tax ?? 0),
    discount: Number(cart?.discount ?? session?.discount ?? 0),
    total: Number(cart?.total ?? session?.total ?? 0),
    currency: cart?.currency || session?.currency || "USD",
  };
}

export function unwrapCheckoutShippingMethods(sessionOrResponse: any) {
  const session = unwrapCheckoutSession(sessionOrResponse);

  const source =
    session?.shippingMethods ||
    session?.availableShippingMethods ||
    session?.shippingOptions ||
    session?.deliveryOptions ||
    session?.cart?.shippingMethods ||
    session?.cart?.availableShippingMethods ||
    session?.cart?.shippingOptions ||
    session?.checkout?.shippingMethods ||
    [];

  return Array.isArray(source) ? source : [];
}

export function unwrapCheckoutPaymentMethods(sessionOrResponse: any) {
  const session = unwrapCheckoutSession(sessionOrResponse);

  const source =
    session?.paymentMethods ||
    session?.paymentOptions ||
    session?.cart?.paymentMethods ||
    session?.checkout?.paymentMethods ||
    [];

  return Array.isArray(source) ? source : [];
}

export function getCheckoutClientSecret(response: any) {
  const data = response?.data || response || {};

  return (
    data?.clientSecret ||
    data?.paymentIntent?.clientSecret ||
    data?.payment?.clientSecret ||
    ""
  );
}

export function getCheckoutPaymentIntentId(response: any) {
  const data = response?.data || response || {};

  return (
    data?.paymentIntentId ||
    data?.paymentIntent?.id ||
    data?.payment?.paymentIntentId ||
    ""
  );
}

export function getCheckoutRedirectUrl(response: any) {
  const data = response?.data || response || {};

  return (
    data?.checkoutUrl ||
    data?.paymentUrl ||
    data?.redirectUrl ||
    data?.sessionUrl ||
    ""
  );
}

export function getPlacedOrderData(response: any) {
  return response?.data || response || {};
}





export async function removeCheckoutPromoCode() {
  return apiRequest<any>("/checkout/promo-code", {
    method: "DELETE",
  });
}


export async function createCheckout(payload?: any) {
  return createCheckoutPaymentIntent(payload);
}