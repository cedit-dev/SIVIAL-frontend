import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

import { useSiniestrosStore } from '@/store/useSiniestrosStore';
import { ShieldAlert } from 'lucide-react';

const getGravedadColor = (gravedad: string) => {
  switch (gravedad) {
    case 'fatal': return '#991b1b'; // Dark Red
    case 'grave': return '#e63946'; // Red
    case 'leve': return '#f59e0b'; // Amber
    case 'solo_danos': return '#3b82f6'; // Blue
    default: return '#94a3b8';
  }
};

const getGravedadPeso = (gravedad: string) => {
  switch (gravedad) {
    case 'fatal': return 4;
    case 'grave': return 3;
    case 'leve': return 2;
    case 'solo_danos': return 1;
    default: return 1;
  }
};

const HeatmapLayer = ({ data }: { data: any[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !data || !Array.isArray(data)) return;
    
    // Convert data to leaflet heat format: [lat, lng, intensity]
    const heatData = data.map(s => [s.lat, s.lng, getGravedadPeso(s.gravedad)]);
    
    // @ts-ignore - leaflet.heat is not typed perfectly
    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 15,
      max: 4, // Max weight
      gradient: { 0.1: 'blue', 0.4: 'cyan', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, data]);

  return null;
};

const getIconPath = (tipo: string) => {
  const t = tipo.toLowerCase();
  if (t.includes('choque')) {
    // Two cars colliding
    return `<path d="M7 10h10M4 14l3-3m13 3l-3-3M5 18h14M21 14v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M9 6v2M15 6v2" stroke-width="2.5"/><path d="M12 2v6" stroke-width="3" stroke="currentColor"/>`;
  }
  if (t.includes('atropello')) {
    // Person icon
    return `<circle cx="12" cy="5" r="3"/><path d="M12 8v8M7 12h10M10 21l2-5 2 5"/>`;
  }
  if (t.includes('volcamiento')) {
    // Car upside down
    return `<path d="M21 10h-2L17 6H7L5 10H3v4h2l2 4h10l2-4h2v-4z" transform="rotate(180 12 12)"/>`;
  }
  if (t.includes('motocicleta')) {
    // Bike/Moto profile
    return `<circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 18H5V11L9 10L12 13H18M12 13V10H16"/>`;
  }
  if (t.includes('animal')) {
    // Paw or generic quadruped
    return `<path d="M11 5L9 9M13 5L15 9M12 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 11l2 2M20 11l-2 2"/>`;
  }
  // Generic / Otros
  return `<path d="M12 2L2 22h20L12 2zM12 17h.01M12 10v5" stroke-width="2"/>`;
};

// Create custom SVG markers
const createCustomIcon = (color: string, tipo: string) => {
  const iconContent = getIconPath(tipo);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" fill="${color}22" stroke-width="1"/>
      ${iconContent}
    </svg>`;
    
  return new L.DivIcon({
    html: `<div style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); transform: translate(-50%, -50%); transition: all 0.2s ease;">${svg}</div>`,
    className: 'custom-marker-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const PuntosLayer = ({ data }: { data: any[] }) => {
  if (!data || !Array.isArray(data)) return null;
  return (
    <>
      {data.map((siniestro) => (
        <Marker 
          key={siniestro.id} 
          position={[siniestro.lat, siniestro.lng]}
          icon={createCustomIcon(getGravedadColor(siniestro.gravedad), siniestro.tipo)}
        >
          <Popup className="custom-popup">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
               <div className="w-3 h-3 rounded-full" style={{backgroundColor: getGravedadColor(siniestro.gravedad)}} />
               <h3 className="!p-0 !border-0">{siniestro.descripcion || 'Siniestro Vial'}</h3>
            </div>
            <div className="attr-row">
              <span className="attr-label">Fecha y Hora</span>
              <span className="attr-value">{siniestro.fecha} {siniestro.hora}</span>
            </div>
            <div className="attr-row">
              <span className="attr-label">Gravedad</span>
              <span className="attr-value" style={{color: getGravedadColor(siniestro.gravedad), textTransform: 'capitalize'}}>
                {siniestro.gravedad.replace('_', ' ')}
              </span>
            </div>
            <div className="attr-row">
              <span className="attr-label">Tipo de Evento</span>
              <span className="attr-value capitalize">{siniestro.tipo.replace('_', ' ')}</span>
            </div>
            <div className="attr-row">
              <span className="attr-label">Vía/Sector</span>
              <span className="attr-value">{siniestro.via}</span>
            </div>
            <div className="attr-row">
              <span className="attr-label">Víctimas / Fallecidos</span>
              <span className="attr-value">{siniestro.victimas} / {siniestro.fallecidos}</span>
            </div>
            <div className="attr-row">
              <span className="attr-label">Vehículos</span>
              <span className="attr-value capitalize">{siniestro.vehiculos_involucrados.join(', ')}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

const ResizeHandler = () => {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;

    // Force a first update
    map.invalidateSize();

    // Use ResizeObserver for more accuracy than window resize
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      // Small timeout to allow transition/animation to finish if any
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    });

    observer.observe(container);

    // Initial brute-force invalidation sequence
    const intervals = [100, 500, 1000, 2000, 5000];
    const timers = intervals.map(ms => setTimeout(() => {
      map.invalidateSize();
    }, ms));

    return () => {
      observer.disconnect();
      timers.forEach(t => clearTimeout(t));
    };
  }, [map]);

  return null;
};

const CenterControl = () => {
  const map = useMap();
  const OCANA_CENTER: [number, number] = [8.2344, -73.3566];

  return (
    <div className="leaflet-top leaflet-left !top-[110px]">
      <div className="leaflet-control leaflet-bar">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            map.flyTo(OCANA_CENTER, 14, { duration: 1.5 });
          }}
          className="w-[38px] h-[38px] flex items-center justify-center bg-[#1e293b] text-[#f1f5f9] hover:bg-[#334155] border-none transition-all shadow-md rounded-lg"
          title="Centrar en Ocaña"
        >
          <div className="flex flex-col items-center justify-center">
             <ShieldAlert size={18} className="text-primary" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default function MapComponent({ modoCalor }: { modoCalor: boolean }) {
  const { siniestros } = useSiniestrosStore();
  const OCANA_CENTER: [number, number] = [8.2344, -73.3566];

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px', position: 'relative' }}>
      <MapContainer 
        center={OCANA_CENTER} 
        zoom={14} 
        style={{ width: '100%', height: '100%' }}
        className="z-10"
        zoomControl={true}
      >
        <ResizeHandler />
        <CenterControl />
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {modoCalor ? (
          <HeatmapLayer data={siniestros} />
        ) : (
          <PuntosLayer data={siniestros} />
        )}
      </MapContainer>
    </div>
  );
}
