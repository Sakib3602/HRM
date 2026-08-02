"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.changePassword = exports.logout = exports.refresh = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const token_1 = require("../utils/token");
const hash_1 = require("../utils/hash");
const errorHandler_1 = require("../middleware/errorHandler");
const User_1 = require("../models/User/User");
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true, // JS দিয়ে পড়া যাবে না (XSS প্রোটেকশন)
    secure: process.env.NODE_ENV === "production", // প্রোডাকশনে শুধু HTTPS এ পাঠাবে
    sameSite: "lax", // CSRF প্রোটেকশন
    maxAge: 7 * 24 * 60 * 60 * 1000, // ৭ দিন
    path: "/api/auth", // শুধু auth route গুলাতেই কুকি যাবে
};
// প্রতিটা successful login/refresh এ নতুন টোকেন পেয়ার বানিয়ে দেয়
const issueTokens = async (user, res) => {
    const payload = { id: user._id.toString(), role: user.role };
    const accessToken = (0, token_1.signAccessToken)(payload);
    const refreshToken = (0, token_1.signRefreshToken)(payload);
    user.refreshTokenHash = (0, hash_1.hashToken)(refreshToken);
    await user.save();
    // ওয়েব ব্রাউজার এই cookie টা automatic ব্যবহার করবে (httpOnly, JS access নাই)
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    // মোবাইল অ্যাপ cookie ব্যবহার করে না — তাই body তেও পাঠানো হচ্ছে,
    // app টা এইটা SecureStore/Keychain এ রাখবে এবং Authorization header এ accessToken পাঠাবে
    return { accessToken, refreshToken };
};
// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password || typeof email !== "string" || typeof password !== "string") {
            throw new errorHandler_1.AppError("Email and password are required", 400);
        }
        const user = await User_1.User.findOne({ email: email.toLowerCase().trim(), isActive: true });
        if (!user) {
            throw new errorHandler_1.AppError("Invalid email or password", 401);
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new errorHandler_1.AppError("Invalid email or password", 401);
        }
        const { accessToken, refreshToken } = await issueTokens(user, res);
        res.json({ accessToken, refreshToken, user });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
// POST /api/auth/refresh
// ওয়েব: cookie থেকে automatic টোকেন আসবে
// অ্যাপ: body তে { refreshToken } পাঠাতে হবে
const refresh = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!token || typeof token !== "string") {
            throw new errorHandler_1.AppError("Refresh token missing", 401);
        }
        const decoded = (0, token_1.verifyRefreshToken)(token);
        const user = await User_1.User.findById(decoded.id);
        if (!user || !user.isActive) {
            throw new errorHandler_1.AppError("User not found or inactive", 401);
        }
        // DB তে রাখা hash এর সাথে না মিললে — টোকেন পুরনো/চুরি হওয়া হতে পারে, পুরা সেশন revoke করে দেওয়া হচ্ছে
        if (!user.refreshTokenHash || user.refreshTokenHash !== (0, hash_1.hashToken)(token)) {
            user.refreshTokenHash = undefined;
            await user.save();
            throw new errorHandler_1.AppError("Session expired, please login again", 401);
        }
        // রোটেশন — প্রতিবার নতুন refresh token ইস্যু হয়, আগেরটা আর কাজ করবে না
        const { accessToken, refreshToken } = await issueTokens(user, res);
        res.json({ accessToken, refreshToken });
    }
    catch (err) {
        next(new errorHandler_1.AppError("Invalid or expired refresh token", 401));
    }
};
exports.refresh = refresh;
// POST /api/auth/logout
const logout = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (token && typeof token === "string") {
            const decoded = (0, token_1.verifyRefreshToken)(token);
            await User_1.User.findByIdAndUpdate(decoded.id, { $set: { refreshTokenHash: null } });
        }
    }
    catch {
        // টোকেন invalid/expired হলেও logout সফল হিসেবেই ধরা হবে
    }
    res.clearCookie("refreshToken", { path: "/api/auth" });
    res.json({ message: "Logged out" });
};
exports.logout = logout;
// POST /api/auth/change-password
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword ||
            !newPassword ||
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string") {
            throw new errorHandler_1.AppError("Current and new password are required", 400);
        }
        const user = await User_1.User.findById(req.user?.id);
        if (!user)
            throw new errorHandler_1.AppError("User not found", 404);
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!isMatch)
            throw new errorHandler_1.AppError("Current password is incorrect", 400);
        if (newPassword.length < 6) {
            throw new errorHandler_1.AppError("New password must be at least 6 characters", 400);
        }
        user.passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        user.mustChangePassword = false;
        user.refreshTokenHash = undefined; // পাসওয়ার্ড বদলালে পুরনো সেশন সব invalid হয়ে যাবে
        await user.save();
        res.clearCookie("refreshToken", { path: "/api/auth" });
        res.json({ message: "Password updated successfully. Please login again." });
    }
    catch (err) {
        next(err);
    }
};
exports.changePassword = changePassword;
// GET /api/auth/me
const getMe = async (req, res, next) => {
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
exports.getMe = getMe;
