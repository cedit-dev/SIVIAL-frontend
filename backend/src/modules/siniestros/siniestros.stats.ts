type AccidentForStats = {
  tipo: string;
  gravedad: string;
  dia_semana: string;
  hora: string;
  fecha: string;
  via: string;
  victimas: number;
  fallecidos: number;
  vehiculos_involucrados: string[];
};

function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>((result, item) => {
    result[item] = (result[item] ?? 0) + 1;
    return result;
  }, {});
}

function toChart(counts: Record<string, number>) {
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function buildStats(data: AccidentForStats[]) {
  const byType = countBy(data.map((item) => item.tipo));
  const byGravity = countBy(data.map((item) => item.gravedad));
  const byDay = countBy(data.map((item) => item.dia_semana));
  const byHour = countBy(data.map((item) => item.hora.slice(0, 2)));
  const byVehicle = countBy(data.flatMap((item) => item.vehiculos_involucrados));
  const byMonth = countBy(data.map((item) => item.fecha.slice(0, 7)));
  const byRoad = countBy(data.map((item) => item.via));

  const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const topRoad = Object.entries(byRoad).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    totalSiniestros: data.length,
    totalVictimas: data.reduce((sum, item) => sum + item.victimas, 0),
    totalFallecidos: data.reduce((sum, item) => sum + item.fallecidos, 0),
    tipoFrecuente: topType,
    viaPeligrosa: topRoad,
    porTipo: toChart(byType),
    porGravedad: toChart(byGravity),
    porDia: toChart(byDay),
    porHora: Object.entries(byHour).map(([hora, cantidad]) => ({ hora, cantidad })),
    porVehiculo: toChart(byVehicle),
    porMes: Object.entries(byMonth).map(([mes, cantidad]) => ({ mes, cantidad }))
  };
}
