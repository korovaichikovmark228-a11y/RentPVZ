// Приём заявок с лендинга и отправка их в Telegram.
// Ключи бота лежат в переменных окружения Vercel (см. .env.example),
// в код не попадают.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const phoneRaw = String(payload?.phone ?? "").trim();
  const digits = phoneRaw.replace(/\D/g, "");
  // Минимальная валидация: телефон должен содержать 10–15 цифр.
  if (digits.length < 10 || digits.length > 15) {
    return Response.json({ ok: false, error: "bad_phone" }, { status: 422 });
  }

  const name = String(payload?.name ?? "").trim().slice(0, 80);
  const item = String(payload?.item ?? "").trim().slice(0, 120);
  const days = String(payload?.days ?? "").trim().slice(0, 20);
  const district = String(payload?.district ?? "").trim().slice(0, 120);
  const pickup = String(payload?.pickup ?? "").trim().slice(0, 40);
  const source = String(payload?.source ?? "").trim().slice(0, 40);

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Если бот ещё не настроен — не теряем заявку: логируем и отвечаем ok,
  // чтобы у пользователя всё прошло гладко. Настрой env на Vercel.
  if (!token || !chatId) {
    console.warn("[lead] TELEGRAM env not set, lead not delivered:", {
      phoneRaw,
      name,
      item,
    });
    return Response.json({ ok: true, delivered: false });
  }

  const lines = [
    "🆕 <b>Новая заявка с лендинга аренды</b>",
    `📞 Телефон: <b>${escapeHtml(phoneRaw)}</b>`,
    name && `👤 Имя: ${escapeHtml(name)}`,
    item && `📦 Вещь: ${escapeHtml(item)}`,
    days && `📅 Срок: ${escapeHtml(days)}`,
    district && `📍 Район: ${escapeHtml(district)}`,
    pickup && `🏬 ПВЗ: ${escapeHtml(pickup)}`,
    source && `↪️ Источник: ${escapeHtml(source)}`,
  ].filter(Boolean);

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: lines.join("\n"),
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );

    if (!tgRes.ok) {
      const detail = await tgRes.text();
      console.error("[lead] telegram error:", tgRes.status, detail);
      // Заявку всё равно принимаем, чтобы пользователь не застрял.
      return Response.json({ ok: true, delivered: false });
    }
  } catch (err) {
    console.error("[lead] telegram fetch failed:", err);
    return Response.json({ ok: true, delivered: false });
  }

  return Response.json({ ok: true, delivered: true });
}
