/**
 * Schematic view (not to scale) of supply lines: EU origins -> Kyiv hub -> regions of Ukraine.
 * The Ukraine outline is a rough simplified shape, Crimea is not drawn.
 */

const LAND =
  "M92 129 L105 132 L112 136 L129 136 L148 131 L162 129 L171 134 L185 135 L192 146 L192 162 " +
  "L178 174 L190 177 L203 165 L206 158 L224 162 L241 164 L259 164 L272 155 L286 156 L301 141 " +
  "L311 141 L326 138 L339 128 L333 114 L316 107 L300 101 L283 98 L266 89 L259 75 L238 72 " +
  "L225 75 L210 80 L196 84 L176 81 L154 80 L120 77 L105 81 L109 93 L105 101 L95 107 L92 114 L92 125 Z";

const origins = [
  { name: "Литва", x: 127, y: 34, labelX: 127, labelY: 22, anchor: "middle", route: "M127 34 C150 40 180 60 206 100" },
  { name: "Польща", x: 70, y: 71, labelX: 70, labelY: 60, anchor: "middle", route: "M70 71 C110 70 170 90 206 100" },
  { name: "Румунія", x: 141, y: 202, labelX: 152, labelY: 206, anchor: "start", route: "M141 202 C160 170 185 130 206 100" },
  { name: "Греція", x: 90, y: 259, labelX: 100, labelY: 263, anchor: "start", route: "M90 259 C120 230 170 190 206 100" },
] as const;

const KYIV = { x: 206, y: 100 };

const regions = [
  { name: "Львів", x: 112, y: 109, lx: 104, ly: 104, anchor: "end" },
  { name: "Вінниця", x: 176, y: 118, lx: 176, ly: 136, anchor: "middle" },
  { name: "Чернігів", x: 214, y: 83, lx: 214, ly: 72, anchor: "middle" },
  { name: "Одеса", x: 209, y: 157, lx: 209, ly: 176, anchor: "middle" },
  { name: "Дніпро", x: 269, y: 131, lx: 278, ly: 128, anchor: "start" },
  { name: "Запоріжжя", x: 270, y: 140, lx: 278, ly: 152, anchor: "start" },
  { name: "Харків", x: 286, y: 101, lx: 296, ly: 105, anchor: "start" },
] as const;

export function SupplyMap() {
  return (
    <svg
      className="supply-map"
      viewBox="0 0 400 300"
      role="img"
      aria-label="Схема постачання: нафтопродукти з Литви, Польщі, Румунії та Греції надходять до Києва і далі в регіони України: Львів, Вінниця, Чернігів, Одеса, Дніпро, Запоріжжя, Харків"
    >
      <path d={LAND} className="map-land" />

      {regions.map((r) => (
        <path
          key={`line-${r.name}`}
          d={`M${KYIV.x} ${KYIV.y} L${r.x} ${r.y}`}
          className="map-distribution"
        />
      ))}

      {origins.map((o) => (
        <g key={o.name}>
          <path d={o.route} className="map-route" />
          <circle cx={o.x} cy={o.y} r="6" className="map-node" />
          <text x={o.labelX} y={o.labelY} textAnchor={o.anchor} className="map-label">
            {o.name}
          </text>
        </g>
      ))}

      {regions.map((r) => (
        <g key={r.name}>
          <circle cx={r.x} cy={r.y} r="4" className="map-city" />
          <text x={r.lx} y={r.ly} textAnchor={r.anchor} className="map-city-label">
            {r.name}
          </text>
        </g>
      ))}

      <circle cx={KYIV.x} cy={KYIV.y} r="11" className="map-hub" />
      <circle cx={KYIV.x} cy={KYIV.y} r="5" className="map-hub-core" />
      <text x={KYIV.x - 14} y={KYIV.y - 6} textAnchor="end" className="map-label map-label-strong">
        Київ
      </text>
      <text x={200} y={292} textAnchor="middle" className="map-note">
        Доставка по всій Україні
      </text>
    </svg>
  );
}
