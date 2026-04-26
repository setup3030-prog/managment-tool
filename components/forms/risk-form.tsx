"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useData } from "@/context/data-context";
import { USERS } from "@/data/seed-data";
import type { RiskAction } from "@/types";

const schema = z.object({
  title:       z.string().min(1, "Wymagane"),
  description: z.string().min(1, "Wymagane"),
  severity:    z.enum(["CRITICAL","HIGH","MEDIUM","LOW"]),
  category:    z.enum(["FINANCIAL","OPERATIONAL","COMMERCIAL","QUALITY","DELIVERY"]),
  impactEur:   z.coerce.number(),
  owner:       z.string().min(1, "Wymagane"),
  dueDate:     z.string().min(1, "Wymagane"),
  status:      z.enum(["OPEN","IN_PROGRESS","MONITORING","RESOLVED"]),
  linkedProject:  z.string().optional(),
  linkedCustomer: z.string().optional(),
  actionsText: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  risk?: RiskAction;
}

const DEFAULTS: FormValues = {
  title: "", description: "", severity: "MEDIUM", category: "FINANCIAL",
  impactEur: 0, owner: "", dueDate: "", status: "OPEN",
  linkedProject: "", linkedCustomer: "", actionsText: "",
};

function toForm(r: RiskAction): FormValues {
  return {
    title: r.title, description: r.description, severity: r.severity,
    category: r.category, impactEur: r.impactEur, owner: r.owner,
    dueDate: r.dueDate, status: r.status,
    linkedProject: r.linkedProject ?? "",
    linkedCustomer: r.linkedCustomer ?? "",
    actionsText: r.actions.join("\n"),
  };
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {error && <p className="text-[10px] text-rose-400">{error}</p>}
    </div>
  );
}

export function RiskForm({ open, onClose, risk }: Props) {
  const { addRiskAction, updateRiskAction } = useData();
  const isEdit = !!risk;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: risk ? toForm(risk) : DEFAULTS,
  });

  useEffect(() => {
    if (open) reset(risk ? toForm(risk) : DEFAULTS);
  }, [open, risk]);

  function onSubmit(values: FormValues) {
    const data: Omit<RiskAction, "id"> = {
      title: values.title,
      description: values.description,
      severity: values.severity,
      category: values.category,
      impactEur: values.impactEur,
      owner: values.owner,
      dueDate: values.dueDate,
      status: values.status,
      linkedProject: values.linkedProject || undefined,
      linkedCustomer: values.linkedCustomer || undefined,
      actions: values.actionsText.split("\n").map(a => a.trim()).filter(Boolean),
    };

    if (isEdit && risk) {
      updateRiskAction(risk.id, data);
      toast.success("Ryzyko zaktualizowane");
    } else {
      addRiskAction(data);
      toast.success("Ryzyko dodane", { description: values.title });
    }
    onClose();
  }

  const sv = (name: keyof FormValues) => (val: string) => setValue(name, val as never, { shouldValidate: true });

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEdit ? "Edytuj ryzyko" : "Nowe ryzyko / działanie"}</SheetTitle>
          <SheetDescription>Dane zapisywane lokalnie w przeglądarce</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-10">
          <Field label="Tytuł *" error={errors.title?.message}>
            <Input {...register("title")} placeholder="np. Projekt X – przekroczony budżet" className="h-9" />
          </Field>

          <Field label="Opis *" error={errors.description?.message}>
            <Textarea {...register("description")} rows={4} placeholder="Szczegółowy opis ryzyka lub problemu..." />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Dotkliwość">
              <Select onValueChange={sv("severity")} defaultValue={watch("severity")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRITICAL">🔴 Krytyczne</SelectItem>
                  <SelectItem value="HIGH">🟠 Wysokie</SelectItem>
                  <SelectItem value="MEDIUM">🟡 Średnie</SelectItem>
                  <SelectItem value="LOW">🟢 Niskie</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Kategoria">
              <Select onValueChange={sv("category")} defaultValue={watch("category")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FINANCIAL">Finansowe</SelectItem>
                  <SelectItem value="OPERATIONAL">Operacyjne</SelectItem>
                  <SelectItem value="COMMERCIAL">Komercyjne</SelectItem>
                  <SelectItem value="QUALITY">Jakość</SelectItem>
                  <SelectItem value="DELIVERY">Dostawa</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Wpływ finansowy (EUR)" error={errors.impactEur?.message}>
              <Input {...register("impactEur")} type="number" placeholder="-15000" className="h-9" />
            </Field>
            <Field label="Status">
              <Select onValueChange={sv("status")} defaultValue={watch("status")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Otwarte</SelectItem>
                  <SelectItem value="IN_PROGRESS">W toku</SelectItem>
                  <SelectItem value="MONITORING">Monitorowane</SelectItem>
                  <SelectItem value="RESOLVED">Rozwiązane</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Właściciel *" error={errors.owner?.message}>
              <Select onValueChange={sv("owner")} defaultValue={watch("owner")}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Wybierz osobę" /></SelectTrigger>
                <SelectContent>
                  {USERS.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}
                  <SelectItem value="Inny">Inny</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Termin *" error={errors.dueDate?.message}>
              <Input {...register("dueDate")} type="date" className="h-9" />
            </Field>
          </div>

          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Powiązany projekt (opcjonalnie)">
              <Input {...register("linkedProject")} placeholder="np. T-2024-001" className="h-9" />
            </Field>
            <Field label="Powiązany klient (opcjonalnie)">
              <Input {...register("linkedCustomer")} placeholder="np. BMW AG" className="h-9" />
            </Field>
          </div>

          <Field label="Działania (każde w nowej linii)">
            <Textarea
              {...register("actionsText")}
              rows={5}
              placeholder={"1. Negocjuj surcharge z klientem\n2. Zlecenie zewnętrzne – ślusarnia\n3. Raport do zarządu do piątku"}
            />
          </Field>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="submit" className="flex-1">
              {isEdit ? "Zapisz zmiany" : "Dodaj ryzyko"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Anuluj</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
