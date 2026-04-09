import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

import { useSiniestrosStore } from '@/store/useSiniestrosStore';
import { ShieldAlert, Layers } from 'lucide-react';

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

export const getIconPath = (tipo: string) => {
  const t = tipo.toLowerCase();
  if (t.includes('choque')) {
    // Two cars colliding
    return `<path d="M7 10h10M4 14l3-3m13 3l-3-3M5 18h14M21 14v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M9 6v2M15 6v2" stroke-width="2.5"/><path d="M12 2v6" stroke-width="3" stroke="currentColor"/>`;
  }
  if (t.includes('atropello')) {
    // Pedestrian being hit (Silhouette)
    return `<circle cx="16" cy="6" r="2.5" fill="currentColor"/><path d="M12 12l4-2 3 4M14 17l2-5 2 2M4 15l6-3" stroke-width="2.5"/><path d="M2 17h4" stroke-width="1.5"/>`;
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
    // Quadruped profile (Dog/Cow silhouette)
    return `<path d="M4 11h9l3 2h2l-1 4h-2l-1-4h-3l-1 4h-2l-1-4h-3z" stroke-width="2.5"/>`;
  }
  // Generic / Otros
  return `<path d="M12 2L2 22h20L12 2zM12 17h.01M12 10v5" stroke-width="2"/>`;
};

// Create custom SVG markers
export const createCustomIcon = (color: string, tipo: string, victimas: number = 0) => {
  const iconContent = getIconPath(tipo);
  
  // Victims badge (only if > 1)
  const badge = victimas > 1 ? `
    <g transform="translate(18, 0)">
      <circle cx="4" cy="4" r="7" fill="#e11d48" stroke="white" stroke-width="1.2"/>
      <text x="4" y="7.5" text-anchor="middle" font-size="9" fill="white" font-family="Inter, sans-serif" font-weight="bold">${victimas}</text>
    </g>
  ` : '';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="-2 -6 32 32" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" fill="${color}22" stroke-width="1"/>
      ${iconContent}
      ${badge}
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
          icon={createCustomIcon(getGravedadColor(siniestro.gravedad), siniestro.tipo, siniestro.victimas)}
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
              <span className="attr-label">Va/Sector</span>
              <span className="attr-value">{siniestro.via}</span>
            </div>
            <div className="attr-row">
              <span className="attr-label">Vctimas / Fallecidos</span>
              <span className="attr-value">{siniestro.victimas} / {siniestro.fallecidos}</span>
            </div>
            <div className="attr-row">
              <span className="attr-label">Vehculos</span>
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
    map.invalidateSize();
  }, [map]);

  return null;
};

const MapSelector = ({ activeLayerId, onSelect }: { activeLayerId: string, onSelect: (id: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  const layers = [
    { id: 'osm', name: 'OpenStreetMap', color: '#e8e0d0' },
    { id: 'satellite', name: 'Satélite', color: '#1e293b' },
    { id: 'topo', name: 'Topográfico', color: '#d1d5db' },
    { id: 'dark', name: 'Oscuro', color: '#1a1a2e' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={selectorRef} className="absolute bottom-[16px] right-[60px] z-[1000] flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 p-3 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 min-w-[180px]">
           <p className="text-[10px] font-black uppercase text-muted-foreground mb-3 px-1 tracking-widest text-center">Mapa Base</p>
           <div className="grid grid-cols-2 gap-3">
            {layers.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  onSelect(l.id);
                  setIsOpen(false);
                }}
                className={`flex flex-col items-center gap-1.5 p-1 rounded-xl transition-all hover:scale-105 active:scale-95`}
              >
                <div 
                  className={`w-14 h-11 rounded-lg shadow-inner border transition-all ${activeLayerId === l.id ? 'border-[#c0392b] border-2 scale-105' : 'border-white/10 opacity-80'}`} 
                  style={{ backgroundColor: l.color }}
                />
                <span className={`text-[10px] font-bold leading-none ${activeLayerId === l.id ? 'text-[#c0392b]' : 'text-foreground'}`}>{l.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-card border border-border shadow-md hover:bg-muted transition-all active:scale-90 text-inherit"
        title="Tipo de Mapa"
      >
        <Layers size={18} className={isOpen ? 'text-[#c0392b]' : 'text-primary'} />
      </button>
    </div>
  );
};

const CenterControl = () => {
  const map = useMap();
  const OCANA_CENTER: [number, number] = [8.2344, -73.3566];

  return (
    <div className="absolute top-[168px] left-[12px] z-[1000]">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          map.flyTo(OCANA_CENTER, 14, { duration: 1.5 });
        }}
        className="w-[38px] h-[38px] flex items-center justify-center bg-card text-foreground hover:bg-muted border border-border transition-all shadow-md rounded-full"
        title="Centrar en Ocaña"
      >
        <div className="flex flex-col items-center justify-center">
           <ShieldAlert size={18} className="text-primary" />
        </div>
      </button>
    </div>
  );
};

export default function MapComponent({ 
  modoCalor, 
  theme, 
  activeLayer: externalLayer, 
  onLayerChange 
}: { 
  modoCalor: boolean, 
  theme?: string, 
  activeLayer?: string, 
  onLayerChange?: (id: string) => void 
}) {
  const { siniestros } = useSiniestrosStore();
  
  const [internalLayer, setInternalLayer] = useState(localStorage.getItem('sinvial_maplayer') || 'osm');
  
  const activeLayer = externalLayer || internalLayer;
  const OCANA_CENTER: [number, number] = [8.2344, -73.3566];

  useEffect(() => {
    localStorage.setItem('sinvial_maplayer', activeLayer);
  }, [activeLayer]);

  const handleLayerSelect = (id: string) => {
    setInternalLayer(id);
    if (onLayerChange) onLayerChange(id);
  };

  const getTileUrl = () => {
    switch (activeLayer) {
      case 'satellite': return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'osm': return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'topo': return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'dark': return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      default: return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getAttribution = () => {
    switch (activeLayer) {
      case 'satellite': return 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
      case 'topo': return 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';
      case 'dark': return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
      default: return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }
  };

  return (
    <div 
      className={theme === 'light' ? 'light-theme' : ''}
      style={{ width: '100%', height: '100%', minHeight: '400px', position: 'relative' }}
    >
      <MapContainer 
        center={OCANA_CENTER} 
        zoom={15} 
        style={{ width: '100%', height: '100%' }}
        className="z-10"
        zoomControl={true}
      >
        <ResizeHandler />
        <CenterControl />
        <MapSelector activeLayerId={activeLayer} onSelect={handleLayerSelect} />
        <TileLayer
          attribution={getAttribution()}
          url={getTileUrl()}
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
