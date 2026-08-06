import { Router } from "express";

import { protect, hrOnly } from "../middleware/auth";
import { createUser, deleteUser, getMyProfile, getOnboardingUsers, getUsers, updateOnboardingProgress, updateUser } from "../controllers/UserController";

const router = Router();

router.use(protect); 

router.get("/me", getMyProfile);
router.get("/", hrOnly, getUsers);
router.get("/onboarding", hrOnly, getOnboardingUsers);
router.post("/", hrOnly, createUser);
router.patch("/:id", hrOnly, updateUser);
router.patch("/:id/onboarding", hrOnly, updateOnboardingProgress);
router.delete("/:id", hrOnly, deleteUser);

export default router;