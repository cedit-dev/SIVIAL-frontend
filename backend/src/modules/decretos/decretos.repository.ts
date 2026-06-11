import { pool } from "../../db/pool.js";
import type { DecretoFilters, DecretoPayload } from "./decretos.schemas.js";

interface DecretoRow {
  id: string;
  numero: string;
  titulo: string;
  categoria: string;
  fecha_expedicion: string;
  fecha_vigencia: string | null;
  estado: string;
  descripcion: string | null;
  archivo_url: string;
  archivo_nombre: string;
  archivo_tamano: number;
  creado_por: string | null;
  creado_en: string;
  actualizado_en: string;
}

function toResponse(row: DecretoRow) {
  return {
    id: row.id,
    numero: row.numero,
    titulo: row.titulo,
    categoria: row.categoria,
    fechaExpedicion: row.fecha_expedicion,
    fechaVigencia: row.fecha_vigencia,
    estado: row.estado,
    descripcion: row.descripcion ?? "",
    archivoUrl: row.archivo_url,
    archivoNombre: row.archivo_nombre,
    archivoTamano: row.archivo_tamano,
    creadoPor: row.creado_por,
    creadoEn: row.creado_en,
    actualizadoEn: row.actualizado_en
  };
}

function buildWhere(filters: DecretoFilters) {
  const clauses: string[] = [];
  const values: unknown[] = [];

  if (filters.categoria && filters.categoria !== "all") {
    values.push(filters.categoria);
    clauses.push(`categoria = $${values.length}`);
  }
  if (filters.estado && filters.estado !== "all") {
    values.push(filters.estado);
    clauses.push(`estado = $${values.length}`);
  }
  if (filters.year && filters.year !== "all") {
    values.push(`${filters.year}%`);
    clauses.push(`fecha_expedicion::text like $${values.length}`);
  }
  if (filters.busqueda) {
    values.push(`%${filters.busqueda}%`);
    clauses.push(`(numero ilike $${values.length} or titulo ilike $${values.length} or descripcion ilike $${values.length})`);
  }

  return {
    where: clauses.length ? `where ${clauses.join(" and ")}` : "",
    values
  };
}

export async function listDecretos(filters: DecretoFilters) {
  const { where, values } = buildWhere(filters);
  const countResult = await pool.query<{ total: string }>(`select count(*)::int as total from decretos ${where}`, values);
  const total = Number(countResult.rows[0]?.total ?? 0);
  const offset = (filters.page - 1) * filters.limit;
  const result = await pool.query<DecretoRow>(
    `select * from decretos ${where}
     order by fecha_expedicion desc, creado_en desc
     limit $${values.length + 1} offset $${values.length + 2}`,
    [...values, filters.limit, offset]
  );

  return {
    data: result.rows.map(toResponse),
    page: filters.page,
    limit: filters.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / filters.limit))
  };
}

export async function findDecretoById(id: string) {
  const result = await pool.query<DecretoRow>("select * from decretos where id = $1", [id]);
  return result.rows[0] ? toResponse(result.rows[0]) : null;
}

export async function createDecreto(payload: DecretoPayload, file: Express.Multer.File, userId?: string) {
  const result = await pool.query<DecretoRow>(
    `insert into decretos (
      numero, titulo, categoria, fecha_expedicion, fecha_vigencia, estado, descripcion,
      archivo_url, archivo_nombre, archivo_tamano, creado_por
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    returning *`,
    [
      payload.numero,
      payload.titulo,
      payload.categoria,
      payload.fechaExpedicion,
      payload.fechaVigencia ?? null,
      payload.estado,
      payload.descripcion ?? null,
      file.path_url,
      file.originalname,
      file.size,
      userId ?? null
    ]
  );
  return toResponse(result.rows[0]);
}

export async function updateDecreto(id: string, payload: DecretoPayload, file?: Express.Multer.File) {
  const result = await pool.query<DecretoRow>(
    `update decretos set
      numero=$2, titulo=$3, categoria=$4, fecha_expedicion=$5, fecha_vigencia=$6,
      estado=$7, descripcion=$8,
      archivo_url=coalesce($9, archivo_url),
      archivo_nombre=coalesce($10, archivo_nombre),
      archivo_tamano=coalesce($11, archivo_tamano),
      actualizado_en=now()
    where id=$1
    returning *`,
    [
      id,
      payload.numero,
      payload.titulo,
      payload.categoria,
      payload.fechaExpedicion,
      payload.fechaVigencia ?? null,
      payload.estado,
      payload.descripcion ?? null,
      file?.path_url ?? null,
      file?.originalname ?? null,
      file?.size ?? null
    ]
  );
  return result.rows[0] ? toResponse(result.rows[0]) : null;
}

export async function patchDecretoEstado(id: string, estado: string) {
  const result = await pool.query<DecretoRow>(
    "update decretos set estado=$2, actualizado_en=now() where id=$1 returning *",
    [id, estado]
  );
  return result.rows[0] ? toResponse(result.rows[0]) : null;
}

export async function deleteDecreto(id: string) {
  const result = await pool.query("delete from decretos where id=$1", [id]);
  return (result.rowCount ?? 0) > 0;
}
