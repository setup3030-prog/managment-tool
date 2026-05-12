"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Factory, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", company: "", password: "" });

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Access request submitted!", {
      description: "An administrator will review your request and send login credentials.",
    });
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Factory className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-xl font-bold">Rocco Tools</span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Request Access</h1>
          <p className="text-muted-foreground mt-1">An admin will review and activate your account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input placeholder="Thomas Keller" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>Work Email</Label>
            <Input type="email" placeholder="name@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>Company</Label>
            <Input placeholder="Rocco Tools GmbH" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>Preferred Password</Label>
            <Input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="h-11" />
          </div>

          <Button type="submit" className="w-full h-11 mt-2" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><ArrowRight className="w-4 h-4" /> Request Access</>}
          </Button>
        </form>

        <button onClick={() => router.push("/login")} className="mt-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </button>
      </motion.div>
    </div>
  );
}
