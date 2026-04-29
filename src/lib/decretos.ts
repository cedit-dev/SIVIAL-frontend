import type {
  Decreto,
  DecretoCategoria,
  DecretoEstado,
  DecretoFilters,
  DecretoPayload,
  PaginatedDecretos,
} from "@/types/decretos";

const STORAGE_KEY = "sinvial_decretos";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdfDataUrl(lines: string[]) {
  const content = [
    "BT",
    "/F1 18 Tf",
    "72 736 Td",
    ...lines.flatMap((line, index) => [
      index === 0 ? `(${escapePdfText(line)}) Tj` : `0 -26 Td (${escapePdfText(line)}) Tj`,
    ]),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return `data:application/pdf;base64,${btoa(pdf)}`;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No fue posible leer el archivo PDF"));
    reader.readAsDataURL(file);
  });
}

function buildSeedData(): Decreto[] {
  const baseDate = new Date().toISOString();
  const seed = [
    {
      numero: "Decreto 042 de 2025",
      titulo: "Límites temporales de velocidad en corredores escolares",
      categoria: "Velocidad" as const,
      fechaExpedicion: "2025-02-14",
      fechaVigencia: "2025-02-20",
      estado: "Vigente" as const,
      descripcion:
        "Establece límites máximos de velocidad y franjas horarias de control en zonas escolares del municipio.",
    },
    {
      numero: "Decreto 031 de 2024",
      titulo: "Reordenamiento de señalización preventiva en el centro histórico",
      categoria: "Señalización" as const,
      fechaExpedicion: "2024-09-03",
      fechaVigencia: "2024-09-15",
      estado: "Vigente" as const,
      descripcion:
        "Actualiza la señalización vertical y horizontal en corredores patrimoniales y de alta afluencia peatonal.",
    },
    {
      numero: "Decreto 018 de 2024",
      titulo: "Ajuste al régimen sancionatorio por estacionamiento indebido",
      categoria: "Sanciones" as const,
      fechaExpedicion: "2024-05-11",
      fechaVigencia: "2024-05-20",
      estado: "Vigente" as const,
      descripcion:
        "Define criterios operativos para comparendos en zonas de cargue, descargue y rutas de transporte público.",
    },
    {
      numero: "Decreto 063 de 2023",
      titulo: "Plan de movilidad para eventos masivos y cierres viales",
      categoria: "Movilidad" as const,
      fechaExpedicion: "2023-10-26",
      fechaVigencia: "2023-11-01",
      estado: "Vigente" as const,
      descripcion:
        "Reglamenta desvíos, cierres y operación del tránsito durante festividades, ferias y concentraciones públicas.",
    },
    {
      numero: "Decreto 011 de 2022",
      titulo: "Lineamientos generales para intervenciones viales temporales",
      categoria: "General" as const,
      fechaExpedicion: "2022-03-19",
      fechaVigencia: "2022-03-25",
      estado: "Derogado" as const,
      descripcion:
        "Compila requisitos mínimos para señalización, socialización y seguimiento de intervenciones temporales.",
    },
    {
      numero: "Decreto 077 de 2021",
      titulo: "Regulación de circulación nocturna para vehículos de carga",
      categoria: "Movilidad" as const,
      fechaExpedicion: "2021-12-07",
      fechaVigencia: "2021-12-15",
      estado: "Derogado" as const,
      descripcion:
        "Define ventanas horarias especiales y restricciones para vehículos pesados dentro del perímetro urbano.",
    },
  ];

  return seed.map((item) => {
    const id = slugify(item.numero);
    const archivoNombre = `${id}.pdf`;
    const archivoUrl = buildPdfDataUrl([
      "Alcaldía Municipal de Ocaña",
      item.numero,
      item.titulo,
      item.descripcion,
    ]);

    return {
      id,
      ...item,
      archivoUrl,
      archivoNombre,
      archivoTamano: Math.round((archivoUrl.length * 3) / 4),
      creadoPor: "Secretaría de Movilidad",
      creadoEn: baseDate,
      actualizadoEn: baseDate,
    };
  });
}

async function fetchFromApi<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

function readStorage() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Decreto[];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function writeStorage(data: Decreto[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function ensureData() {
  const current = readStorage();
  if (current) {
    return current;
  }

  const seed = buildSeedData();
  writeStorage(seed);
  return seed;
}

function applyFilters(data: Decreto[], filters: DecretoFilters) {
  const search = filters.busqueda?.trim().toLowerCase();

  return data.filter((item) => {
    const matchesCategory = !filters.categoria || filters.categoria === "all" || item.categoria === filters.categoria;
    const matchesState = !filters.estado || filters.estado === "all" || item.estado === filters.estado;
    const matchesYear = !filters.year || filters.year === "all" || item.fechaExpedicion.startsWith(filters.year);
    const matchesSearch =
      !search ||
      [item.titulo, item.numero, item.descripcion].some((field) => field.toLowerCase().includes(search));

    return matchesCategory && matchesState && matchesYear && matchesSearch;
  });
}

function paginate(data: Decreto[], filters: DecretoFilters): PaginatedDecretos {
  const filtered = applyFilters(data, filters).sort((a, b) => b.fechaExpedicion.localeCompare(a.fechaExpedicion));
  const limit = filters.limit ?? 9;
  const page = filters.page ?? 1;
  const start = (page - 1) * limit;
  const slice = filtered.slice(start, start + limit);

  return {
    data: slice,
    page,
    limit,
    total: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
  };
}

function updateRecord(
  records: Decreto[],
  id: string,
  updater: (current: Decreto) => Decreto,
) {
  const next = records.map((record) => (record.id === id ? updater(record) : record));
  writeStorage(next);
  return next.find((record) => record.id === id) ?? null;
}

export async function listDecretos(filters: DecretoFilters): Promise<PaginatedDecretos> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") {
      params.set(key, String(value));
    }
  });

  try {
    return await fetchFromApi<PaginatedDecretos>(`/api/decretos?${params.toString()}`);
  } catch {
    return paginate(ensureData(), filters);
  }
}

