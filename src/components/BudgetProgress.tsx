"use client";

import { cn } from "@/lib/utils";

interface BudgetProgressProps {
  value: number;
  className?: string;
}

export function BudgetProgress({ value, className }: BudgetProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const isWarning = value >= 80 && value < 100;
  const isDanger = value >= 100;

  let indicatorColor = "var(--chart-2)";
  if (isDanger) indicatorColor = "var(--destructive)";
  else if (isWarning) indicatorColor = "var(--warning)";

  return (
    <div
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-primary/20",
        className,
      )}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${clamped}%`,
          backgroundColor: indicatorColor,
          boxShadow: isDanger
            ? "0 0 16px color-mix(in oklab, var(--destructive) 50%, transparent)"
            : isWarning
              ? "0 0 16px color-mix(in oklab, var(--warning) 50%, transparent)"
              : "0 0 12px color-mix(in oklab, var(--chart-2) 35%, transparent)",
        }}
      />
    </div>
  );
}
