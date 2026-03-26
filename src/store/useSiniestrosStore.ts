import { create } from 'zustand';
import { FiltrosSiniestro, Siniestro } from '../types/siniestros';
import { siniestros as dbSiniestros, aplicarFiltros } from '../data/index';

interface SiniestrosState {
  // Datos crudos
  siniestrosRaw: Siniestro[];
  // Datos filtrados actuales
  siniestros: Siniestro[];
  // Estado de los filtros
  filtros: FiltrosSiniestro;
  
  // Acciones
  setFiltro: <K extends keyof FiltrosSiniestro>(key: K, value: FiltrosSiniestro[K]) => void;
  resetFiltros: () => void;
}

const filtrosIniciales: FiltrosSiniestro = {
  fechas: [null, null],
  tipos: [],
  gravedades: [],
  vehiculos: [],
  clima: 'todas',
  dias: [],
  horas: [0, 24],
};

export const useSiniestrosStore = create<SiniestrosState>((set) => ({
  siniestrosRaw: dbSiniestros,
  siniestros: dbSiniestros,
  filtros: filtrosIniciales,

  setFiltro: (key, value) => set((state) => {
    const nuevosFiltros = { ...state.filtros, [key]: value };
    return {
      filtros: nuevosFiltros,
      siniestros: aplicarFiltros(state.siniestrosRaw, nuevosFiltros)
    };
  }),

  resetFiltros: () => set((state) => ({
    filtros: filtrosIniciales,
    siniestros: state.siniestrosRaw
  }))
}));
