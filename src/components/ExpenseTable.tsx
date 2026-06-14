import { useState } from "react";
import { format } from "date-fns";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type Expense, formatCurrency } from "@/lib/expenses";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";

interface Props {
  items: Expense[];
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
  onAdd?: () => void;
}

export function ExpenseTable({ items, onEdit, onDelete, onAdd }: Props) {
  const [pending, setPending] = useState<Expense | null>(null);

  if (items.length === 0) {
    return (
      <EmptyState
        action={
          onAdd && (
            <Button onClick={onAdd} className="gradient-primary text-primary-foreground shadow-glow">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          )
        }
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((e) => (
              <TableRow key={e.id} className="group">
                <TableCell>
                  <div className="font-medium">{e.title}</div>
                  {e.notes && (
                    <div className="line-clamp-1 text-xs text-muted-foreground">{e.notes}</div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">{e.category}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(e.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatCurrency(e.amount)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button size="icon" variant="ghost" onClick={() => onEdit(e)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setPending(e)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{pending?.title}". This action can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pending) {
                  onDelete(pending.id);
                  toast.success("Expense deleted");
                }
                setPending(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
