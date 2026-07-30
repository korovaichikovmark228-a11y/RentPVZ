"use client";

import { useCallback, useEffect, useState } from "react";
import { track } from "@vercel/analytics";

const ITEMS = [
  { id: "perf", emoji: "🔩", name: "Перфоратор", cat: "Инструмент", value: 12000, badge: "Хит района" },
  { id: "drill", emoji: "🪛", name: "Дрель-шуруповёрт", cat: "Инструмент", value: 6000 },
  { id: "washer", emoji: "💦", name: "Мойка высокого давления", cat: "Для дома", value: 14000 },
  { id: "steamer", emoji: "👕", name: "Отпариватель для одежды", cat: "Для дома", value: 8000, badge: "Часто спрашивают" },
  { id: "vacuum", emoji: "🧽", name: "Моющий пылесос", cat: "Для дома", value: 20000 },
  { id: "projector", emoji: "📽️", name: "Проектор", cat: "Техника", value: 25000 },
  { id: "stroller", emoji: "🍼", name: "Детская коляска", cat: "Детям", value: 18000, badge: "Хит района" },
  { id: "carseat", emoji: "🚗", name: "Автокресло", cat: "Детям", value: 10000 },
  { id: "tent", emoji: "⛺", name: "Палатка 4-местная", cat: "Отдых", value: 12000 },
];

const DAY_RATE = 0.05; // 5% от стоимости вещи за день
const dayPrice = (value) => Math.round((value * DAY_RATE) / 10) * 10;
const fmt = (n) => n.toLocaleString("ru-RU");

const PVZ = [
  { name: "Ozon", color: "#0069ff" },
  { name: "Яндекс Маркет", color: "#fc3f1d" },
  { name: "Wildberries", color: "#cb11ab" },
];

const DAY_OPTIONS = [1, 2, 3, 7];

