import { AlertTriangle, ShieldAlert, Download, Maximize, FileText, Table } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiniestrosStore } from '@/store/useSiniestrosStore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';

const currentYear = new Date().getFullYear();

const Header = ({ isFullscreen, toggleFullscreen }: { isFullscreen?: boolean, toggleFullscreen?: () => void }) => {
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
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-background border-b border-border shadow-sm z-50 relative">
      <div className="flex items-center gap-2 md:gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center">
            <img 
              src="/logo-sinvial.png" 
              alt="SinVial Ocaña" 
              className="h-12 md:h-16 w-auto object-contain transition-transform group-hover:scale-105 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" 
            />
          </div>
        </Link>
        <div className="hidden sm:block border-l border-border h-8 mx-1" />
        <div className="hidden lg:block">
          <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground leading-none">Alcaldía de Ocaña</p>
          <p className="text-[11px] font-black text-foreground tracking-tight">Sistema de Información de Siniestros Viales</p>
        </div>
        {/* Original text section, modified to keep currentYear span */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-xl font-bold text-foreground tracking-tight truncate">SinVial Ocaña</h1>
            <span className="hidden xs:inline-block px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-semibold uppercase tracking-wider">
              {currentYear}
            </span>
          </div>
          <p className="hidden sm:block text-xs md:sm text-muted-foreground font-medium truncate">
            Sistema de Información de Siniestros Viales
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
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
            title={isFullscreen ? "Salir de pantalla completa" : "Modo Presentación"}
          >
            <Maximize size={18} />
          </button>
        )}

        <div className="hidden md:flex items-center gap-2 text-sm text-foreground bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
          <ShieldAlert size={16} className="text-primary" />
          <span className="font-semibold text-primary">Plataforma Oficial</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
