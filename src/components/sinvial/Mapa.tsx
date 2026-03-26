import { useState } from 'react';
import MapComponent from './MapComponent';
import LeyendaMapa from './LeyendaMapa';

const Mapa = () => {
  const [modoCalor, setModoCalor] = useState(false);

  return (
    <div className="relative w-full h-full bg-[#0f172a] flex flex-col items-center justify-center min-h-[400px]">
      
      {/* Toggle modo superpuesto */}
      <div className="absolute top-4 right-4 z-[1000] bg-card/80 backdrop-blur-md rounded-lg p-1.5 shadow-md flex border border-border">
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${!modoCalor ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
          onClick={() => setModoCalor(false)}
        >
          Puntos
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${modoCalor ? 'bg-accent text-accent-foreground shadow' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
          onClick={() => setModoCalor(true)}
        >
          Calor
        </button>
      </div>

      {/* Leyenda e Información */}
      <LeyendaMapa />

      <div className="w-full h-full relative">
        <MapComponent modoCalor={modoCalor} />
      </div>
    </div>
  );
};

export default Mapa;
