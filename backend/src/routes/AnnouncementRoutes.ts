import { Router } from "express";
import { protect, hrOnly } from "../middleware/auth";
import { createAnnouncement, deleteAnnouncement, getAnnouncements } from "../controllers/AnnouncementController";


const router = Router();

router.use(protect);

router.get("/", getAnnouncements);          
router.post("/", hrOnly, createAnnouncement); 
router.delete("/:id", hrOnly, deleteAnnouncement);

export default router;