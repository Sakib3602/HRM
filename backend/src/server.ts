import dotenv from "dotenv";
dotenv.config();
import app from "./app";

import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5000;

const checkSecrets = () => {
  const access = process.env.JWT_ACCESS_SECRET || "";
  const refresh = process.env.JWT_REFRESH_SECRET || "";
  if (access.length < 32 || refresh.length < 32) {
    console.warn(
      "⚠️  JWT secrets খুব ছোট/দুর্বল। প্রোডাকশনে যাওয়ার আগে অন্তত ৩২ ক্যারেক্টারের random string বসাও।\n" +
      "   জেনারেট করতে: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
    );
  }
  if (process.env.NODE_ENV === "production" && (access === refresh)) {
    throw new Error("JWT_ACCESS_SECRET ও JWT_REFRESH_SECRET আলাদা হতে হবে");
  }
};

const start = async () => {
  checkSecrets();
  await connectDB();

  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

start();