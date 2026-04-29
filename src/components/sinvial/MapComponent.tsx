import { useEffect, useRef, useState } from "react";
import { LayerGroup, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

import { Switch } from "@/components/ui/switch";
import { useSiniestrosStore } from "@/store/useSiniestrosStore";
import type { GravedadSiniestro, Siniestro } from "@/types/siniestros";
import { Layers, ShieldAlert } from "lucide-react";

type BaseLayerId = "dark" | "light" | "satellite" | "streets" | "terrain";
type SenalTipo = "prohibicion" | "advertencia" | "informacion";

interface SenalTransito {
  id: string;
  tipo: SenalTipo;
  nombre: string;
  descripcion: string;
  lat: number;
  lng: number;
}

interface LayerVisibility {
  prohibicion: boolean;
  advertencia: boolean;
  informacion: boolean;
}

const LAYERS_STORAGE_KEY = "sinvial_layers";
const MAP_STORAGE_KEY = "sinvial_maplayer";
const OCANA_CENTER: [number, number] = [8.2344, -73.3566];

const DEFAULT_LAYER_VISIBILITY: LayerVisibility = {
  prohibicion: false,
  advertencia: false,
  informacion: false,
};

const BASE_LAYERS: Array<{ id: BaseLayerId; name: string; color: string }> = [
  { id: "dark", name: "Oscuro", color: "#161b22" },
  { id: "light", name: "Claro", color: "#f4f1ec" },
  { id: "satellite", name: "Satélite", color: "#243b53" },
  { id: "streets", name: "Calles", color: "#e8e0d0" },
  { id: "terrain", name: "Terreno", color: "#c8d5b9" },
];

const SENALES_MOCK: Record<SenalTipo, SenalTransito[]> = {
  prohibicion: [
    { id: "pro-1", tipo: "prohibicion", nombre: "No girar a la izquierda", descripcion: "Prohíbe el giro hacia la izquierda en la intersección.", lat: 8.2342, lng: -73.3549 },
    { id: "pro-2", tipo: "prohibicion", nombre: "No estacionar", descripcion: "Restringe el estacionamiento permanente sobre el corredor vial.", lat: 8.2351, lng: -73.3561 },
    { id: "pro-3", tipo: "prohibicion", nombre: "Velocidad máxima 30 km/h", descripcion: "Limita la velocidad por cercanía a zona escolar y comercial.", lat: 8.2336, lng: -73.3555 },
    { id: "pro-4", tipo: "prohibicion", nombre: "No adelantar", descripcion: "Impide maniobras de adelantamiento por visibilidad reducida.", lat: 8.2329, lng: -73.3572 },
    { id: "pro-5", tipo: "prohibicion", nombre: "Prohibido el paso de motos", descripcion: "Restringe el acceso de motocicletas en tramo peatonalizado.", lat: 8.2348, lng: -73.3538 },
  ],
  advertencia: [
    { id: "adv-1", tipo: "advertencia", nombre: "Curva peligrosa", descripcion: "Advierte un cambio brusco de dirección con riesgo de pérdida de control.", lat: 8.2381, lng: -73.3604 },
    { id: "adv-2", tipo: "advertencia", nombre: "Zona escolar", descripcion: "Precaución por presencia frecuente de estudiantes y cruces peatonales.", lat: 8.2368, lng: -73.3526 },
    { id: "adv-3", tipo: "advertencia", nombre: "Cruce de peatones", descripcion: "Indica paso peatonal con alta circulación a nivel.", lat: 8.2317, lng: -73.3587 },
    { id: "adv-4", tipo: "advertencia", nombre: "Superficie deslizante", descripcion: "Tramo con riesgo de deslizamiento en condiciones de lluvia.", lat: 8.2298, lng: -73.3519 },
    { id: "adv-5", tipo: "advertencia", nombre: "Reductor de velocidad", descripcion: "Se aproxima un reductor físico sobre la vía.", lat: 8.2403, lng: -73.3558 },
  ],
  informacion: [
    { id: "inf-1", tipo: "informacion", nombre: "Centro histórico", descripcion: "Dirección hacia el centro histórico y zona patrimonial del municipio.", lat: 8.2355, lng: -73.3547 },
    { id: "inf-2", tipo: "informacion", nombre: "Hospital", descripcion: "Referencia vial para acceso rápido al hospital.", lat: 8.2376, lng: -73.3508 },
    { id: "inf-3", tipo: "informacion", nombre: "Estación de policía", descripcion: "Orientación hacia la estación de policía más cercana.", lat: 8.2306, lng: -73.3569 },
    { id: "inf-4", tipo: "informacion", nombre: "Parque principal", descripcion: "Señal informativa hacia el parque principal y área cívica.", lat: 8.2344, lng: -73.3558 },
    { id: "inf-5", tipo: "informacion", nombre: "Salida a Bucaramanga", descripcion: "Indica la ruta de salida municipal hacia Bucaramanga.", lat: 8.2412, lng: -73.3621 },
  ],
};

const SIGNAL_META: Record<SenalTipo, { label: string; color: string; svg: string; text: string }> = {
  prohibicion: {
    label: "Señales de Prohibición",
    color: "#c0392b",
    text: "Prohibición",
    svg: `<svg width="32" height="32" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="14" fill="#c0392b" stroke="white" stroke-width="2"/>
  <line x1="8" y1="8" x2="24" y2="24" stroke="white" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  },
  advertencia: {
    label: "Señales de Advertencia",
    color: "#d4a017",
    text: "Advertencia",
    svg: `<svg width="32" height="32" viewBox="0 0 32 32">
  <polygon points="16,3 30,29 2,29" fill="#d4a017" stroke="#1a1a2e" stroke-width="2"/>
  <text x="16" y="25" text-anchor="middle" fill="#1a1a2e" font-size="14" font-weight="bold">!</text>
</svg>`,
  },
  informacion: {
    label: "Señales de Información",
    color: "#388bfd",
    text: "Información",
    svg: `<svg width="32" height="32" viewBox="0 0 32 32">
  <rect x="2" y="8" width="28" height="18" rx="3" fill="#388bfd" stroke="white" stroke-width="2"/>
  <text x="16" y="22" text-anchor="middle" fill="white" font-size="14" font-weight="bold">i</text>
</svg>`,
  },
};

const getGravedadColor = (gravedad: GravedadSiniestro) => {
  switch (gravedad) {
    case "fatal":
      return "#991b1b";
    case "grave":
      return "#e63946";
    case "leve":
      return "#f59e0b";
    case "solo_danos":
      return "#3b82f6";
    default:
      return "#94a3b8";
  }
};

const getGravedadPeso = (gravedad: GravedadSiniestro) => {
  switch (gravedad) {
    case "fatal":
      return 4;
    case "grave":
      return 3;
    case "leve":
      return 2;
    case "solo_danos":
      return 1;
    default:
      return 1;
  }
};

function getStoredLayerVisibility(): LayerVisibility {
  const raw = localStorage.getItem(LAYERS_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_LAYER_VISIBILITY;
  }

  try {
    return { ...DEFAULT_LAYER_VISIBILITY, ...(JSON.parse(raw) as Partial<LayerVisibility>) };
  } catch {
    return DEFAULT_LAYER_VISIBILITY;
  }
}

async function fetchSenales(tipo: SenalTipo): Promise<SenalTransito[]> {
  // Preparado para API real:
  // const res = await fetch(`/api/senales?tipo=${tipo}`)
  // return res.json()
  return SENALES_MOCK[tipo];
}

const HeatmapLayer = ({ data }: { data: Siniestro[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !data.length) return;

    const heatData = data.map((siniestro) => [siniestro.lat, siniestro.lng, getGravedadPeso(siniestro.gravedad)] as [number, number, number]);
    const heatLayer = (L as typeof L & {
      heatLayer: (points: [number, number, number][], options: Record<string, unknown>) => L.Layer;
    }).heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 15,
      max: 4,
      gradient: { 0.1: "blue", 0.4: "cyan", 0.6: "lime", 0.8: "yellow", 1: "red" },
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, data]);

  return null;
};

export function getIconPath(tipo: string) {
  const normalized = tipo.toLowerCase();
  if (normalized.includes("choque")) {
    return `<path d="M7 10h10M4 14l3-3m13 3l-3-3M5 18h14M21 14v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M9 6v2M15 6v2" stroke-width="2.5"/><path d="M12 2v6" stroke-width="3" stroke="currentColor"/>`;
  }
  if (normalized.includes("atropello")) {
    return `<circle cx="16" cy="6" r="2.5" fill="currentColor"/><path d="M12 12l4-2 3 4M14 17l2-5 2 2M4 15l6-3" stroke-width="2.5"/><path d="M2 17h4" stroke-width="1.5"/>`;
  }
  if (normalized.includes("volcamiento")) {
    return `<path d="M21 10h-2L17 6H7L5 10H3v4h2l2 4h10l2-4h2v-4z" transform="rotate(180 12 12)"/>`;
  }
  if (normalized.includes("motocicleta")) {
    return `<circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 18H5V11L9 10L12 13H18M12 13V10H16"/>`;
  }
  if (normalized.includes("animal")) {
    return `<path d="M4 11h9l3 2h2l-1 4h-2l-1-4h-3l-1 4h-2l-1-4h-3z" stroke-width="2.5"/>`;
  }
  return `<path d="M12 2L2 22h20L12 2zM12 17h.01M12 10v5" stroke-width="2"/>`;
}

function createCustomIcon(color: string, tipo: string, victimas = 0) {
  const iconContent = getIconPath(tipo);
  const badge =
    victimas > 1
      ? `
    <g transform="translate(18, 0)">
      <circle cx="4" cy="4" r="7" fill="#e11d48" stroke="white" stroke-width="1.2"/>
      <text x="4" y="7.5" text-anchor="middle" font-size="9" fill="white" font-family="Inter, sans-serif" font-weight="bold">${victimas}</text>
    </g>
  `
      : "";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="-2 -6 32 32" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" fill="${color}22" stroke-width="1"/>
      ${iconContent}
      ${badge}
    </svg>`;

  return new L.DivIcon({
    html: `<div style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); transform: translate(-50%, -50%); transition: all 0.2s ease;">${svg}</div>`,
    className: "custom-marker-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function createSignalIcon(tipo: SenalTipo) {
  return new L.DivIcon({
    html: `<div style="transform: translate(-50%, -50%); filter: drop-shadow(0 4px 10px rgba(0,0,0,0.28));">${SIGNAL_META[tipo].svg}</div>`,
    className: "custom-signal-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

const PuntosLayer = ({ data }: { data: Siniestro[] }) => (
  <>
    {data.map((siniestro) => (
      <Marker
        key={siniestro.id}
        position={[siniestro.lat, siniestro.lng]}
        icon={createCustomIcon(getGravedadColor(siniestro.gravedad), siniestro.tipo, siniestro.victimas)}
      >
        <Popup className="custom-popup">
          <div className="mb-2 flex items-center gap-2 border-b border-white/10 pb-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getGravedadColor(siniestro.gravedad) }} />
            <h3 className="!border-0 !p-0">{siniestro.descripcion || "Siniestro Vial"}</h3>
          </div>
          <div className="attr-row">
            <span className="attr-label">Fecha y Hora</span>
            <span className="attr-value">{siniestro.fecha} {siniestro.hora}</span>
          </div>
          <div className="attr-row">
            <span className="attr-label">Gravedad</span>
            <span className="attr-value" style={{ color: getGravedadColor(siniestro.gravedad), textTransform: "capitalize" }}>
              {siniestro.gravedad.replace("_", " ")}
            </span>
          </div>
          <div className="attr-row">
            <span className="attr-label">Tipo de Evento</span>
            <span className="attr-value capitalize">{siniestro.tipo.replace("_", " ")}</span>
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
            <span className="attr-value capitalize">{siniestro.vehiculos_involucrados.join(", ")}</span>
          </div>
        </Popup>
      </Marker>
    ))}
  </>
);

const SenalesLayer = ({ senales }: { senales: SenalTransito[] }) => (
  <LayerGroup>
    {senales.map((senal) => (
      <Marker key={senal.id} position={[senal.lat, senal.lng]} icon={createSignalIcon(senal.tipo)}>
        <Popup className="custom-popup">
          <div className="mb-2 flex items-center gap-2 border-b border-white/10 pb-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: SIGNAL_META[senal.tipo].color }} />
            <h3 className="!border-0 !p-0">{senal.nombre}</h3>
          </div>
          <div className="attr-row">
            <span className="attr-label">Tipo</span>
            <span className="attr-value" style={{ color: SIGNAL_META[senal.tipo].color }}>
              {SIGNAL_META[senal.tipo].text}
            </span>
          </div>
          <div className="attr-row">
            <span className="attr-label">Descripción</span>
            <span className="attr-value">{senal.descripcion}</span>
          </div>
          <div className="attr-row">
            <span className="attr-label">Coordenadas</span>
            <span className="attr-value">{senal.lat.toFixed(4)}, {senal.lng.toFixed(4)}</span>
          </div>
        </Popup>
      </Marker>
    ))}
  </LayerGroup>
);

const ResizeHandler = () => {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  return null;
};

const MapSelector = ({
  activeLayerId,
  onSelect,
  visibility,
  onVisibilityChange,
  counts,
}: {
  activeLayerId: BaseLayerId;
  onSelect: (id: BaseLayerId) => void;
  visibility: LayerVisibility;
  onVisibilityChange: (tipo: SenalTipo, value: boolean) => void;
  counts: Record<SenalTipo, number>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={selectorRef} className="absolute bottom-[16px] right-[60px] z-[1000] flex flex-col items-end">
      {isOpen && (
        <div className="map-selector-panel mb-3 min-w-[300px] overflow-hidden rounded-[1.75rem] border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <p className="mb-3 px-1 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Tipo de mapa
          </p>
          <div className="grid grid-cols-2 gap-3">
            {BASE_LAYERS.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onSelect(layer.id)}
                className="flex flex-col items-center gap-1.5 rounded-xl p-1 transition-all hover:scale-105 active:scale-95"
              >
                <div
                  className={`h-11 w-14 rounded-lg border shadow-inner transition-all ${activeLayerId === layer.id ? "scale-105 border-2 border-[#c0392b]" : "border-white/10 opacity-85"}`}
                  style={{ backgroundColor: layer.color }}
                />
                <span className={`text-[10px] font-bold leading-none ${activeLayerId === layer.id ? "text-[#c0392b]" : "text-foreground"}`}>
                  {layer.name}
                </span>
              </button>
            ))}
          </div>

          <div className="map-selector-separator my-4 h-px" />

          <p className="mb-3 px-1 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Capas adicionales
          </p>
          <div className="space-y-2">
            {(Object.keys(SIGNAL_META) as SenalTipo[]).map((tipo) => (
              <div key={tipo} className="flex items-center justify-between rounded-2xl border border-white/5 bg-background/50 px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${SIGNAL_META[tipo].color}22` }}
                    dangerouslySetInnerHTML={{ __html: SIGNAL_META[tipo].svg }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {SIGNAL_META[tipo].label} ({counts[tipo]})
                    </p>
                  </div>
                </div>
                <Switch
                  checked={visibility[tipo]}
                  onCheckedChange={(checked) => onVisibilityChange(tipo, checked)}
                  className="transition-all"
                  style={{ backgroundColor: visibility[tipo] ? SIGNAL_META[tipo].color : undefined }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-border bg-card shadow-md transition-all active:scale-90 hover:bg-muted"
        title="Selector de capas"
      >
        <Layers size={18} className={isOpen ? "text-[#c0392b]" : "text-primary"} />
      </button>
    </div>
  );
};

const CenterControl = () => {
  const map = useMap();

  return (
    <div className="absolute left-[12px] top-[168px] z-[1000]">
      <button
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          map.flyTo(OCANA_CENTER, 14, { duration: 1.5 });
        }}
        className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-all hover:bg-muted"
        title="Centrar en Ocaña"
      >
        <ShieldAlert size={18} className="text-primary" />
      </button>
    </div>
  );
};

export default function MapComponent({
  modoCalor,
  theme,
  activeLayer: externalLayer,
  onLayerChange,
}: {
  modoCalor: boolean;
  theme?: string;
  activeLayer?: string;
  onLayerChange?: (id: string) => void;
}) {
  const { siniestros } = useSiniestrosStore();
  const [internalLayer, setInternalLayer] = useState<BaseLayerId>((localStorage.getItem(MAP_STORAGE_KEY) as BaseLayerId) || "streets");
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>(() => getStoredLayerVisibility());
  const [senales, setSenales] = useState<Record<SenalTipo, SenalTransito[]>>({
    prohibicion: [],
    advertencia: [],
    informacion: [],
  });

  const activeLayer = (externalLayer as BaseLayerId) || internalLayer;

  useEffect(() => {
    localStorage.setItem(MAP_STORAGE_KEY, activeLayer);
  }, [activeLayer]);

  useEffect(() => {
    localStorage.setItem(LAYERS_STORAGE_KEY, JSON.stringify(layerVisibility));
  }, [layerVisibility]);

  useEffect(() => {
    let mounted = true;

    const loadSignals = async () => {
      const [prohibicion, advertencia, informacion] = await Promise.all([
        fetchSenales("prohibicion"),
        fetchSenales("advertencia"),
        fetchSenales("informacion"),
      ]);

      if (!mounted) return;

      setSenales({ prohibicion, advertencia, informacion });
    };

    void loadSignals();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLayerSelect = (id: BaseLayerId) => {
    setInternalLayer(id);
    onLayerChange?.(id);
  };

  const handleVisibilityChange = (tipo: SenalTipo, value: boolean) => {
    setLayerVisibility((current) => ({ ...current, [tipo]: value }));
  };

  const getTileUrl = () => {
    switch (activeLayer) {
      case "satellite":
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      case "light":
        return "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
      case "streets":
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      case "terrain":
        return "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
      case "dark":
      default:
        return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    }
  };

  const getAttribution = () => {
    switch (activeLayer) {
      case "satellite":
        return "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";
      case "light":
      case "dark":
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
      case "terrain":
        return 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>';
      case "streets":
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }
  };

  return (
    <div
      className={theme === "light" ? "light-theme" : ""}
      style={{ width: "100%", height: "100%", minHeight: "400px", position: "relative" }}
    >
      <MapContainer center={OCANA_CENTER} zoom={15} style={{ width: "100%", height: "100%" }} className="z-10" zoomControl>
        <ResizeHandler />
        <CenterControl />
        <MapSelector
          activeLayerId={activeLayer}
          onSelect={handleLayerSelect}
          visibility={layerVisibility}
          onVisibilityChange={handleVisibilityChange}
          counts={{
            prohibicion: senales.prohibicion.length,
            advertencia: senales.advertencia.length,
            informacion: senales.informacion.length,
          }}
        />

        <TileLayer attribution={getAttribution()} url={getTileUrl()} />

        {modoCalor ? <HeatmapLayer data={siniestros} /> : <PuntosLayer data={siniestros} />}
        {layerVisibility.prohibicion && <SenalesLayer senales={senales.prohibicion} />}
        {layerVisibility.advertencia && <SenalesLayer senales={senales.advertencia} />}
        {layerVisibility.informacion && <SenalesLayer senales={senales.informacion} />}
      </MapContainer>
    </div>
  );
}
