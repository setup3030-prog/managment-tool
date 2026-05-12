"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Factory, ArrowRight, Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    // Demo mode: set cookie and redirect
    document.cookie = "demo_session=true; path=/; max-age=86400";
    toast.success("Welcome back, Thomas!", { description: "Redirecting to Command Center..." });
    await new Promise((r) => setTimeout(r, 600));
    router.push("/dashboard");
  }

  async function handleDemoLogin() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    document.cookie = "demo_session=true; path=/; max-age=86400";
    toast.success("Welcome back, Thomas!", { description: "Redirecting to Command Center..." });
    await new Promise((r) => setTimeout(r, 600));
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand art */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden"
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Mold cross-section SVG art */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <svg width="500" height="400" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Mold halves */}
            <rect x="50" y="40" width="400" height="140" rx="4" stroke="#6366f1" strokeWidth="2" fill="none"/>
            <rect x="50" y="220" width="400" height="140" rx="4" stroke="#6366f1" strokeWidth="2" fill="none"/>
            {/* Part cavity */}
            <path d="M150 180 Q250 200 350 180 L370 220 Q250 240 130 220 Z" stroke="#818cf8" strokeWidth="1.5" fill="rgba(99,102,241,0.05)"/>
            {/* Sprue */}
            <line x1="250" y1="40" x2="250" y2="180" stroke="#6366f1" strokeWidth="3" strokeDasharray="8 4"/>
            {/* Runner */}
            <line x1="150" y1="170" x2="350" y2="170" stroke="#818cf8" strokeWidth="2"/>
            {/* Gates */}
            <circle cx="150" cy="170" r="5" fill="#6366f1"/>
            <circle cx="350" cy="170" r="5" fill="#6366f1"/>
            {/* Ejector pins */}
            <line x1="170" y1="220" x2="170" y2="310" stroke="#475569" strokeWidth="2" strokeDasharray="4 3"/>
            <line x1="250" y1="220" x2="250" y2="310" stroke="#475569" strokeWidth="2" strokeDasharray="4 3"/>
            <line x1="330" y1="220" x2="330" y2="310" stroke="#475569" strokeWidth="2" strokeDasharray="4 3"/>
            {/* Cooling channels */}
            <path d="M80 80 Q130 60 180 80 Q230 100 280 80 Q330 60 380 80 Q430 100 460 80" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.6"/>
            <path d="M80 280 Q130 260 180 280 Q230 300 280 280 Q330 260 380 280 Q430 300 460 280" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.6"/>
            {/* Parting line */}
            <line x1="40" y1="200" x2="460" y2="200" stroke="#94a3b8" strokeWidth="1" strokeDasharray="12 4"/>
          </svg>
        </div>

        {/* Floating metrics */}
        <div className="absolute top-16 right-10 space-y-3">
          {[
            { label: "OEE", value: "92.3%", color: "text-emerald-400" },
            { label: "Margin", value: "19.8%", color: "text-indigo-400" },
            { label: "OTD", value: "98.9%", color: "text-emerald-400" },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.15 }}
              className="flex items-center gap-3 bg-white/5 backdrop-blur border border-white/10 rounded-lg px-4 py-2"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400">{m.label}</span>
              <span className={`text-sm font-bold ${m.color}`}>{m.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div className="absolute bottom-12 left-12 right-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Factory className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">Rocco Tools</span>
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-3">
              Factory ERP meets<br />
              <span className="gradient-text">Startup SaaS</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Complete command center for your injection molding operation. Manage RFQs, track margins, monitor OEE — all in one place.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right panel — login form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-1 items-center justify-center p-8 lg:max-w-md xl:max-w-lg"
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Factory className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-xl font-bold">Rocco Tools</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-1">Sign in to your Command Center</p>
          </div>

          {/* Demo Mode Banner */}
          <motion.button
            onClick={handleDemoLogin}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full mb-6 flex items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-left hover:bg-indigo-500/15 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-indigo-300">Try Demo Mode</p>
              <p className="text-xs text-muted-foreground">Auto-fill credentials & explore</p>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or sign in manually</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@rocco-tools.eu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-primary hover:underline font-medium">
              Request access
            </a>
          </p>

          <p className="mt-8 text-center text-xs text-muted-foreground/50">
            Rocco Tools Command Center v1.0 · © {new Date().getFullYear()} Rocco Tools
          </p>
        </div>
      </motion.div>
    </div>
  );
}
