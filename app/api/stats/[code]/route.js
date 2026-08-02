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
        redis.get(K.visits),
        redis.get(K.bookClicks),
        redis.get(K.leads),
        redis.hgetall(K.bookByItem),
        redis.hgetall(K.leadsByItem),
        redis.hgetall(K.visitsByDay),
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
