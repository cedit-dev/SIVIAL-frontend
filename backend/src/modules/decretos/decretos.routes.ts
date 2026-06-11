import { Router } from "express";

import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRoles } from "../../middleware/auth.js";
import { AppError } from "../../middleware/errorHandler.js";
import { publicUploadPath, upload } from "../../middleware/upload.js";
import {
  decretoEstadoPayloadSchema,
  decretoFiltersSchema,
  decretoPayloadSchema
} from "./decretos.schemas.js";
import {
  createDecreto,
  deleteDecreto,
  findDecretoById,
  listDecretos,
  patchDecretoEstado,
  updateDecreto
} from "./decretos.repository.js";

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        path_url?: string;
      }
    }
  }
}

export const decretosRouter = Router();

function withPublicPath(file?: Express.Multer.File) {
  if (file) file.path_url = publicUploadPath(file.path);
  return file;
}

decretosRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const filters = decretoFiltersSchema.parse(req.query);
    res.json(await listDecretos(filters));
  })
);

decretosRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const decreto = await findDecretoById(req.params.id);
    if (!decreto) throw new AppError(404, "Decreto not found");
    res.json(decreto);
  })
);

decretosRouter.post(
  "/",
  requireAuth,
  requireRoles("admin", "editor"),
  upload.single("archivo"),
  asyncHandler(async (req, res) => {
    const file = withPublicPath(req.file);
    if (!file) throw new AppError(400, "PDF file is required");
    const payload = decretoPayloadSchema.parse(req.body);
    res.status(201).json(await createDecreto(payload, file, req.user?.id));
  })
);

decretosRouter.put(
  "/:id",
  requireAuth,
  requireRoles("admin", "editor"),
  upload.single("archivo"),
  asyncHandler(async (req, res) => {
    const payload = decretoPayloadSchema.parse(req.body);
    const decreto = await updateDecreto(req.params.id, payload, withPublicPath(req.file));
    if (!decreto) throw new AppError(404, "Decreto not found");
    res.json(decreto);
  })
);

decretosRouter.patch(
  "/:id/estado",
  requireAuth,
  requireRoles("admin", "editor"),
  asyncHandler(async (req, res) => {
    const body = decretoEstadoPayloadSchema.parse(req.body);
    const decreto = await patchDecretoEstado(req.params.id, body.estado);
    if (!decreto) throw new AppError(404, "Decreto not found");
    res.json(decreto);
  })
);

decretosRouter.delete(
  "/:id",
  requireAuth,
  requireRoles("admin", "editor"),
  asyncHandler(async (req, res) => {
    const deleted = await deleteDecreto(req.params.id);
    if (!deleted) throw new AppError(404, "Decreto not found");
    res.status(204).send();
  })
);
