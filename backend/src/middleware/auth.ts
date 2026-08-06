import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";
import { User } from "../models/User/User";


export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select("_id role company isActive refreshTokenHash");
    if (!user || !user.isActive) {
      if (user) {
        user.refreshTokenHash = undefined;
        await user.save();
      }
      res.clearCookie("refreshToken", { path: "/api/auth" });
      return res.status(401).json({ message: "Account is inactive. Please contact HR." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token invalid or expired" });
  }
};

export const hrOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "hr") {
    return res.status(403).json({ message: "Access denied — HR only" });
  }
  next();
};
export const employeeOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "employee") {
    return res.status(403).json({ message: "Access denied — Employee only" });
  }
  next();
};