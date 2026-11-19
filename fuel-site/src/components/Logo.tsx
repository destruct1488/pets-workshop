import { company } from "@/lib/site";

/** Nested triangles with the red-to-green gradient of the company mark. */
export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 92" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="mark-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e8362f" />
          <stop offset="1" stopColor="#0b9a4a" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#mark-gradient)" strokeWidth="5" strokeLinejoin="miter">
        <path d="M50 4 L96 88 H4 Z" />
        <path d="M58 22 L84 78 H32 Z" />
        <path d="M62 44 L74 70 H50 Z" />
      </g>
    </svg>
  );
}

export function Logo() {
  return (
    <a className="logo" href="#top" aria-label={`${company.name}, на початок сторінки`}>
      <LogoMark />
      <span className="logo-text">
        <strong>{company.name}</strong>
        <span>{company.nameLatin}</span>
      </span>
    </a>
  );
}
