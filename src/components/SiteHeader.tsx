import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, GraduationCap } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import logoImg from "@/assets/logo.png";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/teachers", label: "Teachers" },
  { to: "/achievements", label: "Achievements" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { settings } = useSettings();

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/5 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* Logo/Branding */}
        <Link to="/" className="flex items-center gap-2.5 text-left" onClick={() => setOpen(false)}>
          {settings.logoUrl ? (
            <img 
              src={settings.logoUrl} 
              alt={`${settings.academyName} logo`} 
              className="size-9 object-contain rounded-md" 
            />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-academy text-white">
              <GraduationCap className="size-5" />
            </div>
          )}
          <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-emerald-academy">
            {settings.academyName}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-7 text-xs sm:text-sm font-semibold text-muted-foreground lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "text-emerald-academy font-bold" }}
              className="hover:text-foreground transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <Link
          to="/register/student"
          className="hidden lg:inline-flex items-center justify-center rounded-lg bg-emerald-academy px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-academy/95 shadow-sm transition"
        >
          Book Free Trial
        </Link>

        {/* Mobile Toggle */}
        <button
          aria-label="Toggle menu"
          className="lg:hidden p-2 -mr-2 text-foreground focus:outline-none"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden border-t border-foreground/5 bg-background shadow-inner">
          <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col gap-2.5">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "text-emerald-academy font-bold bg-muted/30" }}
                className="py-2.5 px-3 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/15 transition-all text-left"
              >
                {n.label}
              </Link>
            ))}
            <div className="border-t border-border mt-3 pt-4 flex flex-col gap-2">
              <Link
                to="/register/student"
                onClick={() => setOpen(false)}
                className="w-full inline-flex items-center justify-center rounded-lg bg-emerald-academy py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm"
              >
                Apply as Student
              </Link>
              <Link
                to="/register/teacher"
                onClick={() => setOpen(false)}
                className="w-full inline-flex items-center justify-center rounded-lg border border-border bg-card py-3 text-xs font-bold uppercase tracking-wider text-foreground shadow-sm"
              >
                Apply as Teacher
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
