import { Link } from "@tanstack/react-router";
import { SITE, whatsappLink } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-foreground/5 bg-background pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <div className="size-6 rounded-sm bg-emerald-academy" />
              <span className="font-serif text-lg font-semibold tracking-tight text-emerald-academy">
                {SITE.name}
              </span>
            </div>
            <p className="max-w-[40ch] text-sm text-muted-foreground leading-relaxed">
              Preserving traditional Islamic knowledge through innovative online learning.
              Join a global community of students and scholars.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground">Academy</h5>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-emerald-academy">About Us</Link>
            <Link to="/courses" className="text-sm text-muted-foreground hover:text-emerald-academy">Courses</Link>
            <Link to="/achievements" className="text-sm text-muted-foreground hover:text-emerald-academy">Achievements</Link>
            <Link to="/register/teacher" className="text-sm text-muted-foreground hover:text-emerald-academy">Teach with us</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground">Contact</h5>
            <a href={`mailto:${SITE.email}`} className="text-sm text-muted-foreground hover:text-emerald-academy">{SITE.email}</a>
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-emerald-academy">
              WhatsApp: {SITE.phone}
            </a>
            <span className="text-sm text-muted-foreground">{SITE.address}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-foreground/5 pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Nurturing faith through knowledge.</p>
        </div>
      </div>
    </footer>
  );
}
