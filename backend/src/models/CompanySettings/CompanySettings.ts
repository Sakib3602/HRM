import { Schema, model, Document } from "mongoose";

export interface ICompanySettings extends Document {
  company: string;
  storageLimitBytes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const DEFAULT_STORAGE_LIMIT = 1 * 1024 * 1024 * 1024; // 1 GB

const companySettingsSchema = new Schema<ICompanySettings>(
  {
    company: { type: String, required: true, unique: true },
    storageLimitBytes: { type: Number, default: DEFAULT_STORAGE_LIMIT },
  },
  { timestamps: true, versionKey: false }
);

export const CompanySettings = model<ICompanySettings>("CompanySettings", companySettingsSchema);
export { DEFAULT_STORAGE_LIMIT };