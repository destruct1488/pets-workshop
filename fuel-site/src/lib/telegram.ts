const API = "https://api.telegram.org";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // Claude accepts images up to 5 MB

export type TgPhotoSize = { file_id: string; file_size?: number; width: number; height: number };
export type TgMessage = {
  message_id: number;
  from?: { id: number; is_bot?: boolean };
  chat: { id: number; type: string };
  text?: string;
  photo?: TgPhotoSize[];
  document?: { file_id: string; file_size?: number; mime_type?: string };
};
export type TgCallbackQuery = {
  id: string;
  from: { id: number };
  data?: string;
  message?: { message_id: number; chat: { id: number } };
};
export type TgUpdate = {
  update_id: number;
  message?: TgMessage;
  callback_query?: TgCallbackQuery;
};

function token(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return t;
}

async function call<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API}/bot${token()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const data = (await res.json()) as { ok: boolean; result: T; description?: string };
  if (!data.ok) throw new Error(`Telegram ${method} failed: ${data.description ?? res.status}`);
  return data.result;
}

type Keyboard = { text: string; callback_data: string }[][];

export const sendMessage = (chatId: number, text: string, keyboard?: Keyboard) =>
  call<{ message_id: number }>("sendMessage", {
    chat_id: chatId,
    text,
    ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
  });

export const editMessageText = (chatId: number, messageId: number, text: string) =>
  call("editMessageText", { chat_id: chatId, message_id: messageId, text });

export const answerCallbackQuery = (id: string, text?: string) =>
  call("answerCallbackQuery", { callback_query_id: id, ...(text ? { text } : {}) });

const MEDIA_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/** Picks the largest photo variant that still fits the size limit. */
export function pickFileId(message: TgMessage): string | null {
  if (message.photo?.length) {
    const fitting = message.photo
      .filter((p) => (p.file_size ?? 0) <= MAX_IMAGE_BYTES)
      .sort((a, b) => b.width * b.height - a.width * a.height);
    return fitting[0]?.file_id ?? null;
  }
  const doc = message.document;
  if (doc && doc.mime_type?.startsWith("image/") && (doc.file_size ?? 0) <= MAX_IMAGE_BYTES) {
    return doc.file_id;
  }
  return null;
}

export async function downloadImage(fileId: string): Promise<{ base64: string; mediaType: string }> {
  const file = await call<{ file_path?: string; file_size?: number }>("getFile", { file_id: fileId });
  if (!file.file_path) throw new Error("Telegram did not return a file path");
  const ext = file.file_path.split(".").pop()?.toLowerCase() ?? "";
  const mediaType = MEDIA_TYPES[ext];
  if (!mediaType) throw new Error("Unsupported image type");
  if ((file.file_size ?? 0) > MAX_IMAGE_BYTES) throw new Error("Image is too large");

  const res = await fetch(`${API}/file/bot${token()}/${file.file_path}`, {
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Telegram file download failed (${res.status})`);
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error("Image is too large");
  return { base64: bytes.toString("base64"), mediaType };
}
