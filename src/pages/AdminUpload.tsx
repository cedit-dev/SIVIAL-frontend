import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Upload, 
    FileText, 
    MapPin, 
    Clock, 
    AlertCircle, 
    LogOut, 
    LayoutDashboard, 
    Plus, 
    FileUp, 
    CheckCircle2, 
    ShieldCheck, 
    History, 
    CalendarIcon 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clearSession, hasEditorialAccess } from "@/lib/auth";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminUpload() {
    const navigate = useNavigate();
    const session = useAuthSession();
    const now = new Date();
    const currentHour = now.getHours();
    const [date, setDate] = useState<Date>(now);
    const [hour, setHour] = useState(((currentHour % 12) || 12).toString().padStart(2, '0'));
    const [minute, setMinute] = useState((Math.floor(now.getMinutes() / 5) * 5).toString().padStart(2, '0'));
    const [period, setPeriod] = useState(currentHour >= 12 ? "PM" : "AM");
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!hasEditorialAccess(session)) {
            navigate("/decretos", { replace: true });
        }
    }, [navigate, session]);

    if (!hasEditorialAccess(session)) {
        return null;
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleFileSelect = (file: File) => {
        if (file.name.endsWith('.kml') || file.name.endsWith('.xml') || file.type === 'application/pdf') {
            setUploadedFile(file);
            toast.success("Archivo cargado correctamente", {
                description: `${file.name} listo para procesar.`
            });
        } else {
            toast.error("Formato no compatible", {
                description: "Por favor suba archivos KML, XML o PDF."
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const location = formData.get("location");
        
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("¡Reporte Registrado!", {
                description: `Siniestro en ${location} el ${format(date, "PPP", { locale: es })} a las ${hour}:${minute} ${period}.`,
            });
            setUploadedFile(null);
            (e.target as HTMLFormElement).reset();
            // Reset date to now for next report
            const now = new Date();
            setDate(now);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
            {/* Glossy Header */}
            <nav className="fixed top-0 left-0 right-0 h-20 bg-card/40 backdrop-blur-xl border-b border-white/5 z-50 px-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <ShieldCheck className="text-white w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black tracking-widest text-white uppercase italic">SIVIAL ADMIN</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Portal Operativo</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate("/mapa")}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-all group"
                    >
                        <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Mapa
                    </button>
                    <button 
                        onClick={() => navigate("/admin/decretos")}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-all group"
                    >
                        <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Decretos
                    </button>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <button 
                        onClick={() => {
                            clearSession();
                            navigate("/login");
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 text-white text-xs font-black uppercase tracking-widest hover:bg-destructive/20 hover:text-destructive transition-all border border-white/10"
                    >
                        <LogOut className="w-4 h-4" />
                        Salir
                    </button>
                </div>
            </nav>

            <main className="flex-1 pt-32 pb-16 px-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4"
                        >
                            <span className="inline-block w-8 h-[2px] bg-primary" />
                            Nuevo Reporte Operativo
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black text-white tracking-tighter"
                        >
                            Carga de Información <br/>de <span className="text-primary italic">Campo</span>
                        </motion.h1>
                    </div>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 md:max-w-xs"
                    >
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shrink-0">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                            Asegúrese de adjuntar evidencias fotográficas o archivos geográficos (KML) para una mejor precisión.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Side: Inputs */}
                    <div className="lg:col-span-7 space-y-8">
                        <motion.form 
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-card/30 backdrop-blur-sm rounded-[2.5rem] border border-white/5 p-10 space-y-8 shadow-2xl"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Date & Time Row */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 italic">Fecha del Suceso</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full h-14 bg-white/5 border-white/10 rounded-2xl px-5 text-sm font-bold text-white justify-between">
                                                {date ? format(date, "PPP", { locale: es }) : <span>Fecha</span>}
                                                <CalendarIcon className="w-4 h-4 text-primary opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-card border-white/10"><Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus/></PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 italic">Hora Estimada</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full h-14 bg-white/5 border-white/10 rounded-2xl px-5 text-sm font-bold text-white justify-between">
                                                <span>{hour}:{minute} {period}</span>
                                                <Clock className="w-4 h-4 text-primary opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-48 p-4 bg-card border-white/10"><div className="flex gap-2 items-center"><Select value={hour} onValueChange={setHour}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent className="bg-card">{Array.from({length:12},(_,i)=>(i+1).toString().padStart(2,'0')).map(h=><SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent></Select>:<Select value={minute} onValueChange={setMinute}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent className="bg-card">{["00","05","10","15","20","25","30","35","40","45","50","55"].map(m=><SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select><Select value={period} onValueChange={setPeriod}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent className="bg-card"><SelectItem value="AM">AM</SelectItem><SelectItem value="PM">PM</SelectItem></SelectContent></Select></div></PopoverContent>
                                    </Popover>
                                </div>

                                {/* Severity & Event Type */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 italic">Gravedad del Siniestro</label>
                                    <Select name="severity" defaultValue="herido">
                                        <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 rounded-2xl px-5 text-sm font-bold text-white">
                                            <SelectValue placeholder="Seleccione gravedad" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-white/10 text-white">
                                            <SelectItem value="fatal">Fatal (Fallecidos)</SelectItem>
                                            <SelectItem value="herido">Con Heridos</SelectItem>
                                            <SelectItem value="daños">Solo Daños Materiales</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 italic">Tipo de Evento</label>
                                    <Select name="eventType" defaultValue="choque">
                                        <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 rounded-2xl px-5 text-sm font-bold text-white">
                                            <SelectValue placeholder="Seleccione tipo" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-white/10 text-white">
                                            <SelectItem value="atropello">Atropello</SelectItem>
                                            <SelectItem value="choque">Choque</SelectItem>
                                            <SelectItem value="volcamiento">Volcamiento</SelectItem>
                                            <SelectItem value="caida">Caída de Ocupante</SelectItem>
                                            <SelectItem value="otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Location / Sector */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 italic">Vía / Sector (Ej: San Agustín, Calle 11)</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-primary w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                                    <input 
                                        name="location"
                                        type="text" 
                                        placeholder="Nombre de la vía o sector..."
                                        required
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 text-sm font-bold text-white placeholder:text-white/20 focus:border-primary transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Victims and Vehicles */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 italic">Víctimas / Fallecidos (Ej: 2 / 1)</label>
                                    <input 
                                        name="victims"
                                        type="text" 
                                        placeholder="Total / Fallecidos"
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold text-white focus:border-primary transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 italic">Vehículos Involucrados</label>
                                    <input 
                                        name="vehicles"
                                        type="text" 
                                        placeholder="Camión, automóvil, moto..."
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold text-white focus:border-primary transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Additional Comments */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 italic">Observaciones Adicionales</label>
                                <textarea 
                                    name="notes"
                                    rows={3}
                                    placeholder="Detalles sobre el estado de los conductores, clima, etc..."
                                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm font-bold text-white placeholder:text-white/20 focus:border-primary transition-all outline-none resize-none"
                                />
                            </div>

                            <div className="pt-2">
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-base uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-xl shadow-primary/20"
                                >
                                    {loading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"/> : <>Registrar Siniestro <Plus className="w-6 h-6"/></>}
                                </button>
                            </div>
                        </motion.form>
                    </div>

                    {/* Right Side: File & Activity */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Drag & Drop Area */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                                relative overflow-hidden min-h-[320px] border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center p-10 text-center transition-all duration-500
                                ${isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-white/10 bg-card/20 hover:border-white/20'}
                                ${uploadedFile ? 'border-success bg-success/5' : ''}
                            `}
                        >
                            <AnimatePresence mode="wait">
                                {!uploadedFile ? (
                                    <motion.div 
                                        key="empty"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-2 text-white/40 ring-1 ring-white/10 shadow-inner">
                                            <Upload className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white italic">Adjuntar GIS</h3>
                                            <p className="text-muted-foreground text-[11px] mt-2 max-w-[240px] font-bold uppercase tracking-widest leading-relaxed mx-auto">
                                                Arrastre sus archivos <span className="text-primary italic">KML, XML o PDF</span>
                                            </p>
                                        </div>
                                        <label className="inline-flex items-center gap-3 px-8 py-3.5 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/90 cursor-pointer shadow-xl transition-all">
                                            <FileUp className="w-4 h-4" /> Buscar Archivo
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept=".kml,.xml,.pdf"
                                                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                            />
                                        </label>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="uploaded"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-6"
                                    >
                                        <div className="w-24 h-24 bg-success/20 rounded-[2rem] flex items-center justify-center mx-auto mb-2 text-success shadow-lg shadow-success/10">
                                            <CheckCircle2 className="w-12 h-12" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white italic">Archivo Listo</h3>
                                            <div className="mt-4 p-5 bg-black/40 border border-success/20 rounded-3xl flex items-center gap-4 text-left max-w-sm mx-auto">
                                                <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center text-success shrink-0">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-white truncate italic">{uploadedFile.name}</p>
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setUploadedFile(null)}
                                            className="text-[10px] font-black text-destructive hover:text-destructive/80 uppercase tracking-[0.3em] transition-colors"
                                        >
                                            Eliminar y cambiar
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Decorative background blurs */}
                            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-[100px] -z-10" />
                            <div className="absolute -top-20 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-[100px] -z-10" />
                        </motion.div>

                        {/* Recent History Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-card/30 backdrop-blur-sm rounded-[3rem] border border-white/5 p-8 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                                    <History className="w-4 h-4 text-primary" />
                                    Historial
                                </h3>
                                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">En Vivo</span>
                            </div>
                            
                            <div className="space-y-4">
                                {[
                                    { time: "10:45 AM", user: "Agente Mendoza", action: "Reporte Sta. Clara", status: "Procesado" },
                                    { time: "09:20 AM", user: "Oficial Duarte", action: "Actualización GIS", status: "Validado" },
                                    { time: "Ayer", user: "Sivial Bot", action: "Limpieza de Datos", status: "Sistema" }
                                ].map((item, idx) => (
                                    <div key={idx} className="group flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-crosshair">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary transition-colors">
                                                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-white uppercase tracking-wider">{item.user}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold">{item.action}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-white italic">{item.time}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">{item.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Premium Footer */}
            <footer className="mt-auto py-12 px-8 border-t border-white/5 bg-black/20 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] italic">Antigravity Design Engine</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">© 2026 Alcaldía de Ocaña · SinVial Platform</p>
                    </div>
                    <div className="flex items-center gap-10">
                        {['Documentación', 'Soporte', 'Privacidad'].map((link) => (
                            <a 
                                key={link}
                                href="#" 
                                className="text-[10px] font-black text-muted-foreground hover:text-white transition-all uppercase tracking-[0.2em] relative group"
                            >
                                {link}
                                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all group-hover:w-full" />
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
