import { apiRequest } from "./client";

export type OrderItem = {
  id?: string;
  productId?: string;
  name?: string;
  title?: string;
  image?: string;
  quantity?: number;
  price?: number;
};

export type Order = {
  id?: string;
  orderId?: string;
  status?: string;
  total?: number;
  amount?: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItem[];
};

export type OrdersResponse = {
  success?: boolean;
  data?: Order[];
  orders?: Order[];
};

export function getOrders() {
  return apiRequest<OrdersResponse | Order[]>("/orders", {
    method: "GET",
  });
}