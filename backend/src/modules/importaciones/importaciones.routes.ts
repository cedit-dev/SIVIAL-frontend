import { Router } from "express";

import { pool } from "../../db/pool.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRoles } from "../../middleware/auth.js";
import { AppError } from "../../middleware/errorHandler.js";

export const importacionesRouter = Router();

importacionesRouter.get(
  "/:id",
  requireAuth,
  requireRoles("admin", "editor"),
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `select id, filename, source_file_path, source_pdf_path, status, total_rows,
        imported_rows, error_rows, errors, created_by, created_at, completed_at
       from import_batches
       where id = $1`,
      [req.params.id]
    );

    if (!result.rows[0]) {
      throw new AppError(404, "Import batch not found");
    }

    res.json(result.rows[0]);
  })
);
