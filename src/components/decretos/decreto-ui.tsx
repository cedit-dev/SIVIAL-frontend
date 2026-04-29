import { Download, ExternalLink, FileSearch, FileText } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Decreto, DecretoCategoria, DecretoEstado, DecretoFilters } from "@/types/decretos";
import { DECRETO_CATEGORIAS, DECRETO_ESTADOS } from "@/types/decretos";

const categoryClasses: Record<DecretoCategoria, string> = {
  Velocidad: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  Señalización: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Sanciones: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  Movilidad: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  General: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

const statusClasses: Record<DecretoEstado, string> = {
  Vigente: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Derogado: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export function getCategoriaBadgeClass(categoria: DecretoCategoria) {
  return cn(categoryClasses[categoria]);
}

export function getEstadoBadgeClass(estado: DecretoEstado) {
  return statusClasses[estado];
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}

interface DecretoFiltersPanelProps {
  filters: DecretoFilters;
  years: string[];
  onChange: (next: DecretoFilters) => void;
}

export function DecretoFiltersPanel({ filters, years, onChange }: DecretoFiltersPanelProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-card/70 p-5 backdrop-blur-xl">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Buscar
          </label>
          <input
            value={filters.busqueda ?? ""}
            onChange={(event) => onChange({ ...filters, busqueda: event.target.value, page: 1 })}
            placeholder="Título, número o descripción"
            className="h-12 w-full rounded-full border border-white/10 bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>

        <FilterSelect
          label="Año"
          value={filters.year ?? "all"}
          options={["all", ...years]}
          onChange={(value) => onChange({ ...filters, year: value, page: 1 })}
        />
        <FilterSelect
          label="Categoría"
          value={filters.categoria ?? "all"}
          options={["all", ...DECRETO_CATEGORIAS]}
          onChange={(value) => onChange({ ...filters, categoria: value as DecretoFilters["categoria"], page: 1 })}
        />
        <FilterSelect
          label="Estado"
          value={filters.estado ?? "all"}
          options={["all", ...DECRETO_ESTADOS]}
          onChange={(value) => onChange({ ...filters, estado: value as DecretoFilters["estado"], page: 1 })}
        />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-full border border-white/10 bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? `Todos${label === "Año" ? "" : ""}` : option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DecretoCard({ decreto }: { decreto: Decreto }) {
  return (
    <article className="group rounded-[2rem] border border-white/10 bg-card/70 p-6 shadow-xl backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-primary/30">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={cn("text-lg font-black text-foreground", decreto.estado === "Derogado" && "line-through decoration-rose-400/50")}>
            {decreto.numero}
          </p>
          <p className="text-sm text-muted-foreground">{formatDate(decreto.fechaExpedicion)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={cn("rounded-full border px-3 py-1 font-semibold", getCategoriaBadgeClass(decreto.categoria))}>
            {decreto.categoria}
          </Badge>
          <Badge className={cn("rounded-full border px-3 py-1 font-semibold", getEstadoBadgeClass(decreto.estado))}>
            {decreto.estado}
          </Badge>
        </div>
      </div>

      <Link to={`/decretos/${decreto.id}`} className="block">
        <h3 className="mb-3 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
          {decreto.titulo}
        </h3>
      </Link>
      <p className="mb-6 line-clamp-3 text-sm leading-6 text-muted-foreground">{decreto.descripcion}</p>

      <div className="flex flex-wrap gap-3">
        <Button
          asChild
          className="h-11 rounded-full px-5 font-semibold"
        >
          <a href={decreto.archivoUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={16} />
            Ver decreto
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-11 rounded-full border-white/10 bg-transparent px-5 font-semibold"
        >
          <a href={decreto.archivoUrl} download={decreto.archivoNombre}>
            <Download size={16} />
            Descargar
          </a>
        </Button>
      </div>
    </article>
  );
}

export function DecretoEmptyState() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[2.25rem] border border-dashed border-white/10 bg-card/40 px-6 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-primary">
        <FileSearch size={34} />
      </div>
      <h3 className="text-xl font-bold text-foreground">No se encontraron decretos</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Prueba ajustando la búsqueda o los filtros para encontrar otra normativa.
      </p>
    </div>
  );
}

export function DecretoPdfPreviewCard({ decreto }: { decreto: Decreto }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-card/70 p-4 shadow-xl backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText size={22} />
          </div>
          <div>
            <p className="font-semibold text-foreground">{decreto.archivoNombre}</p>
            <p className="text-sm text-muted-foreground">{formatFileSize(decreto.archivoTamano)}</p>
          </div>
        </div>
        <Button asChild className="rounded-full px-5">
          <a href={decreto.archivoUrl} download={decreto.archivoNombre}>
            <Download size={16} />
            Descargar
          </a>
        </Button>
      </div>

      <iframe
        title={`Documento ${decreto.numero}`}
        src={decreto.archivoUrl}
        className="h-[70vh] w-full rounded-[1.5rem] border border-white/10 bg-white"
      />
    </div>
  );
}
