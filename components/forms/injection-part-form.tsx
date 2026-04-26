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
import { CUSTOMERS, MATERIALS } from "@/data/seed-data";
import type { InjectionPart } from "@/types";

const schema = z.object({
  partNo:            z.string().min(1, "Wymagane"),
  description:       z.string().min(1, "Wymagane"),
  customer:          z.string().min(1, "Wymagane"),
  segment:           z.enum(["AUTOMOTIVE","INDUSTRIAL","HVAC","MEDICAL"]),
  status:            z.enum(["ACTIVE","RAMPING","NEW","EOL","ON_HOLD"]),
  annualVolume:      z.coerce.number().min(1, "Wymagane"),
  unitPrice:         z.coerce.number().min(0.001, "Wymagane"),
  materialCode:      z.string().min(1, "Wymagane"),
  materialCostPerKg: z.coerce.number().min(0),
  partWeightKg:      z.coerce.number().min(0),
  machineTons:       z.coerce.number().min(0),
  cycleTimeSec:      z.coerce.number().min(1),
  oee:               z.coerce.number().min(1).max(100),
  scrapPct:          z.coerce.number().min(0),
  lastPriceUpdate:   z.string(),
  nextPriceReview:   z.string(),
});

type FormValues = z.infer<typeof schema>;

const DEFAULTS: FormValues = {
  partNo: "", description: "", customer: "",
  segment: "AUTOMOTIVE", status: "NEW",
  annualVolume: 0, unitPrice: 0,
  materialCode: "PP", materialCostPerKg: 1.45,
  partWeightKg: 0, machineTons: 250,
  cycleTimeSec: 30, oee: 85, scrapPct: 2.0,
  lastPriceUpdate: new Date().toISOString().slice(0, 10),
  nextPriceReview: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
};

// Machine rate €/h by tonnage (simplified)
function machineRate(tons: number): number {
  if (tons <= 180) return 42;
  if (tons <= 350) return 55;
  if (tons <= 500) return 68;
  return 85;
}

function calcDerived(v: FormValues) {
  const materialCostPerPart = v.materialCostPerKg * v.partWeightKg * (1 + v.scrapPct / 100);
  const effectiveCycleS = v.cycleTimeSec / (v.oee / 100);
  const rate = machineRate(v.machineTons);
  const machineCostPerPart = (effectiveCycleS / 3600) * rate;
  const laborCostPerPart   = machineCostPerPart * 0.065;
  const totalCostPerPart   = materialCostPerPart + machineCostPerPart + laborCostPerPart;
  const marginPct          = v.unitPrice > 0 ? ((v.unitPrice - totalCostPerPart) / v.unitPrice) * 100 : 0;
  const annualRevenue      = v.annualVolume * v.unitPrice;
  const annualGrossProfit  = v.annualVolume * (v.unitPrice - totalCostPerPart);
  const monthlyVolume      = Math.round(v.annualVolume / 12);
  return { materialCostPerPart, machineCostPerPart, laborCostPerPart, totalCostPerPart, marginPct, annualRevenue, annualGrossProfit, monthlyVolume };
}

