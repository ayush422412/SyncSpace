import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  shareDocument,
} from "../controllers/documentController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  createDocument
);

router.get(
  "/",
  protect,
  getDocuments
);

router.get(
  "/:id",
  protect,
  getDocumentById
);

router.put(
  "/:id",
  protect,
  updateDocument
);

router.post(
  "/:id/share",
  protect,
  shareDocument
);

export default router;