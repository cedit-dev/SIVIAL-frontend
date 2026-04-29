import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DecretoFormDialog from "@/components/decretos/DecretoFormDialog";
import { DecretoFiltersPanel, formatDate, getCategoriaBadgeClass, getEstadoBadgeClass } from "@/components/decretos/decreto-ui";
import SinVialNavbar from "@/components/sinvial/SinVialNavbar";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useSinVialTheme } from "@/hooks/use-sinvial-theme";
import { hasEditorialAccess } from "@/lib/auth";
import {
  createDecreto,
  deleteDecreto,
  getDecretosStats,
  listDecretos,
  patchDecretoEstado,
  updateDecreto,
} from "@/lib/decretos";
import type { Decreto, DecretoFilters, DecretoPayload } from "@/types/decretos";

const defaultFilters: DecretoFilters = {
  categoria: "all",
  estado: "all",
  year: "all",
  busqueda: "",
  page: 1,
  limit: 10,
};

export default function AdminDecretos() {
  const { theme, setTheme } = useSinVialTheme();
  const session = useAuthSession();
  const canAccess = hasEditorialAccess(session);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<DecretoFilters>(defaultFilters);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Decreto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Decreto | null>(null);

  useEffect(() => {
    if (!canAccess) {
      toast.error("No tienes permisos para acceder a esta sección");
      navigate("/decretos", { replace: true });
    }
  }, [canAccess, navigate]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["decretos"] });
    queryClient.invalidateQueries({ queryKey: ["decretos-stats"] });
  };

  const { data: stats } = useQuery({
    queryKey: ["decretos-stats"],
    queryFn: getDecretosStats,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["decretos", filters],
    queryFn: () => listDecretos(filters),
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: DecretoPayload) => {
      if (selected) {
        return updateDecreto(selected.id, payload);
      }
      return createDecreto(payload, session?.name ?? "Usuario institucional");
    },
    onSuccess: () => {
      refresh();
      setDialogOpen(false);
      setSelected(null);
      toast.success(selected ? "Decreto actualizado" : "Decreto creado");
    },
  });

  const stateMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: "Vigente" | "Derogado" }) => patchDecretoEstado(id, estado),
    onSuccess: () => {
      refresh();
      toast.success("Estado actualizado");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDecreto(id),
    onSuccess: () => {
      refresh();
      setPendingDelete(null);
      toast.success("Decreto eliminado");
    },
  });

  const summaryCards = useMemo(
    () => [
      { label: "Totales", value: stats?.total ?? 0, tone: "text-foreground" },
      { label: "Vigentes", value: stats?.vigentes ?? 0, tone: "text-emerald-400" },
      { label: "Derogados", value: stats?.derogados ?? 0, tone: "text-rose-400" },
    ],
    [stats],
  );

  const pages = Array.from({ length: data?.totalPages ?? 1 }, (_, index) => index + 1);

  if (!canAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SinVialNavbar theme={theme} setTheme={setTheme} />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">Panel administrativo</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">Gestión de decretos</h1>
            <p className="mt-3 text-muted-foreground">
              Administra la normativa de tránsito publicada en SinVial Ocaña.
            </p>
          </div>

          <Button
            onClick={() => {
              setSelected(null);
              setDialogOpen(true);
            }}
            className="h-12 rounded-full px-6 font-semibold"
          >
            <Plus size={18} />
            Nuevo decreto
          </Button>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-[2rem] border border-white/10 bg-card/70 p-6 shadow-xl backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">{card.label}</p>
              <p className={`mt-4 text-4xl font-black ${card.tone}`}>{card.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <DecretoFiltersPanel filters={filters} years={stats?.years ?? []} onChange={setFilters} />
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-card/70 p-4 shadow-xl backdrop-blur-xl md:p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead>Número</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    Cargando decretos...
                  </TableCell>
                </TableRow>
              ) : data?.data.length ? (
                data.data.map((decreto) => (
                  <TableRow key={decreto.id} className="border-white/10">
                    <TableCell className="font-semibold">{decreto.numero}</TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="font-semibold text-foreground">{decreto.titulo}</p>
                        <p className="line-clamp-1 text-sm text-muted-foreground">{decreto.descripcion}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-full border px-3 py-1 font-semibold ${getCategoriaBadgeClass(decreto.categoria)}`}>
                        {decreto.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(decreto.fechaExpedicion)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={decreto.estado === "Vigente"}
                          onCheckedChange={(checked) =>
                            stateMutation.mutate({ id: decreto.id, estado: checked ? "Vigente" : "Derogado" })
                          }
                        />
                        <Badge className={`rounded-full border px-3 py-1 font-semibold ${getEstadoBadgeClass(decreto.estado)}`}>
                          {decreto.estado}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full border-white/10"
                          onClick={() => {
                            setSelected(decreto);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full border-white/10 text-rose-400"
                          onClick={() => setPendingDelete(decreto)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No se encontraron decretos con los filtros actuales.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {(data?.totalPages ?? 1) > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if ((filters.page ?? 1) > 1) {
                        setFilters({ ...filters, page: (filters.page ?? 1) - 1 });
                      }
                    }}
                  />
                </PaginationItem>
                {pages.map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === (filters.page ?? 1)}
                      onClick={(event) => {
                        event.preventDefault();
                        setFilters({ ...filters, page });
                      }}
                      className="rounded-full"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if ((filters.page ?? 1) < (data?.totalPages ?? 1)) {
                        setFilters({ ...filters, page: (filters.page ?? 1) + 1 });
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </section>
      </main>

      <DecretoFormDialog
        open={dialogOpen}
        decreto={selected}
        saving={saveMutation.isPending}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelected(null);
        }}
        onSubmit={async (payload) => saveMutation.mutateAsync(payload)}
      />

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="rounded-[2rem] border-white/10 bg-[#161b22]">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar decreto</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción removerá el decreto del listado público y del panel administrativo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-white/10">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive hover:bg-destructive/90"
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
