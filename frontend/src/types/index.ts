export type Role = "ADMIN" | "SELLER" | "BUYER";
export type BaseUnit = "WEIGHT" | "VOLUME" | "COUNT";
export type OrderStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
export type QuotationStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  _count?: { products: number; orders: number; quotations: number };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  imageUrl?: string;
  baseUnit: BaseUnit;
  inventoryQuantity: number | string;
  pricePerBaseUnit: number | string;
  lowStockThreshold: number | string;
  isActive: boolean;
  sellerId: string;
  seller?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  id: string;
  buyerId: string;
  productId: string;
  enteredQuantity: number | string;
  enteredUnit: string;
  convertedQuantityBase: number | string;
  calculatedAmount: number | string;
  status: QuotationStatus;
  notes?: string;
  buyer?: { id: string; name: string; email: string };
  product?: { id: string; name: string; sku: string; baseUnit: BaseUnit; pricePerBaseUnit: number | string };
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  productId: string;
  quotationId?: string;
  enteredQuantity: number | string;
  enteredUnit: string;
  convertedQuantityBase: number | string;
  totalAmount: number | string;
  status: OrderStatus;
  adminNotes?: string;
  buyer?: { id: string; name: string; email: string };
  product?: { id: string; name: string; sku: string; baseUnit: BaseUnit };
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
}
