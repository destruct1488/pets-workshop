import { Logo } from "@/components/Logo";
import { PriceTable } from "@/components/PriceTable";
import { SupplyMap } from "@/components/SupplyMap";
import { company, mainPhone, navLinks, originCountries, phoneGroups } from "@/lib/site";
import { FALLBACK_PRICES } from "@/lib/fallback-prices";
import { getCurrentPrices } from "@/lib/store";

// Prices are refreshed right after publishing (revalidatePath in the bot);
// this is only the safety net.
export const revalidate = 300;

export default async function Home() {
  const prices = (await getCurrentPrices()) ?? FALLBACK_PRICES;

  return (
    <>
      <a className="skip-link" href="#main">
        Перейти до змісту
      </a>

      <header className="site-header" id="top">
        <div className="container header-row">
          <Logo />
          <nav aria-label="Основна навігація" className="nav">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <a className="button button-solid header-phone" href={mainPhone.href}>
            {mainPhone.display}
          </a>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="about">
          <div className="container hero-grid">
            <div className="hero-copy">
              <h1>Оптові поставки нафтопродуктів з Європи: прозора якість на кожному етапі</h1>
              <p>
                {company.name} імпортує світлі нафтопродукти з ЄС і доставляє їх власними бензовозами,
                залізницею, річковим та морським транспортом по всій Україні: від Києва до Львова,
                Одеси та Харкова, у місце, вказане в договорі.
              </p>
              <div className="hero-actions">
                <a className="button button-solid" href={mainPhone.href}>
                  Зателефонувати
                </a>
                <a
                  className="button button-line"
                  href={company.telegramUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Актуальні ціни
                </a>
              </div>
            </div>
            <div className="hero-visual">
              <SupplyMap />
            </div>
          </div>
        </section>

        <section className="quality" id="quality">
          <div className="container split">
            <div className="split-head">
              <h2>Якість підтверджена документами на кожну поставку</h2>
            </div>
            <div className="quality-side">
              <p className="quality-standard">Євро 5</p>
              <p>Сертифікат і паспорт якості супроводжують кожну окрему поставку.</p>
              <p className="quality-label">Звідки постачаємо</p>
              <ul className="chips">
                {originCountries.map((country) => (
                  <li key={country}>{country}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section" id="prices">
          <div className="container">
            <div className="section-head">
              <h2>Актуальні ціни за регіонами</h2>
              <p>
                Ціни змінюються разом з ринком. Остаточну вартість для вашого обсягу і маршруту ми
                розраховуємо індивідуально.
              </p>
            </div>
            <PriceTable snapshot={prices} />
            <div className="pricing-note">
              <h3>Умови поставки</h3>
              <ul>
                <li>Ціни вказані з ПДВ, на об’єм від 30 000 л.</li>
                <li>Об’єм від 5 000 до 25 000 л розраховується індивідуально.</li>
                <li>Умови та місце поставки: DDP.</li>
                <li>Більший обсяг поставки знижує ціну, більша відстань маршруту підвищує її. Для кожного клієнта діє індивідуальна програма лояльності.</li>
                <li>Ціни актуальні на момент публікації.</li>
              </ul>
              <a href={company.telegramUrl} rel="noopener noreferrer" target="_blank">
                Ціни за регіонами в Telegram: {company.telegramLabel}
              </a>
            </div>
          </div>
        </section>

        <section className="section section-tint" id="contacts">
          <div className="container">
            <div className="section-head">
              <h2>Зв’яжіться з нами</h2>
              <p>Для нас важливі порядність і сумлінність. У співпраці ми максимально враховуємо ваші інтереси.</p>
            </div>
            <div className="contact-grid">
              {phoneGroups.map((group) => (
                <div className="contact-block" key={group.title}>
                  <h3>{group.title}</h3>
                  <ul>
                    {group.phones.map((p) => (
                      <li key={p.href}>
                        <a href={p.href}>{p.display}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="contact-block">
                <h3>Онлайн</h3>
                <ul>
                  <li>
                    <a href={`mailto:${company.email}`}>{company.email}</a>
                  </li>
                  <li>
                    <a href={company.telegramUrl} rel="noopener noreferrer" target="_blank">
                      {company.telegramLabel}
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="requisites">
              <h3>Реквізити</h3>
              <dl>
                <div>
                  <dt>Компанія</dt>
                  <dd>{company.legalName}</dd>
                </div>
                <div>
                  <dt>Юридична адреса</dt>
                  <dd>{company.address}</dd>
                </div>
                <div>
                  <dt>ЄДРПОУ</dt>
                  <dd>{company.edrpou}</dd>
                </div>
                <div>
                  <dt>Beneficiary</dt>
                  <dd>
                    LLC «{company.nameLatin}», {company.addressEn}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-row">
          <span>
            © {new Date().getFullYear()} {company.legalName}
          </span>
          <span>Прозора якість та контроль на кожному етапі постачання</span>
        </div>
      </footer>
    </>
  );
}
