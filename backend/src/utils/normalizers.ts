import { z } from "zod";

export const accidentTypeSchema = z.enum([
  "choque",
  "atropello",
  "volcamiento",
  "caida_motocicleta",
  "choque_animal",
  "otro"
]);

export const gravitySchema = z.enum(["fatal", "grave", "leve", "solo_danos"]);

export const vehicleSchema = z.enum([
  "automovil",
  "motocicleta",
  "camion",
  "bicicleta",
  "peaton",
  "bus",
  "otro"
]);

export const daySchema = z.enum([
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo"
]);

export type AccidentType = z.infer<typeof accidentTypeSchema>;
export type Gravity = z.infer<typeof gravitySchema>;
export type Vehicle = z.infer<typeof vehicleSchema>;
export type DayName = z.infer<typeof daySchema>;

const MONTHS: Record<string, string> = {
  ene: "01",
  enero: "01",
  feb: "02",
  febrero: "02",
  mar: "03",
  marzo: "03",
  abr: "04",
  abril: "04",
  may: "05",
  mayo: "05",
  jun: "06",
  junio: "06",
  jul: "07",
  julio: "07",
  ago: "08",
  agosto: "08",
  sep: "09",
  sept: "09",
  septiembre: "09",
  oct: "10",
  octubre: "10",
  nov: "11",
  noviembre: "11",
  dic: "12",
  diciembre: "12"
};

const DAYS: Record<string, DayName> = {
  lunes: "lunes",
  martes: "martes",
  miercoles: "miercoles",
  jueves: "jueves",
  viernes: "viernes",
  sabado: "sabado",
  domingo: "domingo"
};

export function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeHeader(value: unknown) {
  return normalizeText(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");
}

export function parseInteger(value: unknown) {
  const text = String(value ?? "").replace(/[^\d-]/g, "");
  if (!text || text === "-") return 0;
  return Number.parseInt(text, 10) || 0;
}

export function parseOptionalInteger(value: unknown) {
  const text = String(value ?? "").replace(/[^\d-]/g, "");
  if (!text || text === "-") return null;
  return Number.parseInt(text, 10);
}

export function parseTime(value: unknown) {
  const raw = String(value ?? "").trim();
  const match = raw.match(/^(\d{1,2}):(\d{1,2})/);
  if (!match) return "00:00";

  const hour = Math.min(Number(match[1]), 23).toString().padStart(2, "0");
  const minute = Math.min(Number(match[2]), 59).toString().padStart(2, "0");
  return `${hour}:${minute}`;
}

export function parseDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number") {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    epoch.setUTCDate(epoch.getUTCDate() + value);
    return epoch.toISOString().slice(0, 10);
  }

  const raw = normalizeText(value).toLowerCase();
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  }

  const slash = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (slash) {
    const year = slash[3].length === 2 ? `20${slash[3]}` : slash[3];
    return `${year}-${slash[2].padStart(2, "0")}-${slash[1].padStart(2, "0")}`;
  }

  const spanish = raw.match(/^(\d{1,2})[-\s]([a-z]+)[-\s](\d{2,4})$/);
  if (spanish) {
    const month = MONTHS[spanish[2]];
    const year = spanish[3].length === 2 ? `20${spanish[3]}` : spanish[3];
    if (month) {
      return `${year}-${month}-${spanish[1].padStart(2, "0")}`;
    }
  }

  throw new Error(`Invalid date value: ${String(value)}`);
}

export function normalizeDay(value: unknown, date?: string): DayName {
  const text = normalizeText(value).toLowerCase();
  if (DAYS[text]) return DAYS[text];

  if (date) {
    const day = new Date(`${date}T00:00:00Z`).getUTCDay();
    return ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"][day] as DayName;
  }

  return "lunes";
}

export function normalizeVehicle(value: unknown): Vehicle | null {
  const text = normalizeText(value).toLowerCase();
  if (!text || text === "*" || text === "null" || text === "undefined") return null;
  if (text.includes("moto")) return "motocicleta";
  if (text.includes("auto") || text.includes("carro") || text.includes("campero")) return "automovil";
  if (text.includes("camion") || text.includes("tracto")) return "camion";
  if (text.includes("bici")) return "bicicleta";
  if (text.includes("peaton")) return "peaton";
  if (text.includes("bus") || text.includes("buseta")) return "bus";
  return "otro";
}

export function normalizeAccidentType(value: unknown): AccidentType {
  const text = normalizeText(value).toLowerCase();
  if (text.includes("choque")) return "choque";
  if (text.includes("atrop")) return "atropello";
  if (text.includes("volca")) return "volcamiento";
  if (text.includes("caida") && text.includes("moto")) return "caida_motocicleta";
  if (text.includes("animal")) return "choque_animal";
  return "otro";
}

export function normalizeGravity(fallecidos: number, lesionados: number): Gravity {
  if (fallecidos > 0) return "fatal";
  if (lesionados > 0) return "grave";
  return "solo_danos";
}

export function buildDescription(input: {
  gravedad: Gravity;
  via: string;
  vehicles: Vehicle[];
  hipotesis?: string | null;
}) {
  const vehicles = input.vehicles.length ? ` involucrando ${input.vehicles.join(", ")}` : "";
  const hypothesis = input.hipotesis ? ` Hipotesis: ${input.hipotesis}` : "";
  return `Siniestro ${input.gravedad} en ${input.via || "sitio sin especificar"}${vehicles}.${hypothesis}`;
}
