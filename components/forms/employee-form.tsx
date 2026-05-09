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
import type { OrgEmployee, OrgDepartment, UserRole } from "@/types";

const DEPARTMENTS: OrgDepartment[] = ["Management", "Technical", "Design", "Sales", "Finance", "Quality"];
const ROLES: UserRole[] = ["ADMIN", "ENGINEER", "SALES", "FINANCE", "VIEWER"];

const schema = z.object({
  name:      z.string().min(1, "Wymagane"),
  position:  z.string().min(1, "Wymagane"),
  department: z.enum(["Management", "Technical", "Design", "Sales", "Finance", "Quality"]),
  reportsTo: z.string().optional(),
  email:     z.string().email("Nieprawidłowy e-mail"),
  phone:     z.string().optional(),
  role:      z.enum(["ADMIN", "ENGINEER", "SALES", "FINANCE", "VIEWER"]),
  hireYear:  z.coerce.number().int().min(1990).max(2099).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

const DEFAULTS: FormValues = {
  name: "", position: "", department: "Technical", reportsTo: "",
  email: "", phone: "", role: "VIEWER", hireYear: "",
};

function toForm(e: OrgEmployee): FormValues {
  return {
    name: e.name, position: e.position, department: e.department,
    reportsTo: e.reportsTo ?? "", email: e.email, phone: e.phone ?? "",
    role: e.role, hireYear: e.hireYear ?? "",
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

interface Props {
  open: boolean;
  onClose: () => void;
  employee?: OrgEmployee;
}

export function EmployeeForm({ open, onClose, employee }: Props) {
  const { employees, addEmployee, updateEmployee } = useData();
  const isEdit = !!employee;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: employee ? toForm(employee) : DEFAULTS,
  });

  useEffect(() => {
    if (open) reset(employee ? toForm(employee) : DEFAULTS);
  }, [open, employee]);

  function onSubmit(values: FormValues) {
    const data: Omit<OrgEmployee, "id"> = {
      name:       values.name,
      position:   values.position,
      department: values.department,
      email:      values.email,
      phone:      values.phone || undefined,
      reportsTo:  values.reportsTo || undefined,
      role:       values.role,
      hireYear:   values.hireYear ? Number(values.hireYear) : undefined,
    };

    if (isEdit && employee) {
      updateEmployee(employee.id, data);
      toast.success("Pracownik zaktualizowany");
    } else {
      addEmployee(data);
      toast.success("Pracownik dodany", { description: values.name });
    }
    onClose();
  }

  const sv = (name: keyof FormValues) => (val: string) => setValue(name, val as never, { shouldValidate: true });

  // Manager options: all employees except the one being edited
  const managerOptions = employees.filter(e => e.id !== employee?.id);

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEdit ? "Edytuj pracownika" : "Nowy pracownik"}</SheetTitle>
          <SheetDescription>Dane zapisywane lokalnie w przeglądarce</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-10">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Imię i nazwisko *" error={errors.name?.message}>
              <Input {...register("name")} placeholder="Jan Kowalski" className="h-9" />
            </Field>
            <Field label="Stanowisko *" error={errors.position?.message}>
              <Input {...register("position")} placeholder="CNC Machinist" className="h-9" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Dział">
              <Select onValueChange={sv("department")} value={watch("department")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Rola systemowa">
              <Select onValueChange={sv("role")} value={watch("role")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Przełożony (opcjonalnie)">
            <Select onValueChange={sv("reportsTo")} value={watch("reportsTo") ?? ""}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Brak przełożonego (root)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">— Brak (root) —</SelectItem>
                {managerOptions.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.name} · {e.position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <Field label="E-mail *" error={errors.email?.message}>
              <Input {...register("email")} type="email" placeholder="jan.kowalski@shapers.pl" className="h-9" />
            </Field>
            <Field label="Telefon (opcjonalnie)">
              <Input {...register("phone")} placeholder="+48 600 100 001" className="h-9" />
            </Field>
          </div>

          <Field label="Rok zatrudnienia (opcjonalnie)">
            <Input {...register("hireYear")} type="number" placeholder="2020" className="h-9 w-32" />
          </Field>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="submit" className="flex-1">
              {isEdit ? "Zapisz zmiany" : "Dodaj pracownika"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Anuluj</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
