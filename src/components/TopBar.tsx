import { Moon, Sun, Plus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useCurrency } from "@/lib/currency";

interface Props {
  title: string;
  subtitle?: string;
  onAdd?: () => void;
}

export function TopBar({ title, subtitle, onAdd }: Props) {
  const { theme, toggle } = useTheme();
  // Subscribe so all pages re-render when currency changes
  useCurrency();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/40 glass px-4 md:px-6">
      <SidebarTrigger />
      <div className="flex-1 min-w-0">
        <h1 className="font-display truncate text-base font-semibold tracking-tight md:text-lg">{title}</h1>
        {subtitle && <p className="hidden truncate text-xs text-muted-foreground md:block">{subtitle}</p>}
      </div>
      <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className="rounded-full">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      {onAdd && (
        <Button onClick={onAdd} className="gradient-primary text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add expense</span>
        </Button>
      )}
    </header>
  );
}
