import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PriceSnapshot } from "./prices";

/**
 * Tiny key-value store. In production it talks to Upstash Redis over REST
 * (works on serverless hosting). Without Upstash variables it falls back to
 * JSON files in .data/, which is enough for local work.
 */

const upstashUrl = () => process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = () => process.env.UPSTASH_REDIS_REST_TOKEN;

async function upstash(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(upstashUrl()!, {
    method: "POST",
    headers: { Authorization: `Bearer ${upstashToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Upstash request failed (${res.status})`);
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error("Upstash returned an error");
  return data.result;
}

const useUpstash = () => Boolean(upstashUrl() && upstashToken());

function filePath(key: string): string {
  // Keys are our own constants, but keep the file name safe anyway.
  return path.join(process.cwd(), ".data", key.replace(/[^a-zA-Z0-9_-]/g, "_") + ".json");
}

export async function kvGet<T>(key: string): Promise<T | null> {
  try {
    if (useUpstash()) {
      const result = await upstash(["GET", key]);
      return typeof result === "string" ? (JSON.parse(result) as T) : null;
    }
    const file = JSON.parse(await readFile(filePath(key), "utf8")) as { expiresAt?: number; value: T };
    if (file.expiresAt && file.expiresAt < Date.now()) return null;
    return file.value;
  } catch {
    return null;
  }
}

export async function kvSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  if (useUpstash()) {
    const cmd: (string | number)[] = ["SET", key, JSON.stringify(value)];
    if (ttlSeconds) cmd.push("EX", ttlSeconds);
    await upstash(cmd);
    return;
  }
  await mkdir(path.dirname(filePath(key)), { recursive: true });
  await writeFile(
    filePath(key),
    JSON.stringify({ value, expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined }),
  );
}

export async function kvDelete(key: string): Promise<void> {
  if (useUpstash()) {
    await upstash(["DEL", key]);
    return;
  }
  await rm(filePath(key), { force: true });
}

/** Sets a key only if it does not exist yet. Returns true when it was set. */
export async function kvSetOnce(key: string, ttlSeconds: number): Promise<boolean> {
  if (useUpstash()) {
    return (await upstash(["SET", key, "1", "EX", ttlSeconds, "NX"])) === "OK";
  }
  if (await kvGet(key)) return false;
  await kvSet(key, 1, ttlSeconds);
  return true;
}

const CURRENT_KEY = "prices-current";
export const getCurrentPrices = () => kvGet<PriceSnapshot>(CURRENT_KEY);
export const setCurrentPrices = (snapshot: PriceSnapshot) => kvSet(CURRENT_KEY, snapshot);
