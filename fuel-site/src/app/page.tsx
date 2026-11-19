import { Logo } from "@/components/Logo";
import { PriceTable } from "@/components/PriceTable";
import { SupplyMap } from "@/components/SupplyMap";
import { company, mainPhone, navLinks, phoneGroups } from "@/lib/site";
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
          <div className="header-brand-right">
            <span className="flag-ua" aria-hidden="true">
              <span />
              <span />
            </span>
            <span className="header-legal">LLC «{company.nameLatin}»</span>
          </div>
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
            </div>
            <div className="hero-visual">
              <SupplyMap />
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
            <div className="telegram-cta">
              <a className="button button-solid" href={company.telegramUrl} rel="noopener noreferrer" target="_blank">
                Ціни за регіонами в Telegram
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
                  <div className="phone-buttons">
                    {group.phones.map((p) => (
                      <a className="button button-solid" key={p.href} href={p.href}>
                        {p.display}
                      </a>
                    ))}
                  </div>
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
          <span>Контур карти України: MapSVG, CC BY 4.0</span>
        </div>
      </footer>
    </>
  );
}
