import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getDecretosStats, listDecretos } from "@/lib/decretos";
import type { DecretoFilters } from "@/types/decretos";
import SinVialNavbar from "@/components/sinvial/SinVialNavbar";
import { useSinVialTheme } from "@/hooks/use-sinvial-theme";
import { DecretoCard, DecretoEmptyState, DecretoFiltersPanel } from "@/components/decretos/decreto-ui";

const defaultFilters: DecretoFilters = {
  categoria: "all",
  estado: "all",
  year: "all",
  busqueda: "",
  page: 1,
  limit: 9,
};

export default function Decretos() {
  const { theme, setTheme } = useSinVialTheme();
  const [filters, setFilters] = useState<DecretoFilters>(defaultFilters);

  const { data: stats } = useQuery({
    queryKey: ["decretos-stats"],
    queryFn: getDecretosStats,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["decretos", filters],
    queryFn: () => listDecretos(filters),
  });

  const pages = useMemo(() => Array.from({ length: data?.totalPages ?? 1 }, (_, index) => index + 1), [data?.totalPages]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SinVialNavbar theme={theme} setTheme={setTheme} />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(230,57,70,0.22),transparent_40%),linear-gradient(135deg,rgba(22,27,34,0.98),rgba(30,41,59,0.9))] px-6 py-10 shadow-2xl md:px-10 md:py-14">
          <div className="relative z-10 max-w-3xl">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">Normativa oficial</p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">Decretos de Tránsito</h1>
            <p className="mt-4 text-lg text-slate-300">Normativa oficial del municipio de Ocaña</p>
          </div>
        </section>

        <section className="mt-8">
          <DecretoFiltersPanel filters={filters} years={stats?.years ?? []} onChange={setFilters} />
        </section>

        <section className="mt-8">
          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-72 animate-pulse rounded-[2rem] border border-white/10 bg-card/60" />
              ))}
            </div>
          ) : data?.data.length ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {data.data.map((decreto) => (
                  <DecretoCard key={decreto.id} decreto={decreto} />
                ))}
              </div>

              <Pagination className="mt-8">
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
            </>
          ) : (
            <DecretoEmptyState />
          )}
        </section>
      </main>
    </div>
  );
}
