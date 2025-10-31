import { useEffect, useState } from "react";
import { TIMING } from "@/constants/application-config";

export function useDebounce<T>(
  value: T, 
  delay: number = TIMING.DEBOUNCE_DELAY
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
