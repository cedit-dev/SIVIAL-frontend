import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Map, Lock, Mail, AlertTriangle } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        setTimeout(() => {
            setLoading(false);
            if (email === "admin@ufpso.edu.co" && password === "12345") {
                import("sonner").then(({ toast }) => {
                    toast.success("Welcome, Administrator", {
                        description: "Access granted to the SIVIAL system.",
                    });
                });
                navigate("/admin/upload");
            } else {
                import("sonner").then(({ toast }) => {
                    toast.error("Invalid Credentials", {
                        description: "Please check your email and password.",
                    });
                });
            }
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 relative overflow-hidden font-sans">

            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            {/* Back button */}
            <button
                onClick={() => navigate("/")}
                className="absolute top-6 left-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors z-20 group bg-card border border-border px-3 py-1.5 rounded-lg"
            >
                <ArrowLeft className="w-4 h-4" />
                Volver
            </button>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-[420px] bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                {/* Top accent bar */}
                <div className="h-1.5 w-full bg-primary" />

                <div className="px-8 pt-10 pb-8 text-center border-b border-border/50">
                    <div className="flex justify-center mb-6">
                        <img 
                            src="/logo-sinvial.png" 
                            alt="SinVial Ocaña" 
                            className="h-20 w-auto object-contain drop-shadow-2xl" 
                        />
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                            Portal Institucional
                        </span>
                    </div>

                    <h1 className="text-2xl font-black tracking-tight">Acceso Operativo</h1>
                    <p className="text-sm text-muted-foreground mt-2 font-medium">
                        Sistema de Información de Siniestros Viales de Ocaña
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5 bg-card/50">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" /> Correo Institucional
                        </label>
                        <input
                            type="email"
                            placeholder="funcionario@ocana.gov.co"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full h-11 bg-background border border-border text-foreground text-sm rounded-lg px-3 outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" /> Contraseña de Acceso
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full h-11 bg-background border border-border text-foreground text-sm rounded-lg pl-3 pr-10 outline-none focus:border-primary transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-border bg-background accent-primary" />
                            <span className="text-xs font-medium text-muted-foreground">Recordarme</span>
                        </label>
                        <button type="button" className="text-xs font-semibold text-primary hover:underline underline-offset-2">
                            ¿Olvidó su contraseña?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md mt-2 disabled:opacity-70"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>Identificarse <Map className="w-4 h-4" /></>
                        )}
                    </button>
                </form>

                <div className="px-8 pb-6 text-center text-xs text-muted-foreground bg-card/50">
                    Soporte técnico: <span className="font-semibold text-foreground">soporte@ocana.gov.co</span>
                </div>
            </div>

            <div className="absolute bottom-4 text-center w-full z-10">
                <p className="text-xs text-muted-foreground font-medium">
                    © {new Date().getFullYear()} Alcaldía de Ocaña
                </p>
            </div>
        </div>
    );
}
