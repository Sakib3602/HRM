import multer from "multer";
import { AppError } from "./errorHandler";

const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream",
];

const allowedExtensions = ["pdf", "doc", "docx", "xls", "xlsx"];

const getExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // single file হার্ড ক্যাপ 50MB (company quota আলাদা চেক হবে controller এ)
  fileFilter: (_req, file, cb) => {
    const ext = getExtension(file.originalname);
    const hasAllowedMime = allowedTypes.includes(file.mimetype);
    const hasAllowedExt = allowedExtensions.includes(ext);

    if (hasAllowedMime && hasAllowedExt) {
      cb(null, true);
    } else if (file.mimetype === "application/octet-stream" && hasAllowedExt) {
      // Some browsers/devices send generic MIME types for Office files.
      cb(null, true);
    } else {
      cb(new AppError("Only PDF, DOC, DOCX, XLS, XLSX files are allowed", 400) as any);
    }
  },
});