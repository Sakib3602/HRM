import rateLimit from "express-rate-limit";

// ১৫ মিনিটে একটা IP থেকে সর্বোচ্চ ১০ বার লগইন চেষ্টা করা যাবে
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
});