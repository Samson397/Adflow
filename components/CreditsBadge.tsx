"use client";

import { useEffect, useState } from "react";
import { Coins } from "lucide-react";

export function CreditsBadge() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.json())
      .then((result) => {
        if (result.success) setBalance(result.data.balance);
      })
      .catch(() => setBalance(null));
  }, []);

  if (balance === null) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      <Coins className="h-3.5 w-3.5" />
      {balance.toLocaleString()} credits
    </span>
  );
}
