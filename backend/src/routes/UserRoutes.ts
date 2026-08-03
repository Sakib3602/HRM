import { Router } from "express";

import { protect, hrOnly } from "../middleware/auth";
import { createUser, deleteUser, getMyProfile, getUsers, updateUser } from "../controllers/UserController";

const router = Router();

router.use(protect); 

router.get("/me", getMyProfile);
router.get("/", hrOnly, getUsers);
router.post("/", hrOnly, createUser);
router.patch("/:id", hrOnly, updateUser);
router.delete("/:id", hrOnly, deleteUser);

export default router;