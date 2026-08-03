// এই স্ক্রিপ্টটা একবারই চালাবে, প্রথম HR অ্যাডমিন ইউজার বানানোর জন্য
// রান করার কমান্ড: npm run seed:admin

import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { connectDB } from "../config/db";

import mongoose from "mongoose";
import { User } from "../models/User/User";

const run = async () => {
  await connectDB();

  const email = "sakibsarker6969@gmail.com";
  const plainPassword = "sakibsarker6969@gmail.com"; 

  const exists = await User.findOne({ email });
  if (exists) {
    console.log("HR admin already exists:", email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(plainPassword, 12);

  const hr = await User.create({
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

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});