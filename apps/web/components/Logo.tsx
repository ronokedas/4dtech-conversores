import Link from "next/link";

export function Logo() {
  return <Link href="/" className="brand" aria-label="Documentos Online - 4D Tech, inicio">
    <svg className="brand-mark" viewBox="0 0 36 42" aria-hidden="true"><path d="M5 1.5h17l9 9V39a1.5 1.5 0 0 1-1.5 1.5h-24A1.5 1.5 0 0 1 4 39V3A1.5 1.5 0 0 1 5.5 1.5Z" fill="#fff" stroke="currentColor" strokeWidth="2"/><path d="M22 1.5v9h9" fill="none" stroke="#14b8a6" strokeWidth="2"/><path d="M11 16h13M11 22h13M11 28h8" fill="none" stroke="#0866ff" strokeWidth="2.2" strokeLinecap="round"/></svg>
    <span><strong>Documentos Online</strong><small>4D Tech</small></span>
  </Link>;
}
