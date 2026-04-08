import { useState } from 'react';
import MapComponent from './MapComponent';
import LeyendaMapa from './LeyendaMapa';

const Mapa = ({ isFullscreen, theme }: { isFullscreen?: boolean, theme?: string }) => {
  const [modoCalor, setModoCalor] = useState(false);

  return (
    <div className="relative w-full h-full bg-[#0f172a] flex flex-col items-center justify-center min-h-[400px]">
      
      {/* Toggle modo superpuesto */}
      <div className={`absolute top-4 right-4 flex gap-2 floating-control rounded-full ${isFullscreen ? 'z-[9999]' : 'z-[1000]'}`}>
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-all shadow-none ${!modoCalor ? 'btn-puntos-activo' : 'btn-map-inactive'}`}
          onClick={() => setModoCalor(false)}
        >
          Puntos
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-all shadow-none ${modoCalor ? 'btn-calor-activo' : 'btn-map-inactive'}`}
          onClick={() => setModoCalor(true)}
        >
          Calor
        </button>
      </div>

      {/* Leyenda e Información */}
      <LeyendaMapa isFullscreen={isFullscreen} />

      <div className="w-full h-full relative">
        <MapComponent modoCalor={modoCalor} theme={theme} />
      </div>
    </div>
  );
};

export default Mapa;
