import path from "node:path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { decretosRouter } from "./modules/decretos/decretos.routes.js";
import { importacionesRouter } from "./modules/importaciones/importaciones.routes.js";
import { senalesRouter } from "./modules/senales/senales.routes.js";
import { siniestrosRouter } from "./modules/siniestros/siniestros.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "sinvial-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/siniestros", siniestrosRouter);
app.use("/api/importaciones", importacionesRouter);
app.use("/api/decretos", decretosRouter);
app.use("/api/senales", senalesRouter);

app.use(notFoundHandler);
app.use(errorHandler);
