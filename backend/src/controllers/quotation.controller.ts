import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";
import { toBaseUnit, calculatePrice } from "../services/conversion.service";
import { BaseUnit } from "@prisma/client";

// GET /api/quotations
export const getQuotations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (req.user?.role === "BUYER") where.buyerId = req.user.id;

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, name: true, sku: true, baseUnit: true, pricePerBaseUnit: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.quotation.count({ where }),
    ]);

    res.json({ quotations, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch quotations" });
  }
};

// POST /api/quotations
export const createQuotation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, enteredQuantity, enteredUnit } = req.body;

    if (!productId || enteredQuantity === undefined || !enteredUnit) {
      res.status(400).json({ error: "productId, enteredQuantity, and enteredUnit are required" });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const qty = parseFloat(enteredQuantity.toString());
    const baseQty = toBaseUnit(qty, enteredUnit, product.baseUnit as "WEIGHT" | "VOLUME" | "COUNT");
    const amount = calculatePrice(baseQty, product.pricePerBaseUnit);

    const quotation = await prisma.quotation.create({
      data: {
        buyerId: req.user!.id,
        productId,
        enteredQuantity: qty,
        enteredUnit,
        convertedQuantityBase: baseQty,
        calculatedAmount: amount,
      },
      include: {
        product: { select: { id: true, name: true, sku: true, baseUnit: true } },
        buyer: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ quotation });
  } catch (err: unknown) {
    console.error(err);
    const msg = err instanceof Error ? err.message : "Failed to create quotation";
    res.status(500).json({ error: msg });
  }
};

// PATCH /api/quotations/:id
export const updateQuotation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quotation = await prisma.quotation.findUnique({ where: { id: req.params.id } });
    if (!quotation) {
      res.status(404).json({ error: "Quotation not found" });
      return;
    }

    // Only admin or the buyer themselves
    if (req.user?.role === "BUYER" && quotation.buyerId !== req.user.id) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    const { status, notes } = req.body;
    const updated = await prisma.quotation.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        buyer: { select: { id: true, name: true } },
      },
    });

    res.json({ quotation: updated });
  } catch {
    res.status(500).json({ error: "Failed to update quotation" });
  }
};

// POST /api/quotations/:id/convert - Convert quotation to order
export const convertQuotationToOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: { product: true },
    });

    if (!quotation) {
      res.status(404).json({ error: "Quotation not found" });
      return;
    }

    if (req.user?.role === "BUYER" && quotation.buyerId !== req.user.id) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    if (quotation.status !== "PENDING") {
      res.status(400).json({ error: "Only PENDING quotations can be converted to orders" });
      return;
    }

    const order = await prisma.order.create({
      data: {
        buyerId: quotation.buyerId,
        productId: quotation.productId,
        quotationId: quotation.id,
        enteredQuantity: quotation.enteredQuantity,
        enteredUnit: quotation.enteredUnit,
        convertedQuantityBase: quotation.convertedQuantityBase,
        totalAmount: quotation.calculatedAmount,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        buyer: { select: { id: true, name: true } },
      },
    });

    // Mark quotation as approved
    await prisma.quotation.update({ where: { id: quotation.id }, data: { status: "APPROVED" } });

    res.status(201).json({ order });
  } catch {
    res.status(500).json({ error: "Failed to convert quotation to order" });
  }
};
