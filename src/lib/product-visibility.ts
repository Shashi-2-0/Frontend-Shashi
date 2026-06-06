export function isPublicVisibleProduct(product: any) {
  const status = String(
    product?.adminStatus ||
      product?.statusLabel ||
      product?.status ||
      product?.publishStatus ||
      product?.state ||
      ""
  ).toUpperCase();

  if (status) {
    return status === "ACTIVE" || status === "PUBLISHED";
  }

  if (typeof product?.isActive === "boolean") return product.isActive;
  if (typeof product?.active === "boolean") return product.active;
  if (typeof product?.published === "boolean") return product.published;
  if (typeof product?.isPublished === "boolean") return product.isPublished;

  return false;
}

export function filterPublicVisibleProducts<T = any>(products: T[] = []) {
  return products.filter((product: any) => isPublicVisibleProduct(product));
}