import Header from '@/components/sinvial/Header';
import FiltrosPanel from '@/components/sinvial/FiltrosPanel';
import Mapa from '@/components/sinvial/Mapa';
import EstadisticasPanel from '@/components/sinvial/EstadisticasPanel';
import { useState, useEffect } from 'react';
import { Filter, X, BarChart3, Minimize, Maximize } from 'lucide-react';

const Index = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const [theme, setTheme] = useState(localStorage.getItem('sinvial_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('sinvial_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  // Handle Fullscreen Z-Index
  const controlZIndex = isFullscreen ? 'z-[9999]' : 'z-[1000]';

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden bg-background ${isFullscreen ? 'fixed inset-0 z-[9999]' : ''}`}>
      {/* 1. Header institucional - Hidden in fullscreen */}
      {!isFullscreen && (
        <div className="block z-50 relative">
          <Header 
            isFullscreen={isFullscreen} 
            toggleFullscreen={() => setIsFullscreen(!isFullscreen)} 
            theme={theme}
            setTheme={setTheme}
          />
        </div>
      )}

      {/* Contenedor principal para alojar el mapa a flex-1 */}
      <div className={`relative flex flex-col overflow-hidden w-full ${isFullscreen ? 'h-screen' : 'flex-1 h-full'}`}>

        {/* Contenedor Central del Mapa */}
        <main className="relative w-full h-full flex-1 overflow-hidden bg-[#0f172a]">
          
          <Mapa 
            isFullscreen={isFullscreen} 
            theme={theme} 
            onToggleFullscreen={setIsFullscreen}
          />

          {/* Zone 2: Filter Toggle Button (Top-Left below Zoom) */}
          <div className={`absolute top-[120px] left-[12px] ${controlZIndex} transition-all duration-300 ${showFilters ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <button 
              onClick={() => setShowFilters(true)}
              className="flex items-center justify-center w-[38px] h-[38px] rounded-full bg-card border border-border shadow-md hover:bg-muted transition-all active:scale-90 text-inherit"
              title="Filtros"
            >
              <Filter size={18} className="text-primary" />
            </button>
          </div>

          {/* Zone 5: Stats Toggle Button (Bottom-Center) */}
          {!showStats && (
            <div className={`absolute bottom-[24px] left-1/2 -translate-x-1/2 ${controlZIndex} animate-in fade-in slide-in-from-bottom-4`}>
              <button 
                onClick={() => setShowStats(true)}
                className="flex items-center gap-2 px-6 py-3 font-bold rounded-full bg-card border border-border shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:bg-muted transition-all active:scale-95 text-foreground"
              >
                <BarChart3 size={20} className="text-primary" />
                Estadísticas
              </button>
            </div>
          )}

          {/* Panel Lateral de Filtros (Absolute Overlay Zone 1500) */}
          <div 
            id="filtros-panel-container" 
            style={{ transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
            className={`
              absolute left-0 top-0 h-full w-full sm:w-[340px] bg-card border-r border-border shadow-2xl z-[1500]
              ${showFilters ? 'translate-x-0' : '-translate-x-full'}
            `}
          >
            <button 
              id="filtros-close-btn"
              onClick={() => setShowFilters(false)}
              className="absolute top-4 right-4 z-50 p-1.5 rounded-full bg-background/80 hover:bg-background border border-border text-muted-foreground hover:text-foreground transition-colors shadow-sm"
            >
              <X size={18} />
            </button>
            <div className="w-full h-full pt-2">
              <FiltrosPanel />
            </div>
          </div>
          
        </main>

        {/* Sección Inferior: Analíticas y Tabla (Fixed Overlay Zone 2000) */}
        <div 
          id="analytics-panel" 
          style={{ transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}
          className={`fixed bottom-0 left-0 w-full bg-card/95 backdrop-blur-xl border-t border-border z-[2000] ${theme === 'light' ? 'shadow-[0_-10px_40px_rgba(0,0,0,0.1)]' : 'shadow-[0_-10px_40px_rgba(0,0,0,0.5)]'} ${showStats ? 'translate-y-0' : 'translate-y-[100%]'}`}
        >
          {/* Header del panel con título y cierre */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground select-none">
                Análisis de Siniestralidad
              </h3>
            </div>
            <button 
              onClick={() => setShowStats(false)}
              className={`p-1.5 rounded-full transition-all ${
                theme === 'light' 
                  ? 'text-[#1a1a2e] hover:bg-black/5' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
              }`}
              title="Cerrar Panel"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="max-h-[calc(75vh-60px)] min-h-[300px] overflow-y-auto custom-scrollbar pb-8 pt-4">
            <EstadisticasPanel theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
