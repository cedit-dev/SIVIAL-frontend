import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Map } from "lucide-react";

import { saveSession } from "@/lib/auth";

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
        saveSession({
          email,
          name: "Administrador SinVial",
          role: "admin",
        });

        import("sonner").then(({ toast }) => {
          toast.success("Acceso concedido", {
            description: "Has ingresado como administrador.",
          });
        });
        navigate("/admin/decretos");
        return;
      }

      if (email === "editor@ocana.gov.co" && password === "12345") {
        saveSession({
          email,
          name: "Editor de Decretos",
          role: "editor",
        });

        import("sonner").then(({ toast }) => {
          toast.success("Acceso concedido", {
            description: "Has ingresado como editor institucional.",
          });
        });
        navigate("/admin/decretos");
        return;
      }

      import("sonner").then(({ toast }) => {
        toast.error("Credenciales inválidas", {
          description: "Verifica el correo y la contraseña institucional.",
        });
      });
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 font-sans text-foreground">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <button
        onClick={() => navigate("/")}
        className="group absolute left-6 top-6 z-20 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <div className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="h-1.5 w-full bg-primary" />

        <div className="border-b border-border/50 px-8 pb-8 pt-10 text-center">
          <div className="mb-6 flex justify-center">
            <img src="/logo-sinvial.png" alt="SinVial Ocaña" className="h-20 w-auto object-contain drop-shadow-2xl" />
          </div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Portal Institucional</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight">Acceso Operativo</h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Sistema de Información de Siniestros Viales de Ocaña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-card/50 px-8 py-8">
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> Correo Institucional
            </label>
            <input
              type="email"
              placeholder="funcionario@ocana.gov.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Contraseña de Acceso
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-border bg-background pl-3 pr-10 text-sm text-foreground outline-none transition-colors focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-border bg-background accent-primary" />
              <span className="text-xs font-medium text-muted-foreground">Recordarme</span>
            </label>
            <button type="button" className="text-xs font-semibold text-primary hover:underline underline-offset-2">
              ¿Olvidó su contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 disabled:opacity-70"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                Identificarse <Map className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="bg-card/50 px-8 pb-6 text-center text-xs text-muted-foreground">
          Accesos demo: <span className="font-semibold text-foreground">admin@ufpso.edu.co</span> y{" "}
          <span className="font-semibold text-foreground">editor@ocana.gov.co</span> con clave{" "}
          <span className="font-semibold text-foreground">12345</span>
        </div>
      </div>

      <div className="absolute bottom-4 z-10 w-full text-center">
        <p className="text-xs font-medium text-muted-foreground">© {new Date().getFullYear()} Alcaldía de Ocaña</p>
      </div>
    </div>
  );
}
