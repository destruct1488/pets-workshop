import { company } from "@/lib/site";
import { formatDate, formatPrice, toMatrix, type PriceSnapshot } from "@/lib/prices";

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

  const matrix = toMatrix(snapshot.items);
  const asOf = snapshot.priceDate
    ? formatDate(snapshot.priceDate)
    : new Date(snapshot.updatedAt).toLocaleDateString("uk-UA", {
        timeZone: "Europe/Kyiv",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <div>
      <p className="prices-updated">
        Ціни станом на <time dateTime={snapshot.priceDate ?? snapshot.updatedAt}>{asOf}</time>
      </p>
      <div className="table-scroll" role="region" aria-label="Таблиця цін за регіонами" tabIndex={0}>
        <table className="price-matrix">
          <thead>
            <tr>
              <th scope="col">Регіон</th>
              {matrix.products.map((p) => (
                <th scope="col" key={`${p.name}-${p.unit}`}>
                  {p.name}
                  <span>{p.unit}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map((row) => (
              <tr key={row.region ?? "all"}>
                <th scope="row">{row.region ?? "Усі регіони"}</th>
                {row.cells.map((cell, i) => (
                  <td key={i}>{cell === null ? "—" : formatPrice(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
