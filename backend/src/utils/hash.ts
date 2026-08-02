import crypto from "crypto";

// রিফ্রেশ টোকেন DB তে plain text রাখা হয় না — sha256 hash রাখা হয়
// (bcrypt নয়, কারণ টোকেন এমনিতেই random ও লম্বা — শুধু plain-text leak ঠেকানোই উদ্দেশ্য)
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};