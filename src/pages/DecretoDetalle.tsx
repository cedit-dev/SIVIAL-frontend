import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SinVialNavbar from "@/components/sinvial/SinVialNavbar";
import { useSinVialTheme } from "@/hooks/use-sinvial-theme";
import { getDecretoById, getDecretosRelated } from "@/lib/decretos";
import {
  DecretoCard,
  DecretoPdfPreviewCard,
  formatDate,
  getCategoriaBadgeClass,
  getEstadoBadgeClass,
} from "@/components/decretos/decreto-ui";
import { Download } from "lucide-react";

export default function DecretoDetalle() {
  const { theme, setTheme } = useSinVialTheme();
  const { id = "" } = useParams();

  const { data: decreto, isLoading } = useQuery({
    queryKey: ["decreto", id],
    queryFn: () => getDecretoById(id),
  });

  const { data: relacionados = [] } = useQuery({
    queryKey: ["decretos-relacionados", id, decreto?.categoria],
    queryFn: () => getDecretosRelated(id, decreto!.categoria),
    enabled: Boolean(decreto),
  });

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!decreto) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SinVialNavbar theme={theme} setTheme={setTheme} />
        <main className="mx-auto max-w-5xl px-4 py-16 md:px-6">
          <p className="text-lg font-semibold">No fue posible cargar el decreto solicitado.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SinVialNavbar theme={theme} setTheme={setTheme} />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/decretos">Decretos</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{decreto.numero}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <section className="mt-6 grid gap-8 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[2.25rem] border border-white/10 bg-card/70 p-6 shadow-xl backdrop-blur-xl md:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <Badge className={`rounded-full border px-3 py-1 font-semibold ${getCategoriaBadgeClass(decreto.categoria)}`}>
                {decreto.categoria}
              </Badge>
              <Badge className={`rounded-full border px-3 py-1 font-semibold ${getEstadoBadgeClass(decreto.estado)}`}>
                {decreto.estado}
              </Badge>
            </div>

            <h1 className="text-3xl font-black tracking-tight md:text-4xl">{decreto.numero}</h1>
            <h2 className="mt-3 text-xl font-semibold text-muted-foreground md:text-2xl">{decreto.titulo}</h2>

            <div className="mt-6 grid gap-4 rounded-[1.75rem] border border-white/10 bg-background/50 p-5 md:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Fecha de expedición</p>
                <p className="mt-2 font-semibold">{formatDate(decreto.fechaExpedicion)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Fecha de vigencia</p>
                <p className="mt-2 font-semibold">
                  {decreto.fechaVigencia ? formatDate(decreto.fechaVigencia) : "No definida"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Descripción</p>
              <p className="mt-3 text-base leading-7 text-muted-foreground">{decreto.descripcion}</p>
            </div>

            <Button asChild className="mt-8 rounded-full px-6">
              <a href={decreto.archivoUrl} download={decreto.archivoNombre}>
                <Download size={16} />
                Descargar decreto
              </a>
            </Button>
          </div>

          <DecretoPdfPreviewCard decreto={decreto} />
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-2xl font-black">Decretos relacionados</h3>
            <Link to="/decretos" className="text-sm font-semibold text-primary hover:underline">
              Ver todos
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {relacionados.map((relacionado) => (
              <DecretoCard key={relacionado.id} decreto={relacionado} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
