// Приём событий с лендинга: посещения и клики «Забронировать».
import { getRedis, K, today } from "@/lib/redis";

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

  const redis = getRedis();
  if (!redis) return Response.json({ ok: true, stored: false });

  try {
    if (type === "visit") {
      await Promise.all([redis.incr(K.visits), redis.hincrby(K.visitsByDay, today(), 1)]);
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
