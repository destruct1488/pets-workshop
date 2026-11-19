// Registers the site's /api/telegram address as the bot's webhook.
// Usage: set the variables from .env.example in your shell, then
//   npm run set-webhook
const { TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, SITE_URL } = process.env;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_WEBHOOK_SECRET || !SITE_URL) {
  console.error("Set TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET and SITE_URL first.");
  process.exit(1);
}
if (!SITE_URL.startsWith("https://")) {
  console.error("Telegram only accepts https:// webhook addresses.");
  process.exit(1);
}

const url = new URL("/api/telegram", SITE_URL).toString();
const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url,
    secret_token: TELEGRAM_WEBHOOK_SECRET,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  }),
});
const data = await res.json();
console.log(data.ok ? `Webhook set: ${url}` : `Failed: ${data.description}`);
process.exit(data.ok ? 0 : 1);
