import { useSiniestrosStore } from '@/store/useSiniestrosStore';
import { TipoSiniestro, GravedadSiniestro, VehiculoInvolucrado, CondicionClima, DiaSemana } from '@/types/siniestros';

const FiltrosPanel = () => {
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

  const formatFecha = (d: Date | null) => d ? d.toISOString().split('T')[0] : '';

  return (
    <aside className="w-full md:w-[320px] lg:w-[340px] bg-card border-r border-border p-5 flex flex-col gap-6 overflow-y-auto h-full shadow-sm z-40 relative custom-scrollbar">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Filtros</h2>
        <button 
          onClick={resetFiltros}
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-2 py-1 rounded"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Stats Resumen */}
      <div className="text-sm text-muted-foreground flex justify-between items-center bg-background p-3 rounded-lg border border-border mt-[-8px]">
        <span>Mostrando:</span>
        <span className="font-bold text-foreground">
          {siniestros.length} de {siniestrosRaw.length} siniestros
        </span>
      </div>

      {/* Rango de Fechas */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-foreground uppercase tracking-wider">Rango de Fechas</label>
        <div className="grid grid-cols-2 gap-2">
          <input 
            type="date" 
            className="w-full bg-background border border-border text-foreground text-sm rounded-md px-3 py-2 outline-none focus:border-primary"
            value={formatFecha(filtros.fechas[0])}
            onChange={(e) => setFiltro('fechas', [e.target.value ? new Date(e.target.value) : null, filtros.fechas[1]])}
          />
          <input 
            type="date" 
            className="w-full bg-background border border-border text-foreground text-sm rounded-md px-3 py-2 outline-none focus:border-primary"
            value={formatFecha(filtros.fechas[1])}
            onChange={(e) => setFiltro('fechas', [filtros.fechas[0], e.target.value ? new Date(e.target.value) : null])}
          />
        </div>
      </div>

      {/* Gravedad */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-foreground uppercase tracking-wider">Gravedad</label>
        <div className="flex flex-col gap-1.5">
          {['fatal', 'grave', 'leve', 'solo_danos'].map((g) => (
            <label key={g} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                checked={filtros.gravedades.includes(g as GravedadSiniestro)}
                onChange={() => handleCheckbox('gravedades', g)}
              />
              <span className="capitalize">{g.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tipo de siniestro */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-foreground uppercase tracking-wider">Tipo</label>
        <div className="grid grid-cols-2 gap-1.5">
          {['choque', 'atropello', 'volcamiento', 'caida_motocicleta', 'choque_animal', 'otro'].map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                checked={filtros.tipos.includes(t as TipoSiniestro)}
                onChange={() => handleCheckbox('tipos', t)}
              />
              <span className="capitalize text-xs truncate" title={t.replace('_', ' ')}>{t.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Vehículo */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-foreground uppercase tracking-wider">Vehículo Involucrado</label>
        <div className="grid grid-cols-2 gap-1.5">
          {['automovil', 'motocicleta', 'camion', 'bicicleta', 'peaton', 'bus'].map((v) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                checked={filtros.vehiculos.includes(v as VehiculoInvolucrado)}
                onChange={() => handleCheckbox('vehiculos', v)}
              />
              <span className="capitalize text-xs">{v}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clima */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-foreground uppercase tracking-wider">Clima</label>
        <select 
          className="w-full bg-background border border-border text-foreground text-sm rounded-md px-3 py-2 outline-none focus:border-primary capitalize"
          value={filtros.clima}
          onChange={(e) => setFiltro('clima', e.target.value as CondicionClima | 'todas')}
        >
          <option value="todas">Todas las condiciones</option>
          {['despejado', 'lluvia', 'niebla'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Día de la semana (Chips) */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-foreground uppercase tracking-wider">Día</label>
        <div className="flex flex-wrap gap-2">
          {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((d) => {
            const isSelected = filtros.dias.includes(d as DiaSemana);
            return (
              <button
                key={d}
                onClick={() => handleDiasChip(d as DiaSemana)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-muted-foreground hover:border-primary hover:text-foreground'
                }`}
              >
                {d.charAt(0).toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Franja Horaria */}
      <div className="flex flex-col gap-2 pb-6">
        <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
          Franja Horaria ({filtros.horas[0]}h - {filtros.horas[1]}h)
        </label>
        <div className="flex items-center gap-4">
          <input 
            type="range" 
            min="0" max="23" 
            className="w-full accent-primary"
            value={filtros.horas[0]}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val < filtros.horas[1]) setFiltro('horas', [val, filtros.horas[1]]);
            }}
          />
          <input 
            type="range" 
            min="1" max="24" 
            className="w-full accent-primary"
            value={filtros.horas[1]}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val > filtros.horas[0]) setFiltro('horas', [filtros.horas[0], val]);
            }}
          />
        </div>
      </div>

    </aside>
  );
};

export default FiltrosPanel;
