import Header from '@/components/sinvial/Header';
import FiltrosPanel from '@/components/sinvial/FiltrosPanel';
import Mapa from '@/components/sinvial/Mapa';
import EstadisticasPanel from '@/components/sinvial/EstadisticasPanel';
import { useState } from 'react';
import { Filter, X } from 'lucide-react';

const Index = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden bg-background ${isFullscreen ? 'fixed inset-0 z-[9999]' : ''}`}>
      {/* 1. Header institucional */}
      <Header isFullscreen={isFullscreen} toggleFullscreen={() => setIsFullscreen(!isFullscreen)} />

      {/* Contenedor principal scrollable para alojar el mapa arriba y stats abajo */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative">
        
        {/* Botón flotante para filtros en móvil */}
        {!isFullscreen && (
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden fixed bottom-10 right-6 z-[60] bg-primary text-white p-4 rounded-full shadow-2xl active:scale-90 transition-transform flex items-center gap-2"
          >
            {showFilters ? <X size={20} /> : <Filter size={20} />}
            <span className="text-xs font-bold uppercase">{showFilters ? 'Cerrar' : 'Filtros'}</span>
          </button>
        )}

        {/* Sección Superior: Mapa y Filtros */}
        <div className={`flex flex-col lg:flex-row w-full border-b border-border ${isFullscreen ? 'h-full' : 'h-auto lg:h-[75vh]'}`}>
          {/* Panel Lateral de Filtros (Responsive Drawer on Mobile) */}
          {!isFullscreen && (
            <div className={`
              ${showFilters ? 'fixed inset-0 z-[55] flex' : 'hidden md:flex'} 
              lg:relative lg:inset-auto lg:z-auto lg:h-full lg:w-[340px]
            `}>
              {/* Overlay for mobile drawer */}
              {showFilters && (
                <div 
                  className="fixed inset-0 bg-background/80 backdrop-blur-sm lg:hidden"
                  onClick={() => setShowFilters(false)}
                />
              )}
              <div className="relative w-[85%] max-w-[340px] h-full">
                <FiltrosPanel />
              </div>
            </div>
          )}
          
          {/* Contenedor Central del Mapa */}
          <main className="relative w-full h-[500px] md:h-[60vh] lg:h-full lg:flex-1">
            <Mapa />
          </main>
        </div>

        {/* Sección Inferior: Analíticas y Tabla */}
        <div id="analytics-panel" className="bg-background">
          <EstadisticasPanel />
        </div>
      </div>
    </div>
  );
};

export default Index;
