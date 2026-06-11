import fs from "node:fs";
import path from "node:path";
import { parse as parseCsv } from "csv-parse/sync";
import xlsx from "xlsx";

import {
  buildDescription,
  normalizeAccidentType,
  normalizeDay,
  normalizeGravity,
  normalizeHeader,
  normalizeVehicle,
  parseDate,
  parseInteger,
  parseOptionalInteger,
  parseTime,
  type Vehicle
} from "./normalizers.js";

export interface NormalizedAccidentInput {
  numero: number | null;
  fecha: string;
  hora: string;
  dia: string;
  viaKmSitio: string;
  claseAccidente: string;
  fallecidoRaw: string | null;
  lesionadoRaw: string | null;
  zona: string | null;
  vehiculo1: string | null;
  vehiculo2: string | null;
  vehiculo3: string | null;
  condicionLesionado: string | null;
  condicionFallecido: string | null;
  sexo: string | null;
  edad: number | null;
  hipotesis: string | null;
  tipo: string;
  gravedad: string;
  victimas: number;
  fallecidos: number;
  lesionados: number;
  vehiculosInvolucrados: Vehicle[];
  via: string;
  descripcion: string;
  diaSemana: string;
  lat?: number | null;
  lng?: number | null;
  geocodingStatus: "pending" | "located" | "failed" | "manual";
}

export interface ParsedAccidentFile {
  rows: NormalizedAccidentInput[];
  errors: Array<{ row: number; message: string }>;
}

const HEADER_ALIASES: Record<string, string> = {
  NO: "numero",
  N: "numero",
  NUMERO: "numero",
  FECHA: "fecha",
  HORA: "hora",
  DIA: "dia",
  VIA_KM_SITIO: "viaKmSitio",
  VIA_KILOMETRO_SITIO: "viaKmSitio",
  CLASE_ACCIDENTE: "claseAccidente",
  FALLECIDO: "fallecido",
  FALLECI_DO: "fallecido",
  LESIONADO: "lesionado",
  LESIO_NADO: "lesionado",
  ZONA: "zona",
  VEHICULO_1: "vehiculo1",
  VEHICULO_2: "vehiculo2",
  VEHICULO_3: "vehiculo3",
  CONDICION_LESIONADO: "condicionLesionado",
  CONDICION_FALLECIDO: "condicionFallecido",
  SEXO: "sexo",
  EDAD: "edad",
  HIPOTESIS: "hipotesis"
};

function readRows(filePath: string): unknown[][] {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".csv") {
    const content = fs.readFileSync(filePath, "utf8");
    return parseCsv(content, {
      bom: true,
      relaxColumnCount: true,
      skipEmptyLines: false
    }) as unknown[][];
  }

  const workbook = xlsx.readFile(filePath, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: "" }) as unknown[][];
}

function findHeaderRow(rows: unknown[][]) {
  return rows.findIndex((row) => {
    const headers = row.map(normalizeHeader);
    return headers.includes("FECHA") && headers.includes("HORA") && headers.some((header) => header.includes("VIA"));
  });
}

function mapRow(headers: string[], values: unknown[]) {
  return headers.reduce<Record<string, unknown>>((result, header, index) => {
    const key = HEADER_ALIASES[normalizeHeader(header)];
    if (key) result[key] = values[index];
    return result;
  }, {});
}

function toNullableText(value: unknown) {
  const text = String(value ?? "").trim();
  return text && text !== "*" ? text : null;
}

function normalizeRow(raw: Record<string, unknown>): NormalizedAccidentInput {
  const fecha = parseDate(raw.fecha);
  const hora = parseTime(raw.hora);
  const lesionados = parseInteger(raw.lesionado);
  const fallecidos = parseInteger(raw.fallecido);
  const tipo = normalizeAccidentType(raw.claseAccidente);
  const gravedad = normalizeGravity(fallecidos, lesionados);
  const vehiculos = [raw.vehiculo1, raw.vehiculo2, raw.vehiculo3]
    .map(normalizeVehicle)
    .filter((vehicle): vehicle is Vehicle => Boolean(vehicle));
  const via = String(raw.viaKmSitio ?? "").trim();
  const diaSemana = normalizeDay(raw.dia, fecha);
  const hipotesis = toNullableText(raw.hipotesis);

  return {
    numero: parseOptionalInteger(raw.numero),
    fecha,
    hora,
    dia: String(raw.dia ?? "").trim(),
    viaKmSitio: via,
    claseAccidente: String(raw.claseAccidente ?? "").trim(),
    fallecidoRaw: toNullableText(raw.fallecido),
    lesionadoRaw: toNullableText(raw.lesionado),
    zona: toNullableText(raw.zona),
    vehiculo1: toNullableText(raw.vehiculo1),
    vehiculo2: toNullableText(raw.vehiculo2),
    vehiculo3: toNullableText(raw.vehiculo3),
    condicionLesionado: toNullableText(raw.condicionLesionado),
    condicionFallecido: toNullableText(raw.condicionFallecido),
    sexo: toNullableText(raw.sexo),
    edad: parseOptionalInteger(raw.edad),
    hipotesis,
    tipo,
    gravedad,
    victimas: fallecidos + lesionados,
    fallecidos,
    lesionados,
    vehiculosInvolucrados: vehiculos,
    via,
    descripcion: buildDescription({ gravedad, via, vehicles: vehiculos, hipotesis }),
    diaSemana,
    lat: null,
    lng: null,
    geocodingStatus: "pending"
  };
}

export function parseAccidentFile(filePath: string): ParsedAccidentFile {
  const rows = readRows(filePath);
  const headerIndex = findHeaderRow(rows);

  if (headerIndex < 0) {
    return {
      rows: [],
      errors: [{ row: 0, message: "Could not find official accident headers" }]
    };
  }

  const headers = rows[headerIndex].map(String);
  const dataRows = rows.slice(headerIndex + 1);
  const parsed: NormalizedAccidentInput[] = [];
  const errors: ParsedAccidentFile["errors"] = [];

  dataRows.forEach((row, index) => {
    if (!row.some((value) => String(value ?? "").trim())) return;

    try {
      const mapped = mapRow(headers, row);
      parsed.push(normalizeRow(mapped));
    } catch (error) {
      errors.push({
        row: headerIndex + index + 2,
        message: error instanceof Error ? error.message : "Unknown parse error"
      });
    }
  });

  return { rows: parsed, errors };
}
