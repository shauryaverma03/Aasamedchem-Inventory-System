import { Router } from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "../controllers/product.controller";
import { authenticateUser, authorizeRoles } from "../middleware/auth";

const router = Router();

router.get("/categories", authenticateUser, getCategories);
router.get("/", authenticateUser, getProducts);
router.get("/:id", authenticateUser, getProduct);
router.post("/", authenticateUser, authorizeRoles("ADMIN", "SELLER"), createProduct);
router.put("/:id", authenticateUser, authorizeRoles("ADMIN", "SELLER"), updateProduct);
router.delete("/:id", authenticateUser, authorizeRoles("ADMIN", "SELLER"), deleteProduct);

export default router;
