import { z } from "zod";

export const decretoCategoriaSchema = z.preprocess((value) => {
  if (value === "Senalizacion") return "Señalización";
  return value;
}, z.enum(["Velocidad", "Señalización", "Sanciones", "Movilidad", "General"]));
export const decretoEstadoSchema = z.enum(["Vigente", "Derogado"]);

export const decretoPayloadSchema = z.object({
  numero: z.string().min(1),
  titulo: z.string().min(1),
  categoria: decretoCategoriaSchema,
  fechaExpedicion: z.string().min(1),
  fechaVigencia: z.string().optional().nullable(),
  estado: decretoEstadoSchema.default("Vigente"),
  descripcion: z.string().optional().nullable()
});

export const decretoFiltersSchema = z.object({
  categoria: z.string().optional(),
  estado: z.string().optional(),
  year: z.string().optional(),
  busqueda: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
});

export const decretoEstadoPayloadSchema = z.object({
  estado: decretoEstadoSchema
});

export type DecretoPayload = z.infer<typeof decretoPayloadSchema>;
export type DecretoFilters = z.infer<typeof decretoFiltersSchema>;
