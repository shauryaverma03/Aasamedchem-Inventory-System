import { Decimal } from "@prisma/client/runtime/library";

// ── Weight Conversion (base = grams) ─────────────────────────────────────────
export function convertWeight(value: number, fromUnit: string): number {
  switch (fromUnit.toLowerCase()) {
    case "kg":
      return value * 1000;
    case "g":
      return value;
    default:
      throw new Error(`Unknown weight unit: ${fromUnit}`);
  }
}

export function displayWeight(baseGrams: number, toUnit: string): number {
  switch (toUnit.toLowerCase()) {
    case "kg":
      return baseGrams / 1000;
    case "g":
      return baseGrams;
    default:
      throw new Error(`Unknown weight unit: ${toUnit}`);
  }
}

// ── Volume Conversion (base = milliliters) ────────────────────────────────────
export function convertVolume(value: number, fromUnit: string): number {
  switch (fromUnit.toLowerCase()) {
    case "l":
      return value * 1000;
    case "ml":
      return value;
    default:
      throw new Error(`Unknown volume unit: ${fromUnit}`);
  }
}

export function displayVolume(baseMl: number, toUnit: string): number {
  switch (toUnit.toLowerCase()) {
    case "l":
      return baseMl / 1000;
    case "ml":
      return baseMl;
    default:
      throw new Error(`Unknown volume unit: ${toUnit}`);
  }
}

// ── Count Conversion (base = item) ────────────────────────────────────────────
export function convertCount(value: number, fromUnit: string): number {
  if (fromUnit.toLowerCase() === "item") return value;
  throw new Error(`Unknown count unit: ${fromUnit}`);
}

// ── Universal Converter ───────────────────────────────────────────────────────
export type BaseUnitType = "WEIGHT" | "VOLUME" | "COUNT";

export function toBaseUnit(
  value: number,
  unit: string,
  baseUnitType: BaseUnitType
): number {
  switch (baseUnitType) {
    case "WEIGHT":
      return convertWeight(value, unit);
    case "VOLUME":
      return convertVolume(value, unit);
    case "COUNT":
      return convertCount(value, unit);
  }
}

// ── Price Calculator ──────────────────────────────────────────────────────────
export function calculatePrice(
  quantityInBase: number,
  pricePerBaseUnit: Decimal | number
): number {
  const price = typeof pricePerBaseUnit === "number"
    ? pricePerBaseUnit
    : parseFloat(pricePerBaseUnit.toString());
  return parseFloat((quantityInBase * price).toFixed(6));
}

// ── Get available units for a base type ──────────────────────────────────────
export function getUnitsForBaseType(baseUnit: BaseUnitType): string[] {
  switch (baseUnit) {
    case "WEIGHT":
      return ["g", "kg"];
    case "VOLUME":
      return ["mL", "L"];
    case "COUNT":
      return ["item"];
  }
}

// ── Format display label ──────────────────────────────────────────────────────
export function formatQuantityDisplay(
  baseValue: number,
  baseUnitType: BaseUnitType
): string {
  switch (baseUnitType) {
    case "WEIGHT":
      if (baseValue >= 1000) return `${baseValue / 1000} kg`;
      return `${baseValue} g`;
    case "VOLUME":
      if (baseValue >= 1000) return `${baseValue / 1000} L`;
      return `${baseValue} mL`;
    case "COUNT":
      return `${baseValue} item(s)`;
  }
}
