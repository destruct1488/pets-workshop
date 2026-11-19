import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { diffPrices, formatSummary, type PriceItem } from "./prices";
import { parseIdList } from "./security";
import { getCurrentPrices, kvDelete, kvGet, kvSet, kvSetOnce, setCurrentPrices } from "./store";
import {
  answerCallbackQuery,
  downloadImage,
  editMessageText,
  pickFileId,
  sendMessage,
  type TgCallbackQuery,
  type TgMessage,
  type TgUpdate,
} from "./telegram";
import { extractPrices } from "./vision";

type Pending = { items: PriceItem[]; priceDate: string | null; userId: number };

const PENDING_TTL = 60 * 60; // a parsed table waits one hour for confirmation
const CALLBACK_RE = /^(pub|cancel):([0-9a-f]{16})$/;

const allowedUsers = () => parseIdList(process.env.TELEGRAM_ALLOWED_USER_IDS);

const HELP =
  "Надішліть фото таблиці з цінами. Я прочитаю її, покажу результат і опублікую на сайті після вашого підтвердження.";

export async function handleUpdate(update: TgUpdate): Promise<void> {
  // Telegram may deliver the same update twice; handle each one once.
  if (!(await kvSetOnce(`update-${update.update_id}`, 24 * 60 * 60))) return;

  if (update.message) await handleMessage(update.message);
  else if (update.callback_query) await handleCallback(update.callback_query);
}

async function handleMessage(message: TgMessage): Promise<void> {
  const userId = message.from?.id;
  // Only private chats with allowed users. Everyone else is ignored silently.
  if (!userId || message.chat.type !== "private" || !allowedUsers().has(userId)) return;
  const chatId = message.chat.id;

  const fileId = pickFileId(message);
  if (!fileId) {
    if (message.photo || message.document) {
      await sendMessage(chatId, "Не вдалося прийняти файл. Надішліть фото до 5 МБ у форматі JPG, PNG або WebP.");
    } else if (message.text === "/status") {
      const current = await getCurrentPrices();
      await sendMessage(
        chatId,
        current
          ? `Ціни на сайті оновлено: ${new Date(current.updatedAt).toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" })}. Рядків: ${current.items.length}.`
          : "На сайті ще немає цін. Надішліть фото таблиці.",
      );
    } else {
      await sendMessage(chatId, HELP);
    }
    return;
  }

  await sendMessage(chatId, "Читаю таблицю, це займе до хвилини…");
  try {
    const image = await downloadImage(fileId);
    const result = await extractPrices(image.base64, image.mediaType);
    if (!result.ok) {
      await sendMessage(chatId, `${result.error} Спробуйте надіслати чіткіше фото.`);
      return;
    }

    const current = await getCurrentPrices();
    const changes = diffPrices(current?.items, result.items);
    const id = randomBytes(8).toString("hex");
    await kvSet(`pending-${id}`, { items: result.items, priceDate: result.priceDate, userId } satisfies Pending, PENDING_TTL);
    await sendMessage(chatId, formatSummary(result.items, changes, result.priceDate), [
      [
        { text: "Опублікувати на сайті", callback_data: `pub:${id}` },
        { text: "Скасувати", callback_data: `cancel:${id}` },
      ],
    ]);
  } catch (error) {
    console.error("price photo failed:", error instanceof Error ? error.message : "unknown error");
    await sendMessage(chatId, "Не вдалося обробити фото. Спробуйте ще раз трохи пізніше.");
  }
}

async function handleCallback(query: TgCallbackQuery): Promise<void> {
  if (!allowedUsers().has(query.from.id)) return;
  const match = CALLBACK_RE.exec(query.data ?? "");
  const chat = query.message;
  if (!match || !chat) {
    await answerCallbackQuery(query.id);
    return;
  }
  const [, action, id] = match;
  const key = `pending-${id}`;
  const pending = await kvGet<Pending>(key);
  if (!pending) {
    await answerCallbackQuery(query.id, "Ця таблиця вже недійсна. Надішліть фото ще раз.");
    return;
  }

  // Remove it first so a double tap cannot publish twice.
  await kvDelete(key);
  if (action === "cancel") {
    await answerCallbackQuery(query.id, "Скасовано");
    await editMessageText(chat.chat.id, chat.message_id, "Скасовано. Ціни на сайті не змінено.");
    return;
  }

  await setCurrentPrices({ updatedAt: new Date().toISOString(), priceDate: pending.priceDate, items: pending.items });
  revalidatePath("/");
  await answerCallbackQuery(query.id, "Опубліковано");
  await editMessageText(chat.chat.id, chat.message_id, `Опубліковано на сайті. Рядків: ${pending.items.length}.`);
}
