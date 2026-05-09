"use client";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useData } from "@/context/data-context";
import { CUSTOMERS } from "@/data/seed-data";
import { calcRfqCosts, MATERIAL_PRESETS, INJECTION_MATERIALS } from "@/lib/rfq-calc";
import type { RFQ, RfqStatus, InjectionMaterial } from "@/types";

// ── Zod schema ────────────────────────────────────────────────────────────────

const schema = z.object({
  rfqNo:                z.string().min(1, "Wymagane"),
  customerId:           z.string().min(1, "Wybierz klienta"),
  description:          z.string().min(1, "Wymagane"),
  status:               z.enum(["DRAFT","COSTING","SENT","WON","LOST","CANCELLED"]),
  requestDate:          z.string().min(1, "Wymagane"),
  dueDate:              z.string().min(1, "Wymagane"),
  sentDate:             z.string().optional(),
  decisionDate:         z.string().optional(),
  toolingValue:         z.coerce.number().min(0),
  serialValuePA:        z.coerce.number().min(0),
  estimatedToolingCost: z.coerce.number().min(0),
  marginPct:            z.coerce.number().min(0).max(100),
  partsCount:           z.coerce.number().int().min(1),
  lostReason:           z.string().optional(),
  notes:                z.string().optional(),
  // costCalc fields (flat, cc_ prefix)
  cc_material:              z.string(),
  cc_materialCostPerKg:     z.coerce.number().min(0),
  cc_weightGrams:           z.coerce.number().min(0),
  cc_cycleTimeSec:          z.coerce.number().min(0),
  cc_cavities:              z.coerce.number().int().min(1),
  cc_annualVolume:          z.coerce.number().min(0),
  cc_machineRatePerHr:      z.coerce.number().min(0),
  cc_laborRatePerHr:        z.coerce.number().min(0),
  cc_scrapPct:              z.coerce.number().min(0).max(99),
  cc_packagingCostPerPart:  z.coerce.number().min(0),
  cc_logisticsCostPerPart:  z.coerce.number().min(0),
  cc_sgaPct:                z.coerce.number().min(0).max(100),
  cc_targetMarginPct:       z.coerce.number().min(0).max(99),
});

type FormValues = z.infer<typeof schema>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  rfq?: RFQ;
  defaultStatus?: RfqStatus;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().slice(0, 10);

function makeDefaultRfqNo(count: number) {
  const year = new Date().getFullYear();
  return `RFQ-${year}-${String(count + 1).padStart(3, "0")}`;
}

const CC_DEFAULTS = {
  cc_material: "PP" as InjectionMaterial,
  cc_materialCostPerKg: MATERIAL_PRESETS["PP"],
  cc_weightGrams: 0,
  cc_cycleTimeSec: 0,
  cc_cavities: 1,
  cc_annualVolume: 0,
  cc_machineRatePerHr: 35,
  cc_laborRatePerHr: 18,
  cc_scrapPct: 2,
  cc_packagingCostPerPart: 0,
  cc_logisticsCostPerPart: 0,
  cc_sgaPct: 8,
  cc_targetMarginPct: 20,
};

const BASE_DEFAULTS = (rfqNo: string): FormValues => ({
  rfqNo, customerId: "", description: "", status: "DRAFT",
  requestDate: TODAY, dueDate: "", sentDate: "", decisionDate: "",
  toolingValue: 0, serialValuePA: 0, estimatedToolingCost: 0,
  marginPct: 20, partsCount: 1, lostReason: "", notes: "",
  ...CC_DEFAULTS,
});

