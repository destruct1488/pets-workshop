/** Schematic (not geographic) view of supply lines from four EU countries to Kyiv. */
const origins = [
  { name: "Литва", x: 74, y: 56, c1: [190, 56], c2: [300, 130] },
  { name: "Польща", x: 58, y: 146, c1: [180, 150], c2: [300, 160] },
  { name: "Румунія", x: 80, y: 238, c1: [200, 236], c2: [300, 190] },
  { name: "Греція", x: 126, y: 328, c1: [240, 320], c2: [320, 220] },
] as const;

const KYIV = { x: 430, y: 176 };

export function SupplyMap() {
  return (
    <svg
      className="supply-map"
      viewBox="0 0 520 380"
      role="img"
      aria-label="Схема постачання: з Литви, Польщі, Румунії та Греції нафтопродукти надходять до Києва і далі по всій Україні"
    >
      <defs>
        <linearGradient id="line-gradient" gradientUnits="userSpaceOnUse" x1="40" y1="0" x2="430" y2="0">
          <stop offset="0" stopColor="#e8362f" />
          <stop offset="1" stopColor="#0b9a4a" />
        </linearGradient>
      </defs>
      {origins.map((o) => (
        <g key={o.name}>
          <path
            d={`M${o.x} ${o.y} C${o.c1[0]} ${o.c1[1]} ${o.c2[0]} ${o.c2[1]} ${KYIV.x} ${KYIV.y}`}
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx={o.x} cy={o.y} r="6" className="map-node" />
          <text x={o.x - 2} y={o.y - 14} className="map-label">
            {o.name}
          </text>
        </g>
      ))}
      <circle cx={KYIV.x} cy={KYIV.y} r="11" className="map-hub" />
      <circle cx={KYIV.x} cy={KYIV.y} r="4" className="map-hub-core" />
      <text x={KYIV.x} y={KYIV.y - 24} textAnchor="middle" className="map-label map-label-strong">
        Київ
      </text>
      <text x={KYIV.x} y={KYIV.y + 40} textAnchor="end" className="map-note" dx="60">
        усі регіони України
      </text>
    </svg>
  );
}
