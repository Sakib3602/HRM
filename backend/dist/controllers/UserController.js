"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getMyProfile = exports.getUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const errorHandler_1 = require("../middleware/errorHandler");
const User_1 = require("../models/User/User");
// রেন্ডম টেম্প পাসওয়ার্ড জেনারেটর
const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8);
};
// GET /api/users  (HR → সব ইউজার, employee হলে এই route এ আসবেই না, hrOnly middleware আটকাবে)
const getUsers = async (req, res, next) => {
    try {
        const users = await User_1.User.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(users);
    }
    catch (err) {
        next(err);
    }
};
exports.getUsers = getUsers;
// GET /api/users/me
const getMyProfile = async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user?.id);
        if (!user)
            throw new errorHandler_1.AppError("User not found", 404);
        res.json(user);
    }
    catch (err) {
        next(err);
    }
};
exports.getMyProfile = getMyProfile;
// POST /api/users  (HR only — নতুন office user add)
const createUser = async (req, res, next) => {
    try {
        const { name, email, department, manager, role, vehicle, phone } = req.body;
        if (!name || !email || !department ||
            typeof name !== "string" || typeof email !== "string" || typeof department !== "string") {
            throw new errorHandler_1.AppError("Name, email and department are required", 400);
        }
        const exists = await User_1.User.findOne({ email: email.toLowerCase().trim() });
        if (exists) {
            throw new errorHandler_1.AppError("A user with this email already exists", 409);
        }
        const tempPassword = generateTempPassword();
        const passwordHash = await bcryptjs_1.default.hash(tempPassword, 12);
        const user = await User_1.User.create({
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
    }
    catch (err) {
        next(err);
    }
};
exports.createUser = createUser;
// PATCH /api/users/:id  (HR only)
const updateUser = async (req, res, next) => {
    try {
        const { name, department, manager, role, vehicle, phone } = req.body;
        const user = await User_1.User.findByIdAndUpdate(req.params.id, { name, department, manager, role, vehicle, phone }, { new: true, runValidators: true });
        if (!user)
            throw new errorHandler_1.AppError("User not found", 404);
        res.json(user);
    }
    catch (err) {
        next(err);
    }
};
exports.updateUser = updateUser;
// DELETE /api/users/:id  (HR only — soft delete)
const deleteUser = async (req, res, next) => {
    try {
        if (req.params.id === req.user?.id) {
            throw new errorHandler_1.AppError("You can't remove the account you're logged in as", 400);
        }
        const user = await User_1.User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!user)
            throw new errorHandler_1.AppError("User not found", 404);
        res.json({ message: "User removed", user });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteUser = deleteUser;