function toForm(r: RFQ): FormValues {
  const cc = r.costCalc;
  return {
    rfqNo: r.rfqNo, customerId: r.customerId, description: r.description,
    status: r.status, requestDate: r.requestDate, dueDate: r.dueDate,
    sentDate: r.sentDate ?? "", decisionDate: r.decisionDate ?? "",
    toolingValue: r.toolingValue, serialValuePA: r.serialValuePA,
    estimatedToolingCost: r.estimatedToolingCost, marginPct: r.marginPct,
    partsCount: r.partsCount, lostReason: r.lostReason ?? "", notes: r.notes ?? "",
    cc_material:             cc?.material             ?? "PP",
    cc_materialCostPerKg:    cc?.materialCostPerKg    ?? MATERIAL_PRESETS["PP"],
    cc_weightGrams:          cc?.weightGrams          ?? 0,
    cc_cycleTimeSec:         cc?.cycleTimeSec         ?? 0,
    cc_cavities:             cc?.cavities             ?? 1,
    cc_annualVolume:         cc?.annualVolume         ?? 0,
    cc_machineRatePerHr:     cc?.machineRatePerHr     ?? 35,
    cc_laborRatePerHr:       cc?.laborRatePerHr       ?? 18,
    cc_scrapPct:             cc?.scrapPct             ?? 2,
    cc_packagingCostPerPart: cc?.packagingCostPerPart ?? 0,
    cc_logisticsCostPerPart: cc?.logisticsCostPerPart ?? 0,
    cc_sgaPct:               cc?.sgaPct               ?? 8,
    cc_targetMarginPct:      cc?.targetMarginPct      ?? 20,
  };
}

function Field({ label, error, hint, children }: {
  label: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      {error && <p className="text-[10px] text-rose-400">{error}</p>}
    </div>
  );
}

function ResultRow({ label, value, highlight, dimmed }: {
  label: string; value: string; highlight?: boolean; dimmed?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between py-1.5 px-2 rounded text-xs",
      highlight ? "bg-indigo-500/10 font-semibold" : "hover:bg-muted/30",
      dimmed && "opacity-50",
    )}>
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "text-indigo-300" : ""}>{value}</span>
    </div>
  );
}

