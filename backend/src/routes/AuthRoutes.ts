import { Router } from "express";

import { protect } from "../middleware/auth";
import { loginLimiter } from "../middleware/rateLimiter";
import { changePassword, getMe, login, logout, refresh } from "../controllers/AuthController";

const router = Router();

router.post("/login", loginLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/change-password", protect, changePassword);
router.get("/me", protect, getMe);

export default router;