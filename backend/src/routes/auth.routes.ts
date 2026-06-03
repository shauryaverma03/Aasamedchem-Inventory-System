import { Router } from "express";
import { register, login, getProfile, updateProfile } from "../controllers/auth.controller";
import { authenticateUser } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticateUser, getProfile);
router.put("/profile", authenticateUser, updateProfile);

export default router;
