import { useState } from 'react';
import { X } from 'lucide-react';
import MapComponent from './MapComponent';
import LeyendaMapa from './LeyendaMapa';

const Mapa = ({ 
  isFullscreen, 
  theme, 
  onToggleFullscreen 
}: { 
  isFullscreen?: boolean, 
  theme?: string,
  onToggleFullscreen?: (state: boolean) => void
}) => {
  const [modoCalor, setModoCalor] = useState(false);
  const [activeLayer, setActiveLayer] = useState(localStorage.getItem('sinvial_maplayer') || 'streets');

  const isLightMap = activeLayer === 'light' || activeLayer === 'streets' || activeLayer === 'terrain';
  const textColor = isLightMap ? 'text-black' : 'text-white';

  return (
    <div className="relative w-full h-full bg-[#0f172a] flex flex-col items-center justify-center min-h-[400px]">
      
      {/* Toggle modo superpuesto */}
      <div className={`absolute top-4 right-4 flex gap-2 floating-control rounded-full ${isFullscreen ? 'z-[9999]' : 'z-[1000]'}`}>
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-all shadow-none ${!modoCalor ? 'btn-puntos-activo' : 'btn-map-inactive'} ${textColor}`}
          onClick={() => setModoCalor(false)}
        >
          Puntos
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-all shadow-none ${modoCalor ? 'btn-calor-activo' : 'btn-map-inactive'} ${textColor}`}
          onClick={() => setModoCalor(true)}
        >
          Calor
        </button>

        {/* Botón de salir de pantalla completa (Solo visible en fullscreen) */}
        {isFullscreen && (
          <button
            className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-card border border-border hover:bg-muted transition-all active:scale-90 text-primary shadow-sm"
            onClick={() => onToggleFullscreen?.(false)}
            title="Contraer / Salir"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Leyenda e Información */}
      <LeyendaMapa isFullscreen={isFullscreen} />

      <div className="w-full h-full relative">
        <MapComponent 
          modoCalor={modoCalor} 
          theme={theme} 
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
        />
      </div>
    </div>
  );
};

export default Mapa;
