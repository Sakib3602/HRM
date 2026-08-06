import { HrDocument } from "../models/Document/Document";
import { CompanySettings, DEFAULT_STORAGE_LIMIT } from "../models/CompanySettings/CompanySettings";

// company এর এখন পর্যন্ত মোট storage ব্যবহার বের করা
export const getCompanyStorageUsage = async (company: string): Promise<number> => {
  const result = await HrDocument.aggregate([
    { $match: { company } },
    { $group: { _id: null, total: { $sum: "$fileSize" } } },
  ]);
  return result[0]?.total || 0;
};

// company এর storage limit বের করা, না থাকলে default দিয়ে তৈরি করে দেওয়া
export const getCompanyStorageLimit = async (company: string): Promise<number> => {
  let settings = await CompanySettings.findOne({ company });
  if (!settings) {
    settings = await CompanySettings.create({ company, storageLimitBytes: DEFAULT_STORAGE_LIMIT });
  }
  return settings.storageLimitBytes;
};

export const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
};