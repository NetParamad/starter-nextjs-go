import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { appConfig } from "@/lib/app-config";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/#about", label: "About" },
  { href: "/login", label: "Auth Demo" },
  { href: "/signup", label: "Create Account" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t" id="contact">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_auto]">
        <div className="grid max-w-md gap-3">
          <div className="flex items-center gap-2">
            <BrandMark />
            <strong className="text-sm font-semibold tracking-tight">
              {appConfig.name}
            </strong>
          </div>
          <p className="text-muted-foreground text-sm">
            A full-stack starter with a Next.js frontend, Go API, and auth-first
            flows you can reshape into your own product.
          </p>
          <p className="text-muted-foreground text-xs">
            API host: {appConfig.url.host}
          </p>
        </div>

        <nav
          className="grid content-start gap-1 sm:grid-cols-2 sm:gap-x-8"
          aria-label="Footer"
        >
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground rounded-md py-1.5 text-sm transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4">
          <p className="text-muted-foreground text-xs">
            © {year} {appConfig.name}. Built to become your product.
          </p>
          <p className="text-muted-foreground text-xs">
            Next.js UI · Go API · Auth and owner flows
          </p>
        </div>
      </div>
    </footer>
  );
}