function fmt(n: number, dec = 4) {
  if (!isFinite(n) || n === 0) return "—";
  return `€${n.toFixed(dec).replace(/\.?0+$/, "")}`;
}
function fmtK(n: number) {
  if (!isFinite(n) || n === 0) return "—";
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}
function fmtEur(n: number) {
  if (!isFinite(n) || n === 0) return "—";
  return `€${Math.round(n).toLocaleString("de-DE")}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RfqForm({ open, onClose, rfq, defaultStatus }: Props) {
  const { rfqs, addRfq, updateRfq } = useData();
  const isEdit = !!rfq;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: rfq ? toForm(rfq) : BASE_DEFAULTS(makeDefaultRfqNo(rfqs.length)),
    });

  useEffect(() => {
    if (open) {
      reset(rfq ? toForm(rfq) : {
        ...BASE_DEFAULTS(makeDefaultRfqNo(rfqs.length)),
        status: defaultStatus ?? "DRAFT",
      });
    }
  }, [open, rfq]);

  const status      = watch("status");
  const toolingCost = watch("estimatedToolingCost");

  // costCalc inputs (watched for live calculation)
  const ccVals = watch([
    "cc_material","cc_materialCostPerKg","cc_weightGrams","cc_cycleTimeSec",
    "cc_cavities","cc_annualVolume","cc_machineRatePerHr","cc_laborRatePerHr",
    "cc_scrapPct","cc_packagingCostPerPart","cc_logisticsCostPerPart",
    "cc_sgaPct","cc_targetMarginPct",
  ]);

  const calc = useMemo(() => {
    const [
      material, materialCostPerKg, weightGrams, cycleTimeSec,
      cavities, annualVolume, machineRatePerHr, laborRatePerHr,
      scrapPct, packagingCostPerPart, logisticsCostPerPart,
      sgaPct, targetMarginPct,
    ] = ccVals;
    if (!annualVolume || !cycleTimeSec || !weightGrams) return null;
    return calcRfqCosts({
      material: (material || "PP") as InjectionMaterial,
      materialCostPerKg:    Number(materialCostPerKg)    || 0,
      weightGrams:          Number(weightGrams)          || 0,
      cycleTimeSec:         Number(cycleTimeSec)         || 0,
      cavities:             Number(cavities)             || 1,
      annualVolume:         Number(annualVolume)         || 0,
      machineRatePerHr:     Number(machineRatePerHr)     || 0,
      laborRatePerHr:       Number(laborRatePerHr)       || 0,
      scrapPct:             Number(scrapPct)             || 0,
      packagingCostPerPart: Number(packagingCostPerPart) || 0,
      logisticsCostPerPart: Number(logisticsCostPerPart) || 0,
      sgaPct:               Number(sgaPct)               || 0,
      targetMarginPct:      Number(targetMarginPct)      || 0,
    }, Number(toolingCost) || 0);
  }, [ccVals, toolingCost]);

  const sv = (name: keyof FormValues) => (val: string) =>
    setValue(name, val as never, { shouldValidate: true });

  function onSubmit(values: FormValues) {
    const hasCostCalc = values.cc_annualVolume > 0 && values.cc_cycleTimeSec > 0;
    const data: Omit<RFQ, "id"> = {
      rfqNo:                values.rfqNo,
      customerId:           values.customerId,
      description:          values.description,
      status:               values.status,
      requestDate:          values.requestDate,
      dueDate:              values.dueDate,
      sentDate:             values.sentDate || undefined,
      decisionDate:         values.decisionDate || undefined,
      toolingValue:         values.toolingValue,
      serialValuePA:        values.serialValuePA,
      estimatedToolingCost: values.estimatedToolingCost,
      marginPct:            values.marginPct,
      partsCount:           values.partsCount,
      lostReason:           values.lostReason || undefined,
      notes:                values.notes || undefined,
      costCalc: hasCostCalc ? {
        material:             values.cc_material as InjectionMaterial,
        materialCostPerKg:    values.cc_materialCostPerKg,
        weightGrams:          values.cc_weightGrams,
        cycleTimeSec:         values.cc_cycleTimeSec,
        cavities:             values.cc_cavities,
        annualVolume:         values.cc_annualVolume,
        machineRatePerHr:     values.cc_machineRatePerHr,
        laborRatePerHr:       values.cc_laborRatePerHr,
        scrapPct:             values.cc_scrapPct,
        packagingCostPerPart: values.cc_packagingCostPerPart,
        logisticsCostPerPart: values.cc_logisticsCostPerPart,
        sgaPct:               values.cc_sgaPct,
        targetMarginPct:      values.cc_targetMarginPct,
      } : undefined,
    };

    if (isEdit && rfq) {
      updateRfq(rfq.id, data);
      toast.success("RFQ zaktualizowane", { description: values.rfqNo });
    } else {
      addRfq(data);
      toast.success("RFQ dodane", { description: values.rfqNo });
    }
    onClose();
  }

  const annualVol = Number(watch("cc_annualVolume")) || 0;
  const bepWarning = calc && annualVol > 0 && calc.bepUnits > annualVol;

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{isEdit ? `Edytuj ${rfq?.rfqNo}` : "Nowe RFQ"}</SheetTitle>
          <SheetDescription>Dane zapisywane lokalnie w przeglądarce</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="rfq" className="w-full">
            <TabsList className="w-full mb-4 bg-muted/40">
              <TabsTrigger value="rfq" className="flex-1 text-xs">Dane RFQ</TabsTrigger>
              <TabsTrigger value="calc" className="flex-1 text-xs">Kalkulator IM</TabsTrigger>
            </TabsList>

            {/* ── TAB 1: DANE RFQ ── */}
            <TabsContent value="rfq" className="space-y-4 pb-10">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nr RFQ *" error={errors.rfqNo?.message}>
                  <Input {...register("rfqNo")} placeholder="RFQ-2026-016" className="h-9 font-mono" />
                </Field>
                <Field label="Status">
                  <Select onValueChange={sv("status")} value={watch("status")}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="COSTING">Costing</SelectItem>
                      <SelectItem value="SENT">Sent</SelectItem>
                      <SelectItem value="WON">Won</SelectItem>
                      <SelectItem value="LOST">Lost</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field label="Klient *" error={errors.customerId?.message}>
                <Select onValueChange={sv("customerId")} value={watch("customerId")}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Wybierz klienta" /></SelectTrigger>
                  <SelectContent>
                    {CUSTOMERS.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Opis / nazwa RFQ *" error={errors.description?.message}>
                <Textarea {...register("description")} rows={2}
                  placeholder="np. BMW Platform X – Front Door Panel Complete Set" />
              </Field>

              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Data wpływu *" error={errors.requestDate?.message}>
                  <Input {...register("requestDate")} type="date" className="h-9" />
                </Field>
                <Field label="Termin oferty *" error={errors.dueDate?.message}>
                  <Input {...register("dueDate")} type="date" className="h-9" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Data wysłania">
                  <Input {...register("sentDate")} type="date" className="h-9" />
                </Field>
                <Field label="Data decyzji">
                  <Input {...register("decisionDate")} type="date" className="h-9" />
                </Field>
              </div>

              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Wartość toolingu (€)" error={errors.toolingValue?.message}>
                  <Input {...register("toolingValue")} type="number" step="1000" className="h-9" />
                </Field>
                <Field label="Serial value PA (€)" error={errors.serialValuePA?.message}>
                  <Input {...register("serialValuePA")} type="number" step="1000" className="h-9" />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Koszt est. toolingu (€)" error={errors.estimatedToolingCost?.message}
                  hint="Używany w kalkulatorze BEP">
                  <Input {...register("estimatedToolingCost")} type="number" step="1000" className="h-9" />
                </Field>
                <Field label="Marża (%)" error={errors.marginPct?.message}>
                  <Input {...register("marginPct")} type="number" step="0.1" className="h-9" />
                </Field>
                <Field label="Liczba części" error={errors.partsCount?.message}>
                  <Input {...register("partsCount")} type="number" min="1" className="h-9" />
                </Field>
              </div>

              {(status === "LOST" || status === "CANCELLED") && (
                <Field label="Powód przegranej / anulowania">
                  <Input {...register("lostReason")} placeholder="np. Competitor 12% lower" className="h-9" />
                </Field>
              )}
              <Field label="Notatki (opcjonalnie)">
                <Textarea {...register("notes")} rows={3} placeholder="Dodatkowe uwagi..." />
              </Field>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button type="submit" className="flex-1">
                  {isEdit ? "Zapisz zmiany" : "Dodaj RFQ"}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>Anuluj</Button>
              </div>
            </TabsContent>

            {/* ── TAB 2: KALKULATOR IM ── */}
            <TabsContent value="calc" className="pb-10">
              <div className="grid grid-cols-2 gap-5">

                {/* LEFT: inputs */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Parametry części</p>

                  <Field label="Materiał">
                    <Select
                      value={watch("cc_material")}
                      onValueChange={val => {
                        setValue("cc_material", val, { shouldValidate: true });
                        setValue("cc_materialCostPerKg",
                          MATERIAL_PRESETS[val as InjectionMaterial] ?? 1.20,
                          { shouldValidate: true });
                      }}
                    >
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {INJECTION_MATERIALS.map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Koszt materiału (€/kg)">
                    <Input {...register("cc_materialCostPerKg")} type="number" step="0.01" className="h-9" />
                  </Field>

                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Masa części (g)">
                      <Input {...register("cc_weightGrams")} type="number" step="1" placeholder="0" className="h-9" />
                    </Field>
                    <Field label="Czas cyklu (s)">
                      <Input {...register("cc_cycleTimeSec")} type="number" step="0.1" placeholder="0" className="h-9" />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Gniazda">
                      <Input {...register("cc_cavities")} type="number" min="1" step="1" className="h-9" />
                    </Field>
                    <Field label="Braki (%)">
                      <Input {...register("cc_scrapPct")} type="number" step="0.1" className="h-9" />
                    </Field>
                  </div>

                  <Field label="Wolumen roczny (szt/rok)">
                    <Input {...register("cc_annualVolume")} type="number" step="1000" placeholder="0" className="h-9" />
                  </Field>

                  <Separator />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Koszty maszynowe</p>

                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Stawka maszyny (€/h)">
                      <Input {...register("cc_machineRatePerHr")} type="number" step="1" className="h-9" />
                    </Field>
                    <Field label="Robocizna (€/h)">
                      <Input {...register("cc_laborRatePerHr")} type="number" step="1" className="h-9" />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Opakowanie (€/szt)">
                      <Input {...register("cc_packagingCostPerPart")} type="number" step="0.001" className="h-9" />
                    </Field>
                    <Field label="Logistyka (€/szt)">
                      <Input {...register("cc_logisticsCostPerPart")} type="number" step="0.001" className="h-9" />
                    </Field>
                  </div>

                  <Separator />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Komercyjne</p>

                  <div className="grid grid-cols-2 gap-2">
                    <Field label="SGA overhead (%)">
                      <Input {...register("cc_sgaPct")} type="number" step="0.5" className="h-9" />
                    </Field>
                    <Field label="Cel. marża (%)">
                      <Input {...register("cc_targetMarginPct")} type="number" step="0.5" className="h-9" />
                    </Field>
                  </div>
                </div>

                {/* RIGHT: results */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Wyniki kalkulacji</p>

                  {!calc ? (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                      Wpisz masę, czas cyklu i wolumen roczny, aby zobaczyć wyniki
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-card overflow-hidden text-xs space-y-0.5 p-1">
                      {/* Production */}
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 pt-2 pb-1">
                        Produkcja
                      </p>
                      <ResultRow label="Szt/h" value={`${Math.round(calc.partsPerHour).toLocaleString("de-DE")}`} />

                      {/* Cost breakdown */}
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 pt-3 pb-1">
                        Koszt / szt
                      </p>
                      <ResultRow label="Materiał"   value={fmt(calc.materialCostPerPart)} />
                      <ResultRow label="Maszyna"    value={fmt(calc.machineCostPerPart)} />
                      <ResultRow label="Robocizna"  value={fmt(calc.laborCostPerPart)} />
                      <ResultRow label="Direct cost" value={fmt(calc.directCostPerPart)} highlight />
                      <ResultRow label="Tooling/szt" value={fmt(calc.toolingPerPart)} />
                      <ResultRow label="+ SGA"      value={fmt(calc.sgaPerPart)} />
                      <ResultRow label="Total cost"  value={fmt(calc.totalCostPerPart)} highlight />

                      {/* Price */}
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 pt-3 pb-1">
                        Cena
                      </p>
                      <ResultRow label="Cena sprzedaży" value={fmt(calc.salesPricePerPart)} highlight />
                      <ResultRow label="Marża / szt"    value={fmt(calc.marginPerPart)} />
                      <ResultRow
                        label="Gross margin"
                        value={`${calc.grossMarginPct.toFixed(1)}%`}
                      />

                      {/* BEP */}
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 pt-3 pb-1">
                        Break-even
                      </p>
                      <ResultRow
                        label="BEP [szt]"
                        value={calc.bepUnits > 0 ? fmtK(calc.bepUnits) : "—"}
                        highlight
                      />
                      <ResultRow
                        label="BEP / vol roczny"
                        value={annualVol > 0 && calc.bepUnits > 0
                          ? `${((calc.bepUnits / annualVol) * 100).toFixed(0)}%`
                          : "—"}
                      />

                      {/* Annual */}
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 pt-3 pb-1">
                        Roczne
                      </p>
                      <ResultRow label="Przychód"      value={fmtEur(calc.annualRevenue)} highlight />
                      <ResultRow label="Zysk"          value={fmtEur(calc.annualProfit)} />
                      <ResultRow label="Zysk %"        value={`${calc.annualProfitPct.toFixed(1)}%`} />

                      {/* Warnings */}
                      {bepWarning && (
                        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2 mt-2 text-[10px] text-rose-400">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          BEP ({fmtK(calc.bepUnits)} szt) przekracza wolumen roczny ({fmtK(annualVol)} szt)
                        </div>
                      )}
                      {calc.grossMarginPct > 0 && (
                        <div className={cn(
                          "flex items-center gap-2 rounded-lg p-2 mt-1 text-[10px]",
                          calc.grossMarginPct >= 17
                            ? "bg-emerald-500/10 text-emerald-400"
                            : calc.grossMarginPct >= 12
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-rose-500/10 text-rose-400"
                        )}>
                          <TrendingUp className="w-3 h-3 shrink-0" />
                          Gross margin {calc.grossMarginPct.toFixed(1)}%
                          {calc.grossMarginPct >= 17 ? " — dobra" : calc.grossMarginPct >= 12 ? " — akceptowalna" : " — za niska"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 mt-4 border-t border-border">
                <Button type="submit" className="flex-1">
                  {isEdit ? "Zapisz zmiany" : "Dodaj RFQ"}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>Anuluj</Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </SheetContent>
    </Sheet>
  );
}
