import { z } from "zod";

import { accidentTypeSchema, daySchema, gravitySchema, vehicleSchema } from "../../utils/normalizers.js";

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === undefined ? null : Number(value)),
  z.number().nullable()
);

export const accidentPayloadSchema = z.object({
  numero: z.number().int().nullable().optional(),
  fecha: z.string().min(1),
  hora: z.string().min(1),
  dia: z.string().optional().nullable(),
  viaKmSitio: z.string().optional().nullable(),
  claseAccidente: z.string().optional().nullable(),
  fallecidoRaw: z.string().optional().nullable(),
  lesionadoRaw: z.string().optional().nullable(),
  zona: z.string().optional().nullable(),
  vehiculo1: z.string().optional().nullable(),
  vehiculo2: z.string().optional().nullable(),
  vehiculo3: z.string().optional().nullable(),
  condicionLesionado: z.string().optional().nullable(),
  condicionFallecido: z.string().optional().nullable(),
  sexo: z.string().optional().nullable(),
  edad: z.number().int().nullable().optional(),
  hipotesis: z.string().optional().nullable(),
  tipo: accidentTypeSchema,
  gravedad: gravitySchema,
  victimas: z.number().int().min(0),
  fallecidos: z.number().int().min(0),
  lesionados: z.number().int().min(0),
  vehiculosInvolucrados: z.array(vehicleSchema).default([]),
  via: z.string().min(1),
  descripcion: z.string().min(1),
  diaSemana: daySchema,
  lat: optionalNumber.optional(),
  lng: optionalNumber.optional(),
  geocodingStatus: z.enum(["pending", "located", "failed", "manual"]).default("pending")
});

export const accidentFiltersSchema = z.object({
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  tipo: z.string().optional(),
  gravedad: z.string().optional(),
  vehiculo: z.string().optional(),
  dia: z.string().optional(),
  horaInicio: z.coerce.number().int().min(0).max(24).optional(),
  horaFin: z.coerce.number().int().min(0).max(24).optional(),
  zona: z.string().optional(),
  busqueda: z.string().optional(),
  conCoordenadas: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(100)
});

export type AccidentPayload = z.infer<typeof accidentPayloadSchema>;
export type AccidentFilters = z.infer<typeof accidentFiltersSchema>;
