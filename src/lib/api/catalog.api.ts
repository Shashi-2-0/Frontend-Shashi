import { apiRequest } from "./client";

export type CatalogVariant = {
  id?: string;
  variantId?: string;
  productId?: string;
  color?: string;
  colorHex?: string;
  size?: string;
  height?: string;
  price?: number | string;
  sku?: string;
  stock?: number;
  available?: boolean;
  isAvailable?: boolean;
  isActive?: boolean;
  status?: string;
  availabilityStatus?: string;
  inventoryStatus?: string;
};

export type CatalogImage = {
  id?: string;
  url?: string;
  src?: string;
  imageUrl?: string;
  alt?: string;
  sortOrder?: number;
};

export type CatalogColor = {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  hex?: string;
  colorHex?: string;
  available?: boolean;
};

export type CatalogSize = {
  id?: string;
  label?: string;
  size?: string;
  name?: string;
  available?: boolean;
};

export type CatalogHeightOption = {
  id?: string;
  label?: string;
  value?: string;
  group?: string;
  sortOrder?: number;
  productCount?: number;
  active?: boolean;
  isActive?: boolean;
};

export type CatalogFiltersMeta = {
  colors?: any[];
  colorStories?: any[];
  categories?: any[];
  sizes?: any[];
  heights?: CatalogHeightOption[];
  heightOptions?: CatalogHeightOption[];
  fabrics?: any[];
  fabric?: any[];
  dressLengths?: any[];
  necklines?: any[];
  sleeveLengths?: any[];
  prices?: {
    min?: number;
    max?: number;
  };
  [key: string]: any;
};

export type CatalogProduct = {
  id?: string;
  productId?: string;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  sku?: string;
  mode?: string;
  brand?: string;
  vendor?: string;

  price?: number | string;
  listingPrice?: number | string;
  rentalPrice?: number | string;
  resalePrice?: number | string;
  rentPrice?: number | string;
  salePrice?: number | string;
  compareAtPrice?: number | string;
  currency?: string;

  category?: string;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
 categoryPath?: string[] | any[];
categoryUrl?: string;
  breadcrumb?: any[];

  productType?: string;
  type?: string;
  fabric?: string;
  material?: string;

  color?: string;
  primaryColor?: string;
  secondaryColor?: string;
  variantColor?: string;
  colors?: string[] | CatalogColor[];

  sizes?: string[] | CatalogSize[];
  heights?: string[] | CatalogHeightOption[];
  heightOptions?: CatalogHeightOption[];

  images?: string[] | CatalogImage[];
  image?: string;
  imageUrl?: string;
  thumbnail?: string;

  variants?: CatalogVariant[];
  inventory?: CatalogVariant[];
  productVariants?: CatalogVariant[];

  status?: string;
  adminStatus?: string;
  statusLabel?: string;
  publishStatus?: string;
  state?: string;
  isActive?: boolean;
  active?: boolean;
  published?: boolean;
  isPublished?: boolean;

  silhouette?: string;
  neckline?: string;
  dressLength?: string;
  sleeveLength?: string;
  backStyle?: string;

  reviewsCount?: number;
  rating?: number;

  matchScore?: number;
  recommendationReasons?: string[];

  [key: string]: any;
};

export type CatalogResponse = {
  success?: boolean;
  message?: string;
  error?: any;

  data?:
    | CatalogProduct[]
    | {
        products?: CatalogProduct[];
        items?: CatalogProduct[];
        catalog?: CatalogProduct[];
        data?:
          | CatalogProduct[]
          | {
              products?: CatalogProduct[];
              items?: CatalogProduct[];
              catalog?: CatalogProduct[];
              filters?: CatalogFiltersMeta;
              heightOptions?: CatalogHeightOption[];
              total?: number;
              page?: number;
              limit?: number;
              totalPages?: number;
              pagination?: {
                page?: number;
                limit?: number;
                total?: number;
                totalPages?: number;
              };
            };
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
        pagination?: {
          page?: number;
          limit?: number;
          total?: number;
          totalPages?: number;
        };
        filters?: CatalogFiltersMeta;
        heightOptions?: CatalogHeightOption[];
      };

  products?: CatalogProduct[];
  items?: CatalogProduct[];
  catalog?: CatalogProduct[];

  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };

  filters?: CatalogFiltersMeta;
  heightOptions?: CatalogHeightOption[];
};

