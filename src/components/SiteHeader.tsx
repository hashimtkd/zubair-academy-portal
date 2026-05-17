import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SITE } from "@/lib/site";
import logo from "@/assets/logo.png";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/register/student", label: "Student Registration" },
  { to: "/register/teacher", label: "Teacher Registration" },
  { to: "/achievements", label: "Achievements" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-foreground/5 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <img src={logo} alt="Zubair Online Academy logo" width={36} height={36} className="size-9 object-contain" />
          <span className="font-serif text-xl font-semibold tracking-tight text-emerald-academy">
            {SITE.short}
          </span>
        </Link>

        <div className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "text-emerald-academy" }}
              className="hover:text-foreground transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </div>

        <Link
          to="/register/student"
          className="hidden lg:inline-flex items-center justify-center rounded-md bg-emerald-academy px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
        >
          Apply Now
        </Link>

        <button
          aria-label="Toggle menu"
          className="lg:hidden p-2 -mr-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-foreground/5 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "text-emerald-academy" }}
                className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/register/student"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-md bg-emerald-academy px-4 py-2.5 text-sm font-medium text-white"
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