interface Props {
  open: boolean;
  onClose: () => void;
  part?: InjectionPart;
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

export function InjectionPartForm({ open, onClose, part }: Props) {
  const { addInjectionPart, updateInjectionPart } = useData();
  const isEdit = !!part;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: part ? {
      partNo: part.partNo, description: part.description, customer: part.customer,
      segment: part.segment, status: part.status,
      annualVolume: part.annualVolume, unitPrice: part.unitPrice,
      materialCode: part.materialCode, materialCostPerKg: part.materialCostPerKg,
      partWeightKg: part.partWeightKg, machineTons: part.machineTons,
      cycleTimeSec: part.cycleTimeSec, oee: part.oee, scrapPct: part.scrapPct,
      lastPriceUpdate: part.lastPriceUpdate, nextPriceReview: part.nextPriceReview,
    } : DEFAULTS,
  });

  useEffect(() => {
    if (open) reset(part ? {
      partNo: part.partNo, description: part.description, customer: part.customer,
      segment: part.segment, status: part.status,
      annualVolume: part.annualVolume, unitPrice: part.unitPrice,
      materialCode: part.materialCode, materialCostPerKg: part.materialCostPerKg,
      partWeightKg: part.partWeightKg, machineTons: part.machineTons,
      cycleTimeSec: part.cycleTimeSec, oee: part.oee, scrapPct: part.scrapPct,
      lastPriceUpdate: part.lastPriceUpdate, nextPriceReview: part.nextPriceReview,
    } : DEFAULTS);
  }, [open, part]);

  const sv = (name: keyof FormValues) => (val: string) => {
    setValue(name, val as never, { shouldValidate: true });
    // Auto-fill material cost per kg when material changes
    if (name === "materialCode") {
      const mat = MATERIALS.find(m => m.code === val);
      if (mat) setValue("materialCostPerKg", mat.pricePerKg);
    }
  };

  const values = watch();
  const derived = calcDerived(values);

  function onSubmit(v: FormValues) {
    const d = calcDerived(v);
    const data: Omit<InjectionPart, "id"> = {
      partNo: v.partNo, description: v.description, customer: v.customer,
      segment: v.segment, status: v.status,
      annualVolume: v.annualVolume, monthlyVolume: d.monthlyVolume,
      unitPrice: v.unitPrice, materialCode: v.materialCode,
      materialCostPerKg: v.materialCostPerKg, partWeightKg: v.partWeightKg,
      machineTons: v.machineTons, cycleTimeSec: v.cycleTimeSec,
      oee: v.oee, scrapPct: v.scrapPct,
      laborCostPerPart: d.laborCostPerPart, machineCostPerPart: d.machineCostPerPart,
      materialCostPerPart: d.materialCostPerPart, totalCostPerPart: d.totalCostPerPart,
      marginPct: d.marginPct, annualRevenue: d.annualRevenue, annualGrossProfit: d.annualGrossProfit,
      lastPriceUpdate: v.lastPriceUpdate, nextPriceReview: v.nextPriceReview,
    };

    if (isEdit && part) {
      updateInjectionPart(part.id, data);
      toast.success("Część zaktualizowana");
    } else {
      addInjectionPart(data);
      toast.success("Część dodana", { description: v.partNo });
    }
    onClose();
  }

  const fmt = (n: number, dec = 3) => isNaN(n) || !isFinite(n) ? "—" : n.toFixed(dec);
  const fmtEur = (n: number) => isNaN(n) || !isFinite(n) ? "—" : `€${n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const marginColor = derived.marginPct >= 20 ? "text-emerald-400" : derived.marginPct >= 15 ? "text-amber-400" : "text-rose-400";

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEdit ? "Edytuj część" : "Nowa część wtryskowa"}</SheetTitle>
          <SheetDescription>Dane zapisywane lokalnie · koszty wyliczane automatycznie</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-10">
          {/* Podstawowe */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Numer części *" error={errors.partNo?.message}>
              <Input {...register("partNo")} placeholder="BM-XX-001" className="h-9" />
            </Field>
            <Field label="Klient *" error={errors.customer?.message}>
              <Select onValueChange={sv("customer")} defaultValue={watch("customer")}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Wybierz" /></SelectTrigger>
                <SelectContent>
                  {CUSTOMERS.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  <SelectItem value="Inny">Inny</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Opis / nazwa części *" error={errors.description?.message}>
            <Input {...register("description")} placeholder="np. Ventilation Grille Front" className="h-9" />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Segment">
              <Select onValueChange={sv("segment")} defaultValue={watch("segment")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTOMOTIVE">Automotive</SelectItem>
                  <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                  <SelectItem value="HVAC">HVAC</SelectItem>
                  <SelectItem value="MEDICAL">Medical</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select onValueChange={sv("status")} defaultValue={watch("status")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">Nowa</SelectItem>
                  <SelectItem value="RAMPING">Rozruch</SelectItem>
                  <SelectItem value="ACTIVE">Aktywna</SelectItem>
                  <SelectItem value="ON_HOLD">Wstrzymana</SelectItem>
                  <SelectItem value="EOL">EOL</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Maszyna (tony)" error={errors.machineTons?.message}>
              <Select onValueChange={sv("machineTons")} defaultValue={String(watch("machineTons"))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[100, 150, 180, 250, 350, 500, 750, 1000].map(t => <SelectItem key={t} value={String(t)}>{t}t</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Separator />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Wolumen & cena</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Wolumen roczny (szt) *" error={errors.annualVolume?.message}>
              <Input {...register("annualVolume")} type="number" className="h-9" />
            </Field>
            <Field label="Cena jednostkowa (EUR) *" error={errors.unitPrice?.message}>
              <Input {...register("unitPrice")} type="number" step="0.001" className="h-9" />
            </Field>
          </div>

          <Separator />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Materiał</p>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Materiał">
              <Select onValueChange={sv("materialCode")} defaultValue={watch("materialCode")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MATERIALS.map(m => <SelectItem key={m.code} value={m.code}>{m.code} – {m.name.split("(")[0]}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Cena materiału (EUR/kg)">
              <Input {...register("materialCostPerKg")} type="number" step="0.01" className="h-9" />
            </Field>
            <Field label="Masa części (kg)">
              <Input {...register("partWeightKg")} type="number" step="0.001" className="h-9" />
            </Field>
          </div>

          <Separator />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Parametry procesu</p>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Czas cyklu (sek)" error={errors.cycleTimeSec?.message}>
              <Input {...register("cycleTimeSec")} type="number" className="h-9" />
            </Field>
            <Field label="OEE (%)" error={errors.oee?.message}>
              <Input {...register("oee")} type="number" step="0.1" className="h-9" />
            </Field>
            <Field label="Odpad (%)" error={errors.scrapPct?.message}>
              <Input {...register("scrapPct")} type="number" step="0.1" className="h-9" />
            </Field>
          </div>

          {/* Live calc preview */}
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Podgląd wyliczonych kosztów</p>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[
                ["Mat. / szt.", fmt(derived.materialCostPerPart) + " €"],
                ["Maszyna / szt.", fmt(derived.machineCostPerPart) + " €"],
                ["Robocizna / szt.", fmt(derived.laborCostPerPart) + " €"],
                ["Koszt całk. / szt.", fmt(derived.totalCostPerPart) + " €"],
                ["Przychód roczny", fmtEur(derived.annualRevenue)],
                ["Zysk brutto / rok", fmtEur(derived.annualGrossProfit)],
              ].map(([label, val]) => (
                <div key={label} className="bg-card border border-border rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                  <p className="font-semibold">{val}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Marża brutto:</span>
              <span className={`text-lg font-bold ${marginColor}`}>{fmt(derived.marginPct, 1)}%</span>
            </div>
          </div>

          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ostatnia aktualizacja ceny">
              <Input {...register("lastPriceUpdate")} type="date" className="h-9" />
            </Field>
            <Field label="Następny przegląd cen">
              <Input {...register("nextPriceReview")} type="date" className="h-9" />
            </Field>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="submit" className="flex-1">
              {isEdit ? "Zapisz zmiany" : "Dodaj część"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Anuluj</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
