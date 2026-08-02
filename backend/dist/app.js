"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const UserRoutes_1 = __importDefault(require("./routes/UserRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// রিভার্স প্রক্সির (Render/Railway/Nginx) পিছনে থাকলে secure cookie ঠিকমতো কাজ করার জন্য
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}
app.use((0, helmet_1.default)()); // নিরাপদ HTTP headers (XSS, clickjacking ইত্যাদি থেকে বেসিক সুরক্ষা)
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "*", // ওয়েব ফ্রন্টএন্ডের URL, wildcard credentials এ কাজ করে না
    credentials: true, // cookie পাঠাতে/নিতে এইটা লাগবে
}));
app.use(express_1.default.json({ limit: "1mb" })); // payload size limit — DoS ঠেকানোর ছোট্ট সুরক্ষা
app.use((0, cookie_parser_1.default)());
// health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
});
app.use("/api/auth", AuthRoutes_1.default);
app.use("/api/users", UserRoutes_1.default);
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
exports.default = app;
