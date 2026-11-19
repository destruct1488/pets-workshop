import { company } from "@/lib/site";
import { formatPrice, groupByRegion, type PriceSnapshot } from "@/lib/prices";

export function PriceTable({ snapshot }: { snapshot: PriceSnapshot | null }) {
  if (!snapshot || snapshot.items.length === 0) {
    return (
      <div className="prices-empty">
        <p>
          Актуальні ціни за регіонами ми публікуємо в Telegram-каналі. Тут вони з’являться одразу
          після оновлення.
        </p>
        <a className="button button-solid" href={company.telegramUrl} rel="noopener noreferrer" target="_blank">
          Відкрити канал із цінами
        </a>
      </div>
    );
  }

  const updated = new Date(snapshot.updatedAt).toLocaleString("uk-UA", {
    timeZone: "Europe/Kyiv",
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div>
      <p className="prices-updated">
        Оновлено: <time dateTime={snapshot.updatedAt}>{updated}</time>
      </p>
      <div className="price-groups">
        {groupByRegion(snapshot.items).map((group) => (
          <section className="price-group" key={group.region ?? "all"}>
            <h3>{group.region ?? "Усі регіони"}</h3>
            <table>
              <thead>
                <tr>
                  <th scope="col">Паливо</th>
                  <th scope="col">Ціна</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item) => (
                  <tr key={`${item.product}-${item.unit}`}>
                    <th scope="row">{item.product}</th>
                    <td>
                      <b>{formatPrice(item.price)}</b> <span>{item.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </div>
  );
}
