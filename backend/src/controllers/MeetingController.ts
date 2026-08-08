import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler";
import { Meetings } from "../models/Meetings/Meetings";



export const createMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, date, time, employeeId } = req.body;
    const createdBy = req.user?.id;
    const company = req.user?.company;

    if (
      !title || !description || !date || !time ||
      typeof title !== "string" || typeof description !== "string"
    ) {
      throw new AppError("Title, description, date and time are required", 400);
    }

    if (!Array.isArray(employeeId) || employeeId.length === 0) {
      throw new AppError("Please select at least one employee", 400);
    }

    const meeting = await Meetings.create({
      title,
      description,
      date,
      time,
      employeeId,
      createdBy,
      company,
    });

    const populated = await meeting.populate("employeeId", "name email department");

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};


export const getMeetings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = req.user?.company;

    const meetings = await Meetings.find({ company })
      .populate("employeeId", "name email department")
      .populate("createdBy", "name email")
      .sort({ date: 1 });

    res.json(meetings);
  } catch (err) {
    next(err);
  }
};


export const getMyMeetings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const meetings = await Meetings.find({ employeeId: req.user?.id })
      .populate("createdBy", "name email")
      .sort({ date: 1 });

    res.json(meetings);
  } catch (err) {
    next(err);
  }
};


export const deleteMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const meeting = await Meetings.findByIdAndDelete(req.params.id);
    if (!meeting) throw new AppError("Meeting not found", 404);
    res.json({ message: "Meeting removed" });
  } catch (err) {
    next(err);
  }
};