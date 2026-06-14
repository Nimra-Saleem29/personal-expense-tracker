import { useCallback, useEffect, useState } from "react";
import {
  type Expense,
  loadExpenses,
  saveExpenses,
  loadBudget,
  saveBudget,
} from "@/lib/expenses";

let memory: Expense[] | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function useExpenses() {
  const [items, setItems] = useState<Expense[]>(() => memory ?? []);

  useEffect(() => {
    if (memory === null) {
      memory = loadExpenses();
      setItems(memory);
    }
    const l = () => setItems(memory ?? []);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const persist = (next: Expense[]) => {
    memory = next;
    saveExpenses(next);
    emit();
  };

  const add = useCallback((data: Omit<Expense, "id" | "createdAt">) => {
    const next = [
      ...(memory ?? []),
      { ...data, id: crypto.randomUUID(), createdAt: Date.now() },
    ];
    persist(next);
  }, []);

  const update = useCallback(
    (id: string, data: Omit<Expense, "id" | "createdAt">) => {
      const next = (memory ?? []).map((e) =>
        e.id === id ? { ...e, ...data } : e,
      );
      persist(next);
    },
    [],
  );

  const remove = useCallback((id: string) => {
    persist((memory ?? []).filter((e) => e.id !== id));
  }, []);

  return { items, add, update, remove };
}

export function useBudget() {
  const [budget, setBudget] = useState(0);
  useEffect(() => {
    setBudget(loadBudget());
  }, []);
  const update = (n: number) => {
    setBudget(n);
    saveBudget(n);
  };
  return [budget, update] as const;
}
