import { handleUpdate } from "@/lib/bot";
import { safeEqual } from "@/lib/security";
import type { TgUpdate } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BODY_BYTES = 1_000_000;

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const sent = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  // Same answer for "not configured" and "wrong secret": nothing to learn here.
  if (!secret || !safeEqual(sent, secret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return new Response("Payload too large", { status: 413 });
  }

  let update: TgUpdate;
  try {
    update = (await request.json()) as TgUpdate;
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (typeof update?.update_id !== "number") {
    return new Response("Bad request", { status: 400 });
  }

  try {
    await handleUpdate(update);
  } catch (error) {
    console.error("telegram update failed:", error instanceof Error ? error.message : "unknown error");
  }
  // Always 200 for an authenticated request, otherwise Telegram keeps retrying.
  return Response.json({ ok: true });
}

// Anything but POST is not served.
export function GET(): Response {
  return new Response("Not found", { status: 404 });
}
