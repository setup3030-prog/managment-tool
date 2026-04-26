"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Factory, LayoutDashboard, Wrench, Settings2, DollarSign,
  ShoppingCart, AlertTriangle, FileBarChart, Settings,
  ChevronLeft, ChevronRight, LogOut, User,
  FlaskConical,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Executive Summary",    icon: LayoutDashboard,  group: "main" },
  { href: "/tooling",    label: "Tooling Business",     icon: Wrench,           group: "main" },
  { href: "/injection",  label: "Injection Business",   icon: FlaskConical,     group: "main" },
  { href: "/financial",  label: "Financial Overview",   icon: DollarSign,       group: "main" },
  { href: "/sales",      label: "Sales / RFQ",          icon: ShoppingCart,     group: "main" },
  { href: "/risks",      label: "Risks / Actions",      icon: AlertTriangle,    group: "main" },
  { href: "/reports",    label: "Reports",               icon: FileBarChart,     group: "tools" },
  { href: "/settings",   label: "Settings",              icon: Settings,         group: "tools" },
];

const BADGE: Record<string, { count: string; color: string }> = {
  "/risks": { count: "5", color: "bg-rose-500" },
  "/tooling": { count: "3", color: "bg-amber-500" },
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    document.cookie = "demo_session=; path=/; max-age=0";
    toast.info("Signed out");
    router.push("/login");
  }

  const mainItems = NAV_ITEMS.filter(n => n.group === "main");
  const toolItems = NAV_ITEMS.filter(n => n.group === "tools");

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className="relative flex flex-col h-screen bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] z-30 overflow-hidden shrink-0"
      >
        {/* Logo */}
        <div className={cn("flex items-center gap-3 px-4 h-16 border-b border-[hsl(var(--sidebar-border))]", collapsed && "justify-center px-0")}>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Factory className="w-4 h-4 text-indigo-400" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <p className="font-bold text-sm text-foreground tracking-tight whitespace-nowrap">Shapers</p>
                <p className="text-[10px] text-muted-foreground whitespace-nowrap">Command Center</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
          {!collapsed && (
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
              Operations
            </p>
          )}
          {mainItems.map(item => <NavItem key={item.href} item={item} pathname={pathname} collapsed={collapsed} />)}

          {!collapsed ? (
            <p className="px-2 py-1 pt-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
              Tools
            </p>
          ) : (
            <div className="my-2 border-t border-[hsl(var(--sidebar-border))]" />
          )}
          {toolItems.map(item => <NavItem key={item.href} item={item} pathname={pathname} collapsed={collapsed} />)}
        </nav>

        {/* User */}
        <div className={cn("border-t border-[hsl(var(--sidebar-border))] p-3", collapsed && "px-2")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--sidebar-accent))] transition-colors",
                  collapsed && "justify-center px-0"
                )}
              >
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 text-left overflow-hidden">
                      <p className="text-xs font-medium text-foreground truncate">T. Keller</p>
                      <p className="text-[10px] text-muted-foreground truncate">Managing Director</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!collapsed && <LogOut className="w-3.5 h-3.5 shrink-0" />}
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Sign out</TooltipContent>}
          </Tooltip>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-[hsl(var(--sidebar-background))] border border-[hsl(var(--sidebar-border))] flex items-center justify-center hover:bg-accent transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>
    </TooltipProvider>
  );
}

function NavItem({ item, pathname, collapsed }: {
  item: typeof NAV_ITEMS[0];
  pathname: string;
  collapsed: boolean;
}) {
  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
  const badge = BADGE[item.href];
  const Icon = item.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 relative group",
            collapsed && "justify-center px-0 py-2.5",
            active
              ? "bg-indigo-500/15 text-indigo-300 font-medium"
              : "text-[hsl(var(--sidebar-foreground))]/70 hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"
          )}
        >
          <Icon className={cn("w-4 h-4 shrink-0", active ? "text-indigo-400" : "")} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex-1 truncate"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
          {!collapsed && badge && (
            <span className={cn("ml-auto text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center", badge.color)}>
              {badge.count}
            </span>
          )}
          {active && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-indigo-400" />
          )}
        </a>
      </TooltipTrigger>
      {collapsed && (
        <TooltipContent side="right">
          {item.label}{badge ? ` (${badge.count})` : ""}
        </TooltipContent>
      )}
    </Tooltip>
  );
}
