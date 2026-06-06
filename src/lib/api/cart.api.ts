import { apiRequest } from "./client";

export type CartProduct = {
  id?: string;
  productId?: string;
  title?: string;
  name?: string;
  slug?: string;
  imageUrl?: string;
  image?: string;
  thumbnail?: string;
  fabric?: string;
  material?: string;
  color?: string;
  price?: number | string;
  salePrice?: number | string;
  listingPrice?: number | string;
};

export type CartVariant = {
  id?: string;
  variantId?: string;
  productId?: string;
  sku?: string;
  color?: string;
  colorHex?: string;
  size?: string;
  height?: string;
  price?: number | string;
  compareAtPrice?: number | string;
  stock?: number;
  available?: boolean;
  status?: string;
};

export type CartItem = {
  id?: string;
  cartItemId?: string;
  productId?: string;
  variantId?: string;

  product?: CartProduct;
  variant?: CartVariant;
  productVariant?: CartVariant;

  quantity?: number;

  sizeType?: string;
  deliveryOption?: string;

  size?: string;
  color?: string;
  price?: number | string;
  unitPrice?: number | string;
  total?: number | string;
  lineTotal?: number | string;
  subtotal?: number | string;

  bust?: number | string | null;
  waist?: number | string | null;
  hips?: number | string | null;
  hollowToFloor?: number | string | null;
  heightBarefoot?: number | string | null;
  extraLength?: number | string | null;
  customSizingAccepted?: boolean;
};

export type CartResponse = {
  success?: boolean;
  data?: any;
  cart?: any;
  items?: CartItem[];
  subtotal?: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  total?: number;
  currency?: string;
  freeShippingThreshold?: number | null;
  qualifiesForFreeShipping?: boolean;
};

export type AddCartPayload = {
  productId: string;
  variantId?: string;
  quantity?: number;

  sizeType?: "STANDARD" | "CUSTOM" | string;
  deliveryOption?: "STANDARD" | "RUSH" | string;

  bust?: number;
  waist?: number;
  hips?: number;
  hollowToFloor?: number;
  heightBarefoot?: number;
  extraLength?: number;
  customSizingAccepted?: boolean;
};

export type UpdateCartItemPayload = {
  quantity: number;
};

export function getCart() {
  return apiRequest<CartResponse | CartItem[]>("/cart", {
    method: "GET",
  });
}

export function addToCart(payload: AddCartPayload) {
  return apiRequest<any>("/cart/add", {
    method: "POST",
    body: payload,
  });
}

export function updateCartItemQuantity(id: string, quantity: number) {
  return apiRequest<any>(`/cart/item/${id}`, {
    method: "PATCH",
    body: {
      quantity,
    },
  });
}

export function removeCartItem(id: string) {
  return apiRequest<any>(`/cart/remove/${id}`, {
    method: "DELETE",
  });
}

export function clearCart() {
  return apiRequest<any>("/cart/clear", {
    method: "DELETE",
  });
}

export function unwrapCartItems(response: any): CartItem[] {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.cart?.items)) return response.cart.items;

  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.cart?.items)) return response.data.cart.items;

  if (Array.isArray(response?.data?.data?.items)) return response.data.data.items;
  if (Array.isArray(response?.data?.data?.cart?.items)) {
    return response.data.data.cart.items;
  }

  return [];
}

export function unwrapCartSource(response: any) {
  return response?.data?.cart || response?.data || response?.cart || response || {};
}

export function unwrapCartTotals(response: any) {
  const source = unwrapCartSource(response);

  const items = unwrapCartItems(response);

  const fallbackSubtotal = items.reduce((sum, item) => {
    return sum + getCartItemLineTotal(item);
  }, 0);

  const subtotal = Number(source?.subtotal ?? fallbackSubtotal ?? 0);
  const discount = Number(source?.discount ?? 0);
  const shipping = Number(source?.shipping ?? 0);
  const tax = Number(source?.tax ?? 0);

  const total = Number(
    source?.total ?? Math.max(0, subtotal - discount + shipping + tax)
  );

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
    currency: source?.currency || "USD",
    freeShippingThreshold: source?.freeShippingThreshold ?? null,
    qualifiesForFreeShipping: Boolean(source?.qualifiesForFreeShipping),
  };
}

export function getCartItemId(item: CartItem) {
  return String(item?.id || item?.cartItemId || "");
}

export function getCartItemProduct(item: CartItem) {
  return item?.product || {};
}

export function getCartItemVariant(item: CartItem) {
  return item?.variant || item?.productVariant || {};
}

export function getCartItemTitle(item: CartItem) {
  const product = getCartItemProduct(item);

  return String(product?.title || product?.name || "Product title missing from backend");
}

export function getCartItemImage(item: CartItem) {
  const product = getCartItemProduct(item);

  return String(product?.imageUrl || product?.image || product?.thumbnail || "");
}

export function getCartItemUnitPrice(item: CartItem) {
  const product = getCartItemProduct(item);
  const variant = getCartItemVariant(item);

  const value =
    item?.unitPrice ??
    item?.price ??
    variant?.price ??
    product?.salePrice ??
    product?.price ??
    product?.listingPrice ??
    0;

  const numeric = Number(value);

  return Number.isNaN(numeric) ? 0 : numeric;
}

export function getCartItemLineTotal(item: CartItem) {
  const value = item?.lineTotal ?? item?.total ?? item?.subtotal;

  if (value !== undefined && value !== null && value !== "") {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) return numeric;
  }

  return getCartItemUnitPrice(item) * Number(item?.quantity || 1);
}


export function getCartItemColor(item: CartItem) {
  const variant = getCartItemVariant(item);
  const product = getCartItemProduct(item);

 return String(
  variant?.color ||
    (item as any)?.selectedColor ||
    (item as any)?.color ||
    product?.color ||
    ""
);
}

export function getCartItemSize(item: CartItem) {
  const variant = getCartItemVariant(item);

return String(
  variant?.size ||
    (item as any)?.selectedSize ||
    (item as any)?.size ||
    ""
);
}

export function getCartItemSku(item: CartItem) {
  const variant = getCartItemVariant(item);

return String(
  variant?.sku ||
    (item as any)?.sku ||
    ""
);
}