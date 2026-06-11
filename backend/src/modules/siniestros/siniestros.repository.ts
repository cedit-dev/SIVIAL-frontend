import type { PoolClient } from "pg";

import { pool, type Queryable } from "../../db/pool.js";
import type { AccidentFilters, AccidentPayload } from "./siniestros.schemas.js";

export interface AccidentRecord {
  id: string;
  numero: number | null;
  fecha: string;
  hora: string;
  dia: string | null;
  via_km_sitio: string | null;
  clase_accidente: string | null;
  fallecido_raw: string | null;
  lesionado_raw: string | null;
  zona: string | null;
  vehiculo_1: string | null;
  vehiculo_2: string | null;
  vehiculo_3: string | null;
  condicion_lesionado: string | null;
  condicion_fallecido: string | null;
  sexo: string | null;
  edad: number | null;
  hipotesis: string | null;
  tipo: string;
  gravedad: string;
  victimas: number;
  fallecidos: number;
  lesionados: number;
  via: string;
  descripcion: string;
  dia_semana: string;
  lat: number | null;
  lng: number | null;
  geocoding_status: string;
  import_batch_id: string | null;
  created_at: string;
  updated_at: string;
  vehiculos_involucrados: string[];
}

function toResponse(row: AccidentRecord) {
  return {
    id: row.id,
    numero: row.numero,
    fecha: row.fecha,
    hora: row.hora,
    dia: row.dia,
    viaKmSitio: row.via_km_sitio,
    claseAccidente: row.clase_accidente,
    fallecidoRaw: row.fallecido_raw,
    lesionadoRaw: row.lesionado_raw,
    zona: row.zona,
    vehiculo1: row.vehiculo_1,
    vehiculo2: row.vehiculo_2,
    vehiculo3: row.vehiculo_3,
    condicionLesionado: row.condicion_lesionado,
    condicionFallecido: row.condicion_fallecido,
    sexo: row.sexo,
    edad: row.edad,
    hipotesis: row.hipotesis,
    tipo: row.tipo,
    gravedad: row.gravedad,
    victimas: row.victimas,
    fallecidos: row.fallecidos,
    lesionados: row.lesionados,
    vehiculos_involucrados: row.vehiculos_involucrados ?? [],
    via: row.via,
    descripcion: row.descripcion,
    dia_semana: row.dia_semana,
    lat: row.lat === null ? null : Number(row.lat),
    lng: row.lng === null ? null : Number(row.lng),
    geocodingStatus: row.geocoding_status,
    importBatchId: row.import_batch_id,
    creadoEn: row.created_at,
    actualizadoEn: row.updated_at
  };
}

function addArrayFilter(
  clauses: string[],
  values: unknown[],
  field: string,
  rawValue?: string
) {
  if (!rawValue) return;
  const list = rawValue.split(",").map((item) => item.trim()).filter(Boolean);
  if (!list.length) return;
  values.push(list);
  clauses.push(`${field} = any($${values.length})`);
}

function buildWhere(filters: AccidentFilters) {
  const clauses: string[] = [];
  const values: unknown[] = [];

  if (filters.fechaInicio) {
    values.push(filters.fechaInicio);
    clauses.push(`a.fecha >= $${values.length}`);
  }
  if (filters.fechaFin) {
    values.push(filters.fechaFin);
    clauses.push(`a.fecha <= $${values.length}`);
  }

  addArrayFilter(clauses, values, "a.tipo", filters.tipo);
  addArrayFilter(clauses, values, "a.gravedad", filters.gravedad);
  addArrayFilter(clauses, values, "a.dia_semana", filters.dia);

  if (filters.vehiculo) {
    const vehicles = filters.vehiculo.split(",").map((item) => item.trim()).filter(Boolean);
    if (vehicles.length) {
      values.push(vehicles);
      clauses.push(`exists (
        select 1 from accident_vehicles avf
        where avf.accident_id = a.id and avf.vehicle_type = any($${values.length})
      )`);
    }
  }

  if (filters.horaInicio !== undefined) {
    values.push(filters.horaInicio);
    clauses.push(`extract(hour from a.hora::time) >= $${values.length}`);
  }
  if (filters.horaFin !== undefined) {
    values.push(filters.horaFin);
    clauses.push(`extract(hour from a.hora::time) < $${values.length}`);
  }
  if (filters.zona) {
    values.push(filters.zona);
    clauses.push(`a.zona = $${values.length}`);
  }
  if (filters.busqueda) {
    values.push(`%${filters.busqueda}%`);
    clauses.push(`(a.via ilike $${values.length} or a.via_km_sitio ilike $${values.length} or a.descripcion ilike $${values.length} or a.hipotesis ilike $${values.length})`);
  }
  if (filters.conCoordenadas !== undefined) {
    clauses.push(filters.conCoordenadas ? "a.lat is not null and a.lng is not null" : "(a.lat is null or a.lng is null)");
  }

  return {
    where: clauses.length ? `where ${clauses.join(" and ")}` : "",
    values
  };
}

const selectAccidentsSql = `
  select
    a.*,
    coalesce(array_remove(array_agg(av.vehicle_type order by av.position), null), '{}') as vehiculos_involucrados
  from accidents a
  left join accident_vehicles av on av.accident_id = a.id
`;

