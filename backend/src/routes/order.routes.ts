import { Router } from "express";
import { getOrders, createOrder, updateOrderStatus } from "../controllers/order.controller";
import { authenticateUser, authorizeRoles } from "../middleware/auth";

const router = Router();

router.get("/", authenticateUser, getOrders);
router.post("/", authenticateUser, authorizeRoles("BUYER"), createOrder);
router.patch("/:id/status", authenticateUser, authorizeRoles("ADMIN"), updateOrderStatus);

export default router;