export async function getDecretoById(id: string): Promise<Decreto> {
  try {
    return await fetchFromApi<Decreto>(`/api/decretos/${id}`);
  } catch {
    const decreto = ensureData().find((item) => item.id === id);
    if (!decreto) {
      throw new Error("Decreto no encontrado");
    }
    return decreto;
  }
}

export async function createDecreto(payload: DecretoPayload, creadoPor: string) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) {
      formData.append(key, value);
    }
  });

  try {
    return await fetchFromApi<Decreto>("/api/decretos", {
      method: "POST",
      body: formData,
    });
  } catch {
    const records = ensureData();
    const archivoUrl = payload.archivo ? await fileToDataUrl(payload.archivo) : buildPdfDataUrl([payload.numero, payload.titulo]);
    const now = new Date().toISOString();
    const decreto: Decreto = {
      id: `${slugify(payload.numero)}-${Date.now()}`,
      numero: payload.numero,
      titulo: payload.titulo,
      categoria: payload.categoria,
      fechaExpedicion: payload.fechaExpedicion,
      fechaVigencia: payload.fechaVigencia,
      estado: payload.estado,
      descripcion: payload.descripcion,
      archivoUrl,
      archivoNombre: payload.archivo?.name ?? `${slugify(payload.numero)}.pdf`,
      archivoTamano: payload.archivo?.size ?? Math.round((archivoUrl.length * 3) / 4),
      creadoPor,
      creadoEn: now,
      actualizadoEn: now,
    };

    writeStorage([decreto, ...records]);
    return decreto;
  }
}

export async function updateDecreto(id: string, payload: DecretoPayload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value) {
      formData.append(key, value);
    }
  });

  try {
    return await fetchFromApi<Decreto>(`/api/decretos/${id}`, {
      method: "PUT",
      body: formData,
    });
  } catch {
    const records = ensureData();
    const current = records.find((item) => item.id === id);
    if (!current) {
      throw new Error("Decreto no encontrado");
    }

    const archivoUrl = payload.archivo ? await fileToDataUrl(payload.archivo) : current.archivoUrl;
    const updated = updateRecord(records, id, (record) => ({
      ...record,
      numero: payload.numero,
      titulo: payload.titulo,
      categoria: payload.categoria,
      fechaExpedicion: payload.fechaExpedicion,
      fechaVigencia: payload.fechaVigencia,
      estado: payload.estado,
      descripcion: payload.descripcion,
      archivoUrl,
      archivoNombre: payload.archivo?.name ?? record.archivoNombre,
      archivoTamano: payload.archivo?.size ?? record.archivoTamano,
      actualizadoEn: new Date().toISOString(),
    }));

    if (!updated) {
      throw new Error("No fue posible actualizar el decreto");
    }

    return updated;
  }
}

export async function patchDecretoEstado(id: string, estado: DecretoEstado) {
  try {
    return await fetchFromApi<Decreto>(`/api/decretos/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
  } catch {
    const records = ensureData();
    const updated = updateRecord(records, id, (record) => ({
      ...record,
      estado,
      actualizadoEn: new Date().toISOString(),
    }));

    if (!updated) {
      throw new Error("No fue posible cambiar el estado");
    }

    return updated;
  }
}

export async function deleteDecreto(id: string) {
  try {
    const response = await fetch(`/api/decretos/${id}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Delete failed");
    }
    return;
  } catch {
    const records = ensureData();
    writeStorage(records.filter((record) => record.id !== id));
  }
}

export async function getDecretosRelated(id: string, categoria: DecretoCategoria) {
  const data = ensureData()
    .filter((item) => item.id !== id && item.categoria === categoria)
    .sort((a, b) => b.fechaExpedicion.localeCompare(a.fechaExpedicion))
    .slice(0, 3);

  return data;
}

export async function getDecretosStats() {
  const data = ensureData();
  return {
    total: data.length,
    vigentes: data.filter((item) => item.estado === "Vigente").length,
    derogados: data.filter((item) => item.estado === "Derogado").length,
    years: Array.from(new Set(data.map((item) => item.fechaExpedicion.slice(0, 4)))).sort((a, b) => Number(b) - Number(a)),
  };
}
