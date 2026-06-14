import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, type Category, type Expense } from "@/lib/expenses";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Expense | null;
  onSubmit: (data: Omit<Expense, "id" | "createdAt">) => void;
}

export function ExpenseForm({ open, onOpenChange, initial, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setAmount(initial ? String(initial.amount) : "");
      setCategory(initial?.category ?? "Food");
      setDate(initial?.date ?? new Date().toISOString().slice(0, 10));
      setNotes(initial?.notes ?? "");
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt)) {
      toast.error("Amount is required");
      return;
    }
    if (amt <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }
    if (!category) {
      toast.error("Category is required");
      return;
    }
    if (!date) {
      toast.error("Date is required");
      return;
    }
    onSubmit({ title: title.trim(), amount: amt, category, date, notes: notes.trim() });
    toast.success(initial ? "Expense updated" : "Expense added");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit expense" : "Add expense"}</DialogTitle>
          <DialogDescription>
            {initial ? "Update your expense details." : "Track a new transaction."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Coffee at Blue Bottle" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" inputMode="decimal" step="any" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="no-spinner" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="gradient-primary text-primary-foreground">
              {initial ? "Save changes" : "Add expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
