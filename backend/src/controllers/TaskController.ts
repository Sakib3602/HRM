import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler";
import { Task } from "../models/Tasks/Tasks";


// POST /api/tasks  (HR only)
export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;
    const createdBy = req.user?.id;
    const company = req.user?.company;

    if (
      !title || !description || !assignedTo || !dueDate ||
      typeof title !== "string" || typeof description !== "string"
    ) {
      throw new AppError("Title, description, assignedTo and dueDate are required", 400);
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      dueDate,
      createdBy,
      company,
    });

    const populatedTask = await task.populate("assignedTo", "name email department");

    res.status(201).json(populatedTask);
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks  (HR only — নিজের company এর সব task)
export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = req.user?.company;

    const tasks = await Task.find({ company })
      .populate("assignedTo", "name email department")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/my  (logged-in employee এর নিজের task)
export const getMyTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user?.id })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tasks/:id/status  (assigned employee অথবা HR স্ট্যাটাস বদলাতে পারবে)
export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;

    if (!["pending", "in-progress", "completed"].includes(status)) {
      throw new AppError("Invalid status value", 400);
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("assignedTo", "name email department");

    if (!task) throw new AppError("Task not found", 404);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id  (HR only)
export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) throw new AppError("Task not found", 404);
    res.json({ message: "Task removed" });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tasks/:id/complete  (employee note সহ task complete করবে)
export const completeTaskWithNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { note } = req.body;

    if (!note || typeof note !== "string" || !note.trim()) {
      throw new AppError("A completion note is required", 400);
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        status: "completed",
        completionNote: note.trim(),
        completedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate("assignedTo", "name email department");

    if (!task) throw new AppError("Task not found", 404);
    res.json(task);
  } catch (err) {
    next(err);
  }
};