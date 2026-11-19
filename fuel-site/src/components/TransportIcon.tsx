type Props = { id: "road" | "rail" | "river" | "sea" };

const common = {
  width: 40,
  height: 40,
  viewBox: "0 0 40 40",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function TransportIcon({ id }: Props) {
  switch (id) {
    case "road":
      return (
        <svg {...common}>
          <rect x="3" y="14" width="20" height="10" rx="5" />
          <path d="M23 24V16h7l5 5v3h-12" />
          <circle cx="10" cy="28" r="3" />
          <circle cx="29" cy="28" r="3" />
        </svg>
      );
    case "rail":
      return (
        <svg {...common}>
          <rect x="4" y="12" width="14" height="10" rx="5" />
          <rect x="21" y="12" width="14" height="10" rx="5" />
          <path d="M18 17h3M3 28h34M8 22v3M31 22v3" />
        </svg>
      );
    case "river":
      return (
        <svg {...common}>
          <path d="M5 14c4-4 6 4 10 0s6 4 10 0 6 4 10 0" />
          <path d="M5 22c4-4 6 4 10 0s6 4 10 0 6 4 10 0" />
          <path d="M5 30c4-4 6 4 10 0s6 4 10 0 6 4 10 0" />
        </svg>
      );
    case "sea":
      return (
        <svg {...common}>
          <path d="M4 22h32l-4 8H8z" />
          <path d="M12 22v-6h10v6M17 16v-5h4v5" />
        </svg>
      );
  }
}
