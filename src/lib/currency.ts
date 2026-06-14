import { useEffect, useState } from "react";

export type CurrencyCode = "PKR" | "USD" | "EUR" | "GBP" | "AED" | "INR";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  PKR: { code: "PKR", symbol: "₨", name: "Pakistani Rupee", locale: "en-PK", decimals: 0 },
  USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", decimals: 2 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE", decimals: 2 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB", decimals: 2 },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", locale: "en-AE", decimals: 2 },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN", decimals: 0 },
};

const KEY = "currency_v1";
const DEFAULT: CurrencyCode = "PKR";

let current: CurrencyCode = DEFAULT;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw && raw in CURRENCIES) current = raw as CurrencyCode;
  } catch {
    /* ignore */
  }
}

export function getCurrency(): CurrencyCode {
  hydrate();
  return current;
}

export function setCurrency(code: CurrencyCode) {
  current = code;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, code);
    } catch {
      /* ignore */
    }
  }
  for (const l of listeners) l();
}

/** Format a number with the active currency. */
export function formatCurrency(amount: number, opts?: { decimals?: number }): string {
  const info = CURRENCIES[getCurrency()];
  const decimals = opts?.decimals ?? info.decimals;
  const value = Number.isFinite(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat(info.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  return `${info.symbol}${formatted}`;
}

/** Format a compact amount for chart axes (e.g. ₨12k). */
export function formatCompactCurrency(amount: number): string {
  const info = CURRENCIES[getCurrency()];
  const formatted = new Intl.NumberFormat(info.locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
  return `${info.symbol}${formatted}`;
}

/** Subscribe a React component to currency changes. */
export function useCurrency() {
  const [code, setCode] = useState<CurrencyCode>(() => {
    hydrate();
    return current;
  });

  useEffect(() => {
    hydrate();
    setCode(current);
    const l = () => setCode(current);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  return {
    currency: code,
    info: CURRENCIES[code],
    setCurrency,
    format: formatCurrency,
    formatCompact: formatCompactCurrency,
  };
}