export default function Page() {
  const [modalItem, setModalItem] = useState(null);
  const [step, setStep] = useState("config"); // config | loading | error | success
  const [days, setDays] = useState(1);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [pvz, setPvz] = useState("Ozon");
  const [sending, setSending] = useState(false);
  const [formErr, setFormErr] = useState("");

  const openBooking = useCallback((item, source) => {
    setModalItem(item);
    setStep("config");
    setDays(1);
    setPhone("");
    setName("");
    setDistrict("");
    setFormErr("");
    track("open_booking", { item: item.name, source: source || "catalog" });
  }, []);

  const closeModal = useCallback(() => {
    if (modalItem) track("close_modal", { item: modalItem.name, step });
    setModalItem(null);
  }, [modalItem, step]);

  // Закрытие по Escape + блокировка прокрутки фона
  useEffect(() => {
    if (!modalItem) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [modalItem, closeModal]);

  const confirmBooking = () => {
    const total = dayPrice(modalItem.value) * days;
    track("confirm_booking", { item: modalItem.name, days, total });
    setStep("loading");
    // Имитация обработки брони, затем «техническая ошибка» (fake-door).
    setTimeout(() => {
      setStep("error");
      track("error_shown", { item: modalItem.name });
    }, 1600);
  };

  const submitLead = async (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setFormErr("Проверьте номер — кажется, не хватает цифр.");
      return;
    }
    setFormErr("");
    setSending(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name,
          district,
          pickup: pvz,
          item: modalItem.name,
          days: `${days} дн.`,
          source: "landing",
        }),
      });
    } catch {
      // Даже при сетевой ошибке не показываем сбой — заявка нам важнее.
    }
    track("lead_submitted", { item: modalItem.name });
    setSending(false);
    setStep("success");
  };

  return (
    <>
      {/* NAV */}
      <header className="nav">
        <div className="wrap nav__inner">
          <div className="brand">
            <span className="brand__mark">◆</span>
            <span>Рядом.Аренда</span>
          </div>
          <button
            className="nav__cta"
            onClick={() => {
              track("nav_cta");
              document.getElementById("catalog")?.scrollIntoView();
            }}
          >
            Что есть рядом
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="wrap hero__grid">
          <div>
            <span className="pill">● Пилот в вашем районе</span>
            <h1>Берите вещи в аренду в своём пункте выдачи</h1>
            <p className="hero__lead">
              Перфоратор на вечер, отпариватель на выходные, коляску на поездку.
              Заберите по коду в ближайшем ПВЗ и верните туда же — без поездок
              через город и без залога паспортом.
            </p>
            <div className="hero__actions">
              <button
                className="btn btn--primary btn--lg"
                onClick={() => {
                  track("hero_cta");
                  document.getElementById("catalog")?.scrollIntoView();
                }}
              >
                Посмотреть, что есть рядом
              </button>
              <a
                className="btn btn--ghost btn--lg"
                href="#how"
                onClick={() => track("hero_how")}
              >
                Как это работает
              </a>
            </div>
            <div className="hero__trust">
              <span><b className="tick">✓</b> Оплата и залог картой</span>
              <span><b className="tick">✓</b> Ничего не подписывать на месте</span>
              <span><b className="tick">✓</b> 5% от цены вещи за день</span>
            </div>
          </div>

          <div className="hero__card">
            <h4>Уже доступно рядом</h4>
            <p>Заберёте в пункте выдачи в своём районе</p>
            {ITEMS.slice(0, 3).map((it) => (
              <div className="mini-item" key={it.id}>
                <span className="mini-item__emoji">{it.emoji}</span>
                <div className="mini-item__body">
                  <div className="mini-item__name">{it.name}</div>
                  <div className="mini-item__meta">
                    вместо покупки за {fmt(it.value)} ₽
                  </div>
                </div>
                <span className="mini-item__price">{fmt(dayPrice(it.value))} ₽/день</span>
              </div>
            ))}
            <button
              className="btn btn--primary btn--block"
              style={{ marginTop: 6 }}
              onClick={() => openBooking(ITEMS[0], "hero_card")}
            >
              Забронировать
            </button>
          </div>
        </div>
      </section>

      {/* PICKUP STRIP */}
      <div className="pickup-strip">
        <div className="wrap pickup-strip__inner">
          <span className="pickup-strip__label">Заберёте в вашем пункте выдачи:</span>
          {PVZ.map((p) => (
            <span className="pvz" key={p.name}>
              <span className="pvz__dot" style={{ background: p.color }} />
              {p.name}
            </span>
          ))}
        </div>
      </div>

      {/* PROBLEM */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Знакомая ситуация</div>
            <h2>Нужен перфоратор на три часа — а вариантов, по сути, нет</h2>
            <p>
              Повесить полки — дело на вечер. Но чтобы добыть инструмент, сегодня
              приходится выбирать из неудобного:
            </p>
          </div>
          <div className="cards-3">
            <div className="card card--bad">
              <div className="card__emoji">💸</div>
              <h3>Купить</h3>
              <p>
                12 000 ₽ — и потом хранить вещь, которой пользуешься раз в год.
                Деньги заморожены, место занято.
              </p>
            </div>
            <div className="card card--bad">
              <div className="card__emoji">📵</div>
              <h3>Доска объявлений</h3>
              <p>
                Позвонить незнакомцу, ехать через полгорода, оставить паспорт,
                подписать непонятную бумагу и надеяться на адекватный возврат.
              </p>
            </div>
            <div className="card card--bad">
              <div className="card__emoji">🤷</div>
              <h3>Спросить у соседа</h3>
              <p>Если сосед есть. И если у него есть перфоратор. И если он дома.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Как это работает</div>
            <h2>Как забрать хлеб — только это вещь напрокат</h2>
            <p>
              Самое ходовое лежит прямо в пункте выдачи рядом с домом. Редкое —
              привезём со склада за день.
            </p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step__num">1</div>
              <h3>Выбираете вещь</h3>
              <p>Смотрите, что есть в пункте выдачи в вашем районе, и бронируете с телефона.</p>
            </div>
            <div className="step">
              <div className="step__num">2</div>
              <h3>Платите картой</h3>
              <p>Оплата и залог — картой, без наличных. Никакого паспорта незнакомцу.</p>
            </div>
            <div className="step">
              <div className="step__num">3</div>
              <h3>Забираете по коду</h3>
              <p>Заходите в пункт пешком и забираете вещь по коду. Ничего не подписывая.</p>
            </div>
            <div className="step">
              <div className="step__num">4</div>
              <h3>Возвращаете туда же</h3>
              <p>Сделали дело — вернули в тот же пункт. Залог возвращается на карту.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section className="catalog" id="catalog">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Что можно взять</div>
            <h2>Выберите вещь и забронируйте</h2>
            <p>Цена — 5% от стоимости вещи за день. Заберёте в ближайшем пункте выдачи.</p>
          </div>
          <div className="catalog__grid">
            {ITEMS.map((it) => (
              <div className="product" key={it.id}>
                <div className="product__top">
                  <span className="product__emoji">{it.emoji}</span>
                  {it.badge && (
                    <span className={`badge${it.badge === "Часто спрашивают" ? " badge--warn" : ""}`}>
                      {it.badge}
                    </span>
                  )}
                </div>
                <h3>{it.name}</h3>
                <p className="product__cat">{it.cat}</p>
                <div className="product__price">
                  <span className="product__day">{fmt(dayPrice(it.value))} ₽</span>
                  <span style={{ fontSize: 13, color: "var(--ink-mute)" }}>/ день</span>
                  <span className="product__value">{fmt(it.value)} ₽</span>
                </div>
                <button
                  className="btn btn--primary btn--block"
                  onClick={() => openBooking(it, "catalog")}
                >
                  Забронировать
                </button>
              </div>
            ))}
          </div>
          <p className="catalog__note">
            Нет нужной вещи в списке? Забронируйте близкую — на пилоте мы собираем
            заявки, чтобы понять, что привозить в ваш район.
          </p>
        </div>
      </section>

      {/* ECONOMICS / WHY */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Почему это выгодно</div>
            <h2>Платите за пользование, а не за владение</h2>
          </div>
          <div className="econ">
            <ul className="econ__list">
              <li>
                <span className="econ__ic">₽</span>
                <span><b>Не замораживаете деньги.</b> Перфоратор за 12 000 ₽ — это 600 ₽ за вечер вместо покупки, которая потом год лежит.</span>
              </li>
              <li>
                <span className="econ__ic">🏠</span>
                <span><b>Не храните дома.</b> Вещь нужна на три часа, а место в шкафу занимает годами.</span>
              </li>
              <li>
                <span className="econ__ic">🚶</span>
                <span><b>Дошли пешком.</b> Забрали в своём районе, а не поехали через город к незнакомцу.</span>
              </li>
              <li>
                <span className="econ__ic">🔒</span>
                <span><b>Понятные правила.</b> Залог и оплата картой, залог возвращается. Спорные случаи решаем мы.</span>
              </li>
            </ul>
            <div className="calc">
              <h4>Пример: перфоратор</h4>
              <p className="calc__sub">Повесить полки — дело на один вечер</p>
              <div className="calc__row">
                <span>Купить новый</span>
                <b>12 000 ₽</b>
              </div>
              <div className="calc__row">
                <span>Аренда на 1 день</span>
                <span className="calc__big">600 ₽</span>
              </div>
              <div className="calc__row" style={{ borderTop: "none", color: "var(--ink-mute)", fontSize: 13 }}>
                <span>Экономия против покупки</span>
                <span>в 20 раз</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Вопросы</div>
            <h2>Что важно знать</h2>
          </div>
          <div className="faq">
            <details className="q">
              <summary>Какой залог и вернётся ли он?</summary>
              <p>
                Залог блокируется на карте при бронировании и возвращается после
                того, как вы сдали вещь в исправном состоянии. Наличными ничего
                платить не нужно.
              </p>
            </details>
            <details className="q">
              <summary>А если я случайно сломаю вещь?</summary>
              <p>
                Спорные случаи разбираем мы, а не сотрудник пункта. Мелкий износ —
                это нормально. Серьёзные поломки покрываются из залога по понятным
                правилам, которые вы видите заранее.
              </p>
            </details>
            <details className="q">
              <summary>Нужно ли что-то подписывать в пункте?</summary>
              <p>
                Нет. Бронь и договор — онлайн, в пункте вы просто забираете вещь по
                коду, как заказ с маркетплейса.
              </p>
            </details>
            <details className="q">
              <summary>Что, если нужной вещи нет на точке?</summary>
              <p>
                Самое ходовое лежит прямо в пункте. Редкое привозим со склада за
                день. Оставьте заявку — так мы понимаем, что везти в ваш район.
              </p>
            </details>
            <details className="q">
              <summary>В каких пунктах можно забрать?</summary>
              <p>
                В обычных пунктах выдачи заказов рядом с домом — Ozon, Яндекс Маркет
                или Wildberries. Конкретный адрес подскажем при подтверждении брони.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section>
        <div className="final">
          <h2>Возьмите нужную вещь рядом с домом</h2>
          <p>
            Выберите вещь и забронируйте — заберёте в ближайшем пункте выдачи и
            вернёте туда же.
          </p>
          <button
            className="btn btn--primary btn--lg"
            onClick={() => {
              track("final_cta");
              document.getElementById("catalog")?.scrollIntoView();
            }}
          >
            Выбрать вещь
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap footer__inner">
          <div>
            <div className="brand" style={{ marginBottom: 8 }}>
              <span className="brand__mark">◆</span>
              <span>Рядом.Аренда</span>
            </div>
            <div>Аренда вещей в пункте выдачи рядом с домом.</div>
          </div>
          <div style={{ maxWidth: 320 }}>
            Пилотный проект. Мы проверяем спрос на аренду вещей в пунктах выдачи и
            запускаемся по районам. Оставьте заявку — сообщим, когда откроемся рядом
            с вами.
          </div>
        </div>
      </footer>

      {/* MODAL */}
      {modalItem && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal" role="dialog" aria-modal="true">
            <button className="modal__close" aria-label="Закрыть" onClick={closeModal}>
              ×
            </button>

            {step === "config" && (
              <>
                <div className="modal__head">
                  <span className="modal__emoji">{modalItem.emoji}</span>
                  <div>
                    <p className="modal__title">{modalItem.name}</p>
                    <span className="modal__cat">{modalItem.cat}</span>
                  </div>
                </div>

                <div className="field">
                  <label>На сколько дней?</label>
                  <div className="days">
                    {DAY_OPTIONS.map((d) => (
                      <button
                        key={d}
                        className={`day-chip${days === d ? " day-chip--on" : ""}`}
                        onClick={() => setDays(d)}
                      >
                        {d} {d === 1 ? "день" : d < 5 ? "дня" : "дней"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label>Пункт выдачи</label>
                  <div className="days">
                    {PVZ.map((p) => (
                      <button
                        key={p.name}
                        className={`day-chip${pvz === p.name ? " day-chip--on" : ""}`}
                        onClick={() => setPvz(p.name)}
                        style={{ fontSize: 13 }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="total">
                  <span>Итого за {days} {days === 1 ? "день" : days < 5 ? "дня" : "дней"}</span>
                  <span className="total__big">{fmt(dayPrice(modalItem.value) * days)} ₽</span>
                </div>

                <button className="btn btn--primary btn--block btn--lg" onClick={confirmBooking}>
                  Забронировать
                </button>
                <p className="note">Оплата и залог картой при получении. Ничего подписывать не нужно.</p>
              </>
            )}

            {step === "loading" && (
              <div className="center-block" style={{ padding: "34px 0" }}>
                <div className="spinner" />
                <p style={{ marginTop: 16 }}>Бронируем {modalItem.name}…</p>
              </div>
            )}

            {step === "error" && (
              <>
                <div className="center-block">
                  <div className="error-icon">!</div>
                  <p style={{ fontWeight: 700, color: "var(--ink)", fontSize: 17, margin: "0 0 6px" }}>
                    Не получилось оформить бронь
                  </p>
                  <p style={{ margin: 0 }}>
                    На стороне пункта выдачи возникла техническая ошибка. Ваша вещь
                    ещё свободна — оставьте телефон, мы подтвердим бронь вручную и
                    сообщим адрес пункта.
                  </p>
                </div>
                <form onSubmit={submitLead} style={{ marginTop: 20 }}>
                  <div className="field">
                    <label>Телефон *</label>
                    <input
                      className="input"
                      type="tel"
                      inputMode="tel"
                      placeholder="+7 900 000-00-00"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoFocus
                    />
                    {formErr && <div className="err-hint">{formErr}</div>}
                  </div>
                  <div className="field">
                    <label>Как к вам обращаться (необязательно)</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="Имя"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Ваш район (необязательно)</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="Чтобы подобрать ближайший пункт"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    />
                  </div>
                  <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={sending}>
                    {sending ? "Отправляем…" : "Подтвердить бронь по телефону"}
                  </button>
                  <p className="note">Перезвоним, чтобы подтвердить бронь {modalItem.name}. Без спама.</p>
                </form>
              </>
            )}

            {step === "success" && (
              <div className="center-block" style={{ padding: "20px 0" }}>
                <div className="success-icon">✓</div>
                <p style={{ fontWeight: 700, color: "var(--ink)", fontSize: 18, margin: "0 0 6px" }}>
                  Заявка принята
                </p>
                <p style={{ margin: "0 0 20px" }}>
                  Свяжемся с вами, чтобы подтвердить бронь <b>{modalItem.name}</b> и
                  назвать адрес ближайшего пункта выдачи.
                </p>
                <button className="btn btn--ghost btn--block" onClick={closeModal}>
                  Понятно
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