export type CatalogRecommendationsParams = {
  eventType: string;
  season?: string;
  paletteId?: string;
  limit?: number;
};

export type CatalogFilterPayload = {
  category?: string;
  categorySlug?: string;
  categoryPath?: string;

  color?: string;
  colorStory?: string;
  colorStorySlug?: string;
  primaryColor?: string;
  variantColor?: string;
  secondaryColor?: string;
  resaleColor?: string;

  primaryCollection?: string;
  sizeLabel?: string;
  size?: string;
  height?: string;

  occasion?: string;
  occasionTag?: string;
  style?: string;
  fabric?: string;
  neckline?: string;
  sleeveLength?: string;
  dressLength?: string;
  productionType?: string;
  verificationStatus?: string;
  resaleStatus?: string;
  city?: string;
  state?: string;
  condition?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
};

export type CatalogListQuery = Partial<CatalogFilterPayload> & {
  page?: number;
  limit?: number;
  sort?: string;
  brand?: string;
  vendor?: string;
  productType?: string;
  length?: string;
  detail?: string;
  mode?: string;
  availabilityStatus?: string;
  isMadeToOrder?: boolean | string;
  allowCustomSizing?: boolean | string;
  allowRushProduction?: boolean | string;
  availableForSubscription?: boolean | string;
  availableForDailyRent?: boolean | string;
  isRentable?: boolean | string;
  isSellable?: boolean | string;
  listingType?: string;
  resaleCondition?: string;
  allowOffers?: boolean | string;
  minListingPrice?: string | number;
  maxListingPrice?: string | number;
  isShipNow?: boolean | string;
  isShipsNow?: boolean | string;
};

function buildQuery(filters: Record<string, unknown>) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          params.append(key, String(item));
        }
      });

      return;
    }

    params.set(key, String(value));
  });

  return params.toString();
}

export function getCatalogProducts(query?: CatalogListQuery) {
  const queryString = query ? buildQuery(query) : "";

  return apiRequest<CatalogResponse | CatalogProduct[]>(
    queryString ? `/catalog?${queryString}` : "/catalog",
    {
      method: "GET",
    }
  );
}

export function getCatalogProduct(id: string) {
  return apiRequest<any>(`/catalog/${id}`, {
    method: "GET",
  });
}

export function getCatalogProductById(id: string) {
  return apiRequest<any>(`/catalog/${id}`, {
    method: "GET",
  });
}

export function getCatalogRecommendations(params: CatalogRecommendationsParams) {
  const query = buildQuery({
    eventType: params.eventType,
    season: params.season,
    paletteId: params.paletteId,
    limit: params.limit || 9,
  });

  return apiRequest<CatalogResponse | CatalogProduct[] | any>(
    `/catalog/recommendations?${query}`,
    {
      method: "GET",
    }
  );
}

export async function getCatalogFilteredProducts(
  filters: CatalogFilterPayload & {
    page?: number;
    limit?: number;
    sort?: string;
  }
) {
  const query = buildQuery(filters);

  return apiRequest<any>(query ? `/catalog/filter?${query}` : "/catalog/filter", {
    method: "GET",
  });
}

export function getCatalogHeightOptions() {
  return apiRequest<{
    success: boolean;
    data: CatalogHeightOption[];
    error: any;
  }>("/catalog/height-options", {
    method: "GET",
  });
}

