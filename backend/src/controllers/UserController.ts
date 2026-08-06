import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";

import { AppError } from "../middleware/errorHandler";
import { User } from "../models/User/User";

const clampPercent = (value: unknown) => {
  const percent = Number(value);
  if (Number.isNaN(percent)) {
    throw new AppError("Progress percent is required", 400);
  }

  return Math.max(0, Math.min(100, Math.round(percent)));
};

// GET /api/users?page=1&limit=10&search=david&status=active
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userCreatedBy = req.user?.id;

    const page = Math.max(parseInt(String(req.query.page || "1")), 1);
    const limit = Math.max(parseInt(String(req.query.limit || "10")), 1);
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "active"); // active | inactive | all

    const filter: Record<string, any> = { userCreatedBy };

    if (status === "active") filter.isActive = true;
    else if (status === "inactive") filter.isActive = false;
    // status === "all" হলে isActive দিয়ে filter করা হবে না

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { department: regex },
        { phone: regex },
        { manager: regex },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/onboarding
export const getOnboardingUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userCreatedBy = req.user?.id;
    const search = String(req.query.search || "").trim();

    const filter: Record<string, any> = {
      userCreatedBy,
      role: "employee",
      isActive: true,
      employmentStatus: { $ne: "permanent" },
    };

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { department: regex },
        { phone: regex },
        { manager: regex },
      ];
    }

    const users = await User.find(filter).sort({ "onboarding.percent": -1, createdAt: -1 });

    res.json({ users });
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

// POST /api/users  (HR only) — password এখন HR নিজে সেট করবে
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userCreatedBy = req.user?.id; 
    const { name, email, department, manager, role, vehicle, phone, password } = req.body;

    if (
      !name || !email || !department || !password ||
      typeof name !== "string" || typeof email !== "string" ||
      typeof department !== "string" || typeof password !== "string"
    ) {
      throw new AppError("Name, email, department and password are required", 400);
    }

    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400);
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      throw new AppError("A user with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      userCreatedBy,
      company: req.user?.company || "",
      name,
      email: email.toLowerCase(),
      passwordHash,
      department,
      manager,
      vehicle,
      phone,
      role: role === "hr" ? "hr" : "employee",
      employmentStatus: role === "hr" ? "permanent" : "onboarding",
      mustChangePassword: false, // HR নিজে password দিয়েছে, তাই force-change লাগবে না
      onboarding:
        role === "hr"
          ? { percent: 100, completedAt: new Date(), stages: [], notes: [] }
          : { percent: 0, completedAt: null, stages: [], notes: [] },
    });

    res.status(201).json({ user });
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

// PATCH /api/users/:id/onboarding  (HR only)
export const updateOnboardingProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      userCreatedBy: req.user?.id,
      role: "employee",
    });

    if (!user) throw new AppError("Employee not found", 404);
    if (!user.isActive || user.employmentStatus === "removed") {
      throw new AppError("Removed employees cannot be updated", 400);
    }
    if (user.employmentStatus === "permanent") {
      throw new AppError("This employee is already permanent", 400);
    }

    const nextPercent = clampPercent(req.body.percent);
    if (nextPercent <= user.onboarding.percent) {
      throw new AppError("Progress must be higher than the current value", 400);
    }

    const note = String(req.body.note || "").trim();
    const strengths = String(req.body.strengths || "").trim();
    const weaknesses = String(req.body.weaknesses || "").trim();

    if (!note) {
      throw new AppError("A note is required for each progress update", 400);
    }

    user.onboarding.percent = nextPercent;
    user.onboarding.notes.push({
      percent: nextPercent,
      note,
      strengths,
      weaknesses,
      createdAt: new Date(),
      updatedBy: req.user?.id as any,
    });

    if (nextPercent >= 100) {
      user.onboarding.percent = 100;
      user.onboarding.completedAt = new Date();
      user.employmentStatus = "permanent";
    }

    await user.save();

    res.json({ user });
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
      { isActive: false, employmentStatus: "removed" },
      { new: true }
    );

    if (!user) throw new AppError("User not found", 404);
    res.json({ message: "User removed", user });
  } catch (err) {
    next(err);
  }
};


export const getAllUser = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const userCreatedBy = req.user?.id;
    const company = req.user?.company;

    const users = await User.find({ userCreatedBy, company , isActive: true }).select("name email department role");
    res.json({ users });
  } catch (err) {
    next(err);
  }

}