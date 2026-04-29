import { CalendarIcon, FileText, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DECRETO_CATEGORIAS, type Decreto, type DecretoPayload } from "@/types/decretos";
import { formatFileSize } from "./decreto-ui";

interface DecretoFormDialogProps {
  open: boolean;
  decreto?: Decreto | null;
  saving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: DecretoPayload) => Promise<void> | void;
}

type FormState = {
  numero: string;
  titulo: string;
  categoria: DecretoPayload["categoria"];
  fechaExpedicion: string;
  fechaVigencia: string;
  estado: DecretoPayload["estado"];
  descripcion: string;
  archivo: File | null;
};

const initialState: FormState = {
  numero: "",
  titulo: "",
  categoria: "General",
  fechaExpedicion: "",
  fechaVigencia: "",
  estado: "Vigente",
  descripcion: "",
  archivo: null,
};

export default function DecretoFormDialog({
  open,
  decreto,
  saving,
  onOpenChange,
  onSubmit,
}: DecretoFormDialogProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentFileName, setCurrentFileName] = useState("");
  const [currentFileSize, setCurrentFileSize] = useState(0);

  useEffect(() => {
    if (!decreto) {
      setForm(initialState);
      setCurrentFileName("");
      setCurrentFileSize(0);
      setErrors({});
      return;
    }

    setForm({
      numero: decreto.numero,
      titulo: decreto.titulo,
      categoria: decreto.categoria,
      fechaExpedicion: decreto.fechaExpedicion,
      fechaVigencia: decreto.fechaVigencia ?? "",
      estado: decreto.estado,
      descripcion: decreto.descripcion,
      archivo: null,
    });
    setCurrentFileName(decreto.archivoNombre);
    setCurrentFileSize(decreto.archivoTamano);
    setErrors({});
  }, [decreto, open]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.numero.trim()) nextErrors.numero = "El número de decreto es obligatorio.";
    if (!form.titulo.trim()) nextErrors.titulo = "El asunto del decreto es obligatorio.";
    if (!form.fechaExpedicion) nextErrors.fechaExpedicion = "La fecha de expedición es obligatoria.";
    if (!form.archivo && !currentFileName) nextErrors.archivo = "Debes adjuntar el PDF del decreto.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    await onSubmit({
      numero: form.numero,
      titulo: form.titulo,
      categoria: form.categoria,
      fechaExpedicion: form.fechaExpedicion,
      fechaVigencia: form.fechaVigencia || undefined,
      estado: form.estado,
      descripcion: form.descripcion,
      archivo: form.archivo,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-[2rem] border-white/10 bg-[#161b22] p-0 text-foreground">
        <form onSubmit={handleSave}>
          <DialogHeader className="border-b border-white/10 px-6 py-5">
            <DialogTitle className="text-2xl font-black">
              {decreto ? "Editar decreto" : "Nuevo decreto"}
            </DialogTitle>
            <DialogDescription>
              Completa la información oficial del decreto y adjunta el documento en PDF.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
            <Field label="Número de decreto" error={errors.numero}>
              <Input
                value={form.numero}
                onChange={(event) => setForm({ ...form, numero: event.target.value })}
                className="h-12 rounded-full border-white/10 bg-background"
                placeholder="Decreto 042 de 2025"
              />
            </Field>

            <Field label="Asunto / Título" error={errors.titulo}>
              <Input
                value={form.titulo}
                onChange={(event) => setForm({ ...form, titulo: event.target.value })}
                className="h-12 rounded-full border-white/10 bg-background"
                placeholder="Asunto del decreto"
              />
            </Field>

            <Field label="Categoría">
              <Select value={form.categoria} onValueChange={(value) => setForm({ ...form, categoria: value as FormState["categoria"] })}>
                <SelectTrigger className="h-12 rounded-full border-white/10 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-card">
                  {DECRETO_CATEGORIAS.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Estado">
              <RadioGroup
                value={form.estado}
                onValueChange={(value) => setForm({ ...form, estado: value as FormState["estado"] })}
                className="flex gap-3 pt-3"
              >
                {["Vigente", "Derogado"].map((estado) => (
                  <div
                    key={estado}
                    className={cn(
                      "flex flex-1 items-center gap-3 rounded-full border px-4 py-3",
                      form.estado === estado ? "border-primary bg-primary/10" : "border-white/10 bg-background",
                    )}
                  >
                    <RadioGroupItem value={estado} id={estado} />
                    <Label htmlFor={estado}>{estado}</Label>
                  </div>
                ))}
              </RadioGroup>
            </Field>

            <Field label="Fecha de expedición" error={errors.fechaExpedicion}>
              <div className="relative">
                <Input
                  type="date"
                  value={form.fechaExpedicion}
                  onChange={(event) => setForm({ ...form, fechaExpedicion: event.target.value })}
                  className="h-12 rounded-full border-white/10 bg-background pr-12"
                />
                <CalendarIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              </div>
            </Field>

            <Field label="Fecha de vigencia">
              <div className="relative">
                <Input
                  type="date"
                  value={form.fechaVigencia}
                  onChange={(event) => setForm({ ...form, fechaVigencia: event.target.value })}
                  className="h-12 rounded-full border-white/10 bg-background pr-12"
                />
                <CalendarIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              </div>
            </Field>

            <div className="md:col-span-2">
              <Field label="Descripción o resumen">
                <Textarea
                  value={form.descripcion}
                  onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
                  className="min-h-[120px] rounded-[1.5rem] border-white/10 bg-background"
                  placeholder="Resumen del decreto..."
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Archivo PDF" error={errors.archivo}>
                <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-white/10 bg-background px-5 py-6 text-center transition-colors hover:border-primary/30">
                  <FileText className="text-primary" size={28} />
                  <div>
                    <p className="font-semibold text-foreground">Seleccionar archivo PDF</p>
                    <p className="text-sm text-muted-foreground">Solo se aceptan archivos .pdf</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setForm({ ...form, archivo: file });
                      setErrors((current) => ({ ...current, archivo: "" }));
                    }}
                  />
                </label>

                {(form.archivo || currentFileName) && (
                  <div className="mt-3 flex items-center justify-between rounded-full border border-white/10 bg-card px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{form.archivo?.name ?? currentFileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(form.archivo?.size ?? currentFileSize)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...form, archivo: null });
                        setCurrentFileName("");
                        setCurrentFileSize(0);
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </Field>
            </div>
          </div>

          <DialogFooter className="border-t border-white/10 px-6 py-5">
            <Button type="button" variant="outline" className="rounded-full border-white/10" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="rounded-full px-6" disabled={saving}>
              {saving ? "Guardando..." : "Guardar decreto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</Label>
      {children}
      {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}
