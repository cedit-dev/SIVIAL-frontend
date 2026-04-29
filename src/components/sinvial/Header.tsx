import { ShieldAlert, Download, Maximize, FileText, Table, Moon, Sun, X, FileBadge2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiniestrosStore } from '@/store/useSiniestrosStore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';

const Header = ({ isFullscreen, toggleFullscreen, theme, setTheme }: { 
  isFullscreen?: boolean, 
  toggleFullscreen?: () => void,
  theme: string,
  setTheme: (theme: string) => void
}) => {
  const { siniestros } = useSiniestrosStore();
  const [isExporting, setIsExporting] = useState(false);

  const exportCSV = () => {
    if (!siniestros.length) return;
    const headers = ['ID', 'Fecha', 'Hora', 'Tipo', 'Gravedad', 'Víctimas', 'Fallecidos', 'Vehículos', 'Vía', 'Clima', 'Cond. Vía'];
    const rows = siniestros.map(s => [
      s.id, s.fecha, s.hora, s.tipo, s.gravedad, s.victimas, s.fallecidos, 
      `"${s.vehiculos_involucrados.join(', ')}"`, `"${s.via}"`, s.condicion_clima, s.condicion_via
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `siniestros_ocana_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const statsPanel = document.getElementById('analytics-panel');
      if (!statsPanel) return;
      
      const canvas = await html2canvas(statsPanel, { scale: 1.5 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.text("Reporte de Siniestralidad Vial - SinVial Ocaña", 14, 15);
      pdf.setFontSize(10);
      pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 22);
      
      pdf.addImage(imgData, 'PNG', 0, 30, pdfWidth, pdfHeight);
      pdf.save(`reporte_sinvial_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch(err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-2 bg-[#0f172a] z-50 relative border-b border-white/5">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="/logo-sinvial.png" 
            alt="SinVial Ocaña" 
            className="h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-105" 
          />
        </Link>
        <div className="hidden sm:block border-l border-border/20 h-6 mx-1" />
        <div className="flex flex-col">
          <h1 className="text-sm md:text-base font-bold text-white tracking-tight leading-none">SinVial Ocaña</h1>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest hidden md:block">
            Sistema de Información de Siniestros Viales
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/decretos"
          className="hidden items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-background md:flex"
        >
          <FileBadge2 size={14} />
          Decretos
        </Link>

        {/* Acciones */}
        <div className="flex bg-secondary/50 rounded-lg p-1 border border-border">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-background rounded-md transition-colors"
            title="Exportar CSV"
          >
            <Table size={14} /> <span className="hidden sm:inline">CSV</span>
          </button>
          <button 
            onClick={exportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-background rounded-md transition-colors disabled:opacity-50"
            title="Exportar PDF"
          >
            <FileText size={14} /> <span className="hidden sm:inline">{isExporting ? '...' : 'PDF'}</span>
          </button>
        </div>

        {toggleFullscreen && (
          <button 
            onClick={toggleFullscreen}
            className="flex items-center justify-center p-2 rounded-lg bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
            title={isFullscreen ? "Contraer" : "Expandir / Pantalla Completa"}
          >
            {isFullscreen ? <X size={18} /> : <Maximize size={18} />}
          </button>
        )}

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`w-10 h-10 flex items-center justify-center rounded-full border border-border transition-all active:scale-90 ${
            theme === 'dark' 
              ? 'bg-transparent hover:bg-white/5' 
              : 'bg-secondary/20 hover:bg-secondary/40'
          }`}
          title={theme === 'dark' ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="hidden md:flex items-center gap-2 text-sm text-foreground bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
          <ShieldAlert size={16} className="text-primary" />
          <span className="font-semibold text-primary">Plataforma Oficial</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
