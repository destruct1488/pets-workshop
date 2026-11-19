import { UKRAINE_PATHS } from "@/components/ukraine-paths";

/**
 * Schematic supply map: EU origins -> Kyiv hub -> regions of Ukraine.
 * Ukraine uses real region outlines (see ukraine-paths.ts, CC BY 4.0).
 * Origins are placed around the map, not at their true positions.
 */

const origins = [
  { name: "Німеччина", x: -120, y: 120, labelX: -120, labelY: 92, anchor: "start", route: "M-120 120 C60 100 300 120 465 163" },
  { name: "Польща", x: -60, y: 230, labelX: -60, labelY: 268, anchor: "middle", route: "M-60 230 C150 230 350 200 465 163" },
  { name: "Латвія", x: 40, y: -150, labelX: 40, labelY: -176, anchor: "middle", route: "M40 -150 C200 -120 400 40 465 163" },
  { name: "Литва", x: 170, y: -60, labelX: 184, labelY: -52, anchor: "start", route: "M170 -60 C260 -10 380 80 465 163" },
  { name: "Молдова", x: 330, y: 540, labelX: 300, labelY: 534, anchor: "end", route: "M330 540 C380 420 430 280 465 163" },
  { name: "Румунія", x: 240, y: 760, labelX: 256, labelY: 766, anchor: "start", route: "M240 760 C330 620 420 300 465 163" },
  { name: "Греція", x: 120, y: 930, labelX: 136, labelY: 936, anchor: "start", route: "M120 930 C230 720 380 350 465 163" },
] as const;

const KYIV = { x: 465, y: 163 };

const regions = [
  { name: "Львів", x: 108, y: 213, lx: 92, ly: 206, anchor: "end" },
  { name: "Вінниця", x: 353, y: 264, lx: 353, ly: 300, anchor: "middle" },
  { name: "Чернігів", x: 508, y: 75, lx: 524, ly: 70, anchor: "start" },
  { name: "Одеса", x: 478, y: 495, lx: 478, ly: 530, anchor: "middle" },
  { name: "Дніпро", x: 716, y: 327, lx: 736, ly: 332, anchor: "start" },
  { name: "Запоріжжя", x: 722, y: 379, lx: 742, ly: 386, anchor: "start" },
  { name: "Харків", x: 782, y: 198, lx: 804, ly: 206, anchor: "start" },
] as const;

export function SupplyMap() {
  return (
    <svg
      className="supply-map"
      viewBox="-220 -230 1300 1190"
      role="img"
      aria-label="Схема постачання: нафтопродукти з Німеччини, Латвії, Литви, Польщі, Молдови, Румунії та Греції надходять до Києва і далі в регіони України"
    >
      <g className="map-land">
        {UKRAINE_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {regions.map((r) => (
        <path key={`line-${r.name}`} d={`M${KYIV.x} ${KYIV.y} L${r.x} ${r.y}`} className="map-distribution" />
      ))}

      {origins.map((o) => (
        <g key={o.name}>
          <path d={o.route} className="map-route" />
          <circle cx={o.x} cy={o.y} r="22" className="map-node" />
          <text x={o.labelX} y={o.labelY} textAnchor={o.anchor} className="map-label">
            {o.name}
          </text>
        </g>
      ))}

      {regions.map((r) => (
        <g key={r.name}>
          <circle cx={r.x} cy={r.y} r="14" className="map-city" />
          <text x={r.lx} y={r.ly} textAnchor={r.anchor} className="map-city-label">
            {r.name}
          </text>
        </g>
      ))}

      <circle cx={KYIV.x} cy={KYIV.y} r="36" className="map-hub" />
      <circle cx={KYIV.x} cy={KYIV.y} r="16" className="map-hub-core" />
      <text x={KYIV.x - 34} y={KYIV.y - 4} textAnchor="end" className="map-label map-label-strong">
        Київ
      </text>
      <text x={550} y={1010} textAnchor="middle" className="map-note">
        Доставка по всій Україні
      </text>
    </svg>
  );
}
