// Защищённая выдача статистики для админ-панели.
// Доступ только по секретному коду (совпадает с ADMIN_CODE из окружения).
import { getRedis, K } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const code = params?.code;
  const admin = process.env.ADMIN_CODE;
  if (!admin || code !== admin) {
    return new Response("Not found", { status: 404 });
  }

  const redis = getRedis();
  if (!redis) {
    return Response.json({ configured: false });
  }

  try {
    const [visits, bookClicks, leads, bookByItem, leadsByItem, visitsByDay, recentRaw] =
      await Promise.all([
        redis.scard(K.visitsUniq),
        redis.get(K.bookClicks),
        redis.get(K.leads),
        redis.hgetall(K.bookByItem),
        redis.hgetall(K.leadsByItem),
        redis.hgetall(K.visitsUniqByDay),
        redis.lrange(K.recentLeads, 0, 99),
      ]);

    const recentLeads = (recentRaw || []).map((r) => {
      if (typeof r === "object") return r;
      try {
        return JSON.parse(r);
      } catch {
        return null;
      }
    }).filter(Boolean);

    return Response.json({
      configured: true,
      visits: Number(visits) || 0,
      bookClicks: Number(bookClicks) || 0,
      leads: Number(leads) || 0,
      bookByItem: bookByItem || {},
      leadsByItem: leadsByItem || {},
      visitsByDay: visitsByDay || {},
      recentLeads,
    });
  } catch (err) {
    console.error("[stats] redis error:", err);
    return Response.json({ configured: true, error: true, visits: 0, bookClicks: 0, leads: 0, bookByItem: {}, leadsByItem: {}, visitsByDay: {}, recentLeads: [] });
  }
}

// Сброс статистики (по тому же секретному коду).
// ?scope=uv — обнулить только уникальные заходы (клики и заявки не трогаем).
export async function POST(request, { params }) {
  const code = params?.code;
  const admin = process.env.ADMIN_CODE;
  if (!admin || code !== admin) {
    return new Response("Not found", { status: 404 });
  }
  const redis = getRedis();
  if (!redis) return Response.json({ ok: false, configured: false });

  let scope = "all";
  try {
    scope = new URL(request.url).searchParams.get("scope") || "all";
  } catch {
    /* дефолт all */
  }

  const clearDaySets = async () => {
    try {
      const dayKeys = await redis.keys("m:uv:*");
      if (dayKeys && dayKeys.length) await redis.del(...dayKeys);
    } catch {
      /* необязательно */
    }
  };

  try {
    if (scope === "uv") {
      // Только уникальные заходы
      await redis.del(K.visits, K.visitsByDay, K.visitsUniq, K.visitsUniqByDay);
      await clearDaySets();
      return Response.json({ ok: true, scope: "uv" });
    }
    // Полный сброс
    await redis.del(
      K.visits,
      K.visitsByDay,
      K.visitsUniq,
      K.visitsUniqByDay,
      K.bookClicks,
      K.bookByItem,
      K.leads,
      K.leadsByItem,
      K.recentLeads
    );
    await clearDaySets();
    return Response.json({ ok: true, scope: "all" });
  } catch (err) {
    console.error("[stats] reset error:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
