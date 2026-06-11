import { pool } from "../../db/pool.js";
import type { SenalPayload } from "./senales.schemas.js";

interface SenalRow {
  id: string;
  tipo: string;
  nombre: string;
  descripcion: string;
  lat: number;
  lng: number;
  created_at: string;
  updated_at: string;
}

function toResponse(row: SenalRow) {
  return {
    id: row.id,
    tipo: row.tipo,
    nombre: row.nombre,
    descripcion: row.descripcion,
    lat: Number(row.lat),
    lng: Number(row.lng),
    creadoEn: row.created_at,
    actualizadoEn: row.updated_at
  };
}

export async function listSenales(tipo?: string) {
  const result = tipo
    ? await pool.query<SenalRow>("select * from traffic_signs where tipo=$1 order by nombre asc", [tipo])
    : await pool.query<SenalRow>("select * from traffic_signs order by tipo asc, nombre asc");
  return result.rows.map(toResponse);
}

export async function createSenal(payload: SenalPayload) {
  const result = await pool.query<SenalRow>(
    `insert into traffic_signs (tipo, nombre, descripcion, lat, lng, geom)
     values ($1,$2,$3,$4,$5, ST_SetSRID(ST_MakePoint($5, $4), 4326)::geography)
     returning *`,
    [payload.tipo, payload.nombre, payload.descripcion, payload.lat, payload.lng]
  );
  return toResponse(result.rows[0]);
}

export async function updateSenal(id: string, payload: SenalPayload) {
  const result = await pool.query<SenalRow>(
    `update traffic_signs set
      tipo=$2, nombre=$3, descripcion=$4, lat=$5, lng=$6,
      geom=ST_SetSRID(ST_MakePoint($6, $5), 4326)::geography,
      updated_at=now()
     where id=$1
     returning *`,
    [id, payload.tipo, payload.nombre, payload.descripcion, payload.lat, payload.lng]
  );
  return result.rows[0] ? toResponse(result.rows[0]) : null;
}

export async function deleteSenal(id: string) {
  const result = await pool.query("delete from traffic_signs where id=$1", [id]);
  return (result.rowCount ?? 0) > 0;
}
