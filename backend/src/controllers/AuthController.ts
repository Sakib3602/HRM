import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/token";
import { hashToken } from "../utils/hash";
import { AppError } from "../middleware/errorHandler";
import { User } from "../models/User/User";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,                                   // JS দিয়ে পড়া যাবে না (XSS প্রোটেকশন)
  secure: process.env.NODE_ENV === "production",     // প্রোডাকশনে শুধু HTTPS এ পাঠাবে
  sameSite: "lax" as const,                          // CSRF প্রোটেকশন
  maxAge: 7 * 24 * 60 * 60 * 1000,                   // ৭ দিন
  path: "/api/auth",                                 // শুধু auth route গুলাতেই কুকি যাবে
};

// প্রতিটা successful login/refresh এ নতুন টোকেন পেয়ার বানিয়ে দেয়
const issueTokens = async (user: any, res: Response) => {
  const payload = { id: user._id.toString(), role: user.role, company: user.company || "" };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

 
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  return { accessToken, refreshToken };
};

// POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

     console.log('Login attempt - email:', JSON.stringify(email));
    console.log('Login attempt - password:', JSON.stringify(password));

    
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      throw new AppError("Email and password are required", 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim(), isActive: true });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const { accessToken, refreshToken } = await issueTokens(user, res);

    res.json({ accessToken, refreshToken, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
// ওয়েব: cookie থেকে automatic টোকেন আসবে
// অ্যাপ: body তে { refreshToken } পাঠাতে হবে
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token || typeof token !== "string") {
      throw new AppError("Refresh token missing", 401);
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new AppError("User not found or inactive", 401);
    }

    // DB তে রাখা hash এর সাথে না মিললে — টোকেন পুরনো/চুরি হওয়া হতে পারে, পুরা সেশন revoke করে দেওয়া হচ্ছে
    if (!user.refreshTokenHash || user.refreshTokenHash !== hashToken(token)) {
      user.refreshTokenHash = undefined;
      await user.save();
      throw new AppError("Session expired, please login again", 401);
    }

    // রোটেশন — প্রতিবার নতুন refresh token ইস্যু হয়, আগেরটা আর কাজ করবে না
    const { accessToken, refreshToken } = await issueTokens(user, res);

    res.json({ accessToken, refreshToken });
  } catch (err) {
    next(new AppError("Invalid or expired refresh token", 401));
  }
};

// POST /api/auth/logout
export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token && typeof token === "string") {
      const decoded = verifyRefreshToken(token);
      await User.findByIdAndUpdate(decoded.id, { $set: { refreshTokenHash: null } });
    }
  } catch {
    // টোকেন invalid/expired হলেও logout সফল হিসেবেই ধরা হবে
  }

  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.json({ message: "Logged out" });
};

// POST /api/auth/change-password
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      !currentPassword ||
      !newPassword ||
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      throw new AppError("Current and new password are required", 400);
    }

    const user = await User.findById(req.user?.id);
    if (!user) throw new AppError("User not found", 404);

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) throw new AppError("Current password is incorrect", 400);

    if (newPassword.length < 6) {
      throw new AppError("New password must be at least 6 characters", 400);
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.mustChangePassword = false;
    user.refreshTokenHash = undefined; // পাসওয়ার্ড বদলালে পুরনো সেশন সব invalid হয়ে যাবে
    await user.save();

    res.clearCookie("refreshToken", { path: "/api/auth" });
    res.json({ message: "Password updated successfully. Please login again." });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) throw new AppError("User not found", 404);
    res.json(user);
  } catch (err) {
    next(err);
  }
};