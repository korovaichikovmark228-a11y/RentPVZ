"use client";

import { useCallback, useEffect, useState } from "react";

const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);
const fmtTime = (ts) =>
  new Date(ts).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });

const C = {
  bg: "#f4f6fb",
  card: "#fff",
  ink: "#0e1524",
  muted: "#5a6478",
  muted2: "#9aa2b1",
  line: "#e3e9f5",
  blue: "#0b5cff",
  blueSoft: "#eaf1ff",
  orange: "#ff6a2c",
  orangeSoft: "#fff0e8",
};

function Stat({ label, value, sub, accent }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: "20px 22px", flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 13, color: C.muted2, fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 800, color: accent || C.ink, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: C.muted, marginTop: 8 }}>{sub}</div>}
    </div>
  );
}

function Bars({ title, data, color }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1]);
  const max = entries.reduce((m, [, v]) => Math.max(m, Number(v)), 0) || 1;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 22, flex: 1, minWidth: 300 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 16 }}>{title}</div>
      {entries.length === 0 && <div style={{ color: C.muted2, fontSize: 14 }}>Пока нет данных</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {entries.map(([name, v]) => (
          <div key={name}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 5 }}>
              <span style={{ color: C.ink }}>{name}</span>
              <b style={{ color: C.ink }}>{v}</b>
            </div>
            <div style={{ height: 8, background: C.bg, borderRadius: 999 }}>
              <div style={{ height: "100%", width: `${Math.max(4, (Number(v) / max) * 100)}%`, background: color, borderRadius: 999 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ code }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);
  const [updated, setUpdated] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/stats/${code}`, { cache: "no-store" });
      if (!r.ok) throw new Error("bad");
      setData(await r.json());
      setErr(false);
      setUpdated(new Date());
    } catch {
      setErr(true);
    }
  }, [code]);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const wrap = { maxWidth: 1100, margin: "0 auto", padding: "0 20px" };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: "'Onest',system-ui,-apple-system,sans-serif", paddingBottom: 60 }}>
      <div style={{ background: C.card, borderBottom: `1px solid ${C.line}`, padding: "16px 0", marginBottom: 24 }}>
        <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 18 }}>
            <span style={{ width: 28, height: 28, borderRadius: 9, background: C.blue, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>◆</span>
            Админ · Рядом.Аренда
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12.5, color: C.muted2 }}>
              {updated ? `обновлено ${updated.toLocaleTimeString("ru-RU")}` : "загрузка…"} · авто-обновление 10с
            </span>
            <button onClick={load} style={{ border: `1px solid ${C.line}`, background: C.card, color: C.ink, fontWeight: 600, fontSize: 13, padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit" }}>
              Обновить
            </button>
          </div>
        </div>
      </div>

      <div style={wrap}>
        {err && (
          <div style={{ background: C.orangeSoft, color: "#b23c00", borderRadius: 12, padding: "14px 18px", marginBottom: 20, fontSize: 14 }}>
            Не удалось загрузить статистику. Повторю попытку автоматически.
          </div>
        )}

        {data && data.configured === false && (
          <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 24, fontSize: 15, color: C.muted }}>
            Хранилище ещё не подключено. Подключите Upstash Redis (Vercel → Storage) и задайте переменные окружения — после этого здесь появятся данные.
          </div>
        )}

        {data && data.configured !== false && (
          <>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
              <Stat label="Посещения" value={data.visits} accent={C.blue} />
              <Stat label="Клики «Забронировать»" value={data.bookClicks} accent={C.ink} sub={`конверсия ${pct(data.bookClicks, data.visits)}% от заходов`} />
              <Stat label="Заявки (оставили телефон)" value={data.leads} accent={C.orange} sub={`конверсия ${pct(data.leads, data.visits)}% от заходов`} />
              <Stat label="Из клика в заявку" value={`${pct(data.leads, data.bookClicks)}%`} sub={`${data.leads} из ${data.bookClicks} кликов`} />
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
              <Bars title="Клики «Забронировать» по вещам" data={data.bookByItem} color={C.blue} />
              <Bars title="Заявки по вещам" data={data.leadsByItem} color={C.orange} />
              <Bars title="Посещения по дням" data={data.visitsByDay} color={C.muted2} />
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 22 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Последние заявки ({data.recentLeads.length})</div>
              {data.recentLeads.length === 0 ? (
                <div style={{ color: C.muted2, fontSize: 14 }}>Пока нет заявок.</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                    <thead>
                      <tr style={{ textAlign: "left", color: C.muted2 }}>
                        <th style={{ padding: "8px 10px", fontWeight: 600 }}>Время</th>
                        <th style={{ padding: "8px 10px", fontWeight: 600 }}>Телефон</th>
                        <th style={{ padding: "8px 10px", fontWeight: 600 }}>Имя</th>
                        <th style={{ padding: "8px 10px", fontWeight: 600 }}>Вещь</th>
                        <th style={{ padding: "8px 10px", fontWeight: 600 }}>Срок</th>
                        <th style={{ padding: "8px 10px", fontWeight: 600 }}>Район</th>
                        <th style={{ padding: "8px 10px", fontWeight: 600 }}>ПВЗ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentLeads.map((l, i) => (
                        <tr key={i} style={{ borderTop: `1px solid ${C.line}` }}>
                          <td style={{ padding: "10px", color: C.muted, whiteSpace: "nowrap" }}>{l.ts ? fmtTime(l.ts) : "—"}</td>
                          <td style={{ padding: "10px", fontWeight: 700 }}>{l.phone || "—"}</td>
                          <td style={{ padding: "10px" }}>{l.name || "—"}</td>
                          <td style={{ padding: "10px" }}>{l.item || "—"}</td>
                          <td style={{ padding: "10px", color: C.muted }}>{l.days || "—"}</td>
                          <td style={{ padding: "10px", color: C.muted }}>{l.district || "—"}</td>
                          <td style={{ padding: "10px", color: C.muted }}>{l.pickup || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
