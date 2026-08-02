"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
// রিফ্রেশ টোকেন DB তে plain text রাখা হয় না — sha256 hash রাখা হয়
// (bcrypt নয়, কারণ টোকেন এমনিতেই random ও লম্বা — শুধু plain-text leak ঠেকানোই উদ্দেশ্য)
const hashToken = (token) => {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
};
exports.hashToken = hashToken;
