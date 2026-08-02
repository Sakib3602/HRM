"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const PORT = process.env.PORT || 5000;
// দুর্বল/ডিফল্ট secret দিয়ে সার্ভার যাতে ভুলেও প্রোডাকশনে না চলে
const checkSecrets = () => {
    const access = process.env.JWT_ACCESS_SECRET || "";
    const refresh = process.env.JWT_REFRESH_SECRET || "";
    if (access.length < 32 || refresh.length < 32) {
        console.warn("⚠️  JWT secrets খুব ছোট/দুর্বল। প্রোডাকশনে যাওয়ার আগে অন্তত ৩২ ক্যারেক্টারের random string বসাও।\n" +
            "   জেনারেট করতে: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"");
    }
    if (process.env.NODE_ENV === "production" && (access === refresh)) {
        throw new Error("JWT_ACCESS_SECRET ও JWT_REFRESH_SECRET আলাদা হতে হবে");
    }
};
const start = async () => {
    checkSecrets();
    await (0, db_1.connectDB)();
    app_1.default.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
};
start();
