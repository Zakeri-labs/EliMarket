const DEADLOCK_CODE = "40P01";

function isDeadlockError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string };
  return (
    e.code === DEADLOCK_CODE ||
    (typeof e.message === "string" &&
      e.message.toLowerCase().includes("deadlock"))
  );
}

/** Retry once on Postgres deadlock (40P01) — common on singleton upserts under load. */
export async function withDeadlockRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isDeadlockError(err) || attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, 40 * (attempt + 1)));
    }
  }
  throw lastError;
}
