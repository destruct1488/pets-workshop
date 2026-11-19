/**
 * Schematic view (not to scale) of supply lines: EU origins -> Kyiv hub -> regions of Ukraine.
 * Ukraine is drawn with a simplified but complete outline: the eastern border with
 * Russia, the Azov coast and Crimea are included. Only the regional centres are labelled.
 */

const LAND_MAIN =
  "M86 129 L92 119 L92 111 L101 106 L106 99 L112 94 L111 88 L108 82 L121 78 L133 78 L147 80 " +
  "L161 81 L176 81 L189 77 L203 74 L217 74 L231 71 L245 71 L258 71 L266 75 L270 84 L279 92 " +
  "L288 96 L298 102 L311 107 L325 113 L337 117 L339 126 L331 135 L322 142 L316 146 L311 147 " +
  "L301 150 L291 155 L274 161 L265 164 L252 165 L241 165 L232 156 L224 158 L210 156 L206 158 " +
  "L196 165 L190 174 L192 177 L178 179 L171 137 L162 129 L148 131 L139 137 L129 137 L119 134 " +
  "L105 135 Z";

const LAND_CRIMEA =
  "M245 167 L258 164 L267 173 L273 179 L288 174 L287 180 L279 188 L266 189 L255 189 L245 188 " +
  "L231 175 L232 167 Z";

const origins = [
  { name: "Німеччина", x: -8, y: 60, labelX: -8, labelY: 46, anchor: "start", route: "M-8 60 C40 58 130 72 203 98" },
  { name: "Латвія", x: 113, y: 2, labelX: 104, labelY: 6, anchor: "end", route: "M113 2 C130 30 170 60 203 98" },
  { name: "Литва", x: 127, y: 34, labelX: 136, labelY: 38, anchor: "start", route: "M127 34 C150 45 180 70 203 98" },
  { name: "Польща", x: 70, y: 71, labelX: 70, labelY: 89, anchor: "middle", route: "M70 71 C120 75 170 90 203 98" },
  { name: "Молдова", x: 150, y: 150, labelX: 142, labelY: 146, anchor: "end", route: "M150 150 C165 135 185 115 203 98" },
  { name: "Румунія", x: 141, y: 202, labelX: 152, labelY: 206, anchor: "start", route: "M141 202 C165 165 190 125 203 98" },
  { name: "Греція", x: 90, y: 259, labelX: 100, labelY: 263, anchor: "start", route: "M90 259 C130 225 175 165 203 98" },
] as const;

const KYIV = { x: 203, y: 98 };

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
      viewBox="-16 -14 362 318"
      role="img"
      aria-label="Схема постачання: нафтопродукти з Німеччини, Латвії, Литви, Польщі, Молдови, Румунії та Греції надходять до Києва і далі в регіони України"
    >
      <path d={LAND_MAIN} className="map-land" />
      <path d={LAND_CRIMEA} className="map-land" />

      {regions.map((r) => (
        <path key={`line-${r.name}`} d={`M${KYIV.x} ${KYIV.y} L${r.x} ${r.y}`} className="map-distribution" />
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
