import path from "node:path";
import { Router } from "express";

import { pool } from "../../db/pool.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRoles } from "../../middleware/auth.js";
import { AppError } from "../../middleware/errorHandler.js";
import { upload, publicUploadPath } from "../../middleware/upload.js";
import { parseAccidentFile } from "../../utils/accidentParser.js";
import { accidentFiltersSchema, accidentPayloadSchema } from "./siniestros.schemas.js";
import { buildStats } from "./siniestros.stats.js";
import {
  deleteAccident,
  findAccidentById,
  insertAccident,
  listAccidents,
  updateAccident,
  withTransaction
} from "./siniestros.repository.js";

export const siniestrosRouter = Router();

siniestrosRouter.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const filters = accidentFiltersSchema.parse({ ...req.query, page: 1, limit: 5000 });
    const response = await listAccidents(filters);
    res.json(buildStats(response.data.map((item) => ({
      tipo: item.tipo,
      gravedad: item.gravedad,
      dia_semana: item.dia_semana,
      hora: item.hora,
      fecha: item.fecha,
      via: item.via,
      victimas: item.victimas,
      fallecidos: item.fallecidos,
      vehiculos_involucrados: item.vehiculos_involucrados
    }))));
  })
);

siniestrosRouter.post(
  "/import",
  requireAuth,
  requireRoles("admin", "editor"),
  upload.fields([
    { name: "archivo", maxCount: 1 },
    { name: "fuentePdf", maxCount: 1 }
  ]),
  asyncHandler(async (req, res) => {
    const files = req.files as Record<string, Express.Multer.File[]>;
    const sourceFile = files?.archivo?.[0];
    const sourcePdf = files?.fuentePdf?.[0];

    if (!sourceFile) {
      throw new AppError(400, "archivo is required");
    }

    const extension = path.extname(sourceFile.originalname).toLowerCase();
    const isPdfOnly = extension === ".pdf";
    const parsed = isPdfOnly ? { rows: [], errors: [{ row: 0, message: "PDF stored as source only; upload CSV/XLSX to import rows" }] } : parseAccidentFile(sourceFile.path);

    const batch = await withTransaction(async (client) => {
      const batchResult = await client.query<{ id: string }>(
        `insert into import_batches (
          filename, source_file_path, source_pdf_path, status, total_rows, imported_rows, error_rows, errors, created_by
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        returning id`,
        [
          sourceFile.originalname,
          publicUploadPath(sourceFile.path),
          sourcePdf ? publicUploadPath(sourcePdf.path) : isPdfOnly ? publicUploadPath(sourceFile.path) : null,
          "processing",
          parsed.rows.length + parsed.errors.length,
          0,
          parsed.errors.length,
          JSON.stringify(parsed.errors),
          req.user?.id ?? null
        ]
      );
      const batchId = batchResult.rows[0].id;
      let importedRows = 0;

      for (const row of parsed.rows) {
        await insertAccident(accidentPayloadSchema.parse(row), batchId, client);
        importedRows += 1;
      }

      const status = parsed.errors.length ? "completed_with_errors" : "completed";
      await client.query(
        `update import_batches
         set status=$2, imported_rows=$3, error_rows=$4, errors=$5, completed_at=now()
         where id=$1`,
        [batchId, status, importedRows, parsed.errors.length, JSON.stringify(parsed.errors)]
      );

      return {
        id: batchId,
        status,
        totalRows: parsed.rows.length + parsed.errors.length,
        importedRows,
        errorRows: parsed.errors.length,
        errors: parsed.errors
      };
    });

    res.status(201).json(batch);
  })
);

siniestrosRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const filters = accidentFiltersSchema.parse(req.query);
    res.json(await listAccidents(filters));
  })
);

siniestrosRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const accident = await findAccidentById(req.params.id);
    if (!accident) throw new AppError(404, "Accident not found");
    res.json(accident);
  })
);

siniestrosRouter.post(
  "/",
  requireAuth,
  requireRoles("admin", "editor"),
  asyncHandler(async (req, res) => {
    const payload = accidentPayloadSchema.parse(req.body);
    res.status(201).json(await insertAccident(payload));
  })
);

siniestrosRouter.put(
  "/:id",
  requireAuth,
  requireRoles("admin", "editor"),
  asyncHandler(async (req, res) => {
    const payload = accidentPayloadSchema.parse(req.body);
    const accident = await updateAccident(req.params.id, payload);
    if (!accident) throw new AppError(404, "Accident not found");
    res.json(accident);
  })
);

siniestrosRouter.delete(
  "/:id",
  requireAuth,
  requireRoles("admin", "editor"),
  asyncHandler(async (req, res) => {
    const deleted = await deleteAccident(req.params.id);
    if (!deleted) throw new AppError(404, "Accident not found");
    res.status(204).send();
  })
);
