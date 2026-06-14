import { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { isSameMonth, parseISO } from "date-fns";
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Target,
  Wallet,
  TrendingUp,
  PiggyBank,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { useBudget, useExpenses } from "@/hooks/useExpenses";
import { formatCurrency } from "@/lib/expenses";
import { BudgetProgress } from "@/components/BudgetProgress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/budget")({
  head: () => ({
    meta: [
      { title: "Budget — Penny" },
      { name: "description", content: "Set and track your monthly spending budget." },
    ],
  }),
  component: BudgetPage,
});

function BudgetPage() {
  const { items } = useExpenses();
  const [budget, setBudget] = useBudget();
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setDraft(budget ? String(budget) : "");
  }, [budget]);

  const monthTotal = useMemo(() => {
    const now = new Date();
    return items.filter((e) => isSameMonth(parseISO(e.date), now)).reduce((s, e) => s + e.amount, 0);
  }, [items]);

  const pct = budget > 0 ? (monthTotal / budget) * 100 : 0;
  const remaining = budget - monthTotal;

  const isWarning = pct >= 80 && pct < 100;
  const isExceeded = pct >= 100;

  const save = () => {
    const n = parseFloat(draft);
    if (isNaN(n) || n < 0) return toast.error("Enter a valid amount");
    setBudget(n);
    toast.success("Budget updated");
  };

  return (
    <>
      <TopBar title="Budget" subtitle="Set monthly limits and track progress" />
      <div className="space-y-6 p-4 md:p-6">
        <Card className="glass hover-lift border-0 shadow-card animate-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Target className="h-5 w-5 text-primary" />
              Monthly budget
            </CardTitle>
            <CardDescription>We'll alert you as you approach your limit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="budget">Monthly budget (USD)</Label>
                <Input
                  id="budget"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Enter monthly budget"
                  className="no-spinner text-base"
                />
              </div>
              <Button onClick={save} className="gradient-primary text-primary-foreground shadow-glow">
                Save budget
              </Button>
            </div>
          </CardContent>
        </Card>

        {budget > 0 && (
          <Card className="glass hover-lift border-0 shadow-card animate-in-up">
            <CardHeader>
              <CardTitle className="font-display">This month's progress</CardTitle>
              <CardDescription className="tabular-nums">
                {formatCurrency(monthTotal)} spent of {formatCurrency(budget)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium tabular-nums">
                    {isExceeded ? pct.toFixed(2) : pct.toFixed(1)}% used
                  </span>
                  <StatusLabel pct={pct} />
                </div>
                <BudgetProgress value={pct} />
              </div>

              {isWarning && (
                <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 backdrop-blur-sm">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                  <div>
                    <p className="text-sm font-semibold text-warning-foreground">
                      Approaching budget limit
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You've used {pct.toFixed(0)}% of your monthly budget. Consider slowing down your spending.
                    </p>
                  </div>
                </div>
              )}

              {isExceeded && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 shadow-[0_0_24px_-8px_color-mix(in_oklab,var(--destructive)_40%,transparent)] backdrop-blur-sm">
                  <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-destructive">
                      Budget exceeded by {formatCurrency(Math.abs(remaining))}
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {(pct - 100).toFixed(2)}% over budget. You've spent {formatCurrency(monthTotal)} of your {formatCurrency(budget)} limit.
                    </p>
                  </div>
                </div>
              )}

              {!isWarning && !isExceeded && (
                <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 backdrop-blur-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <div>
                    <p className="text-sm font-semibold text-success-foreground">
                      On track
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You're within your monthly budget with {formatCurrency(remaining)} remaining.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <BudgetStat
                  label="Used"
                  value={`${(isExceeded ? pct.toFixed(2) : pct.toFixed(1))}%`}
                  icon={TrendingUp}
                  accent={isExceeded ? "destructive" : isWarning ? "warning" : "success"}
                />
                <BudgetStat
                  label="Remaining"
                  value={formatCurrency(Math.max(0, remaining))}
                  icon={PiggyBank}
                  accent={remaining < 0 ? "destructive" : "success"}
                />
                <BudgetStat
                  label="Over budget"
                  value={remaining < 0 ? formatCurrency(Math.abs(remaining)) : "—"}
                  icon={Wallet}
                  accent={remaining < 0 ? "destructive" : "muted"}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function StatusLabel({ pct }: { pct: number }) {
  if (pct >= 100)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
        <AlertOctagon className="h-3 w-3" />
        Exceeded
      </span>
    );
  if (pct >= 80)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
        <AlertTriangle className="h-3 w-3" />
        Warning
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
      <CheckCircle2 className="h-3 w-3" />
      Healthy
    </span>
  );
}

function BudgetStat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  accent: "muted" | "success" | "warning" | "destructive";
}) {
  const accentMap = {
    muted: "text-muted-foreground",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  };

  const bgMap = {
    muted: "bg-muted/40",
    success: "bg-success/10",
    warning: "bg-warning/10",
    destructive: "bg-destructive/10",
  };

  return (
    <div className={`rounded-xl border border-border/40 ${bgMap[accent]} p-4 backdrop-blur-sm`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${accentMap[accent]}`} />
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p className={`mt-2 font-display text-xl font-semibold tracking-tight tabular-nums ${accentMap[accent]}`}>
        {value}
      </p>
    </div>
  );
}
