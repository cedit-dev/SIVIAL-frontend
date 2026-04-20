import { useSiniestrosStore } from '@/store/useSiniestrosStore';
import { TipoSiniestro, GravedadSiniestro, VehiculoInvolucrado, CondicionClima, DiaSemana } from '@/types/siniestros';
import { CalendarIcon, Filter, Clock, Check, ChevronDown, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const FiltrosPanel = ({ onClose }: { onClose?: () => void }) => {
  const { filtros, siniestros, siniestrosRaw, setFiltro, resetFiltros } = useSiniestrosStore();

  const handleCheckbox = (key: 'tipos' | 'gravedades' | 'vehiculos' | 'dias', value: string) => {
    const currentList = filtros[key] as string[];
    if (currentList.includes(value)) {
      setFiltro(key, currentList.filter(v => v !== value) as any);
    } else {
      setFiltro(key, [...currentList, value] as any);
    }
  };

  const handleDiasChip = (dia: DiaSemana) => handleCheckbox('dias', dia);

  return (
    <aside className="w-full h-full bg-[#0f172a] p-4 flex flex-col gap-5 overflow-y-auto custom-scrollbar select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
            <Filter className="w-4 h-4 text-primary flex-shrink-0" />
            <h2 className="text-sm font-black text-white uppercase tracking-widest italic truncate">Filtros</h2>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={resetFiltros}
                className="text-[9px] font-bold text-primary hover:text-white uppercase tracking-tighter transition-colors"
            >
                Limpiar
            </button>
            {onClose && (
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-muted-foreground hover:text-white transition-all shadow-sm"
                >
                  <X size={14} />
                </button>
            )}
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-muted-foreground font-bold uppercase tracking-tighter">Resultados:</span>
          <span className="text-white font-black">{siniestros.length} / {siniestrosRaw.length}</span>
        </div>
      </div>

      {/* Fechas Compactas */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic">Rango de Fechas</label>
        <div className="grid grid-cols-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 bg-white/5 border-white/10 text-[11px] font-bold justify-between px-3 rounded-lg hover:border-primary/50">
                {filtros.fechas[0] ? format(filtros.fechas[0], "dd/MM/yy") : "Inicio"}
                <CalendarIcon className="w-3 h-3 text-primary opacity-40" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
                className="z-[9999] w-auto p-0 bg-[#0f172a] border-white/10 shadow-2xl" 
                align="start" 
                side="bottom"
                sideOffset={8}
            >
                <Calendar 
                    mode="single" 
                    selected={filtros.fechas[0] || undefined} 
                    onSelect={(d) => setFiltro('fechas', [d || null, filtros.fechas[1]])} 
                    initialFocus 
                />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 bg-white/5 border-white/10 text-[11px] font-bold justify-between px-3 rounded-lg hover:border-primary/50">
                {filtros.fechas[1] ? format(filtros.fechas[1], "dd/MM/yy") : "Fin"}
                <CalendarIcon className="w-3 h-3 text-primary opacity-40" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
                className="z-[9999] w-auto p-0 bg-[#0f172a] border-white/10 shadow-2xl" 
                align="end" 
                side="bottom"
                sideOffset={8}
            >
                <Calendar 
                    mode="single" 
                    selected={filtros.fechas[1] || undefined} 
                    onSelect={(d) => setFiltro('fechas', [filtros.fechas[0], d || null])} 
                    initialFocus 
                />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Gravedad Grid */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic">Gravedad</label>
        <div className="grid grid-cols-2 gap-1.5">
          {['fatal', 'grave', 'leve', 'solo_danos'].map((g) => {
            const active = filtros.gravedades.includes(g as GravedadSiniestro);
            return (
              <button key={g} onClick={() => handleCheckbox('gravedades', g)} className={cn(
                "flex items-center gap-2 p-2 rounded-lg border text-[10px] font-bold transition-all uppercase truncate justify-start",
                active ? "bg-primary/20 border-primary text-white" : "bg-white/5 border-white/5 text-muted-foreground hover:border-white/20"
              )}>
                <div className={cn("w-3 h-3 rounded-sm border flex items-center justify-center", active ? "bg-primary border-primary":"border-white/20")}>
                    {active && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                {g.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tipo Grid */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic">Tipo de Incidente</label>
        <div className="grid grid-cols-2 gap-1.5">
          {['choque', 'atropello', 'volcamiento', 'caida_motocicleta', 'choque_animal', 'otro'].map((t) => {
            const active = filtros.tipos.includes(t as TipoSiniestro);
            return (
              <button key={t} onClick={() => handleCheckbox('tipos', t)} className={cn(
                "flex items-center gap-2 p-2 rounded-lg border text-[9px] font-bold transition-all uppercase truncate justify-start",
                active ? "bg-primary/20 border-primary text-white" : "bg-white/5 border-white/5 text-muted-foreground hover:border-white/20"
              )}>
                <div className={cn("w-3 h-3 rounded-sm border flex items-center justify-center", active ? "bg-primary border-primary":"border-white/20")}>
                    {active && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                {t.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dias Semanales */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic">Días</label>
        <div className="flex justify-between gap-1">
          {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((d) => {
            const active = filtros.dias.includes(d as DiaSemana);
            return (
              <button key={d} onClick={() => handleDiasChip(d as DiaSemana)} className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all border",
                active ? "bg-primary border-primary text-white scale-105 shadow-lg shadow-primary/20" : "bg-white/5 border-white/5 text-muted-foreground hover:border-primary/30"
              )} title={d}>
                {d.charAt(0).toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Franja Horaria Compacta */}
      <div className="space-y-2">
        <div className="flex justify-between items-center ml-1">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Horario</label>
          <span className="text-[9px] font-black text-primary">{filtros.horas[0]}h - {filtros.horas[1]}h</span>
        </div>
        <div className="px-2 pt-2 pb-1">
          <Slider defaultValue={[filtros.horas[0], filtros.horas[1]]} max={24} step={1} value={[filtros.horas[0], filtros.horas[1]]} onValueChange={(vals) => setFiltro('horas', [vals[0], vals[1]])} />
        </div>
      </div>

      {/* Clima Dropdown */}
      <div className="space-y-2 pt-2">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic">Clima</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full h-9 bg-white/5 border-white/10 text-[10px] font-bold justify-between px-3 rounded-lg hover:border-primary/50 uppercase transition-all">
              {filtros.clima === 'todas' ? "Todas las condiciones" : filtros.clima}
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[268px] p-1 bg-[#1e293b] border-white/10 shadow-2xl z-[9999]" align="start">
            <div className="flex flex-col gap-0.5">
              {['todas', 'despejado', 'lluvia', 'niebla'].map((c) => (
                <button
                  key={c}
                  onClick={() => setFiltro('clima', c as any)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-[10px] font-bold rounded-md transition-colors uppercase",
                    filtros.clima === c ? "bg-primary text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {c === 'todas' ? "Todas las condiciones" : c}
                  {filtros.clima === c && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

    </aside>
  );
};

export default FiltrosPanel;
