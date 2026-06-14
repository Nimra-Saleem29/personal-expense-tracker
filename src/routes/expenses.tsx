import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Search } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { ExpenseTable } from "@/components/ExpenseTable";
import { ExpenseForm } from "@/components/ExpenseForm";
import { useExpenses } from "@/hooks/useExpenses";
import { CATEGORIES, type Category, type Expense, exportCSV } from "@/lib/expenses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses — Penny" },
      { name: "description", content: "All your transactions in one place." },
    ],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const { items, add, update, remove } = useExpenses();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return items
      .filter((e) => (cat === "all" ? true : e.category === cat))
      .filter((e) => (q ? e.title.toLowerCase().includes(q.toLowerCase()) || (e.notes ?? "").toLowerCase().includes(q.toLowerCase()) : true))
      .filter((e) => (from ? e.date >= from : true))
      .filter((e) => (to ? e.date <= to : true))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [items, q, cat, from, to]);

  const handleAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleExport = () => {
    if (items.length === 0) {
      toast.error("No expenses available to export.");
      return;
    }
    exportCSV(items);
    toast.success("Exported to CSV");
  };

  const clearFilters = () => {
    setQ("");
    setCat("all");
    setFrom("");
    setTo("");
  };

  const hasFilters = q !== "" || cat !== "all" || from !== "" || to !== "";

  return (
    <>
      <TopBar title="Expenses" subtitle={`${filtered.length} of ${items.length} shown`} onAdd={handleAdd} />
      <div className="space-y-4 p-4 md:p-6">
        <div className="grid gap-3 rounded-xl border bg-card p-4 shadow-card md:grid-cols-[1fr_180px_160px_160px_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or notes…" className="pl-9" />
          </div>
          <Select value={cat} onValueChange={(v) => setCat(v as Category | "all")}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To" />
          <Button variant="ghost" onClick={clearFilters} disabled={!hasFilters}>
            Clear
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>

        <ExpenseTable
          items={filtered}
          onEdit={(e) => { setEditing(e); setOpen(true); }}
          onDelete={remove}
          onAdd={handleAdd}
        />
      </div>

      <ExpenseForm
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSubmit={(data) => editing ? update(editing.id, data) : add(data)}
      />
    </>
  );
}
