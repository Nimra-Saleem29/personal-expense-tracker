import { createFileRoute } from "@tanstack/react-router";
import { Coins, Check } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, useCurrency, type CurrencyCode } from "@/lib/currency";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Penny" },
      { name: "description", content: "Configure currency and preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { currency, info, setCurrency, format } = useCurrency();

  const handleChange = (v: string) => {
    setCurrency(v as CurrencyCode);
    toast.success(`Currency set to ${CURRENCIES[v as CurrencyCode].name}`);
  };

  const codes = Object.keys(CURRENCIES) as CurrencyCode[];

  return (
    <>
      <TopBar title="Settings" subtitle="Preferences and configuration" />
      <div className="space-y-6 p-4 md:p-6">
        <Card className="glass hover-lift border-0 shadow-card animate-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Coins className="h-5 w-5 text-primary" />
              Currency
            </CardTitle>
            <CardDescription>
              Choose the currency used across the entire app. Saved automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-[260px_1fr] sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="currency">Display currency</Label>
                <Select value={currency} onValueChange={handleChange}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {codes.map((c) => (
                      <SelectItem key={c} value={c}>
                        <span className="inline-flex items-center gap-2">
                          <span className="w-5 text-center font-semibold">{CURRENCIES[c].symbol}</span>
                          <span>{CURRENCIES[c].code}</span>
                          <span className="text-muted-foreground">— {CURRENCIES[c].name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4 backdrop-blur-sm">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Sample
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
                  {format(125000)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {info.name} ({info.code})
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">All supported currencies</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {codes.map((c) => {
                  const active = c === currency;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleChange(c)}
                      className={cn(
                        "flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all hover:border-primary/50 hover:bg-primary/5",
                        active
                          ? "border-primary/60 bg-primary/10"
                          : "border-border/50 bg-card",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted font-semibold">
                          {CURRENCIES[c].symbol}
                        </span>
                        <span>
                          <span className="block text-sm font-medium">{CURRENCIES[c].code}</span>
                          <span className="block text-xs text-muted-foreground">
                            {CURRENCIES[c].name}
                          </span>
                        </span>
                      </span>
                      {active && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
