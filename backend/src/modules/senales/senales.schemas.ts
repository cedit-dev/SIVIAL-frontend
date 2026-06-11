import { z } from "zod";

export const senalTipoSchema = z.enum(["prohibicion", "advertencia", "informacion"]);

export const senalPayloadSchema = z.object({
  tipo: senalTipoSchema,
  nombre: z.string().min(1),
  descripcion: z.string().min(1),
  lat: z.number(),
  lng: z.number()
});

export const senalFiltersSchema = z.object({
  tipo: senalTipoSchema.optional()
});

export type SenalPayload = z.infer<typeof senalPayloadSchema>;
