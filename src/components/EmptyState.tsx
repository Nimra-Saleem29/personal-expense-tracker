import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ message = "No expenses recorded yet", action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
        <Wallet className="h-8 w-8 text-primary" />
      </div>
      <p className="text-base font-medium text-foreground">{message}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Start tracking your spending by adding your first expense.
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
