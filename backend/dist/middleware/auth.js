"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hrOnly = exports.protect = void 0;
const token_1 = require("../utils/token");
// লগইন করা যেকোনো ইউজারের জন্য — টোকেন চেক করবে
const protect = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized, token missing" });
    }
    const token = header.split(" ")[1];
    try {
        const decoded = (0, token_1.verifyAccessToken)(token);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Not authorized, token invalid or expired" });
    }
};
exports.protect = protect;
// শুধু HR এর জন্য route গার্ড করা
const hrOnly = (req, res, next) => {
    if (req.user?.role !== "hr") {
        return res.status(403).json({ message: "Access denied — HR only" });
    }
    next();
};
exports.hrOnly = hrOnly;
