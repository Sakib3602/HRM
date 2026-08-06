import { Schema, model, Document as MongoDocument, Types } from "mongoose";

export interface IHrDocument extends MongoDocument {
  name: string;
  fileUrl: string;
  publicId: string;
  fileType: string;
  originalFileName: string;
  fileSize: number; // ← নতুন, bytes এ
  uploadedBy: Types.ObjectId;
  company: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const hrDocumentSchema = new Schema<IHrDocument>(
  {
    name: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    fileType: { type: String, required: true },
    originalFileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

export const HrDocument = model<IHrDocument>("HrDocument", hrDocumentSchema);