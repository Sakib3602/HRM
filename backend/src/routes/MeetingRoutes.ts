import { Router } from "express";
import { protect, hrOnly } from "../middleware/auth";
import { createMeeting, getMeetings, getMyMeetings, deleteMeeting } from "../controllers/MeetingController";

const router = Router();

router.use(protect);

router.get("/my", getMyMeetings);
router.get("/", hrOnly, getMeetings);
router.post("/", hrOnly, createMeeting);
router.delete("/:id", hrOnly, deleteMeeting);

export default router;