import { Info, X, Car, User, RefreshCw, Bike, PawPrint, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const LeyendaMapa = () => {
    const [isOpen, setIsOpen] = useState(false);

    const gravedades = [
        { label: 'Fatal', color: '#991b1b', desc: 'Siniestro con personas fallecidas' },
        { label: 'Grave', color: '#e63946', desc: 'Siniestro con heridos de gravedad' },
        { label: 'Leve', color: '#f59e0b', desc: 'Siniestro con heridos leves' },
        { label: 'Solo Daños', color: '#3b82f6', desc: 'Siniestro sin lesionados' },
    ];

    const tipos = [
        { label: 'Choque', icon: <Car size={16} />, desc: 'Colisión entre vehículos' },
        { label: 'Atropello', icon: <User size={16} />, desc: 'Impacto a peatón' },
        { label: 'Volcamiento', icon: <RefreshCw size={16} />, desc: 'Vehículo volcado' },
        { label: 'Caída Moto', icon: <Bike size={16} />, desc: 'Caída de ocupante de moto' },
        { label: 'Animal', icon: <PawPrint size={16} />, desc: 'Choque con semoviente' },
        { label: 'Otro', icon: <AlertTriangle size={16} />, desc: 'Incendio, caída de objeto, etc.' },
    ];

    return (
        <div className="absolute bottom-4 left-4 z-[1000] flex flex-col items-start gap-2">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-3 bg-card/90 backdrop-blur-md border border-border rounded-full shadow-2xl text-foreground hover:bg-primary hover:text-white transition-all transform hover:scale-110 active:scale-95 group"
                    title="Ver Leyenda"
                >
                    <Info size={22} className="group-hover:animate-pulse" />
                </button>
            ) : (
                <div className="w-72 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <Info size={18} className="text-primary" />
                            <h4 className="font-bold text-sm uppercase tracking-wider">Guía del Mapa</h4>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="space-y-5">
                        <section>
                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-3 tracking-widest">Gravedad (Colores)</p>
                            <div className="grid grid-cols-1 gap-2.5">
                                {gravedades.map(g => (
                                    <div key={g.label} className="flex items-start gap-3 group">
                                        <div className="w-3.5 h-3.5 rounded-full mt-0.5 shadow-[0_0_8px_rgba(0,0,0,0.3)] transition-transform group-hover:scale-110" style={{ backgroundColor: g.color }} />
                                        <div>
                                            <p className="text-xs font-bold leading-none mb-0.5">{g.label}</p>
                                            <p className="text-[10px] text-muted-foreground leading-tight">{g.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-3 tracking-widest">Iconografía (Tipos)</p>
                            <div className="grid grid-cols-2 gap-3">
                                {tipos.map(t => (
                                    <div key={t.label} className="flex items-center gap-2 group p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                                        <div className="p-1.5 bg-muted rounded-md text-muted-foreground group-hover:text-primary transition-colors">
                                            {t.icon}
                                        </div>
                                        <span className="text-[11px] font-semibold">{t.label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-center">
                        <p className="text-[9px] text-muted-foreground italic">Datos oficiales de Siniestralidad Vial</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeyendaMapa;
