"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";

const ITEMS = [
  { id: "perf", name: "Перфоратор", cat: "Инструмент", value: 12000, badge: "Хит района", emoji: "🔩" },
  { id: "drill", name: "Дрель-шуруповёрт", cat: "Инструмент", value: 6000, emoji: "🪛" },
  { id: "washer", name: "Мойка высокого давления", cat: "Для дома", value: 14000, emoji: "💦" },
  { id: "steamer", name: "Отпариватель для одежды", cat: "Для дома", value: 8000, badge: "Часто спрашивают", emoji: "👕" },
  { id: "vacuum", name: "Моющий пылесос", cat: "Для дома", value: 20000, emoji: "🧽" },
  { id: "projector", name: "Проектор", cat: "Техника", value: 25000, emoji: "📽️" },
  { id: "stroller", name: "Детская коляска", cat: "Детям", value: 18000, badge: "Хит района", emoji: "🍼" },
  { id: "carseat", name: "Автокресло", cat: "Детям", value: 10000, emoji: "🚗" },
  { id: "tent", name: "Палатка 4-местная", cat: "Отдых", value: 12000, emoji: "⛺" },
];

const CATS = ["Все", "Инструмент", "Для дома", "Техника", "Детям", "Отдых"];

const PVZ = [
  { name: "Ozon", logo: "/pvz/ozon.jpg" },
  { name: "Яндекс Маркет", logo: "/pvz/yandex.png" },
  { name: "Wildberries", logo: "/pvz/wb.jpg" },
];

const DAY_OPTIONS = [1, 2, 3, 7];
const DAY_RATE = 0.05;
const dayPrice = (value) => Math.round((value * DAY_RATE) / 10) * 10;
const fmt = (n) => n.toLocaleString("ru-RU");
const daysWord = (d) => (d === 1 ? "день" : d < 5 ? "дня" : "дней");

// SVG-иконки интерфейса
function Icon({ id, size = 20, className, style }) {
  return (
    <svg width={size} height={size} className={`ic ${className || ""}`} style={style} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  );
}

// Фото товара с запасным вариантом-эмодзи, если картинка не подгрузилась
function Thumb({ src, emoji, className }) {
  const [err, setErr] = useState(false);
  if (err || !src) {
    return (
      <span className={className} aria-hidden="true">
        {emoji}
      </span>
    );
  }
  return <img src={src} alt="" className={className} loading="lazy" onError={() => setErr(true)} />;
}

function IconDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="ic-search" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </symbol>
        <symbol id="ic-pin" viewBox="0 0 24 24">
          <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="10" r="2.6" fill="currentColor" />
        </symbol>
        <symbol id="ic-user" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </symbol>
        <symbol id="ic-cart" viewBox="0 0 24 24">
          <circle cx="9" cy="20" r="1.9" fill="currentColor" />
          <circle cx="18" cy="20" r="1.9" fill="currentColor" />
          <path d="M3 4h3l2.4 12h10l2-8H7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        </symbol>
        <symbol id="ic-heart" viewBox="0 0 24 24">
          <path d="M12 20S3.5 14.5 3.5 8.8A4.3 4.3 0 0 1 12 6a4.3 4.3 0 0 1 8.5 2.8C20.5 14.5 12 20 12 20z" fill="none" stroke="currentColor" strokeWidth="2" />
        </symbol>
        <symbol id="ic-check" viewBox="0 0 24 24">
          <path d="M4 12l5 5L20 6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="ic-arrow" viewBox="0 0 24 24">
          <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="ic-plus" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </symbol>
      </defs>
    </svg>
  );
}

function Brand({ onClick }) {
  return (
    <div className="brand" onClick={onClick}>
      <span className="brand__mark">◆</span>
      Рядом<span className="brand__dot">·</span>Аренда
    </div>
  );
}

