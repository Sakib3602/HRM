import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";


export const protect = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token invalid or expired" });
  }
};

// শুধু HR এর জন্য route গার্ড করা
export const hrOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "hr") {
    return res.status(403).json({ message: "Access denied — HR only" });
  }
  next();
};