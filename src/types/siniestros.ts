export type TipoSiniestro = 
  | 'choque' 
  | 'atropello' 
  | 'volcamiento' 
  | 'caida_motocicleta' 
  | 'choque_animal' 
  | 'otro';

export type GravedadSiniestro = 'fatal' | 'grave' | 'leve' | 'solo_danos';

export type VehiculoInvolucrado = 
  | 'automovil' 
  | 'motocicleta' 
  | 'camion' 
  | 'bicicleta' 
  | 'peaton' 
  | 'bus';

export type CondicionClima = 'despejado' | 'lluvia' | 'niebla';
export type CondicionVia = 'buena' | 'humeda' | 'deteriorada';
export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface Siniestro {
  id: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  tipo: TipoSiniestro;
  gravedad: GravedadSiniestro;
  victimas: number;
  fallecidos: number;
  vehiculos_involucrados: VehiculoInvolucrado[];
  via: string;
  descripcion: string;
  lat: number;
  lng: number;
  condicion_clima: CondicionClima;
  condicion_via: CondicionVia;
  dia_semana: DiaSemana;
}

export interface FiltrosSiniestro {
  fechas: [Date | null, Date | null];
  tipos: TipoSiniestro[];
  gravedades: GravedadSiniestro[];
  vehiculos: VehiculoInvolucrado[];
  clima: CondicionClima | 'todas';
  dias: DiaSemana[];
  horas: [number, number]; // 0 a 24
}
