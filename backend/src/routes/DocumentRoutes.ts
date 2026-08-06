import { Router } from "express";
import { protect, hrOnly } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { uploadDocument, getDocuments, getStorageInfo, deleteDocument } from "../controllers/DocumentController";

const router = Router();

router.use(protect);
router.use(hrOnly);

router.get("/storage", getStorageInfo); 
router.get("/", getDocuments);
router.post("/", upload.single("file"), uploadDocument);
router.delete("/:id", deleteDocument);

export default router;