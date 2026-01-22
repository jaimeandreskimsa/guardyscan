// Sistema de caché en memoria para APIs frecuentes
// TTL: Time To Live en segundos

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Limpiar entradas expiradas cada 5 minutos
    if (typeof window === "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  set<T>(key: string, data: T, ttlSeconds: number = 60): void {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiry });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  // Invalidar todas las entradas que coincidan con un patrón
  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Limpiar todo el caché
  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Estadísticas del caché
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton global
const globalForCache = globalThis as unknown as {
  memoryCache: MemoryCache | undefined;
};

export const cache = globalForCache.memoryCache ?? new MemoryCache();

if (process.env.NODE_ENV !== "production") {
  globalForCache.memoryCache = cache;
}

// Helper para cachear funciones async
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const result = await fn();
  cache.set(key, result, ttlSeconds);
  return result;
}

// Tiempos de caché por tipo de dato
export const CACHE_TTL = {
  USER_SUBSCRIPTION: 60,      // 1 minuto
  ORGANIZATIONS: 30,          // 30 segundos
  SCAN_RESULTS: 300,          // 5 minutos
  DASHBOARD_STATS: 30,        // 30 segundos
  VULNERABILITIES: 60,        // 1 minuto
  INCIDENTS: 60,              // 1 minuto
};
