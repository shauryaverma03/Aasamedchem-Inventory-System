import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.auditLog.deleteMany();
  await prisma.order.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const hashPw = (pw: string) => bcrypt.hash(pw, 12);

  const admin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@aasa.com",
      passwordHash: await hashPw("Admin@123"),
      role: "ADMIN",
    },
  });

  const seller1 = await prisma.user.create({
    data: {
      name: "Ravi Pharma Supplies",
      email: "seller1@aasa.com",
      passwordHash: await hashPw("Seller@123"),
      role: "SELLER",
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      name: "ChemCore Distributors",
      email: "seller2@aasa.com",
      passwordHash: await hashPw("Seller@123"),
      role: "SELLER",
    },
  });

  const buyer1 = await prisma.user.create({
    data: {
      name: "Arjun Research Labs",
      email: "buyer1@aasa.com",
      passwordHash: await hashPw("Buyer@123"),
      role: "BUYER",
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      name: "Meera Diagnostics",
      email: "buyer2@aasa.com",
      passwordHash: await hashPw("Buyer@123"),
      role: "BUYER",
    },
  });

  console.log("✅ Users created");

  const ethanol = await prisma.product.create({
    data: {
      name: "Ethanol (Absolute)",
      sku: "ETH-ABS-001",
      description: "Absolute ethanol, 99.9% purity, suitable for analytical and pharmaceutical use.",
      category: "Solvents",
      baseUnit: "VOLUME",
      inventoryQuantity: 500000,
      pricePerBaseUnit: 0.0082,
      lowStockThreshold: 10000,
      sellerId: seller1.id,
    },
  });

  const acetone = await prisma.product.create({
    data: {
      name: "Acetone (HPLC Grade)",
      sku: "ACE-HPLC-001",
      description: "High-purity acetone for HPLC and chromatography applications.",
      category: "Solvents",
      baseUnit: "VOLUME",
      inventoryQuantity: 200000,
      pricePerBaseUnit: 0.011,
      lowStockThreshold: 5000,
      sellerId: seller1.id,
    },
  });

  const sodiumChloride = await prisma.product.create({
    data: {
      name: "Sodium Chloride (AR Grade)",
      sku: "NACL-AR-001",
      description: "Analytical Reagent grade sodium chloride, >99.5% purity.",
      category: "Inorganic Salts",
      baseUnit: "WEIGHT",
      inventoryQuantity: 100000,
      pricePerBaseUnit: 0.0012,
      lowStockThreshold: 5000,
      sellerId: seller1.id,
    },
  });

  const glucose = await prisma.product.create({
    data: {
      name: "D-Glucose (Anhydrous)",
      sku: "GLU-ANH-001",
      description: "Anhydrous D-glucose for cell culture and microbiological use.",
      category: "Biochemicals",
      baseUnit: "WEIGHT",
      inventoryQuantity: 50000,
      pricePerBaseUnit: 0.0085,
      lowStockThreshold: 2000,
      sellerId: seller2.id,
    },
  });

  const sulfuricAcid = await prisma.product.create({
    data: {
      name: "Sulfuric Acid (98%)",
      sku: "H2SO4-98-001",
      description: "Concentrated sulfuric acid, 98% w/w, analytical grade.",
      category: "Acids",
      baseUnit: "VOLUME",
      inventoryQuantity: 100000,
      pricePerBaseUnit: 0.0155,
      lowStockThreshold: 5000,
      sellerId: seller2.id,
    },
  });

  const methanol = await prisma.product.create({
    data: {
      name: "Methanol (HPLC Grade)",
      sku: "METH-HPLC-001",
      description: "HPLC-grade methanol, UV cutoff <210 nm.",
      category: "Solvents",
      baseUnit: "VOLUME",
      inventoryQuantity: 300000,
      pricePerBaseUnit: 0.0095,
      lowStockThreshold: 10000,
      sellerId: seller1.id,
    },
  });

  const bsa = await prisma.product.create({
    data: {
      name: "Bovine Serum Albumin (BSA)",
      sku: "BSA-FRF-001",
      description: "Fraction V, lyophilized BSA for biochemistry and cell culture.",
      category: "Proteins",
      baseUnit: "WEIGHT",
      inventoryQuantity: 5000,
      pricePerBaseUnit: 0.42,
      lowStockThreshold: 500,
      sellerId: seller2.id,
    },
  });

  const gloves = await prisma.product.create({
    data: {
      name: "Nitrile Gloves (Medium)",
      sku: "GLOVE-NIT-M-001",
      description: "Powder-free nitrile examination gloves, box of 100.",
      category: "Consumables",
      baseUnit: "COUNT",
      inventoryQuantity: 5000,
      pricePerBaseUnit: 8.5,
      lowStockThreshold: 200,
      sellerId: seller2.id,
    },
  });

  const petriDish = await prisma.product.create({
    data: {
      name: "Petri Dish (90mm)",
      sku: "PETRI-90-001",
      description: "Sterile plastic petri dishes, 90mm diameter.",
      category: "Labware",
      baseUnit: "COUNT",
      inventoryQuantity: 2000,
      pricePerBaseUnit: 12,
      lowStockThreshold: 100,
      sellerId: seller1.id,
    },
  });

  const kcl = await prisma.product.create({
    data: {
      name: "Potassium Chloride (GR)",
      sku: "KCL-GR-001",
      description: "Guaranteed Reagent grade potassium chloride for buffer preparation.",
      category: "Inorganic Salts",
      baseUnit: "WEIGHT",
      inventoryQuantity: 80000,
      pricePerBaseUnit: 0.0018,
      lowStockThreshold: 3000,
      sellerId: seller1.id,
    },
  });

  console.log("✅ Products created: 10");

  // Sample quotations
  const q1 = await prisma.quotation.create({
    data: {
      buyerId: buyer1.id,
      productId: sodiumChloride.id,
      enteredQuantity: 2,
      enteredUnit: "kg",
      convertedQuantityBase: 2000,
      calculatedAmount: 2.40,
      status: "APPROVED",
      notes: "Need for buffer preparation",
    },
  });

  await prisma.quotation.create({
    data: {
      buyerId: buyer2.id,
      productId: ethanol.id,
      enteredQuantity: 500,
      enteredUnit: "mL",
      convertedQuantityBase: 500,
      calculatedAmount: 4.10,
      status: "PENDING",
    },
  });

  await prisma.quotation.create({
    data: {
      buyerId: buyer1.id,
      productId: methanol.id,
      enteredQuantity: 3,
      enteredUnit: "L",
      convertedQuantityBase: 3000,
      calculatedAmount: 28.50,
      status: "PENDING",
    },
  });

  console.log("✅ Quotations created: 3");

  // Sample orders
  await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      productId: sodiumChloride.id,
      quotationId: q1.id,
      enteredQuantity: 5,
      enteredUnit: "kg",
      convertedQuantityBase: 5000,
      totalAmount: 6.00,
      status: "COMPLETED",
      adminNotes: "Shipped via courier",
    },
  });

  await prisma.order.create({
    data: {
      buyerId: buyer2.id,
      productId: glucose.id,
      enteredQuantity: 500,
      enteredUnit: "g",
      convertedQuantityBase: 500,
      totalAmount: 4.25,
      status: "APPROVED",
    },
  });

  await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      productId: gloves.id,
      enteredQuantity: 200,
      enteredUnit: "item",
      convertedQuantityBase: 200,
      totalAmount: 1700,
      status: "PENDING",
    },
  });

  console.log("✅ Orders created: 3");

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "SYSTEM_SEED",
      resource: "Database",
      metadata: { message: "Initial seed data loaded" },
    },
  });

  console.log("🎉 Seeding complete!");
  console.log("\n📋 Test Credentials:");
  console.log("  Admin:  admin@aasa.com  / Admin@123");
  console.log("  Seller: seller1@aasa.com / Seller@123");
  console.log("  Seller: seller2@aasa.com / Seller@123");
  console.log("  Buyer:  buyer1@aasa.com  / Buyer@123");
  console.log("  Buyer:  buyer2@aasa.com  / Buyer@123");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
