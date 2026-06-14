import { useMemo } from "react";
import {
  Tags,
  Banknote,
  Calculator,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { isSameMonth, parseISO, subMonths } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency, type Category, type Expense } from "@/lib/expenses";

interface Props {
  items: Expense[];
  byMonth: { label: string; key: string; total: number }[];
}

export function InsightsSection({ items, byMonth }: Props) {
  const insights = useMemo(() => {
    const byCat = new Map<Category, number>();
    items.forEach(
      (e) => byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount),
    );
    const highestCat = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0];
    const mostExpensive = items.reduce<Expense | null>(
      (m, e) => (!m || e.amount > m.amount ? e : m),
      null,
    );
    const avg = items.length
      ? items.reduce((s, e) => s + e.amount, 0) / items.length
      : 0;

    const now = new Date();
    const thisMonth = items
      .filter((e) => isSameMonth(parseISO(e.date), now))
      .reduce((s, e) => s + e.amount, 0);
    const lastMonth = items
      .filter((e) => isSameMonth(parseISO(e.date), subMonths(now, 1)))
      .reduce((s, e) => s + e.amount, 0);
    const trend =
      lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    return { highestCat, mostExpensive, avg, count: items.length, trend };
  }, [items]);

  const maxMonth = Math.max(...byMonth.map((b) => b.total), 1);

  return (
    <Card className="glass hover-lift animate-in-up border-0 shadow-card">
      <CardHeader>
        <CardTitle className="font-display">Insights</CardTitle>
        <CardDescription>Key metrics from your spending</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {/* Highest spending category */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <Tags className="h-4 w-4 text-primary" />
              Top category
            </div>
            <p className="font-display text-xl font-semibold tabular-nums">
              {insights.highestCat ? insights.highestCat[0] : "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {insights.highestCat
                ? formatCurrency(insights.highestCat[1])
                : "No data"}
            </p>
          </div>

          {/* Most expensive expense */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <Banknote className="h-4 w-4 text-destructive" />
              Most expensive
            </div>
            <p className="font-display text-xl font-semibold tabular-nums">
              {insights.mostExpensive
                ? formatCurrency(insights.mostExpensive.amount)
                : "—"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {insights.mostExpensive?.title ?? "No data"}
            </p>
          </div>

          {/* Average expense amount */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <Calculator className="h-4 w-4 text-success" />
              Average
            </div>
            <p className="font-display text-xl font-semibold tabular-nums">
              {insights.count > 0 ? formatCurrency(insights.avg) : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </div>

          {/* Number of transactions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <Receipt className="h-4 w-4 text-warning" />
              Transactions
            </div>
            <p className="font-display text-xl font-semibold tabular-nums">
              {insights.count}
            </p>
            <p className="text-xs text-muted-foreground">Total logged</p>
          </div>

          {/* Monthly spending trend */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              Monthly trend
            </div>
            <div className="flex items-baseline gap-2">
              <p className="font-display text-xl font-semibold tabular-nums">
                {insights.count > 0 && Math.abs(insights.trend) > 0
                  ? `${Math.abs(insights.trend).toFixed(0)}%`
                  : "—"}
              </p>
              {insights.count > 0 && Math.abs(insights.trend) > 0 && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    insights.trend >= 0
                      ? "text-destructive"
                      : "text-success",
                  )}
                >
                  {insights.trend >= 0 ? "↑" : "↓"}
                </span>
              )}
            </div>
            <div className="flex h-8 items-end gap-1">
              {byMonth.map((m, i) => {
                const h = (m.total / maxMonth) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-primary/30"
                    style={{ height: `${Math.max(h, 4)}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
