/**
 * A small in-memory limiter for public endpoints (e.g. placing an order). It is per server
 * process, which is enough to blunt casual abuse on one instance. When we run many instances
 * it should move to a shared store.
 */
export function createLimiter(opts: { windowMs: number; max: number; now?: () => number }) {
  const now = opts.now ?? Date.now;
  const hits = new Map<string, number[]>();
  return {
    /** Records an attempt for `key` and says whether it is allowed. */
    check(key: string): { ok: boolean; retryAfterMs: number } {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((x) => t - x < opts.windowMs);
      if (recent.length >= opts.max) {
        hits.set(key, recent);
        return { ok: false, retryAfterMs: opts.windowMs - (t - recent[0]) };
      }
      recent.push(t);
      hits.set(key, recent);
      if (hits.size > 5000) for (const [k, v] of hits) if (v.every((x) => t - x >= opts.windowMs)) hits.delete(k); // keep memory bounded
      return { ok: true, retryAfterMs: 0 };
    },
  };
}
