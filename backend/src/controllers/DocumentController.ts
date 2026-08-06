import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import { AppError } from "../middleware/errorHandler";
import { HrDocument } from "../models/Document/Document";
import { getCompanyStorageUsage, getCompanyStorageLimit, formatBytes } from "../utils/storage";

const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "file";
};

const uploadToCloudinary = (buffer: Buffer, filename: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "hrm-documents",
        public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, "")}`,
        use_filename: true,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// POST /api/documents  (HR only)
export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const file = req.file;
    const company = req.user?.company as string;

    if (!name || typeof name !== "string" || !name.trim()) {
      throw new AppError("Document name is required", 400);
    }
    if (!file) {
      throw new AppError("A file is required", 400);
    }

    const trimmedName = name.trim();

    // duplicate নাম চেক
    const existing = await HrDocument.findOne({
      company,
      name: { $regex: `^${trimmedName}$`, $options: "i" },
    });
    if (existing) {
      throw new AppError(
        `A document named "${trimmedName}" already exists. Please choose a different name or delete the old one first.`,
        409
      );
    }

    // ✅ Storage quota চেক
    const [currentUsage, storageLimit] = await Promise.all([
      getCompanyStorageUsage(company),
      getCompanyStorageLimit(company),
    ]);

    if (currentUsage + file.size > storageLimit) {
      const remaining = Math.max(storageLimit - currentUsage, 0);
      throw new AppError(
        `Storage limit reached. You have ${formatBytes(remaining)} left out of ${formatBytes(storageLimit)}. Please delete some files or upgrade your storage.`,
        413 // Payload Too Large
      );
    }

    const result = await uploadToCloudinary(file.buffer, file.originalname);

    const doc = await HrDocument.create({
      name: trimmedName,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      fileType: getFileExtension(file.originalname),
      originalFileName: file.originalname,
      fileSize: file.size,
      uploadedBy: req.user?.id,
      company,
    });

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

// GET /api/documents?search=xxx  (HR only)
export const getDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;
    const company = req.user?.company as string;

    const filter: any = { company };
    if (search && typeof search === "string" && search.trim()) {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    const docs = await HrDocument.find(filter)
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(docs);
  } catch (err) {
    next(err);
  }
};

// ✅ GET /api/documents/storage  (HR only — storage usage বার এর জন্য)
export const getStorageInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = req.user?.company as string;

    const [used, limit] = await Promise.all([
      getCompanyStorageUsage(company),
      getCompanyStorageLimit(company),
    ]);

    res.json({
      usedBytes: used,
      limitBytes: limit,
      usedFormatted: formatBytes(used),
      limitFormatted: formatBytes(limit),
      percentUsed: Math.min(Math.round((used / limit) * 100), 100),
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/documents/:id  (HR only)
export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await HrDocument.findById(req.params.id);
    if (!doc) throw new AppError("Document not found", 404);

    await cloudinary.uploader.destroy(doc.publicId, { resource_type: "raw" });
    await doc.deleteOne();

    res.json({ message: "Document removed" });
  } catch (err) {
    next(err);
  }
};