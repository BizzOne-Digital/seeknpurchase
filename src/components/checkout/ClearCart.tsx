"use client";

import { useEffect } from "react";
import { useStore } from "@/components/providers/StoreProvider";

/** Empties the local cart once an order confirmation page renders. */
export function ClearCart() {
  const { clear, ready } = useStore();
  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);
  return null;
}
