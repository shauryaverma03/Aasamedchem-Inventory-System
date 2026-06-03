import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

// GET /api/admin/users
export const getUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, isActive: true, createdAt: true,
        _count: { select: { products: true, orders: true, quotations: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ users });
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// PATCH /api/admin/users/:id
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { isActive, role } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(role && { role }),
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    res.json({ user: updated });
  } catch {
    res.status(500).json({ error: "Failed to update user" });
  }
};

// GET /api/admin/analytics
export const getAnalytics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalQuotations,
      ordersByStatus,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.quotation.count(),
      prisma.order.groupBy({ by: ["status"], _count: true }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          buyer: { select: { name: true } },
          product: { select: { name: true } },
        },
      }),
      prisma.order.groupBy({
        by: ["productId"],
        _count: true,
        _sum: { totalAmount: true },
        orderBy: { _count: { productId: "desc" } },
        take: 5,
      }),
    ]);

    const productIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true },
    });

    const topProductsWithNames = topProducts.map((tp) => ({
      ...tp,
      product: products.find((p) => p.id === tp.productId),
    }));

    res.json({
      overview: { totalUsers, totalProducts, totalOrders, totalQuotations },
      ordersByStatus,
      recentOrders,
      topProducts: topProductsWithNames,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

// GET /api/admin/inventory
export const getInventory = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true, name: true, sku: true, category: true, baseUnit: true,
        inventoryQuantity: true, lowStockThreshold: true, pricePerBaseUnit: true,
        seller: { select: { id: true, name: true } },
      },
      orderBy: { inventoryQuantity: "asc" },
    });

    const lowStock = products.filter(
      (p) => parseFloat(p.inventoryQuantity.toString()) <= parseFloat(p.lowStockThreshold.toString())
    );

    res.json({ products, lowStock });
  } catch {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
};
