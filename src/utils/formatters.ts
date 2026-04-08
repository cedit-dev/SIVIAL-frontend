export const formatTipoSiniestro = (tipo: string) => {
  switch (tipo) {
    case 'caida_motocicleta': return 'Caída de motocicleta';
    case 'choque_animal': return 'Choque con animal';
    case 'volcamiento': return 'Volcamiento';
    case 'atropello': return 'Atropello';
    case 'choque': return 'Choque';
    case 'otro': return 'Otro';
    default: return tipo.replace('_', ' ');
  }
};

export const formatGravedad = (gravedad: string) => {
  switch (gravedad) {
    case 'solo_danos': return 'Solo daños';
    case 'leve': return 'Leve';
    case 'grave': return 'Grave';
    case 'fatal': return 'Fatal';
    default: return gravedad.replace('_', ' ');
  }
};

export const formatVehiculo = (vehiculo: string) => {
  switch (vehiculo) {
    case 'automovil': return 'Automóvil';
    case 'camion': return 'Camión';
    case 'peaton': return 'Peatón';
    case 'bus': return 'Bus';
    case 'motocicleta': return 'Motocicleta';
    case 'bicicleta': return 'Bicicleta';
    default: return vehiculo;
  }
};