export function unwrapCatalogProducts(
  response: CatalogResponse | CatalogProduct[] | any
): CatalogProduct[] {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.products)) return response.products;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.catalog)) return response.catalog;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.products)) return response.data.products;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.catalog)) return response.data.catalog;

  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.data?.products)) {
    return response.data.data.products;
  }
  if (Array.isArray(response?.data?.data?.items)) {
    return response.data.data.items;
  }
  if (Array.isArray(response?.data?.data?.catalog)) {
    return response.data.data.catalog;
  }

  return [];
}

export function unwrapCatalogFilters(response: any): CatalogFiltersMeta | null {
  return (
    response?.data?.filters ||
    response?.filters ||
    response?.data?.data?.filters ||
    null
  );
}

export function unwrapCatalogHeightOptions(response: any): CatalogHeightOption[] {
  const options =
    response?.data?.heightOptions ||
    response?.heightOptions ||
    response?.data?.data?.heightOptions ||
    response?.data?.filters?.heightOptions ||
    response?.filters?.heightOptions ||
    [];

  return Array.isArray(options) ? options : [];
}

export type CatalogColorStoryShade = {
  id: string;
  name: string;
  hex: string;
  filterValue?: string | null;
  sortOrder?: number;
  active?: boolean;
};

export type CatalogColorStory = {
  id: string;
  name: string;
  description?: string | null;
  displayColor: string;
  filterValue?: string | null;
  sortOrder?: number;
  active?: boolean;
  shades: CatalogColorStoryShade[];
};

export type CatalogColorStoriesQuery =
  | string
  | {
      category?: string;
      categorySlug?: string;
      categoryPath?: string;
    };

export async function getCatalogColorStories(query?: CatalogColorStoriesQuery) {
  const params = new URLSearchParams();

  if (typeof query === "string" && query.trim()) {
    params.set("category", query.trim());
  }

  if (typeof query === "object" && query) {
    if (query.category) params.set("category", query.category);
    if (query.categorySlug) params.set("categorySlug", query.categorySlug);
    if (query.categoryPath) params.set("categoryPath", query.categoryPath);
  }

  const queryString = params.toString();

  return apiRequest<{
    success: boolean;
    data: CatalogColorStory[];
    error: any;
  }>(
    queryString
      ? `/catalog/color-stories?${queryString}`
      : "/catalog/color-stories",
    {
      method: "GET",
    },
  );
}

export type CatalogCategoryFaq = {
  question: string;
  answer: string;
};

export type CatalogCategoryFaqSection = {
  heading?: string;
  description?: string;
};

export type CatalogCategoryTreeNode = {
  id?: string;
  name?: string;
  slug?: string;
  seoSlug?: string;
  url?: string;
  parentId?: string;
  parentSlug?: string;
  level?: number;
  path?: string | string[];
  breadcrumb?: any[];
  imageUrl?: string;
  imageAltText?: string;
  description?: string;
  productCount?: number;
  publicProductCount?: number;
  adminProductCount?: number;
  directProductCount?: number;
  isActive?: boolean;
  sortOrder?: number;
  metafields?: Record<string, any>;
  faqSection?: CatalogCategoryFaqSection | null;
  faqs?: CatalogCategoryFaq[];
  children?: CatalogCategoryTreeNode[];
};

export async function getCatalogCategoryTree() {
  return apiRequest<{
    success: boolean;
    data: {
      data?: CatalogCategoryTreeNode[];
      categories?: CatalogCategoryTreeNode[];
    };
    error: any;
  }>(
    `/catalog/categories/tree?includeInactive=false&showProductCount=true&showEmpty=true&maxDepth=10`,
    {
      method: "GET",
    }
  );
}


export async function resolveCatalogCategoryByPath(path: string) {
  const cleanPath = String(path || "").replace(/^\/+|\/+$/g, "");

  return apiRequest<{
    success: boolean;
    data: CatalogCategoryTreeNode | null;
    error: any;
  }>(
    `/catalog/categories/resolve?path=${encodeURIComponent(cleanPath)}`,
    {
      method: "GET",
    },
  );
}