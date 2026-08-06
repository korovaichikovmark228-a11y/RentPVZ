import { Redis } from "@upstash/redis";

// Клиент Upstash Redis. Читаем переменные, которые может выставить интеграция
// Vercel (KV_REST_API_*) или прямое подключение Upstash (UPSTASH_REDIS_REST_*).
// Если хранилище не настроено — возвращаем null, и вызывающий код мягко это переживает.
let client = null;

export function getRedis() {
  if (client) return client;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  client = new Redis({ url, token });
  return client;
}

// Ключи метрик
export const K = {
  // Старые счётчики заходов (общее число загрузок) — больше не используем как основные.
  visits: "m:visits",
  visitsByDay: "m:visits_by_day",
  // Уникальные посетители: множество id и агрегат по дням.
  visitsUniq: "m:uv", // SET уникальных visitor id (всё время)
  visitsUniqByDay: "m:uv_by_day", // HASH: дата -> число новых уникальных за день
  bookClicks: "m:book_clicks",
  bookByItem: "m:book_by_item",
  leads: "m:leads",
  leadsByItem: "m:leads_by_item",
  recentLeads: "m:recent_leads",
};

// Ключ дневного множества уникальных id (для дедупа в пределах дня)
export const uvDayKey = (d) => `m:uv:${d}`;

export function today() {
  // МСК-ориентированная дата YYYY-MM-DD
  const d = new Date(Date.now() + 3 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}
