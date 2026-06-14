export type Category =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Entertainment"
  | "Bills"
  | "Health"
  | "Travel"
  | "Other";

export const CATEGORIES: Category[] = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Health",
  "Travel",
  "Other",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "var(--chart-1)",
  Transport: "var(--chart-2)",
  Shopping: "var(--chart-3)",
  Entertainment: "var(--chart-4)",
  Bills: "var(--chart-5)",
  Health: "var(--chart-6)",
  Travel: "var(--chart-7)",
  Other: "var(--muted-foreground)",
};

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string; // ISO yyyy-mm-dd
  notes?: string;
  createdAt: number;
}

const KEY = "expenses_v1";
const BUDGET_KEY = "monthly_budget_v1";

export function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Expense[]) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(items: Expense[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function loadBudget(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(BUDGET_KEY);
  return raw ? Number(raw) || 0 : 0;
}

export function saveBudget(n: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BUDGET_KEY, String(n));
}

export { formatCurrency, formatCompactCurrency } from "./currency";

export function exportCSV(items: Expense[]) {
  const headers = ["Title", "Amount", "Category", "Date", "Notes"];
  const rows = items.map((e) => [
    e.title.replaceAll('"', '""'),
    e.amount.toFixed(2),
    e.category,
    e.date,
    (e.notes ?? "").replaceAll('"', '""').replaceAll("\n", " "),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${v}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `expenses.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
