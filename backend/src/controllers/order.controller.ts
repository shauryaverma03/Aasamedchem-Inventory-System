import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

// GET /api/orders
export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "20", status } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (req.user?.role === "BUYER") where.buyerId = req.user.id;
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, name: true, sku: true, baseUnit: true } },
          quotation: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// POST /api/orders
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, enteredQuantity, enteredUnit, convertedQuantityBase, totalAmount } = req.body;

    if (!productId || enteredQuantity === undefined || !enteredUnit || !totalAmount) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const order = await prisma.order.create({
      data: {
        buyerId: req.user!.id,
        productId,
        enteredQuantity,
        enteredUnit,
        convertedQuantityBase: convertedQuantityBase ?? enteredQuantity,
        totalAmount,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        buyer: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ order });
  } catch {
    res.status(500).json({ error: "Failed to create order" });
  }
};

// PATCH /api/orders/:id/status
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const { status, adminNotes } = req.body;
    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(adminNotes !== undefined && { adminNotes }),
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        buyer: { select: { id: true, name: true } },
      },
    });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: "STATUS_UPDATE", resource: "Order", resourceId: order.id, metadata: { status } },
    });

    res.json({ order: updated });
  } catch {
    res.status(500).json({ error: "Failed to update order status" });
  }
};
