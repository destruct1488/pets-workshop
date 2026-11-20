import json
from workers import WorkerEntrypoint, Response
from pyodide.http import pyfetch

# ==== НАСТРОЙКИ ОГРАНИЧЕНИЙ ====
MODEL = "gemini-2.5-flash"      # проверь актуальное имя модели в AI Studio
MAX_INPUT_CHARS = 500           # максимум символов в вопросе
MAX_OUTPUT_TOKENS = 300         # максимум токенов в ответе
DAILY_LIMIT = 20                # сообщений в сутки на одного пользователя
SYSTEM_PROMPT = (
    "Ты дружелюбный помощник в Telegram. Отвечай кратко, не больше 5 предложений. "
    "Отвечай только на вопросы по теме: <впиши тему бота>. "
    "Если вопрос не по теме, вежливо откажи и предложи задать вопрос по теме. "
    "Не пиши длинный код, сочинения и большие тексты."
)
# ================================

TG_URL = "https://api.telegram.org/bot{token}/{method}"


async def tg_call(token, method, payload):
    r = await pyfetch(
        TG_URL.format(token=token, method=method),
        method="POST",
        headers={"Content-Type": "application/json"},
        body=json.dumps(payload),
    )
    return await r.json()


async def send(token, chat_id, text, reply_to=None):
    payload = {"chat_id": chat_id, "text": text[:4000]}
    if reply_to:
        payload["reply_parameters"] = {"message_id": reply_to}
    await tg_call(token, "sendMessage", payload)


async def ask_gemini(api_key, question):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
    body = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": question}]}],
        "generationConfig": {"maxOutputTokens": MAX_OUTPUT_TOKENS, "temperature": 0.7},
    }
    r = await pyfetch(
        url,
        method="POST",
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
        body=json.dumps(body),
    )
    data = await r.json()
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        return "Не получилось ответить, попробуй позже."


async def within_daily_limit(env, user_id):
    from js import Date
    day = Date.new().toISOString()[:10]
    key = f"{user_id}:{day}"
    count = int(await env.USAGE.get(key) or 0)
    if count >= DAILY_LIMIT:
        return False
    await env.USAGE.put(key, str(count + 1), expirationTtl=90000)
    return True


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        env = self.env

        if request.method != "POST":
            return Response("ok")

        # Проверка, что запрос пришёл от Telegram
        if request.headers.get("X-Telegram-Bot-Api-Secret-Token") != env.WEBHOOK_SECRET:
            return Response("forbidden", status=403)

        update = await request.json()
        msg = update.get("message") or {}
        text = (msg.get("text") or "").strip()
        chat_id = (msg.get("chat") or {}).get("id")
        msg_id = msg.get("message_id")
        if not chat_id or not text:
            return Response("ok")

        token = env.BOT_TOKEN

        if text.startswith("/start"):
            await send(token, chat_id,
                       f"Привет! Задай вопрос по теме бота. Лимит: {DAILY_LIMIT} сообщений в сутки.")
            return Response("ok")

        if len(text) > MAX_INPUT_CHARS:
            await send(token, chat_id,
                       f"Слишком длинное сообщение, сократи до {MAX_INPUT_CHARS} символов.", msg_id)
            return Response("ok")

        if not await within_daily_limit(env, msg["from"]["id"]):
            await send(token, chat_id, "Лимит на сегодня исчерпан, приходи завтра.", msg_id)
            return Response("ok")

        answer = await ask_gemini(env.GEMINI_API_KEY, text)
        await send(token, chat_id, answer, msg_id)
        return Response("ok")
