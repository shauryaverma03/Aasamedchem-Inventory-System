import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(num);
}

export function formatNumber(value: number | string, decimals = 2) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toFixed(decimals);
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    COMPLETED: "bg-blue-100 text-blue-800",
    EXPIRED: "bg-gray-100 text-gray-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
}

export function getUnitsForBaseType(baseUnit: string): string[] {
  if (baseUnit === "WEIGHT") return ["g", "kg"];
  if (baseUnit === "VOLUME") return ["mL", "L"];
  return ["item"];
}

export function toBaseUnit(value: number, unit: string, baseUnit: string): number {
  if (baseUnit === "WEIGHT") {
    if (unit === "kg") return value * 1000;
    return value;
  }
  if (baseUnit === "VOLUME") {
    if (unit === "L") return value * 1000;
    return value;
  }
  return value;
}

export function formatBaseQuantity(baseValue: number, baseUnit: string): string {
  if (baseUnit === "WEIGHT") {
    if (baseValue >= 1000) return `${(baseValue / 1000).toFixed(2)} kg`;
    return `${baseValue.toFixed(2)} g`;
  }
  if (baseUnit === "VOLUME") {
    if (baseValue >= 1000) return `${(baseValue / 1000).toFixed(2)} L`;
    return `${baseValue.toFixed(2)} mL`;
  }
  return `${baseValue.toFixed(2)} item(s)`;
}