function ProductCard({ item, onBook }) {
  return (
    <div className="pcard">
      <div className="pcard__media">
        {item.badge && <span className="pcard__badge">{item.badge}</span>}
        <span className="pcard__fav">
          <Icon id="ic-heart" size={18} />
        </span>
        <Thumb src={`/items/${item.id}.jpg`} emoji={item.emoji} className="pcard__img" />
      </div>
      <div className="pcard__body">
        <div className="pcard__cat">{item.cat}</div>
        <div className="pcard__name">{item.name}</div>
        <div className="pcard__price">
          <b>{fmt(dayPrice(item.value))} ₽</b>
          <span className="pcard__unit">/день</span>
        </div>
        <div className="pcard__buy">вместо покупки за {fmt(item.value)} ₽</div>
        <button className="cta btn-blue pcard__cta" onClick={() => onBook(item, "catalog")}>
          Забронировать
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const [activeCat, setActiveCat] = useState("Все");
  const [modalItem, setModalItem] = useState(null);
  const [step, setStep] = useState("config");
  const [days, setDays] = useState(1);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [pvz, setPvz] = useState("Ozon");
  const [sending, setSending] = useState(false);
  const [formErr, setFormErr] = useState("");

  const filtered = useMemo(
    () => (activeCat === "Все" ? ITEMS : ITEMS.filter((i) => i.cat === activeCat)),
    [activeCat]
  );
  const featured = ITEMS.slice(0, 3);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView();

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
      /* заявку не теряем — пользователю показываем успех в любом случае */
    }
    track("lead_submitted", { item: modalItem.name });
    setSending(false);
    setStep("success");
  };

  return (
    <>
      <IconDefs />

      {/* HEADER */}
      <header className="mhead">
        <div className="wrap mhead__row">
          <Brand onClick={() => scrollTo("top")} />
          <div className="search" role="button" onClick={() => { track("nav_cta"); scrollTo("catalog"); }}>
            <div className="search__ph">Искать вещь в вашем районе…</div>
            <div className="cta search__btn"><Icon id="ic-search" size={22} /></div>
          </div>
          <div className="loc"><Icon id="ic-pin" size={18} className="blue" style={{ color: "#0b5cff" }} />Ваш район</div>
          <div className="iconrow">
            <span className="iconbtn"><Icon id="ic-heart" size={21} /></span>
            <span className="iconbtn"><Icon id="ic-cart" size={21} /></span>
            <span className="iconbtn"><Icon id="ic-user" size={21} /></span>
          </div>
        </div>
        <div className="wrap chips">
          {CATS.map((c) => (
            <button
              key={c}
              className={`chip${activeCat === c ? " chip--on" : ""}`}
              onClick={() => { setActiveCat(c); scrollTo("catalog"); }}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <div id="top" className="wrap" style={{ paddingTop: 24, paddingBottom: 8 }}>
        {/* HERO */}
        <div className="hero">
          <div>
            <div className="hero__badge">● Пилот в вашем районе</div>
            <h1 className="hero__title">Берите вещи в аренду в своём пункте выдачи</h1>
            <p className="hero__lead">
              Перфоратор на вечер, коляску на поездку. Забираете по коду в ближайшем
              ПВЗ и возвращаете туда же — без поездок через город и без залога паспортом.
            </p>
            <div className="hero__actions">
              <button className="cta btn-orange" onClick={() => { track("hero_cta"); scrollTo("catalog"); }}>
                Посмотреть, что есть рядом <Icon id="ic-arrow" size={20} />
              </button>
              <a className="cta btn-white" href="#how" onClick={() => track("hero_how")}>
                Как это работает
              </a>
            </div>
            <div className="hero__trust">
              <span><Icon id="ic-check" size={18} className="blue" style={{ color: "#0b5cff" }} />Оплата и залог картой</span>
              <span><Icon id="ic-check" size={18} />Ничего не подписывать</span>
              <span><Icon id="ic-check" size={18} />5% от цены в день</span>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__grid">
              <div className="hero__tile"><Thumb src="/items/perf.jpg" emoji="🔩" /></div>
              <div className="hero__tile"><Thumb src="/items/stroller.jpg" emoji="🍼" /></div>
              <div className="hero__tile hero__tile--wide"><Thumb src="/items/washer.jpg" emoji="💦" /></div>
            </div>
          </div>
        </div>

        {/* PARTNERS */}
        <div className="partners">
          <span>Заберёте в вашем ПВЗ:</span>
          {PVZ.map((p) => (
            <span className="partner" key={p.name}>
              <img src={p.logo} alt={p.name} />
              {p.name}
            </span>
          ))}
        </div>

        {/* FEATURED */}
        <div className="sec">
          <div className="sec-head">
            <div>
              <div className="sec-title">Уже доступно рядом</div>
              <div className="sec-sub">Заберёте в пункте выдачи в своём районе</div>
            </div>
            <span className="link-all" onClick={() => scrollTo("catalog")}>
              Весь каталог <Icon id="ic-arrow" size={17} />
            </span>
          </div>
          <div className="pgrid">
            {featured.map((it) => (
              <ProductCard key={it.id} item={it} onBook={openBooking} />
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="sec-band" id="how">
        <div className="wrap">
          <div className="eyebrow">Как это работает</div>
          <h2 className="sec-title">Как забрать хлеб — только это вещь напрокат</h2>
          <p className="sec-sub">
            Самое ходовое лежит прямо в пункте выдачи рядом с домом. Редкое привезём со склада за день.
          </p>
          <div className="how-grid">
            <div className="how-card">
              <div className="how-num">1</div>
              <h3>Выбираете вещь</h3>
              <p>Смотрите, что есть в пункте выдачи вашего района, и бронируете с телефона.</p>
            </div>
            <div className="how-card">
              <div className="how-num">2</div>
              <h3>Платите картой</h3>
              <p>Оплата и залог — картой, без наличных. Никакого паспорта незнакомцу.</p>
            </div>
            <div className="how-card">
              <div className="how-num">3</div>
              <h3>Забираете по коду</h3>
              <p>Заходите в пункт пешком и забираете вещь по коду. Ничего не подписывая.</p>
            </div>
            <div className="how-card">
              <div className="how-num">4</div>
              <h3>Возвращаете туда же</h3>
              <p>Сделали дело — вернули в тот же пункт. Залог возвращается на карту.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CATALOG */}
      <div className="wrap sec" id="catalog">
        <h2 className="sec-title">Выберите вещь и забронируйте</h2>
        <p className="sec-sub" style={{ marginBottom: 24 }}>
          Цена — 5% от стоимости вещи за день. Заберёте в ближайшем пункте выдачи.
        </p>
        <div className="pgrid pgrid--auto">
          {filtered.map((it) => (
            <ProductCard key={it.id} item={it} onBook={openBooking} />
          ))}
        </div>
        <div className="cat-note">
          <Icon id="ic-plus" size={24} className="blue" style={{ color: "#0b5cff", flex: "none" }} />
          <div>
            Нет нужной вещи в списке? Забронируйте близкую — на пилоте мы собираем
            заявки, чтобы понять, что привозить в ваш район.
          </div>
        </div>
      </div>

      {/* WHY */}
      <div className="sec-band">
        <div className="wrap">
          <div className="eyebrow">Почему это выгодно</div>
          <h2 className="sec-title">Платите за пользование, а не за владение</h2>
          <div className="why-grid">
            <div className="why-items">
              <div className="why-item">
                <div className="why-ic">₽</div>
                <h3>Не замораживаете деньги</h3>
                <p>600 ₽ за вечер вместо покупки за 12 000 ₽, которая потом год лежит.</p>
              </div>
              <div className="why-item">
                <div className="why-ic"><Icon id="ic-pin" size={22} /></div>
                <h3>Не храните дома</h3>
                <p>Вещь нужна на три часа, а место в шкафу занимает годами.</p>
              </div>
              <div className="why-item">
                <div className="why-ic"><Icon id="ic-check" size={22} /></div>
                <h3>Дошли пешком</h3>
                <p>Забрали в своём районе, а не поехали через город к незнакомцу.</p>
              </div>
              <div className="why-item">
                <div className="why-ic"><Icon id="ic-heart" size={22} /></div>
                <h3>Понятные правила</h3>
                <p>Залог и оплата картой, залог возвращается. Спорные случаи решаем мы.</p>
              </div>
            </div>
            <div className="why-card">
              <div className="why-card__eyebrow">Пример: перфоратор</div>
              <div className="why-card__title">Повесить полки — дело на один вечер</div>
              <div className="why-card__row">
                <span>Купить новый</span>
                <span className="why-card__old">12 000 ₽</span>
              </div>
              <div className="why-card__row">
                <span>Аренда на 1 день</span>
                <span className="why-card__new">600 ₽</span>
              </div>
              <div className="why-card__save">
                <span style={{ fontWeight: 600 }}>Экономия против покупки</span>
                <b>в 20 раз</b>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="wrap sec">
        <h2 className="faq-title">Что важно знать</h2>
        <div className="faq">
          <details className="q" open>
            <summary>Какой залог и вернётся ли он?<Icon id="ic-plus" size={20} /></summary>
            <p>
              Залог блокируется на карте при бронировании и возвращается после того,
              как вы сдали вещь в исправном состоянии. Наличными ничего платить не нужно.
            </p>
          </details>
          <details className="q">
            <summary>А если я случайно сломаю вещь?<Icon id="ic-plus" size={20} /></summary>
            <p>
              Спорные случаи разбираем мы, а не сотрудник пункта. Мелкий износ — это
              нормально. Серьёзные поломки покрываются из залога по понятным правилам,
              которые вы видите заранее.
            </p>
          </details>
          <details className="q">
            <summary>Нужно ли что-то подписывать в пункте?<Icon id="ic-plus" size={20} /></summary>
            <p>
              Нет. Бронь и договор — онлайн, в пункте вы просто забираете вещь по коду,
              как заказ с маркетплейса.
            </p>
          </details>
          <details className="q">
            <summary>Что, если нужной вещи нет на точке?<Icon id="ic-plus" size={20} /></summary>
            <p>
              Самое ходовое лежит прямо в пункте. Редкое привозим со склада за день.
              Оставьте заявку — так мы понимаем, что везти в ваш район.
            </p>
          </details>
          <details className="q">
            <summary>В каких пунктах можно забрать?<Icon id="ic-plus" size={20} /></summary>
            <p>
              В обычных пунктах выдачи заказов рядом с домом — Ozon, Яндекс Маркет или
              Wildberries. Конкретный адрес подскажем при подтверждении брони.
            </p>
          </details>
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="wrap sec">
        <div className="final">
          <h2>Возьмите нужную вещь рядом с домом</h2>
          <p>Выберите вещь и забронируйте — заберёте в ближайшем пункте выдачи и вернёте туда же.</p>
          <button className="cta btn-orange" onClick={() => { track("final_cta"); scrollTo("catalog"); }}>
            Выбрать вещь <Icon id="ic-arrow" size={21} />
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="foot">
        <div className="wrap foot__row">
          <div>
            <Brand />
            <div className="foot__about" style={{ marginTop: 12 }}>
              Аренда вещей в пункте выдачи рядом с домом. Пилотный проект — запускаемся
              по районам. Оставьте заявку, сообщим, когда откроемся рядом с вами.
            </div>
          </div>
          <div className="foot__cols">
            <div className="foot__col">
              <h4>Сервис</h4>
              <div>
                <a onClick={() => scrollTo("catalog")} style={{ cursor: "pointer" }}>Каталог</a>
                <a href="#how">Как это работает</a>
                <a onClick={() => scrollTo("catalog")} style={{ cursor: "pointer" }}>Пункты выдачи</a>
              </div>
            </div>
            <div className="foot__col">
              <h4>Помощь</h4>
              <div>
                <a href="#">Вопросы и ответы</a>
                <a href="#">Правила аренды</a>
                <a href="#">Поддержка</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL */}
      {modalItem && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal" role="dialog" aria-modal="true">
            <button className="modal__close" aria-label="Закрыть" onClick={closeModal}>×</button>

            {step === "config" && (
              <>
                <div className="modal__head">
                  <Thumb src={`/items/${modalItem.id}.jpg`} emoji={modalItem.emoji} className="modal__media" />
                  <div>
                    <p className="modal__title">{modalItem.name}</p>
                    <span className="modal__cat">{modalItem.cat}</span>
                  </div>
                </div>

                <div className="field">
                  <label>На сколько дней?</label>
                  <div className="chip-row">
                    {DAY_OPTIONS.map((d) => (
                      <button key={d} className={`day-chip${days === d ? " day-chip--on" : ""}`} onClick={() => setDays(d)}>
                        {d} {daysWord(d)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label>Пункт выдачи</label>
                  <div className="chip-row">
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
                  <span>Итого за {days} {daysWord(days)}</span>
                  <b>{fmt(dayPrice(modalItem.value) * days)} ₽</b>
                </div>

                <button className="cta btn-blue" onClick={confirmBooking}>Забронировать</button>
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
                  <div className="err-icon">!</div>
                  <p style={{ fontWeight: 700, color: "var(--ink)", fontSize: 17, margin: "0 0 6px" }}>
                    Не получилось оформить бронь
                  </p>
                  <p style={{ margin: 0 }}>
                    На стороне пункта выдачи возникла техническая ошибка. Ваша вещь ещё
                    свободна — оставьте телефон, мы подтвердим бронь вручную и сообщим
                    адрес пункта.
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
                    <input className="input" type="text" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
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
                  <button className="cta btn-blue" type="submit" disabled={sending}>
                    {sending ? "Отправляем…" : "Подтвердить бронь по телефону"}
                  </button>
                  <p className="note">Перезвоним, чтобы подтвердить бронь «{modalItem.name}». Без спама.</p>
                </form>
              </>
            )}

            {step === "success" && (
              <div className="center-block" style={{ padding: "20px 0" }}>
                <div className="ok-icon">✓</div>
                <p style={{ fontWeight: 700, color: "var(--ink)", fontSize: 18, margin: "0 0 6px" }}>Заявка принята</p>
                <p style={{ margin: "0 0 20px" }}>
                  Свяжемся с вами, чтобы подтвердить бронь <b>{modalItem.name}</b> и назвать
                  адрес ближайшего пункта выдачи.
                </p>
                <button className="cta btn-white" onClick={closeModal}>Понятно</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
