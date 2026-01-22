"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseFetchOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number; // en milisegundos
  dedupingInterval?: number; // evitar múltiples requests en X ms
}

interface UseFetchResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
  mutate: () => Promise<void>;
}

export function useFetch<T>(
  url: string | null,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const {
    revalidateOnFocus = false,
    revalidateOnReconnect = true,
    refreshInterval = 0,
    dedupingInterval = 2000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  
  const lastFetchTime = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (isRevalidation = false) => {
    if (!url) {
      setIsLoading(false);
      return;
    }

    // Deduping: evitar múltiples requests muy seguidos
    const now = Date.now();
    if (now - lastFetchTime.current < dedupingInterval && data !== null) {
      return;
    }
    lastFetchTime.current = now;

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (isRevalidation) {
      setIsValidating(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err);
      }
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  }, [url, dedupingInterval, data]);

  // Initial fetch
  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url]); // Solo cuando cambia la URL

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        fetchData(true);
      }
    };

    document.addEventListener("visibilitychange", handleFocus);
    return () => document.removeEventListener("visibilitychange", handleFocus);
  }, [revalidateOnFocus, fetchData]);

  // Revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect) return;

    const handleOnline = () => fetchData(true);
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [revalidateOnReconnect, fetchData]);

  // Auto refresh interval
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, fetchData]);

  const mutate = useCallback(async () => {
    lastFetchTime.current = 0; // Reset deduping
    await fetchData(true);
  }, [fetchData]);

  return { data, error, isLoading, isValidating, mutate };
}

// Hook para múltiples requests en paralelo
export function useMultiFetch<T extends Record<string, any>>(
  urls: Record<string, string | null>
): {
  data: Partial<T>;
  isLoading: boolean;
  error: Error | null;
  mutate: () => Promise<void>;
} {
  const [data, setData] = useState<Partial<T>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const entries = Object.entries(urls).filter(([_, url]) => url !== null);
      const results = await Promise.all(
        entries.map(async ([key, url]) => {
          const res = await fetch(url!);
          if (!res.ok) throw new Error(`Error fetching ${key}`);
          return [key, await res.json()];
        })
      );
      
      setData(Object.fromEntries(results) as Partial<T>);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [urls]);

  useEffect(() => {
    fetchAll();
  }, []);

  return { data, isLoading, error, mutate: fetchAll };
}
