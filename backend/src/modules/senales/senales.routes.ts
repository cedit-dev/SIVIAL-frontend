import { Router } from "express";

import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRoles } from "../../middleware/auth.js";
import { AppError } from "../../middleware/errorHandler.js";
import { senalFiltersSchema, senalPayloadSchema } from "./senales.schemas.js";
import { createSenal, deleteSenal, listSenales, updateSenal } from "./senales.repository.js";

export const senalesRouter = Router();

senalesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const filters = senalFiltersSchema.parse(req.query);
    res.json(await listSenales(filters.tipo));
  })
);

senalesRouter.post(
  "/",
  requireAuth,
  requireRoles("admin", "editor"),
  asyncHandler(async (req, res) => {
    const payload = senalPayloadSchema.parse(req.body);
    res.status(201).json(await createSenal(payload));
  })
);

senalesRouter.put(
  "/:id",
  requireAuth,
  requireRoles("admin", "editor"),
  asyncHandler(async (req, res) => {
    const payload = senalPayloadSchema.parse(req.body);
    const senal = await updateSenal(req.params.id, payload);
    if (!senal) throw new AppError(404, "Traffic sign not found");
    res.json(senal);
  })
);

senalesRouter.delete(
  "/:id",
  requireAuth,
  requireRoles("admin", "editor"),
  asyncHandler(async (req, res) => {
    const deleted = await deleteSenal(req.params.id);
    if (!deleted) throw new AppError(404, "Traffic sign not found");
    res.status(204).send();
  })
);
