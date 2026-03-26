import { Siniestro } from '../types/siniestros';

export const getTotalFallecidos = (datos: Siniestro[]) => 
  datos.reduce((sum, item) => sum + item.fallecidos, 0);

export const getTotalVictimas = (datos: Siniestro[]) => 
  datos.reduce((sum, item) => sum + item.victimas, 0);

export const getTipoFrecuente = (datos: Siniestro[]) => {
  if (!datos.length) return 'N/A';
  const counts = datos.reduce((acc, curr) => {
    acc[curr.tipo] = (acc[curr.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b).replace('_', ' ');
};

export const getViaPeligrosa = (datos: Siniestro[]) => {
  if (!datos.length) return 'N/A';
  const counts = datos.reduce((acc, curr) => {
    acc[curr.via] = (acc[curr.via] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
};

// Data for Chart 1: Tipo
export const getDatosPorTipo = (datos: Siniestro[]) => {
  const counts = datos.reduce((acc, curr) => {
    acc[curr.tipo] = (acc[curr.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return Object.keys(counts).map(k => ({ name: k.replace('_', ' '), value: counts[k] })).sort((a, b) => b.value - a.value);
};

// Data for Chart 2: Gravedad
export const getDatosPorGravedad = (datos: Siniestro[]) => {
  const counts = datos.reduce((acc, curr) => {
    acc[curr.gravedad] = (acc[curr.gravedad] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return Object.keys(counts).map(k => ({ name: k.replace('_', ' '), value: counts[k] })).sort((a, b) => b.value - a.value);
};

// Data for Chart 3: Día se semala
export const getDatosPorDia = (datos: Siniestro[]) => {
  const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const counts = datos.reduce((acc, curr) => {
    acc[curr.dia_semana] = (acc[curr.dia_semana] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return days.map(d => ({ name: d, value: counts[d] || 0 }));
};

// Data for Chart 4: Hora
export const getDatosPorHora = (datos: Siniestro[]) => {
  const counts = Array(24).fill(0);
  datos.forEach(d => {
    const horaInt = parseInt(d.hora.split(':')[0], 10);
    counts[horaInt]++;
  });
  return counts.map((v, i) => ({ hora: `${i}:00`, cantidad: v }));
};

// Data for Chart 5: Vehículos
export const getDatosPorVehiculo = (datos: Siniestro[]) => {
  const counts: Record<string, number> = {};
  datos.forEach(d => {
    d.vehiculos_involucrados.forEach(v => {
      counts[v] = (counts[v] || 0) + 1;
    });
  });
  return Object.keys(counts).map(k => ({ name: k, value: counts[k] })).sort((a, b) => b.value - a.value);
};

// Data for Chart 6: Meses
export const getDatosPorMes = (datos: Siniestro[]) => {
  const counts = Array(12).fill(0);
  datos.forEach(d => {
    const monthInt = new Date(d.fecha).getMonth();
    counts[monthInt]++;
  });
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return counts.map((v, i) => ({ mes: monthNames[i], cantidad: v }));
};
