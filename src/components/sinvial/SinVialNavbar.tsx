import { FileBadge2, FileText, LogOut, Map, Menu, Moon, ShieldCheck, Sun, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { clearSession, hasEditorialAccess } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/hooks/use-auth-session";
import { type SinVialTheme } from "@/hooks/use-sinvial-theme";

interface SinVialNavbarProps {
  theme: SinVialTheme;
  setTheme: (theme: SinVialTheme) => void;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-sm font-semibold transition-colors",
    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
  );

export default function SinVialNavbar({ theme, setTheme }: SinVialNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const session = useAuthSession();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearSession();
    navigate("/decretos");
  };

  const items = [
    { to: "/", label: "Inicio" },
    { to: "/mapa", label: "Mapa", icon: Map },
    { to: "/decretos", label: "Decretos", icon: FileBadge2 },
  ];

  if (hasEditorialAccess(session)) {
    items.push({ to: "/admin/decretos", label: "Gestión", icon: FileText });
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#161b22]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo-sinvial.png"
              alt="SinVial Ocaña"
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-white">SinVial Ocaña</p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Plataforma Oficial</p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground transition-all hover:bg-white/10"
              title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === "dark" ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            {session ? (
              <button
                onClick={handleLogout}
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground transition-all hover:bg-white/10 md:inline-flex"
              >
                <LogOut size={14} />
                Salir
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="hidden rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 md:inline-flex"
              >
                Ingresar
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen((current) => !current)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground md:hidden"
              aria-label="Abrir navegación"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-x-4 top-20 z-50 rounded-[2rem] border border-white/10 bg-card/95 p-5 shadow-2xl backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <button
                  key={item.to}
                  onClick={() => {
                    navigate(item.to);
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-full px-4 py-3 text-left text-sm font-semibold transition-all",
                    isActive ? "bg-primary text-primary-foreground" : "bg-background text-foreground",
                  )}
                >
                  {Icon ? <Icon size={16} /> : <ShieldCheck size={16} />}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
