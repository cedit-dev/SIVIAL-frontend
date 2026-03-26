import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Intento de acceso a ruta inexistente:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground font-sans p-6">
      <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 shadow-lg shadow-primary/5">
        <AlertTriangle size={48} strokeWidth={2.5} />
      </div>
      
      <div className="text-center max-w-md">
        <h1 className="mb-2 text-6xl font-black tracking-tighter text-foreground">404</h1>
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">Página no encontrada</h2>
        <p className="mb-8 text-base text-muted-foreground">
          La ruta solicitada no existe o no se encuentra disponible en este momento en el Sistema de Información de Siniestros Viales.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-bold transition-all shadow-md"
        >
          <Home size={18} />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
