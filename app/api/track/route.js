// Приём событий с лендинга: посещения и клики «Забронировать».
import { getRedis, K, today, uvDayKey } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const type = String(payload?.type ?? "");
  const item = String(payload?.item ?? "").trim().slice(0, 120);
  const vid = String(payload?.vid ?? "").trim().slice(0, 80);

  const redis = getRedis();
  if (!redis) return Response.json({ ok: true, stored: false });

  try {
    if (type === "visit") {
      // Считаем УНИКАЛЬНЫХ посетителей: id из localStorage браузера.
      // Если id нет (редко) — используем разовый, чтобы не потерять заход.
      const id = vid || `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const day = today();
      const dayKey = uvDayKey(day);
      const [newDay] = await Promise.all([
        redis.sadd(dayKey, id), // 1 если этот id впервые за сегодня
        redis.sadd(K.visitsUniq, id), // множество всех уникальных id
        redis.expire(dayKey, 60 * 60 * 24 * 45), // дневные множества живут 45 дней
      ]);
      if (newDay === 1) await redis.hincrby(K.visitsUniqByDay, day, 1);
      // Старый общий счётчик заходов оставляем для справки (не показываем).
      redis.incr(K.visits).catch(() => {});
    } else if (type === "book_click") {
      const ops = [redis.incr(K.bookClicks)];
      if (item) ops.push(redis.hincrby(K.bookByItem, item, 1));
      await Promise.all(ops);
    } else {
      return Response.json({ ok: false, error: "bad_type" }, { status: 422 });
    }
  } catch (err) {
    console.error("[track] redis error:", err);
    return Response.json({ ok: true, stored: false });
  }

  return Response.json({ ok: true, stored: true });
}
