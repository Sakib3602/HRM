import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import AuthRoutes from "./routes/AuthRoutes";
import UserRoutes from "./routes/UserRoutes";
import { errorHandler, notFound } from "./middleware/errorHandler";



const app: Application = express();


if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet()); // নিরাপদ HTTP headers (XSS, clickjacking ইত্যাদি থেকে বেসিক সুরক্ষা)

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // ওয়েব ফ্রন্টএন্ডের URL, wildcard credentials এ কাজ করে না
    credentials: true, // cookie পাঠাতে/নিতে এইটা লাগবে
  })
);
app.use(express.json({ limit: "1mb" })); // payload size limit — DoS ঠেকানোর ছোট্ট সুরক্ষা
app.use(cookieParser());

// health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to the HRM API" });
});

app.use("/api/auth", AuthRoutes);
app.use("/api/users", UserRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;