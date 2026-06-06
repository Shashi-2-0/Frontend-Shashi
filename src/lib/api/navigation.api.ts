import { apiRequest } from "./client";

export type MegaMenuItem = {
  label: string;
  href: string;
  icon?: string;
  swatch?: string;
};

export type MegaMenuColumn = {
  heading: string;
  items: MegaMenuItem[];
};

export type MegaMenuCard = {
  title: string;
  href: string;
  image: string;
};

export type MegaMenuData = {
  slug: string;
  title: string;
  columns: MegaMenuColumn[];
  cards: MegaMenuCard[];
};

export async function getMegaMenu(slug: string) {
  return apiRequest<{
    success: boolean;
    data: MegaMenuData;
    error?: any;
  }>(`/navigation/mega-menu?slug=${encodeURIComponent(slug)}`, {
    method: "GET",
  });
}