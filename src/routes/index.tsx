import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  DollarSign,
  Receipt,
  TrendingUp,
  CalendarRange,
  Sparkles,
  ArrowUpRight,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
} from "lucide-react";
import { format, isSameMonth, parseISO, subMonths } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { TopBar } from "@/components/TopBar";
import { StatCard } from "@/components/StatCard";
import { ExpenseForm } from "@/components/ExpenseForm";
import { BudgetProgress } from "@/components/BudgetProgress";
import { useBudget, useExpenses } from "@/hooks/useExpenses";
import {
  CATEGORY_COLORS,
  formatCurrency,
  formatCompactCurrency,
  type Category,
  type Expense,
} from "@/lib/expenses";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { InsightsSection } from "@/components/InsightsSection";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Penny" },
      { name: "description", content: "Overview of your spending and budgets." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { items, add } = useExpenses();
  const [budget] = useBudget();
  const [open, setOpen] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const prev = subMonths(now, 1);
    const monthly = items.filter((e) => isSameMonth(parseISO(e.date), now));
    const lastMonthly = items.filter((e) => isSameMonth(parseISO(e.date), prev));
    const total = items.reduce((s, e) => s + e.amount, 0);
    const monthTotal = monthly.reduce((s, e) => s + e.amount, 0);
    const lastTotal = lastMonthly.reduce((s, e) => s + e.amount, 0);
    const highest = items.reduce<Expense | null>(
      (m, e) => (!m || e.amount > m.amount ? e : m),
      null,
    );
    const trend = lastTotal > 0 ? { value: ((monthTotal - lastTotal) / lastTotal) * 100 } : undefined;
    return { total, monthTotal, highest, count: items.length, trend };
  }, [items]);

  const byCategory = useMemo(() => {
    const map = new Map<Category, number>();
    items.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [items]);

  const byMonth = useMemo(() => {
    const months: { label: string; key: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      months.push({ label: format(d, "MMM"), key: format(d, "yyyy-MM"), total: 0 });
    }
    items.forEach((e) => {
      const key = e.date.slice(0, 7);
      const m = months.find((x) => x.key === key);
      if (m) m.total += e.amount;
    });
    return months;
  }, [items]);

  const insight = useMemo(() => generateInsight(items, budget, stats.monthTotal), [items, budget, stats.monthTotal]);

  const recent = useMemo(
    () => [...items].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [items],
  );

  const budgetPct = budget > 0 ? Math.min(100, (stats.monthTotal / budget) * 100) : 0;

  return (
    <>
      <TopBar title="Dashboard" subtitle="Your financial overview at a glance" onAdd={() => setOpen(true)} />
      <div className="space-y-6 p-4 md:space-y-8 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard delay={0} label="Total spending" value={formatCurrency(stats.total)} icon={DollarSign} accent="primary" hint="All time" />
          <StatCard delay={60} label="This month" value={formatCurrency(stats.monthTotal)} icon={CalendarRange} accent="success" hint={format(new Date(), "MMMM yyyy")} trend={stats.trend} />
          <StatCard delay={120} label="Total expenses" value={String(stats.count)} icon={Receipt} accent="warning" hint="Transactions logged" />
          <StatCard delay={180} label="Highest expense" value={stats.highest ? formatCurrency(stats.highest.amount) : "—"} icon={TrendingUp} accent="destructive" hint={stats.highest?.title ?? "No data"} />
        </div>

        {budget > 0 && (
          <Card className={cn(
            "glass border-0 shadow-card animate-in-up",
            budgetPct >= 100 && "border-destructive/20 shadow-[0_0_24px_-8px_color-mix(in_oklab,var(--destructive)_30%,transparent)]",
            budgetPct >= 80 && budgetPct < 100 && "border-warning/20 shadow-[0_0_24px_-8px_color-mix(in_oklab,var(--warning)_30%,transparent)]"
          )}>
            <CardContent className="p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Monthly budget</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatCurrency(stats.monthTotal)} of {formatCurrency(budget)} used
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "tabular-nums",
                    budgetPct >= 100 && "bg-destructive/15 text-destructive",
                    budgetPct >= 80 && budgetPct < 100 && "bg-warning/15 text-warning",
                    budgetPct < 80 && "bg-success/15 text-success"
                  )}
                >
                  {budgetPct >= 100 && <AlertOctagon className="mr-1 h-3 w-3" />}
                  {budgetPct >= 80 && budgetPct < 100 && <AlertTriangle className="mr-1 h-3 w-3" />}
                  {budgetPct < 80 && <CheckCircle2 className="mr-1 h-3 w-3" />}
                  {budgetPct >= 100 ? `${budgetPct.toFixed(2)}%` : `${budgetPct.toFixed(1)}%`}
                </Badge>
              </div>
              <BudgetProgress value={budgetPct} />
            </CardContent>
          </Card>
        )}

        <InsightsSection items={items} byMonth={byMonth} />

        <div className="grid gap-4 md:gap-6 lg:grid-cols-5">
          <Card className="glass hover-lift border-0 shadow-card animate-in-up lg:col-span-3">
            <CardHeader>
              <CardTitle className="font-display">Monthly spending</CardTitle>
              <CardDescription>Last 6 months trend</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byMonth} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.35} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatCompactCurrency(v)} />
                  <Tooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.4, radius: 8 }}
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)", boxShadow: "var(--shadow-elevated)" }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Bar dataKey="total" fill="url(#barGrad)" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass hover-lift border-0 shadow-card animate-in-up lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-display">By category</CardTitle>
              <CardDescription>Where your money goes</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {byCategory.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3} stroke="var(--card)" strokeWidth={2}>
                      {byCategory.map((e) => (
                        <Cell key={e.name} fill={CATEGORY_COLORS[e.name as Category]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)", boxShadow: "var(--shadow-elevated)" }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No category breakdown yet" />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-5">
          <Card className="shadow-card lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent expenses</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <EmptyState />
              ) : (
                <ul className="divide-y">
                  {recent.map((e) => (
                    <li key={e.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 rounded-lg"
                          style={{ background: `color-mix(in oklab, ${CATEGORY_COLORS[e.category]} 20%, transparent)` }}
                        />
                        <div>
                          <p className="text-sm font-medium">{e.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {e.category} · {format(parseISO(e.date), "MMM d")}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold tabular-nums">{formatCurrency(e.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card lg:col-span-2 bg-gradient-to-br from-primary/10 via-card to-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Smart insights
              </CardTitle>
              <CardDescription>Auto-generated for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {insight.map((line, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{line}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <ExpenseForm open={open} onOpenChange={setOpen} onSubmit={add} />
    </>
  );
}

function generateInsight(items: Expense[], budget: number, monthTotal: number): string[] {
  const out: string[] = [];
  if (items.length === 0) {
    return ["Add a few expenses and we'll surface trends, top categories, and budget alerts."];
  }
  const byCat = new Map<Category, number>();
  items.forEach((e) => byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount));
  const top = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0];
  if (top) out.push(`Your top category is ${top[0]} at ${formatCurrency(top[1])}.`);

  if (budget > 0) {
    const pct = (monthTotal / budget) * 100;
    if (pct > 100) {
      const overAmount = monthTotal - budget;
      const overPct = pct - 100;
      out.push(
        `Budget exceeded by ${formatCurrency(overAmount)} — ${overPct.toFixed(2)}% over budget.`,
      );
    } else if (pct >= 80) {
      out.push(`You've used ${pct.toFixed(1)}% of your monthly budget — slow down.`);
    } else {
      out.push(`You're on track — ${formatCurrency(budget - monthTotal)} left this month.`);
    }
  } else {
    out.push("Set a monthly budget to get personalized alerts.");
  }

  const now = new Date();
  const prev = subMonths(now, 1);
  const cur = items.filter((e) => isSameMonth(parseISO(e.date), now)).reduce((s, e) => s + e.amount, 0);
  const last = items.filter((e) => isSameMonth(parseISO(e.date), prev)).reduce((s, e) => s + e.amount, 0);
  if (last > 0) {
    const diff = ((cur - last) / last) * 100;
    out.push(
      diff >= 0
        ? `Spending is up ${diff.toFixed(0)}% vs last month.`
        : `Nice — spending is down ${Math.abs(diff).toFixed(0)}% vs last month.`,
    );
  }
  return out;
}
