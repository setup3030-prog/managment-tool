"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save, Send, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CostCalculator } from "./cost-calculator";
import { CUSTOMERS, MATERIALS } from "@/data/seed-data";
import type { Rfq, RfqCalculatorInputs } from "@/types";

const rfqSchema = z.object({
  customerId: z.string().min(1, "Customer required"),
  projectName: z.string().min(2, "Project name required"),
  annualVolume: z.coerce.number().positive("Must be > 0"),
  currency: z.enum(["EUR", "USD", "GBP", "PLN"]),
  partWeight: z.coerce.number().positive("Must be > 0"),
  material: z.string().min(1, "Material required"),
  cycleTime: z.coerce.number().positive("Must be > 0"),
  cavities: z.coerce.number().int().positive("Must be ≥ 1"),
  scrapPct: z.coerce.number().min(0).max(20),
  materialCostPerKg: z.coerce.number().positive(),
  machineRate: z.coerce.number().positive(),
  laborCost: z.coerce.number().positive(),
  packagingCost: z.coerce.number().min(0),
  logisticsCost: z.coerce.number().min(0),
  toolingCost: z.coerce.number().min(0),
  sgaPct: z.coerce.number().min(0).max(50),
  targetMarginPct: z.coerce.number().min(0).max(80),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

type RfqFormValues = z.infer<typeof rfqSchema>;

interface RfqFormProps {
  rfq?: Rfq;
  mode: "create" | "edit";
}

const FIELD = (label: string, name: keyof RfqFormValues, type = "number", placeholder = "") => ({
  label, name, type, placeholder,
});

export function RfqForm({ rfq, mode }: RfqFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("customer");

  const defaults: Partial<RfqFormValues> = rfq ? {
    customerId: rfq.customerId,
    projectName: rfq.projectName,
    annualVolume: rfq.annualVolume,
    currency: rfq.currency as "EUR",
    partWeight: rfq.partWeight,
    material: rfq.material,
    cycleTime: rfq.cycleTime,
    cavities: rfq.cavities,
    scrapPct: rfq.scrapPct,
    materialCostPerKg: rfq.materialCostPerKg,
    machineRate: rfq.machineRate,
    laborCost: rfq.laborCost,
    packagingCost: rfq.packagingCost,
    logisticsCost: rfq.logisticsCost,
    toolingCost: rfq.toolingCost,
    sgaPct: rfq.sgaPct,
    targetMarginPct: rfq.targetMarginPct,
    dueDate: rfq.dueDate?.slice(0, 10),
  } : {
    currency: "EUR",
    annualVolume: 100000,
    scrapPct: 2,
    sgaPct: 8,
    targetMarginPct: 17,
    machineRate: 55,
    laborCost: 28,
    packagingCost: 0.05,
    logisticsCost: 0.10,
    cavities: 1,
    cycleTime: 30,
  };

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RfqFormValues>({
    resolver: zodResolver(rfqSchema),
    defaultValues: defaults,
  });

  const values = watch();

  const calculatorInputs: RfqCalculatorInputs = {
    partWeight: values.partWeight ?? 0,
    material: values.material ?? "",
    cycleTime: values.cycleTime ?? 30,
    cavities: values.cavities ?? 1,
    scrapPct: values.scrapPct ?? 2,
    materialCostPerKg: values.materialCostPerKg ?? 0,
    machineRate: values.machineRate ?? 55,
    laborCost: values.laborCost ?? 28,
    packagingCost: values.packagingCost ?? 0,
    logisticsCost: values.logisticsCost ?? 0,
    toolingCost: values.toolingCost ?? 0,
    sgaPct: values.sgaPct ?? 8,
    targetMarginPct: values.targetMarginPct ?? 17,
    annualVolume: values.annualVolume ?? 0,
    currency: values.currency ?? "EUR",
  };

  async function onSubmit(data: RfqFormValues) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    toast.success(mode === "create" ? "RFQ created!" : "RFQ updated!", {
      description: `${data.projectName} saved as draft.`,
    });
    setSaving(false);
    router.push("/rfq");
  }

  function handlePdf() {
    window.open(`/api/rfq/${rfq?.id ?? "preview"}/pdf`, "_blank");
  }

  const Field = useCallback(
    ({ label, name, type = "number", placeholder = "", className = "" }: { label: string; name: keyof RfqFormValues; type?: string; placeholder?: string; className?: string }) => (
      <div className={`space-y-1.5 ${className}`}>
        <Label className="text-xs">{label}</Label>
        <Input
          type={type}
          step={type === "number" ? "any" : undefined}
          placeholder={placeholder}
          className="h-9"
          {...register(name)}
        />
        {errors[name] && <p className="text-xs text-destructive">{(errors[name] as { message: string })?.message}</p>}
      </div>
    ),
    [register, errors]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="part">Part Data</TabsTrigger>
          <TabsTrigger value="cost">Cost Inputs</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        {/* Tab 1: Customer Info */}
        <TabsContent value="customer" className="mt-4">
          <Card>
            <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs">Customer *</Label>
                <Controller
                  control={control}
                  name="customerId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select customer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CUSTOMERS.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.flag} {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.customerId && <p className="text-xs text-destructive">{errors.customerId.message}</p>}
              </div>
              <Field label="Project Name *" name="projectName" type="text" placeholder="e.g. Dashboard Carrier B-Pillar" className="md:col-span-2" />
              <Field label="Annual Volume (pcs) *" name="annualVolume" placeholder="100000" />
              <div className="space-y-1.5">
                <Label className="text-xs">Currency</Label>
                <Controller
                  control={control}
                  name="currency"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["EUR", "USD", "GBP", "PLN"].map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Due Date</Label>
                <Input type="date" className="h-9" {...register("dueDate")} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Part Data */}
        <TabsContent value="part" className="mt-4">
          <Card>
            <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Part Weight (kg) *" name="partWeight" placeholder="0.35" />
              <div className="space-y-1.5">
                <Label className="text-xs">Material *</Label>
                <Controller
                  control={control}
                  name="material"
                  render={({ field }) => (
                    <Select onValueChange={(v) => {
                      field.onChange(v);
                    }} defaultValue={field.value}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select material..." /></SelectTrigger>
                      <SelectContent>
                        {MATERIALS.map((m) => (
                          <SelectItem key={m.id} value={`${m.name}${m.grade ? " " + m.grade : ""}`}>
                            {m.name}{m.grade ? ` ${m.grade}` : ""} — €{m.pricePerKg}/kg
                          </SelectItem>
                        ))}
                        <SelectItem value="PP GF20">PP GF20</SelectItem>
                        <SelectItem value="PP Talc 20%">PP Talc 20%</SelectItem>
                        <SelectItem value="PA6 GF35">PA6 GF35</SelectItem>
                        <SelectItem value="PC/ABS">PC/ABS</SelectItem>
                        <SelectItem value="PP Flame Ret.">PP Flame Ret.</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <Field label="Cycle Time (seconds) *" name="cycleTime" placeholder="30" />
              <Field label="Cavities *" name="cavities" placeholder="2" />
              <Field label="Scrap % *" name="scrapPct" placeholder="2.0" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Cost Inputs */}
        <TabsContent value="cost" className="mt-4">
          <Card>
            <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Material Cost (€/kg) *" name="materialCostPerKg" placeholder="2.80" />
              <Field label="Machine Rate (€/hr) *" name="machineRate" placeholder="55" />
              <Field label="Labour Cost (€/hr) *" name="laborCost" placeholder="28" />
              <Field label="Packaging (€/part)" name="packagingCost" placeholder="0.05" />
              <Field label="Logistics (€/part)" name="logisticsCost" placeholder="0.10" />
              <Field label="Tooling Cost (€ total)" name="toolingCost" placeholder="85000" />
              <Field label="SG&A %" name="sgaPct" placeholder="8" />
              <Field label="Target Margin %" name="targetMarginPct" placeholder="17" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Summary / Live Calculator */}
        <TabsContent value="summary" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-5 space-y-2">
                <p className="text-sm font-semibold mb-3">Input Summary</p>
                {[
                  ["Customer", CUSTOMERS.find(c => c.id === values.customerId)?.name ?? "—"],
                  ["Project", values.projectName || "—"],
                  ["Annual Volume", values.annualVolume ? `${values.annualVolume.toLocaleString()} pcs/yr` : "—"],
                  ["Part Weight", values.partWeight ? `${values.partWeight} kg` : "—"],
                  ["Material", values.material || "—"],
                  ["Cycle Time", values.cycleTime ? `${values.cycleTime}s` : "—"],
                  ["Cavities", values.cavities ?? "—"],
                  ["Tooling Cost", values.toolingCost ? `€${values.toolingCost.toLocaleString()}` : "—"],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div>
              <p className="text-sm font-semibold mb-3">Live Calculation</p>
              <CostCalculator inputs={calculatorInputs} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Draft"}
        </Button>
        <Button type="button" variant="secondary" className="gap-2" onClick={() => {
          toast.success("RFQ marked as Sent", { description: "Status updated and customer notified." });
        }}>
          <Send className="w-4 h-4" />
          Mark as Sent
        </Button>
        {mode === "edit" && rfq && (
          <Button type="button" variant="outline" className="gap-2 ml-auto" onClick={handlePdf}>
            <FileDown className="w-4 h-4" />
            Generate PDF
          </Button>
        )}
      </div>
    </form>
  );
}
