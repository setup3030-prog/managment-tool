"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useData } from "@/context/data-context";

const schema = z.object({
  description:  z.string().min(1, "Wymagane"),
  customer:     z.string().min(1, "Wymagane"),
  amount:       z.coerce.number().min(0.01, "Kwota > 0"),
  type:         z.enum(["INFLOW","OUTFLOW"]),
  category:     z.string().min(1, "Wymagane"),
  dueDate:      z.string().min(1, "Wymagane"),
  status:       z.enum(["PLANNED","CONFIRMED","OVERDUE"]),
  daysOverdue:  z.coerce.number().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

const DEFAULTS: FormValues = {
  description: "", customer: "", amount: 0,
  type: "INFLOW", category: "Tooling Invoice",
  dueDate: "", status: "PLANNED", daysOverdue: 0,
};

const CATEGORIES = [
  "Tooling Invoice", "Injection Invoice", "Service Contract",
  "Raw Material", "Material Purchase", "Payroll", "Leasing", "Tax", "Other",
];

interface Props {
  open: boolean;
  onClose: () => void;
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

export function CashFlowForm({ open, onClose }: Props) {
  const { addCashFlowItem } = useData();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => { if (open) reset(DEFAULTS); }, [open]);

  const sv = (name: keyof FormValues) => (val: string) => setValue(name, val as never, { shouldValidate: true });
  const watchStatus = watch("status");

  function onSubmit(values: FormValues) {
    addCashFlowItem({
      description: values.description,
      customer: values.customer,
      amount: values.type === "OUTFLOW" ? -Math.abs(values.amount) : values.amount,
      type: values.type,
      category: values.category,
      dueDate: values.dueDate,
      status: values.status,
      daysOverdue: values.status === "OVERDUE" ? (values.daysOverdue ?? 0) : undefined,
    });
    toast.success("Pozycja dodana", { description: `${values.description} – ${values.amount} EUR` });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nowa pozycja cash flow</DialogTitle>
          <DialogDescription>Faktura, płatność lub zobowiązanie</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Opis *" error={errors.description?.message}>
            <Input {...register("description")} placeholder="np. T-2026-013 – Zaliczka 30%" className="h-9" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Klient / Dostawca *" error={errors.customer?.message}>
              <Input {...register("customer")} placeholder="np. BMW AG" className="h-9" />
            </Field>
            <Field label="Typ">
              <Select onValueChange={sv("type")} defaultValue={watch("type")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFLOW">⬆ Wpływ</SelectItem>
                  <SelectItem value="OUTFLOW">⬇ Wypływ</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Kwota (EUR) *" error={errors.amount?.message}>
              <Input {...register("amount")} type="number" step="0.01" className="h-9" />
            </Field>
            <Field label="Kategoria">
              <Select onValueChange={sv("category")} defaultValue={watch("category")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Termin płatności *" error={errors.dueDate?.message}>
              <Input {...register("dueDate")} type="date" className="h-9" />
            </Field>
            <Field label="Status">
              <Select onValueChange={sv("status")} defaultValue={watch("status")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNED">Planowane</SelectItem>
                  <SelectItem value="CONFIRMED">Potwierdzone</SelectItem>
                  <SelectItem value="OVERDUE">Przeterminowane</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {watchStatus === "OVERDUE" && (
            <Field label="Dni przeterminowania">
              <Input {...register("daysOverdue")} type="number" className="h-9" />
            </Field>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">Dodaj pozycję</Button>
            <Button type="button" variant="outline" onClick={onClose}>Anuluj</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