export async function listAccidents(filters: AccidentFilters) {
  const { where, values } = buildWhere(filters);
  const countResult = await pool.query<{ total: string }>(`select count(*)::int as total from accidents a ${where}`, values);
  const total = Number(countResult.rows[0]?.total ?? 0);
  const offset = (filters.page - 1) * filters.limit;

  const listResult = await pool.query<AccidentRecord>(
    `${selectAccidentsSql}
     ${where}
     group by a.id
     order by a.fecha desc, a.hora desc
     limit $${values.length + 1} offset $${values.length + 2}`,
    [...values, filters.limit, offset]
  );

  return {
    data: listResult.rows.map(toResponse),
    page: filters.page,
    limit: filters.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / filters.limit))
  };
}

export async function findAccidentById(id: string) {
  const result = await pool.query<AccidentRecord>(
    `${selectAccidentsSql} where a.id = $1 group by a.id`,
    [id]
  );
  return result.rows[0] ? toResponse(result.rows[0]) : null;
}

export async function insertAccident(payload: AccidentPayload, importBatchId?: string | null, queryable: Queryable = pool) {
  const result = await queryable.query<AccidentRecord>(
    `insert into accidents (
      numero, fecha, hora, dia, via_km_sitio, clase_accidente, fallecido_raw, lesionado_raw,
      zona, vehiculo_1, vehiculo_2, vehiculo_3, condicion_lesionado, condicion_fallecido,
      sexo, edad, hipotesis, tipo, gravedad, victimas, fallecidos, lesionados, via,
      descripcion, dia_semana, lat, lng, geocoding_status, import_batch_id, geom
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,
      $24,$25,$26,$27,$28,$29,
      case when $26::double precision is not null and $27::double precision is not null
        then ST_SetSRID(ST_MakePoint($27::double precision, $26::double precision), 4326)::geography
        else null
      end
    )
    returning *`,
    [
      payload.numero ?? null,
      payload.fecha,
      payload.hora,
      payload.dia ?? null,
      payload.viaKmSitio ?? null,
      payload.claseAccidente ?? null,
      payload.fallecidoRaw ?? null,
      payload.lesionadoRaw ?? null,
      payload.zona ?? null,
      payload.vehiculo1 ?? null,
      payload.vehiculo2 ?? null,
      payload.vehiculo3 ?? null,
      payload.condicionLesionado ?? null,
      payload.condicionFallecido ?? null,
      payload.sexo ?? null,
      payload.edad ?? null,
      payload.hipotesis ?? null,
      payload.tipo,
      payload.gravedad,
      payload.victimas,
      payload.fallecidos,
      payload.lesionados,
      payload.via,
      payload.descripcion,
      payload.diaSemana,
      payload.lat ?? null,
      payload.lng ?? null,
      payload.geocodingStatus,
      importBatchId ?? null
    ]
  );

  const accident = result.rows[0];
  await replaceAccidentVehicles(accident.id, payload.vehiculosInvolucrados, queryable);
  const saved = await queryable.query<AccidentRecord>(
    `${selectAccidentsSql} where a.id = $1 group by a.id`,
    [accident.id]
  );
  return toResponse(saved.rows[0]);
}

export async function updateAccident(id: string, payload: AccidentPayload) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await client.query<AccidentRecord>(
      `update accidents set
        numero=$2, fecha=$3, hora=$4, dia=$5, via_km_sitio=$6, clase_accidente=$7,
        fallecido_raw=$8, lesionado_raw=$9, zona=$10, vehiculo_1=$11, vehiculo_2=$12,
        vehiculo_3=$13, condicion_lesionado=$14, condicion_fallecido=$15, sexo=$16,
        edad=$17, hipotesis=$18, tipo=$19, gravedad=$20, victimas=$21, fallecidos=$22,
        lesionados=$23, via=$24, descripcion=$25, dia_semana=$26, lat=$27, lng=$28,
        geocoding_status=$29,
        geom = case when $27::double precision is not null and $28::double precision is not null
          then ST_SetSRID(ST_MakePoint($28::double precision, $27::double precision), 4326)::geography
          else null
        end,
        updated_at=now()
      where id=$1
      returning *`,
      [
        id,
        payload.numero ?? null,
        payload.fecha,
        payload.hora,
        payload.dia ?? null,
        payload.viaKmSitio ?? null,
        payload.claseAccidente ?? null,
        payload.fallecidoRaw ?? null,
        payload.lesionadoRaw ?? null,
        payload.zona ?? null,
        payload.vehiculo1 ?? null,
        payload.vehiculo2 ?? null,
        payload.vehiculo3 ?? null,
        payload.condicionLesionado ?? null,
        payload.condicionFallecido ?? null,
        payload.sexo ?? null,
        payload.edad ?? null,
        payload.hipotesis ?? null,
        payload.tipo,
        payload.gravedad,
        payload.victimas,
        payload.fallecidos,
        payload.lesionados,
        payload.via,
        payload.descripcion,
        payload.diaSemana,
        payload.lat ?? null,
        payload.lng ?? null,
        payload.geocodingStatus
      ]
    );

    if (!result.rows[0]) {
      await client.query("rollback");
      return null;
    }

    await replaceAccidentVehicles(id, payload.vehiculosInvolucrados, client);
    await client.query("commit");
    return findAccidentById(id);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteAccident(id: string) {
  const result = await pool.query("delete from accidents where id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function replaceAccidentVehicles(id: string, vehicles: string[], queryable: Queryable = pool) {
  await queryable.query("delete from accident_vehicles where accident_id = $1", [id]);
  for (const [index, vehicle] of vehicles.entries()) {
    await queryable.query(
      "insert into accident_vehicles (accident_id, position, vehicle_type) values ($1, $2, $3)",
      [id, index + 1, vehicle]
    );
  }
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await callback(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
