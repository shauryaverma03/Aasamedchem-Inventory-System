import { Router } from "express";
import { getUsers, updateUser, getAnalytics, getInventory } from "../controllers/admin.controller";
import { authenticateUser, authorizeRoles } from "../middleware/auth";

const router = Router();

router.use(authenticateUser, authorizeRoles("ADMIN"));

router.get("/users", getUsers);
router.patch("/users/:id", updateUser);
router.get("/analytics", getAnalytics);
router.get("/inventory", getInventory);

export default router;
