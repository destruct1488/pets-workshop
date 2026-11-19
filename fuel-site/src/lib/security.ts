import { createHash, timingSafeEqual } from "node:crypto";

/** Compares two strings in constant time (hashing equalises their length). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Parses "123, 456" into a set of numeric IDs; anything non-numeric is dropped. */
export function parseIdList(value: string | undefined): Set<number> {
  const ids = new Set<number>();
  for (const part of (value ?? "").split(",")) {
    const trimmed = part.trim();
    if (/^-?\d{1,20}$/.test(trimmed)) ids.add(Number(trimmed));
  }
  return ids;
}
