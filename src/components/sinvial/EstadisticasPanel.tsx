import { useSiniestrosStore } from '@/store/useSiniestrosStore';
import {
  getTotalFallecidos, getTotalVictimas, getTipoFrecuente, getViaPeligrosa,
  getDatosPorTipo, getDatosPorGravedad, getDatosPorDia, getDatosPorHora,
  getDatosPorVehiculo, getDatosPorMes
} from '@/utils/estadisticas';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, CartesianGrid
} from 'recharts';
import { Activity, Car, AlertTriangle, AlertOctagon, MapPin } from 'lucide-react';
import { useState } from 'react';

const GRAVITY_COLORS = {
  fatal: '#991b1b', // dark red
  grave: '#e63946', // red
  leve: '#f59e0b', // amber
  'solo_danos': '#3b82f6', // blue
};

const EstadisticasPanel = () => {
  const { siniestros } = useSiniestrosStore();
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;

  if (!siniestros || siniestros.length === 0) {
    return (
      <div className="w-full bg-background p-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">Analíticas y Estadísticas</h2>
        <div className="text-muted-foreground p-8 text-center border border-dashed border-border rounded-xl">
          No hay datos disponibles para los filtros seleccionados.
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Siniestros', value: siniestros.length, icon: Activity, color: 'text-primary' },
    { label: 'Total Víctimas', value: getTotalVictimas(siniestros), icon: AlertTriangle, color: 'text-accent' },
    { label: 'Fallecidos', value: getTotalFallecidos(siniestros), icon: AlertOctagon, color: 'text-[#991b1b]' },
    { label: 'Tipo Frecuente', value: getTipoFrecuente(siniestros), icon: Car, color: 'text-muted-foreground' },
    { label: 'Vía más Peligrosa', value: getViaPeligrosa(siniestros), icon: MapPin, color: 'text-muted-foreground' },
  ];

  const datosGravedadFormateados = getDatosPorGravedad(siniestros).map(d => {
    // map the name to match GRAVITY_COLORS key or color directly
    const key = d.name.replace(' ', '_') as keyof typeof GRAVITY_COLORS;
    return { ...d, color: GRAVITY_COLORS[key] || '#94a3b8' };
  });

  const paginationPages = Math.ceil(siniestros.length / itemsPerPage);
  const paginatedSiniestros = siniestros.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="w-full bg-background p-4 md:p-6 lg:p-8 space-y-8">

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-3 md:p-4 shadow-sm flex items-center gap-3">
            <div className={`p-2 md:p-3 rounded-lg bg-background ${kpi.color}`}>
              <kpi.icon size={20} className="md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">{kpi.label}</p>
              <p className="text-lg md:text-xl font-bold text-foreground capitalize truncate" title={kpi.value.toString()}>
                {kpi.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfica 1: Siniestros por tipo */}
        <div className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">Siniestros por Tipo</h3>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getDatosPorTipo(siniestros)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#f1f5f9', fontSize: 10 }} width={80} />
                <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', fontSize: '12px' }} />
                <Bar dataKey="value" fill="#e63946" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 2: Distribución por gravedad */}
        <div className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">Distribución por Gravedad</h3>
          <div className="h-[250px] md:h-[300px] w-full text-[10px] md:text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datosGravedadFormateados}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {datosGravedadFormateados.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 3: Siniestros por Día */}
        <div className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">Siniestros por Día de la Semana</h3>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getDatosPorDia(siniestros)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', fontSize: '12px' }} />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 4: Franja horaria */}
        <div className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">Distribución por Horas</h3>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getDatosPorHora(siniestros)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="hora" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', fontSize: '12px' }} />
                <Area type="monotone" dataKey="cantidad" stroke="#e63946" fill="#e63946" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 5: Vehículos */}
        <div className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">Vehículos Involucrados</h3>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getDatosPorVehiculo(siniestros)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#f1f5f9', fontSize: 10 }} width={80} />
                <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', fontSize: '12px' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 6: Mensual */}
        <div className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">Evolución Mensual</h3>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getDatosPorMes(siniestros)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', fontSize: '12px' }} />
                <Line type="monotone" dataKey="cantidad" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Tabla Recientes */}
      <div className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-sm">
        <h3 className="text-base md:text-lg font-bold text-foreground mb-4">Listado de Siniestros ({siniestros.length})</h3>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full text-[13px] md:text-sm text-left">
            <thead className="text-[10px] md:text-xs text-muted-foreground uppercase bg-background">
              <tr>
                <th className="px-3 md:px-4 py-3 rounded-tl-lg">Fecha</th>
                <th className="px-3 md:px-4 py-3 hidden sm:table-cell">Hora</th>
                <th className="px-3 md:px-4 py-3">Tipo</th>
                <th className="px-3 md:px-4 py-3">Gravedad</th>
                <th className="px-3 md:px-4 py-3 hidden md:table-cell">Vía</th>
                <th className="px-3 md:px-4 py-3 hidden lg:table-cell">Vehículos</th>
                <th className="px-3 md:px-4 py-3 text-right">Víct.</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSiniestros.map((s) => (
                <tr key={s.id} className="border-b border-border hover:bg-white/5 transition-colors cursor-pointer">
                  <td className="px-3 md:px-4 py-3 font-medium whitespace-nowrap">{s.fecha}</td>
                  <td className="px-3 md:px-4 py-3 hidden sm:table-cell">{s.hora}</td>
                  <td className="px-3 md:px-4 py-3 capitalize">{s.tipo.replace('_', ' ')}</td>
                  <td className="px-3 md:px-4 py-3">
                    <span
                      className="px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-bold capitalize"
                      style={{
                        backgroundColor: `${(GRAVITY_COLORS as any)[s.gravedad]}20`,
                        color: (GRAVITY_COLORS as any)[s.gravedad]
                      }}
                    >
                      {s.gravedad.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-3 md:px-4 py-3 hidden md:table-cell truncate max-w-[150px]">{s.via}</td>
                  <td className="px-3 md:px-4 py-3 hidden lg:table-cell capitalize">{s.vehiculos_involucrados.join(', ')}</td>
                  <td className="px-3 md:px-4 py-3 text-right font-bold">{s.victimas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {paginationPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
            <span className="text-[10px] md:text-xs text-muted-foreground">
              Mostrando {page * itemsPerPage + 1} a {Math.min((page + 1) * itemsPerPage, siniestros.length)} de {siniestros.length}
            </span>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="flex-1 sm:flex-none px-3 py-1.5 md:py-1 bg-background border border-border rounded text-xs md:text-sm disabled:opacity-50 hover:bg-muted font-medium"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(Math.min(paginationPages - 1, page + 1))}
                disabled={page === paginationPages - 1}
                className="flex-1 sm:flex-none px-3 py-1.5 md:py-1 bg-background border border-border rounded text-xs md:text-sm disabled:opacity-50 hover:bg-muted font-medium"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default EstadisticasPanel;
