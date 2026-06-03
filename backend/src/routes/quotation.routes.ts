import { Router } from "express";
import { getQuotations, createQuotation, updateQuotation, convertQuotationToOrder } from "../controllers/quotation.controller";
import { authenticateUser, authorizeRoles } from "../middleware/auth";

const router = Router();

router.get("/", authenticateUser, getQuotations);
router.post("/", authenticateUser, authorizeRoles("BUYER"), createQuotation);
router.patch("/:id", authenticateUser, updateQuotation);
router.post("/:id/convert", authenticateUser, authorizeRoles("BUYER"), convertQuotationToOrder);

export default router;
