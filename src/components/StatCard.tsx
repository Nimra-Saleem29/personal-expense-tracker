import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  accent?: "primary" | "success" | "warning" | "destructive";
  trend?: { value: number; label?: string };
  delay?: number;
}

const accents: Record<string, string> = {
  primary: "gradient-primary text-primary-foreground",
  success: "gradient-success text-primary-foreground",
  warning: "gradient-warning text-primary-foreground",
  destructive: "gradient-destructive text-primary-foreground",
};

export function StatCard({ label, value, icon: Icon, hint, accent = "primary", trend, delay = 0 }: Props) {
  return (
    <Card
      className="group glass hover-lift relative overflow-hidden border-0 shadow-card animate-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40",
          accents[accent],
        )}
      />
      <CardContent className="relative flex items-start justify-between gap-4 p-6">
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          <p className="font-display text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          {(hint || trend) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-1.5 py-0.5 font-medium tabular-nums",
                    trend.value >= 0
                      ? "bg-success/15 text-success"
                      : "bg-destructive/15 text-destructive",
                  )}
                >
                  {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value).toFixed(0)}%
                </span>
              )}
              {hint && <span className="truncate">{hint}</span>}
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-glow transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
            accents[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
