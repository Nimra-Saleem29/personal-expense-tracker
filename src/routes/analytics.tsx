import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format, parseISO, subMonths } from "date-fns";
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
import { useExpenses } from "@/hooks/useExpenses";
import { CATEGORY_COLORS, formatCurrency, formatCompactCurrency, type Category } from "@/lib/expenses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Penny" },
      { name: "description", content: "Charts and breakdowns of your spending." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { items } = useExpenses();

  const byCategory = useMemo(() => {
    const map = new Map<Category, number>();
    items.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [items]);

  const byMonth = useMemo(() => {
    const months: { label: string; key: string; total: number }[] = [];
    for (let i = 11; i >= 0; i--) {
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

  const total = items.reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <TopBar title="Analytics" subtitle="Visual breakdown of where your money goes" />
      <div className="space-y-6 p-4 md:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Category breakdown</CardTitle>
              <CardDescription>Share of total spending</CardDescription>
            </CardHeader>
            <CardContent className="h-[360px]">
              {byCategory.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={70} outerRadius={120} paddingAngle={2}>
                      {byCategory.map((e) => (
                        <Cell key={e.name} fill={CATEGORY_COLORS[e.name as Category]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--popover-foreground)" }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No category data yet" />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Monthly trend</CardTitle>
              <CardDescription>Last 12 months</CardDescription>
            </CardHeader>
            <CardContent className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => formatCompactCurrency(v)} />
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--popover-foreground)" }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Bar dataKey="total" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Category leaderboard</CardTitle>
            <CardDescription>Top spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            {byCategory.length === 0 ? <EmptyState message="No category data yet" /> : (
              <ul className="space-y-3">
                {byCategory.map((c) => {
                  const pct = total ? (c.value / total) * 100 : 0;
                  return (
                    <li key={c.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{c.name}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {formatCurrency(c.value)} · {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: CATEGORY_COLORS[c.name as Category] }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// avoid unused import warning when parseISO unused
void parseISO;
