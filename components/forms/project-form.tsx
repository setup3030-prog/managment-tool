"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useData } from "@/context/data-context";
import { CUSTOMERS } from "@/data/seed-data";
import type { ToolingProject } from "@/types";

const schema = z.object({
  toolNo:               z.string().min(1, "Wymagane"),
  customer:             z.string().min(1, "Wymagane"),
  description:          z.string().min(1, "Wymagane"),
  serviceType:          z.enum(["NEW_TOOL","WARRANTY_REPAIR","PAID_REPAIR","MODIFICATION_ECO","CHINA_TRANSFER","SPARE_PARTS"]),
  status:               z.enum(["ACTIVE","ON_HOLD","COMPLETED","CANCELLED"]),
  riskLevel:            z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]),
  quotedRevenue:        z.coerce.number().min(0),
  quotedCost:           z.coerce.number().min(0),
  estimatedFinalCost:   z.coerce.number().min(0),
  completionPct:        z.coerce.number().min(0).max(100),
  startDate:            z.string().min(1, "Wymagane"),
  eta:                  z.string().min(1, "Wymagane"),
  openECOs:             z.coerce.number().min(0),
  tryoutCount:          z.coerce.number().min(0),
  wip:                  z.coerce.number().min(0),
  steelCost:            z.coerce.number().min(0),
  hotRunnerCost:        z.coerce.number().min(0),
  purchasedComponents:  z.coerce.number().min(0),
  designHoursPlanned:   z.coerce.number().min(0),
  designHoursActual:    z.coerce.number().min(0),
  camHoursPlanned:      z.coerce.number().min(0),
  camHoursActual:       z.coerce.number().min(0),
  cncHoursPlanned:      z.coerce.number().min(0),
  cncHoursActual:       z.coerce.number().min(0),
  edmHoursPlanned:      z.coerce.number().min(0),
  edmHoursActual:       z.coerce.number().min(0),
  fittingHoursPlanned:  z.coerce.number().min(0),
  fittingHoursActual:   z.coerce.number().min(0),
  tryoutLoops:          z.coerce.number().min(0),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  project?: ToolingProject;
}

function toForm(p: ToolingProject): FormValues {
  const cb = p.costBreakdown;
  return {
    toolNo: p.toolNo, customer: p.customer, description: p.description,
    serviceType: p.serviceType, status: p.status, riskLevel: p.riskLevel,
    quotedRevenue: p.quotedRevenue, quotedCost: p.quotedCost,
    estimatedFinalCost: p.estimatedFinalCost, completionPct: p.completionPct,
    startDate: p.startDate, eta: p.eta,
    openECOs: p.openECOs, tryoutCount: p.tryoutCount, wip: p.wip,
    steelCost: cb.steelCost, hotRunnerCost: cb.hotRunnerCost,
    purchasedComponents: cb.purchasedComponents,
    designHoursPlanned: cb.designHoursPlanned, designHoursActual: cb.designHoursActual,
    camHoursPlanned: cb.camHoursPlanned, camHoursActual: cb.camHoursActual,
    cncHoursPlanned: cb.cncHoursPlanned, cncHoursActual: cb.cncHoursActual,
    edmHoursPlanned: cb.edmHoursPlanned, edmHoursActual: cb.edmHoursActual,
    fittingHoursPlanned: cb.fittingHoursPlanned, fittingHoursActual: cb.fittingHoursActual,
    tryoutLoops: cb.tryoutLoops,
  };
}

const DEFAULTS: FormValues = {
  toolNo: "", customer: "", description: "",
  serviceType: "NEW_TOOL", status: "ACTIVE", riskLevel: "LOW",
  quotedRevenue: 0, quotedCost: 0, estimatedFinalCost: 0,
  completionPct: 0, startDate: "", eta: "", openECOs: 0, tryoutCount: 0, wip: 0,
  steelCost: 0, hotRunnerCost: 0, purchasedComponents: 0,
  designHoursPlanned: 0, designHoursActual: 0,
  camHoursPlanned: 0, camHoursActual: 0,
  cncHoursPlanned: 0, cncHoursActual: 0,
  edmHoursPlanned: 0, edmHoursActual: 0,
  fittingHoursPlanned: 0, fittingHoursActual: 0,
  tryoutLoops: 0,
};

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {error && <p className="text-[10px] text-rose-400">{error}</p>}
    </div>
  );
}

