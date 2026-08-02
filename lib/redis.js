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
  visits: "m:visits",
  visitsByDay: "m:visits_by_day",
  bookClicks: "m:book_clicks",
  bookByItem: "m:book_by_item",
  leads: "m:leads",
  leadsByItem: "m:leads_by_item",
  recentLeads: "m:recent_leads",
};

export function today() {
  // МСК-ориентированная дата YYYY-MM-DD
  const d = new Date(Date.now() + 3 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}
