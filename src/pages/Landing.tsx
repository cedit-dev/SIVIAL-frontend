import { useNavigate, Link } from "react-router-dom";
import { AlertTriangle, Map as MapIcon, ShieldCheck, BarChart3, ChevronRight, Target, Users, Phone, Mail, MapPin, Menu, X, Map } from "lucide-react";
import { useState } from 'react';

export default function Landing() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col font-sans">
            
            {/* Minimalist Navbar - Color matched to Logo background */}
            <nav className="w-full flex items-center justify-between px-6 py-2 bg-[#0f172a] sticky top-0 z-50 transition-all">
                <Link to="/" className="flex items-center gap-3 group">
                    <img src="/logo-sinvial.png" alt="SinVial Logo" className="h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-105" />
                </Link>
                
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    <button onClick={() => scrollToSection('inicio')} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Inicio</button>
                    <button onClick={() => scrollToSection('nosotros')} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Sobre Nosotros</button>
                    <button onClick={() => scrollToSection('objetivos')} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Objetivos</button>
                    <button onClick={() => scrollToSection('contacto')} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Contacto</button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4 border-l border-border pl-4">
                        <button onClick={() => navigate('/mapa')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                            <MapIcon size={16} /> Mapa Interactivo
                        </button>
                    </div>
                    <button 
                        onClick={() => navigate('/login')}
                        className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                    >
                        Ingresar
                    </button>
                    
                    {/* Hamburger Toggle */}
                    <button 
                        className="md:hidden p-2 text-foreground"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden pt-24 bg-background/98 backdrop-blur-xl animate-in fade-in slide-in-from-top-10 duration-300">
                    <div className="flex flex-col items-center gap-8 p-6">
                        <button onClick={() => scrollToSection('inicio')} className="text-xl font-bold text-foreground">Inicio</button>
                        <button onClick={() => scrollToSection('nosotros')} className="text-xl font-bold text-foreground">Sobre Nosotros</button>
                        <button onClick={() => scrollToSection('objetivos')} className="text-xl font-bold text-foreground">Objetivos</button>
                        <button onClick={() => scrollToSection('contacto')} className="text-xl font-bold text-foreground">Contacto</button>
                        <hr className="w-full border-border/50" />
                        <button 
                            onClick={() => navigate('/mapa')}
                            className="flex items-center gap-3 text-lg font-semibold text-primary"
                        >
                            <MapIcon size={22} /> Mapa Interactivo
                        </button>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <main id="inicio" className="flex-1 relative flex flex-col items-center justify-center px-6 py-20 md:py-32 text-center min-h-[85vh] overflow-hidden">
                {/* AI-Generated Technical Background */}
                <div 
                    className="absolute inset-0 z-0 opacity-50 bg-cover bg-center bg-no-repeat transition-all duration-1000" 
                    style={{ backgroundImage: 'url("/hero-monitoring.png")' }}
                />
                <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/40 via-background/60 to-background" />
                <div className="absolute inset-0 z-[2] bg-primary/5 mix-blend-overlay" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                        <ShieldCheck size={14} />
                        Plataforma Oficial
                    </div>
                    
                    <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6 max-w-5xl text-white drop-shadow-2xl">
                        Sistema de Información de <br className="hidden md:block"/> Siniestros Viales
                    </h1>
                    
                    <p className="text-lg md:text-2xl text-slate-200 max-w-3xl mb-12 leading-relaxed font-medium drop-shadow-md">
                        Inteligencia de datos aplicada al monitoreo, análisis geoespacial y prevención de siniestros viales en el municipio de Ocaña.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5">
                        <Link to="/mapa" className="flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-4 rounded-2xl font-black transition-all shadow-2xl hover:shadow-primary/40 transform hover:-translate-y-1 cursor-pointer">
                            <MapIcon size={20} />
                            Ingresar al Sistema
                            <ChevronRight size={20} className="ml-1" />
                        </Link>
                    </div>
                </div>
            </main>

            {/* Features Row */}
            <section className="border-t border-border bg-card">
                <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center p-6">
                        <div className="w-14 h-14 bg-background border border-border rounded-2xl flex items-center justify-center text-primary mb-4 shadow-sm">
                            <MapIcon size={24} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Mapeo Geográfico</h3>
                        <p className="text-muted-foreground text-sm">Visualización interactiva de puntos de impacto y mapas de calor (Heatmaps) de la ciudad.</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6">
                        <div className="w-14 h-14 bg-background border border-border rounded-2xl flex items-center justify-center text-accent mb-4 shadow-sm">
                            <BarChart3 size={24} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Analítica Táctica</h3>
                        <p className="text-muted-foreground text-sm">Paneles de rendimiento, gráficas comparativas e identificadores de tramos críticos.</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6">
                        <div className="w-14 h-14 bg-background border border-border rounded-2xl flex items-center justify-center text-[#22c55e] mb-4 shadow-sm">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Gestión Institucional</h3>
                        <p className="text-muted-foreground text-sm">Información certera para la implementación controlada de estrategias de seguridad vial.</p>
                    </div>
                </div>
            </section>

            {/* Sobre Nosotros Section */}
            <section id="nosotros" className="py-24 px-6 bg-background relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-bold uppercase tracking-widest mb-4">
                            <Users size={14} />
                            Sobre Nosotros
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black mb-6">El observatorio de seguridad de Ocaña</h2>
                        <p className="text-muted-foreground text-base md:text-lg mb-6 leading-relaxed">
                            SinVial Ocaña nace como una iniciativa interinstitucional para centralizar, analizar y transparentar los datos de accidentes de tránsito en nuestra ciudad.
                        </p>
                        <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                            Nuestra misión es proveer a las autoridades de tránsito, planificadores urbanos y a la ciudadanía en general, de una herramienta tecnológica moderna que permita identificar patrones de riesgo y evaluar la efectividad de las medidas de prevención implementadas.
                        </p>
                    </div>
                    <div className="flex-1 w-full relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-[100px] -z-10" />
                        <img 
                            src="/about-safety.png" 
                            alt="Sobre SinVial" 
                            className="w-full h-auto rounded-3xl border border-white/10 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500" 
                        />
                    </div>
                </div>
            </section>

            {/* Objetivos Section */}
            <section id="objetivos" className="py-24 px-6 bg-card border-y border-border relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/5 to-transparent" />
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 order-2 lg:order-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-background border border-border p-6 md:p-8 rounded-3xl hover:border-primary/50 transition-colors group">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <MapIcon size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">Georreferenciación</h3>
                                    <p className="text-muted-foreground text-sm">Localización espacial de incidentes para identificar puntos críticos.</p>
                                </div>
                                <div className="bg-background border border-border p-6 md:p-8 rounded-3xl hover:border-accent/50 transition-colors group">
                                    <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-primary-foreground transition-colors">
                                        <BarChart3 size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">Analítica Táctica</h3>
                                    <p className="text-muted-foreground text-sm">Estudio de factores de riesgo, horarios y tipos de vehículos.</p>
                                </div>
                                <div className="bg-background border border-border p-6 md:p-8 rounded-3xl hover:border-[#22c55e]/50 transition-colors group">
                                    <div className="w-12 h-12 bg-[#22c55e]/10 text-[#22c55e] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#22c55e] group-hover:text-primary-foreground transition-colors">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">Prevención Real</h3>
                                    <p className="text-muted-foreground text-sm">Datos para campañas de inteligencia vial y operativos de control.</p>
                                </div>
                                <div className="bg-background border border-border p-6 md:p-8 rounded-3xl hover:border-primary/50 transition-colors group">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <Users size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">Transparencia</h3>
                                    <p className="text-muted-foreground text-sm">Acceso libre a estadísticas de siniestralidad para la ciudadanía.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-1 order-1 lg:order-2 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-bold uppercase tracking-widest mb-4">
                                <Target size={14} />
                                Nuestros Objetivos
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black mb-6">Ejes de Acción Inteligente</h2>
                            <p className="text-muted-foreground text-lg mb-8">
                                Transformamos el dato crudo en información accionable para salvar vidas en las vías de Ocaña.
                            </p>
                            <img 
                                src="/features-illustration.png" 
                                alt="Dashboard Illustration" 
                                className="w-full h-auto rounded-3xl shadow-xl border border-border" 
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Contacto Section */}
            <section id="contacto" className="py-24 px-6 bg-background">
                <div className="max-w-4xl mx-auto bg-card border border-border rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-16 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black mb-6">Líneas de Atención</h2>
                        <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Si tienes dudas sobre la plataforma o necesitas reportar incidencias técnicas sobre los datos expuestos, contáctanos a través de nuestros canales oficiales.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="flex items-center gap-4 bg-background border border-border px-6 py-4 rounded-2xl w-full sm:w-auto">
                                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                    <Phone size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Secretaría de Movilidad</p>
                                    <p className="font-bold">+57 (607) 569 0000</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-background border border-border px-6 py-4 rounded-2xl w-full sm:w-auto">
                                <div className="w-10 h-10 bg-accent/10 text-accent rounded-full flex items-center justify-center">
                                    <Mail size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Soporte Técnico</p>
                                    <p className="font-bold">sinvial@ocana.gov.co</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <MapPin size={16} className="shrink-0" />
                            <span className="leading-tight">Alcaldía Municipal de Ocaña - Complejo Histórico de la Gran Convención</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-8 px-6 text-center text-xs text-muted-foreground bg-background">
                <p>© {new Date().getFullYear()} Alcaldía de Ocaña · Norte de Santander. Todos los derechos reservados.</p>
                <p className="mt-2 opacity-70">Sistema de Información de Siniestros Viales - SinVial</p>
            </footer>
        </div>
    );
}
