import React, { useEffect } from "react";

export function useAutoRefresh(fetchFn, interval = interval, dependencies = []) {
  useEffect(() => {
    fetchFn(); // Initial fetch (when dependencies change or when hook mounts)
    const timer = setInterval(fetchFn, interval); // Call fetch at intervals
    return () => clearInterval(timer);
  }, dependencies);
}