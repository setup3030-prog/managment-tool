"use client";
import { useState } from "react";
import { Save, Loader2, Settings, Shield, Bell, Users2, Sliders, RotateCcw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { APP_SETTINGS, USERS } from "@/data/seed-data";
import { useData } from "@/context/data-context";
import { toast } from "sonner";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-rose-500/10 text-rose-400",
  SALES: "bg-indigo-500/10 text-indigo-400",
  ENGINEER: "bg-amber-500/10 text-amber-400",
  FINANCE: "bg-emerald-500/10 text-emerald-400",
  VIEWER: "bg-slate-500/10 text-slate-400",
};

function ThresholdRow({ label, green, yellow, greenLabel = "Green ≥", yellowLabel = "Yellow ≥", unit = "%", onGreenChange, onYellowChange, reverse = false }: {
  label: string; green: number; yellow: number;
  greenLabel?: string; yellowLabel?: string; unit?: string;
  onGreenChange: (v: number) => void; onYellowChange: (v: number) => void;
  reverse?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <Label className="text-xs text-muted-foreground whitespace-nowrap">{greenLabel}</Label>
          <Input
            type="number"
            value={green}
            onChange={e => onGreenChange(Number(e.target.value))}
            className="w-20 h-8 text-xs text-right"
          />
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <Label className="text-xs text-muted-foreground whitespace-nowrap">{yellowLabel}</Label>
          <Input
            type="number"
            value={yellow}
            onChange={e => onYellowChange(Number(e.target.value))}
            className="w-20 h-8 text-xs text-right"
          />
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Red &lt; {yellow}{unit}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({ ...APP_SETTINGS });
  const [saving, setSaving] = useState(false);
  const { resetToSeedData } = useData();

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success("Settings saved", { description: "All configuration changes have been applied." });
  }

  function set<K extends keyof typeof APP_SETTINGS>(key: K, value: typeof APP_SETTINGS[K]) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div className="p-6 space-y-6 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" /> Settings
          </h1>
          <p className="text-sm text-muted-foreground">System configuration · Shapers Command Center</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-card border border-border mb-6 p-1 h-auto gap-1">
          <TabsTrigger value="general" className="text-xs px-3 py-1.5 gap-1.5">
            <Settings className="w-3.5 h-3.5" /> General
          </TabsTrigger>
          <TabsTrigger value="thresholds" className="text-xs px-3 py-1.5 gap-1.5">
            <Sliders className="w-3.5 h-3.5" /> Thresholds
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs px-3 py-1.5 gap-1.5">
            <Users2 className="w-3.5 h-3.5" /> Users
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs px-3 py-1.5 gap-1.5">
            <Bell className="w-3.5 h-3.5" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* ── GENERAL ── */}
        <TabsContent value="general">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" /> Company & System
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs">Company Name</Label>
                  <Input
                    value={settings.companyName}
                    onChange={e => set("companyName", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Base Currency</Label>
                  <Select value={settings.currency} onValueChange={v => set("currency", v)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR – Euro</SelectItem>
                      <SelectItem value="USD">USD – US Dollar</SelectItem>
                      <SelectItem value="PLN">PLN – Polish Złoty</SelectItem>
                      <SelectItem value="GBP">GBP – British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">RFQ Validity (days)</Label>
                  <Input
                    type="number"
                    value={settings.rfqValidityDays}
                    onChange={e => set("rfqValidityDays", Number(e.target.value))}
                    className="h-9"
                  />
                  <p className="text-[10px] text-muted-foreground">Default validity period for all new quotations</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Financial Year Start</Label>
                  <Select defaultValue="january">
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="january">January</SelectItem>
                      <SelectItem value="april">April</SelectItem>
                      <SelectItem value="july">July</SelectItem>
                      <SelectItem value="october">October</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold mb-4">Demo Mode</h3>
              <div className="flex items-center justify-between p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Demo Mode Active</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Dane użytkownika trzymane w localStorage. Seed data = dane startowe.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="text-xs text-indigo-400 font-medium">DEMO</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs text-rose-400 border-rose-500/20 hover:bg-rose-500/5"
                    onClick={() => {
                      if (confirm("Usunąć wszystkie ręcznie wprowadzone dane i wrócić do danych demo?")) {
                        resetToSeedData();
                        toast.success("Dane zresetowane do wersji demo");
                      }
                    }}
                  >
                    <RotateCcw className="w-3 h-3" /> Resetuj dane
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── THRESHOLDS ── */}
        <TabsContent value="thresholds">
          <div className="rounded-xl border border-border bg-card p-6 space-y-2">
            <h3 className="text-sm font-semibold mb-2">Traffic Light Thresholds</h3>
            <p className="text-xs text-muted-foreground mb-6">
              Configure the Green / Yellow / Red thresholds for KPI traffic lights across the dashboard.
            </p>

            <ThresholdRow
              label="Gross Margin %"
              green={settings.marginGreenThreshold}
              yellow={settings.marginYellowThreshold}
              onGreenChange={v => set("marginGreenThreshold", v)}
              onYellowChange={v => set("marginYellowThreshold", v)}
            />
            <ThresholdRow
              label="OEE (Overall Equipment Effectiveness)"
              green={settings.oeeGreenThreshold}
              yellow={settings.oeeYellowThreshold}
              onGreenChange={v => set("oeeGreenThreshold", v)}
              onYellowChange={v => set("oeeYellowThreshold", v)}
            />
            <ThresholdRow
              label="On-Time Delivery %"
              green={settings.otdGreenThreshold}
              yellow={settings.otdYellowThreshold}
              onGreenChange={v => set("otdGreenThreshold", v)}
              onYellowChange={v => set("otdYellowThreshold", v)}
            />
            <ThresholdRow
              label="Scrap Rate %"
              green={settings.scrapGreenThreshold}
              yellow={settings.scrapYellowThreshold}
              greenLabel="Green ≤"
              yellowLabel="Yellow ≤"
              onGreenChange={v => set("scrapGreenThreshold", v)}
              onYellowChange={v => set("scrapYellowThreshold", v)}
              reverse
            />

            <div className="pt-4 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Tooling-Specific</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Low margin alert threshold (%)", value: 10 },
                  { label: "Max tryout loops before alert", value: 2 },
                  { label: "Overdue milestone alert (days)", value: 14 },
                ].map(f => (
                  <div key={f.label} className="space-y-2">
                    <Label className="text-xs">{f.label}</Label>
                    <Input type="number" defaultValue={f.value} className="h-9" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── USERS ── */}
        <TabsContent value="users">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold">Team Members</p>
              <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => toast.info("User management", { description: "Connect authentication to manage users" })}>
                + Invite User
              </Button>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {["Name", "Email", "Role", "Department", "Status"].map(h => (
                    <th key={h} className="text-left py-2.5 px-4 text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {USERS.map(u => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                          {u.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", ROLE_COLORS[u.role] ?? "bg-slate-500/10 text-slate-400")}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{u.department ?? "—"}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mt-4">
            <h3 className="text-sm font-semibold mb-4">Role Permissions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground">Permission</th>
                    {["ADMIN", "SALES", "ENGINEER", "FINANCE", "VIEWER"].map(r => (
                      <th key={r} className="text-center py-2 px-3 text-muted-foreground">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", ROLE_COLORS[r])}>{r}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { perm: "View dashboards", admin: true, sales: true, eng: true, fin: true, view: true },
                    { perm: "Create / edit RFQs", admin: true, sales: true, eng: false, fin: false, view: false },
                    { perm: "View financial data", admin: true, sales: false, eng: false, fin: true, view: false },
                    { perm: "Edit project data", admin: true, sales: false, eng: true, fin: false, view: false },
                    { perm: "Manage users", admin: true, sales: false, eng: false, fin: false, view: false },
                    { perm: "Export reports", admin: true, sales: true, eng: true, fin: true, view: false },
                    { perm: "Change settings", admin: true, sales: false, eng: false, fin: false, view: false },
                  ].map(row => (
                    <tr key={row.perm} className="border-b border-border/40">
                      <td className="py-2 px-3 text-muted-foreground">{row.perm}</td>
                      {[row.admin, row.sales, row.eng, row.fin, row.view].map((has, i) => (
                        <td key={i} className="py-2 px-3 text-center">
                          {has
                            ? <span className="text-emerald-400 font-bold">✓</span>
                            : <span className="text-muted-foreground/30">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── NOTIFICATIONS ── */}
        <TabsContent value="notifications">
          <div className="rounded-xl border border-border bg-card p-6 space-y-1">
            <h3 className="text-sm font-semibold mb-4">Notification Preferences</h3>
            {[
              { key: "notifyOnNewRfq" as const, label: "New RFQ received", desc: "When a new quotation request is logged" },
              { key: "notifyOnWonLost" as const, label: "RFQ Won / Lost", desc: "When a quotation decision is received" },
              { key: "notifyOnClaimOpened" as const, label: "New claim opened", desc: "When a warranty or quality claim is opened" },
              { key: "notifyOnOverdueInvoice" as const, label: "Invoice overdue", desc: "When a milestone invoice becomes overdue" },
              { key: "notifyOnLowMargin" as const, label: "Low margin alert", desc: "When a project falls below margin threshold" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3.5 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <Switch
                  checked={settings[item.key]}
                  onCheckedChange={v => set(item.key, v)}
                />
              </div>
            ))}

            <div className="pt-4 border-t border-border mt-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Delivery Channels</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Email notifications", desc: "thomas.keller@shapers.eu", enabled: true },
                  { label: "In-app notifications", desc: "Bell icon in top bar", enabled: true },
                  { label: "Slack integration", desc: "Not configured", enabled: false },
                ].map(ch => (
                  <div key={ch.label} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                    <div>
                      <p className="text-xs font-medium">{ch.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{ch.desc}</p>
                    </div>
                    <Switch defaultChecked={ch.enabled} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
