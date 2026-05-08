"use client";

import { useEffect, useState } from "react";

export function HeroAnimatedNumber({
  target,
  stepMs = 50,
  startDelayMs = 150,
}: {
  target: number;
  stepMs?: number;
  startDelayMs?: number;
}) {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const startTimeout = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        i++;
        setValue(i);
        if (i >= target && interval) clearInterval(interval);
      }, stepMs);
    }, startDelayMs);
    return () => {
      clearTimeout(startTimeout);
      if (interval) clearInterval(interval);
    };
  }, [target, stepMs, startDelayMs]);

  return <>{value ?? "..."}</>;
}
