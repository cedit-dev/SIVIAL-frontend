export const DECRETO_CATEGORIAS = [
  "Velocidad",
  "Señalización",
  "Sanciones",
  "Movilidad",
  "General",
] as const;

export const DECRETO_ESTADOS = ["Vigente", "Derogado"] as const;

export type DecretoCategoria = (typeof DECRETO_CATEGORIAS)[number];
export type DecretoEstado = (typeof DECRETO_ESTADOS)[number];

export interface Decreto {
  id: string;
  numero: string;
  titulo: string;
  categoria: DecretoCategoria;
  fechaExpedicion: string;
  fechaVigencia?: string;
  estado: DecretoEstado;
  descripcion: string;
  archivoUrl: string;
  archivoNombre: string;
  archivoTamano: number;
  creadoPor: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface DecretoFilters {
  categoria?: DecretoCategoria | "all";
  estado?: DecretoEstado | "all";
  year?: string;
  busqueda?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedDecretos {
  data: Decreto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DecretoPayload {
  numero: string;
  titulo: string;
  categoria: DecretoCategoria;
  fechaExpedicion: string;
  fechaVigencia?: string;
  estado: DecretoEstado;
  descripcion: string;
  archivo?: File | null;
}
