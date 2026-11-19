import { company } from "@/lib/site";

/** Company name in the top-left corner (the old triangle mark was removed). */
export function Logo() {
  return (
    <a className="logo" href="#top" aria-label={`${company.name}, на початок сторінки`}>
      <span className="logo-text">
        <strong>{company.name}</strong>
        <span>{company.nameLatin}</span>
      </span>
    </a>
  );
}
