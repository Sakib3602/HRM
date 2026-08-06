import { Router } from "express";
import { protect, hrOnly, employeeOnly } from "../middleware/auth";
import {
  createTask,
  getTasks,
  getMyTasks,
  updateTaskStatus,
  deleteTask,
  completeTaskWithNote,
} from "../controllers/TaskController";

const router = Router();

router.use(protect); // সব route এ লগইন লাগবে

router.get("/my",employeeOnly, getMyTasks);    // employee নিজের task দেখবে
router.get("/", hrOnly, getTasks);            // HR সব task দেখবে
router.post("/", hrOnly, createTask);         // HR নতুন task assign করবে
router.patch("/:id/status", updateTaskStatus); // status update (employee/HR দুজনেই)
router.delete("/:id", hrOnly, deleteTask);     // HR delete করবে

router.patch("/:id/complete", completeTaskWithNote);

export default router;