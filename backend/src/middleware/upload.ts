import fs from "node:fs";
import path from "node:path";
import multer from "multer";

import { env } from "../config/env.js";

const uploadRoot = path.resolve(env.UPLOAD_DIR);
fs.mkdirSync(uploadRoot, { recursive: true });
fs.mkdirSync(path.join(uploadRoot, "decretos"), { recursive: true });
fs.mkdirSync(path.join(uploadRoot, "imports"), { recursive: true });

function safeFileName(originalName: string) {
  const ext = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, ext)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();

  return `${base || "archivo"}-${Date.now()}${ext}`;
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const route = `${req.baseUrl}${req.path}`;
    const folder = route.includes("/decretos") ? "decretos" : "imports";
    const destination = path.join(uploadRoot, folder);
    fs.mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (_req, file, cb) => cb(null, safeFileName(file.originalname))
});

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

export function publicUploadPath(filePath: string) {
  const relative = path.relative(uploadRoot, filePath).replaceAll(path.sep, "/");
  return `/uploads/${relative}`;
}
