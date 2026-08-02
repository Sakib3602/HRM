import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";

import { AppError } from "../middleware/errorHandler";
import { User } from "../models/User/User";

// রেন্ডম টেম্প পাসওয়ার্ড জেনারেটর
const generateTempPassword = (): string => {
  return Math.random().toString(36).slice(-8);
};

// GET /api/users  (HR → সব ইউজার, employee হলে এই route এ আসবেই না, hrOnly middleware আটকাবে)
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/me
export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) throw new AppError("User not found", 404);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// POST /api/users  (HR only — নতুন office user add)
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, department, manager, role, vehicle, phone } = req.body;

    if (
      !name || !email || !department ||
      typeof name !== "string" || typeof email !== "string" || typeof department !== "string"
    ) {
      throw new AppError("Name, email and department are required", 400);
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      throw new AppError("A user with this email already exists", 409);
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      department,
      manager,
      vehicle,
      phone,
      role: role === "hr" ? "hr" : "employee",
      mustChangePassword: true,
    });

    // TODO: nodemailer দিয়ে tempPassword ইউজারের ইমেইলে পাঠানো হবে
    console.log(`Temp password for ${email}: ${tempPassword}`);

    res.status(201).json({ user, tempPassword });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id  (HR only)
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, department, manager, role, vehicle, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, department, manager, role, vehicle, phone },
      { new: true, runValidators: true }
    );

    if (!user) throw new AppError("User not found", 404);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id  (HR only — soft delete)
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.params.id === req.user?.id) {
      throw new AppError("You can't remove the account you're logged in as", 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) throw new AppError("User not found", 404);
    res.json({ message: "User removed", user });
  } catch (err) {
    next(err);
  }
};