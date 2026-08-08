import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler";
import { Announcement } from "../models/Announcement/Announcement";

// POST /api/announcements  (HR only)
export const createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;
    const createdBy = req.user?.id;
    const company = req.user?.company;

    if (!title || !description || typeof title !== "string" || typeof description !== "string") {
      throw new AppError("Title and description are required", 400);
    }

    const announcement = await Announcement.create({ title, description, createdBy, company });
    const populated = await announcement.populate("createdBy", "name email");

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// GET /api/announcements  (company এর সব announcement, latest আগে)
export const getAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = req.user?.company;

    const announcements = await Announcement.find({ company })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/announcements/:id  (HR only)
export const deleteAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) throw new AppError("Announcement not found", 404);
    res.json({ message: "Announcement removed" });
  } catch (err) {
    next(err);
  }
};