export function ProjectForm({ open, onClose, project }: Props) {
  const { addToolingProject, updateToolingProject } = useData();
  const isEdit = !!project;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: project ? toForm(project) : DEFAULTS,
  });

  useEffect(() => {
    if (open) reset(project ? toForm(project) : DEFAULTS);
  }, [open, project]);

  function onSubmit(values: FormValues) {
    const projectData: Omit<ToolingProject, "id"> = {
      toolNo: values.toolNo,
      customer: values.customer,
      description: values.description,
      serviceType: values.serviceType,
      status: values.status,
      riskLevel: values.riskLevel,
      quotedRevenue: values.quotedRevenue,
      quotedCost: values.quotedCost,
      estimatedFinalCost: values.estimatedFinalCost,
      completionPct: values.completionPct,
      startDate: values.startDate,
      eta: values.eta,
      openECOs: values.openECOs,
      tryoutCount: values.tryoutCount,
      wip: values.wip,
      milestones: project?.milestones ?? [],
      costBreakdown: {
        steelCost: values.steelCost,
        hotRunnerCost: values.hotRunnerCost,
        purchasedComponents: values.purchasedComponents,
        designHoursPlanned: values.designHoursPlanned,
        designHoursActual: values.designHoursActual,
        camHoursPlanned: values.camHoursPlanned,
        camHoursActual: values.camHoursActual,
        cncHoursPlanned: values.cncHoursPlanned,
        cncHoursActual: values.cncHoursActual,
        edmHoursPlanned: values.edmHoursPlanned,
        edmHoursActual: values.edmHoursActual,
        fittingHoursPlanned: values.fittingHoursPlanned,
        fittingHoursActual: values.fittingHoursActual,
        tryoutLoops: values.tryoutLoops,
      },
    };

    if (isEdit && project) {
      updateToolingProject(project.id, projectData);
      toast.success("Projekt zaktualizowany", { description: values.toolNo });
    } else {
      addToolingProject(projectData);
      toast.success("Projekt dodany", { description: values.toolNo });
    }
    onClose();
  }

  const SectionTitle = ({ children }: { children: string }) => (
    <div className="pt-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{children}</p>
      <Separator className="mb-4" />
    </div>
  );

  const sv = (name: keyof FormValues) => (val: string) => setValue(name, val as never, { shouldValidate: true });

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEdit ? "Edytuj projekt" : "Nowy projekt narzędziowy"}</SheetTitle>
          <SheetDescription>Dane zapisywane lokalnie w przeglądarce</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-10">
          {/* ─── Podstawowe ─── */}
          <SectionTitle>Podstawowe</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Numer narzędzia *" error={errors.toolNo?.message}>
              <Input {...register("toolNo")} placeholder="T-2026-016" className="h-9" />
            </Field>
            <Field label="Klient *" error={errors.customer?.message}>
              <Select onValueChange={sv("customer")} defaultValue={watch("customer")}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Wybierz klienta" /></SelectTrigger>
                <SelectContent>
                  {CUSTOMERS.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  <SelectItem value="Inny">Inny</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Opis / nazwa części *" error={errors.description?.message}>
            <Input {...register("description")} placeholder="np. Door Panel Inner – B-Pillar Bracket" className="h-9" />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Typ usługi" error={errors.serviceType?.message}>
              <Select onValueChange={sv("serviceType")} defaultValue={watch("serviceType")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW_TOOL">Nowe narzędzie</SelectItem>
                  <SelectItem value="WARRANTY_REPAIR">Naprawa gwarancyjna</SelectItem>
                  <SelectItem value="PAID_REPAIR">Naprawa płatna</SelectItem>
                  <SelectItem value="MODIFICATION_ECO">Modyfikacja / ECO</SelectItem>
                  <SelectItem value="CHINA_TRANSFER">Transfer z Chin</SelectItem>
                  <SelectItem value="SPARE_PARTS">Części zamienne</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select onValueChange={sv("status")} defaultValue={watch("status")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Aktywny</SelectItem>
                  <SelectItem value="ON_HOLD">Wstrzymany</SelectItem>
                  <SelectItem value="COMPLETED">Zakończony</SelectItem>
                  <SelectItem value="CANCELLED">Anulowany</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Poziom ryzyka">
              <Select onValueChange={sv("riskLevel")} defaultValue={watch("riskLevel")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Niskie</SelectItem>
                  <SelectItem value="MEDIUM">Średnie</SelectItem>
                  <SelectItem value="HIGH">Wysokie</SelectItem>
                  <SelectItem value="CRITICAL">Krytyczne</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* ─── Finansowe ─── */}
          <SectionTitle>Finansowe</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Wycena (EUR)" error={errors.quotedRevenue?.message}>
              <Input {...register("quotedRevenue")} type="number" className="h-9" />
            </Field>
            <Field label="Planowany koszt (EUR)">
              <Input {...register("quotedCost")} type="number" className="h-9" />
            </Field>
            <Field label="Szacowany koszt końcowy (EUR)">
              <Input {...register("estimatedFinalCost")} type="number" className="h-9" />
            </Field>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <Field label="Realizacja (%)" error={errors.completionPct?.message}>
              <Input {...register("completionPct")} type="number" min={0} max={100} className="h-9" />
            </Field>
            <Field label="WIP (EUR)">
              <Input {...register("wip")} type="number" className="h-9" />
            </Field>
            <Field label="Otwarte ECO">
              <Input {...register("openECOs")} type="number" className="h-9" />
            </Field>
            <Field label="Próby (tryouts)">
              <Input {...register("tryoutCount")} type="number" className="h-9" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data rozpoczęcia *" error={errors.startDate?.message}>
              <Input {...register("startDate")} type="date" className="h-9" />
            </Field>
            <Field label="Planowana dostawa (ETA) *" error={errors.eta?.message}>
              <Input {...register("eta")} type="date" className="h-9" />
            </Field>
          </div>

          {/* ─── Koszty materiałowe ─── */}
          <SectionTitle>Koszty – materiały</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Stal (EUR)">
              <Input {...register("steelCost")} type="number" className="h-9" />
            </Field>
            <Field label="Hot runner (EUR)">
              <Input {...register("hotRunnerCost")} type="number" className="h-9" />
            </Field>
            <Field label="Kupowane komponenty (EUR)">
              <Input {...register("purchasedComponents")} type="number" className="h-9" />
            </Field>
          </div>

          {/* ─── Godziny ─── */}
          <SectionTitle>Godziny pracy (plan / rzeczywiste)</SectionTitle>
          {([
            ["Design",   "designHoursPlanned",   "designHoursActual"],
            ["CAM",      "camHoursPlanned",       "camHoursActual"],
            ["CNC",      "cncHoursPlanned",       "cncHoursActual"],
            ["EDM",      "edmHoursPlanned",       "edmHoursActual"],
            ["Fitting",  "fittingHoursPlanned",   "fittingHoursActual"],
          ] as [string, keyof FormValues, keyof FormValues][]).map(([dept, plan, act]) => (
            <div key={dept} className="grid grid-cols-3 gap-3 items-center">
              <Label className="text-xs text-muted-foreground">{dept}</Label>
              <Field label="Plan (h)">
                <Input {...register(plan)} type="number" className="h-8" />
              </Field>
              <Field label="Rzeczywiste (h)">
                <Input {...register(act)} type="number" className="h-8" />
              </Field>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-3 items-center">
            <Label className="text-xs text-muted-foreground">Tryout loops</Label>
            <Field label="Liczba prób">
              <Input {...register("tryoutLoops")} type="number" className="h-8" />
            </Field>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isEdit ? "Zapisz zmiany" : "Dodaj projekt"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Anuluj</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
