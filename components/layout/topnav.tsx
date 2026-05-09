"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Bell, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandPalette } from "./command-palette";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const BREADCRUMBS: Record<string, string> = {
  "/dashboard": "Executive Summary",
  "/tooling": "Tooling Business",
  "/injection": "Injection Business",
  "/financial": "Financial Overview",
  "/sales": "Sales / RFQ",
  "/risks": "Risks & Actions",
  "/reports": "Reports",
  "/settings": "Settings",
  "/rfq": "RFQ / Quoting",
  "/rfq/new": "New RFQ",
  "/crm": "CRM Pipeline",
};

function getBreadcrumbs(pathname: string): string[] {
  const parts: string[] = [];
  let path = "";
  for (const segment of pathname.split("/").filter(Boolean)) {
    path += "/" + segment;
    parts.push(BREADCRUMBS[path] ?? segment.replace(/-/g, " "));
  }
  return parts;
}

export function TopNav() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = getBreadcrumbs(pathname);

  useEffect(() => { setMounted(true); }, []);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  function handleLogout() {
    document.cookie = "demo_session=; path=/; max-age=0";
    toast.info("Signed out");
    router.push("/login");
  }

  return (
    <>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4 lg:px-6">
        {/* Breadcrumb */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm flex-1">
          <span className="text-muted-foreground">Shapers</span>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight size={13} className="text-muted-foreground/50" />
              <span className={i === breadcrumbs.length - 1 ? "font-medium text-foreground" : "text-muted-foreground"}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>

        {/* Search button */}
        <button
          onClick={() => setPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-muted/30 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors min-w-[200px] max-w-xs"
        >
          <Search size={14} />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
        </button>

        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" onClick={() => toast.info("No new notifications", { description: "You're all caught up!" })}>
            <Bell size={16} />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">3</Badge>
          </Button>

          {/* Theme toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
          )}

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg hover:bg-accent px-2 py-1.5 transition-colors">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-indigo-500/20 text-indigo-300 text-xs font-bold">BZ</AvatarFallback>
                </Avatar>
                <span className="hidden lg:block text-sm font-medium">Bartlomiej Zarski</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-medium">Bartlomiej Zarski</p>
                <p className="text-xs text-muted-foreground font-normal">bartlomiej.zarski@shapers.eu</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
