import siniestrosData from './siniestros.json';
import { Siniestro, FiltrosSiniestro } from '../types/siniestros';

export const siniestros: Siniestro[] = siniestrosData as Siniestro[];

export const aplicarFiltros = (datos: Siniestro[], filtros: FiltrosSiniestro): Siniestro[] => {
  return datos.filter((siniestro) => {
    // Rango de fechas
    if (filtros.fechas[0] && filtros.fechas[1]) {
      const fechaSiniestro = new Date(siniestro.fecha);
      if (fechaSiniestro < filtros.fechas[0] || fechaSiniestro > filtros.fechas[1]) {
        return false;
      }
    } else if (filtros.fechas[0]) {
      const fechaSiniestro = new Date(siniestro.fecha);
      if (fechaSiniestro < filtros.fechas[0]) return false;
    } else if (filtros.fechas[1]) {
      const fechaSiniestro = new Date(siniestro.fecha);
      if (fechaSiniestro > filtros.fechas[1]) return false;
    }

    // Tipos
    if (filtros.tipos.length > 0 && !filtros.tipos.includes(siniestro.tipo)) {
      return false;
    }

    // Gravedad
    if (filtros.gravedades.length > 0 && !filtros.gravedades.includes(siniestro.gravedad)) {
      return false;
    }

    // Vehículos
    if (filtros.vehiculos.length > 0) {
      const tieneVehiculoSeleccionado = siniestro.vehiculos_involucrados.some((v) =>
        filtros.vehiculos.includes(v)
      );
      if (!tieneVehiculoSeleccionado) return false;
    }

    // Clima
    if (filtros.clima !== 'todas' && siniestro.condicion_clima !== filtros.clima) {
      return false;
    }

    // Día de la semana
    if (filtros.dias.length > 0 && !filtros.dias.includes(siniestro.dia_semana)) {
      return false;
    }

    // Rango de horas (asumiendo horas como string "HH:mm")
    const horaSiniestro = parseInt(siniestro.hora.split(':')[0], 10);
    if (horaSiniestro < filtros.horas[0] || horaSiniestro >= filtros.horas[1]) {
      return false;
    }

    return true;
  });
};
