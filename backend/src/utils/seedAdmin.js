"use strict";
// এই স্ক্রিপ্টটা একবারই চালাবে, প্রথম HR অ্যাডমিন ইউজার বানানোর জন্য
// রান করার কমান্ড: npm run seed:admin
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.connectDB)();
    const email = "sakibs@gmail.com";
    const plainPassword = "sakib@gmail.com";
    const exists = yield User_1.User.findOne({ email });
    if (exists) {
        console.log("HR admin already exists:", email);
        process.exit(0);
    }
    const passwordHash = yield bcryptjs_1.default.hash(plainPassword, 12);
    const hr = yield User_1.User.create({
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
    yield mongoose_1.default.disconnect();
    process.exit(0);
});
run().catch((err) => {
    console.error(err);
    process.exit(1);
});
