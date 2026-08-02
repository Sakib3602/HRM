"use strict";
// এই স্ক্রিপ্টটা একবারই চালাবে, প্রথম HR অ্যাডমিন ইউজার বানানোর জন্য
// রান করার কমান্ড: npm run seed:admin
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User/User");
const run = async () => {
    await (0, db_1.connectDB)();
    const email = "sakibs@gmail.com";
    const plainPassword = "sakib@gmail.com";
    const exists = await User_1.User.findOne({ email });
    if (exists) {
        console.log("HR admin already exists:", email);
        process.exit(0);
    }
    const passwordHash = await bcryptjs_1.default.hash(plainPassword, 12);
    const hr = await User_1.User.create({
        name: "HR Admin",
        email,
        passwordHash,
        role: "hr",
        department: "Human Resources",
        mustChangePassword: true,
    });
    console.log("✅ HR admin created:");
    console.log("   email:   ", hr.email);
    console.log("   password:", plainPassword);
    await mongoose_1.default.disconnect();
    process.exit(0);
};
run().catch((err) => {
    console.error(err);
    process.exit(1);
});
