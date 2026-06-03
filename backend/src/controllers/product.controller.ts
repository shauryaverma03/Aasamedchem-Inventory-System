import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

// GET /api/products
export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      page = "1",
      limit = "20",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query as Record<string, string>;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { isActive: true };

    // Sellers only see their own products
    if (req.user?.role === "SELLER") {
      where.sellerId = req.user.id;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }

    const validSortFields = ["name", "sku", "category", "createdAt", "inventoryQuantity", "pricePerBaseUnit"];
    const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const order = sortOrder === "asc" ? "asc" : "desc";

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          seller: { select: { id: true, name: true, email: true } },
        },
        orderBy: { [orderField]: order },
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// GET /api/products/:id
export const getProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    if (!product || !product.isActive) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json({ product });
  } catch {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// POST /api/products
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, sku, description, category, imageUrl, baseUnit, inventoryQuantity, pricePerBaseUnit, lowStockThreshold } = req.body;

    if (!name || !sku || !category || !baseUnit || pricePerBaseUnit === undefined) {
      res.status(400).json({ error: "Missing required fields: name, sku, category, baseUnit, pricePerBaseUnit" });
      return;
    }

    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      res.status(409).json({ error: "SKU already exists" });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description,
        category,
        imageUrl,
        baseUnit,
        inventoryQuantity: inventoryQuantity ?? 0,
        pricePerBaseUnit,
        lowStockThreshold: lowStockThreshold ?? 1000,
        sellerId: req.user!.id,
      },
      include: { seller: { select: { id: true, name: true } } },
    });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: "CREATE", resource: "Product", resourceId: product.id },
    });

    res.status(201).json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// PUT /api/products/:id
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });

    if (!product || !product.isActive) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Sellers can only edit their own products
    if (req.user?.role === "SELLER" && product.sellerId !== req.user.id) {
      res.status(403).json({ error: "Cannot modify another seller's product" });
      return;
    }

    const { name, description, category, imageUrl, inventoryQuantity, pricePerBaseUnit, lowStockThreshold } = req.body;

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(inventoryQuantity !== undefined && { inventoryQuantity }),
        ...(pricePerBaseUnit !== undefined && { pricePerBaseUnit }),
        ...(lowStockThreshold !== undefined && { lowStockThreshold }),
      },
      include: { seller: { select: { id: true, name: true } } },
    });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: "UPDATE", resource: "Product", resourceId: product.id },
    });

    res.json({ product: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });

    if (!product || !product.isActive) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (req.user?.role === "SELLER" && product.sellerId !== req.user.id) {
      res.status(403).json({ error: "Cannot delete another seller's product" });
      return;
    }

    // Soft delete
    await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: "DELETE", resource: "Product", resourceId: product.id },
    });

    res.json({ message: "Product deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

// GET /api/products/categories
export const getCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });
    res.json({ categories: categories.map((c) => c.category) });
  } catch {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};
