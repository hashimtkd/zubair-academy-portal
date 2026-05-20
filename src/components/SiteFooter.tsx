import { Link } from "@tanstack/react-router";
import { useSettings } from "@/hooks/useSettings";
import { whatsappLink } from "@/lib/site";
import { GraduationCap, Mail, MessageCircle, MapPin } from "lucide-react";

export function SiteFooter() {
  const { settings } = useSettings();

  return (
    <footer className="border-t border-foreground/5 bg-card pt-16 pb-8 text-left">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-3">
          
          {/* Brand Col */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              {settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt={`${settings.academyName} logo`} 
                  className="size-7 object-contain rounded" 
                />
              ) : (
                <div className="flex size-7 items-center justify-center rounded bg-emerald-academy text-white">
                  <GraduationCap className="size-4.5" />
                </div>
              )}
              <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-emerald-academy">
                {settings.academyName}
              </span>
            </div>
            <p className="max-w-[38ch] text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {settings.aboutUs || "Preserving traditional Islamic knowledge through innovative online learning. Join a global community of students and scholars."}
            </p>
          </div>

          {/* Quick links Col */}
          <div className="flex flex-col gap-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">Academy Navigation</h5>
            <Link to="/about" className="text-xs sm:text-sm text-muted-foreground hover:text-emerald-academy transition-colors">About History &amp; Mission</Link>
            <Link to="/courses" className="text-xs sm:text-sm text-muted-foreground hover:text-emerald-academy transition-colors">Course Programs Catalog</Link>
            <Link to="/teachers" className="text-xs sm:text-sm text-muted-foreground hover:text-emerald-academy transition-colors">Faculty Members</Link>
            <Link to="/achievements" className="text-xs sm:text-sm text-muted-foreground hover:text-emerald-academy transition-colors">Student Milestones</Link>
            <Link to="/register/teacher" className="text-xs sm:text-sm text-muted-foreground hover:text-emerald-academy transition-colors">Teach With Us (Apply)</Link>
            <Link to="/admin" className="text-xs sm:text-sm text-muted-foreground hover:text-emerald-academy transition-colors font-semibold">Portal Admin Console</Link>
          </div>

          {/* Contact Col */}
          <div className="flex flex-col gap-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">Contact &amp; Support</h5>
            <a 
              href={`mailto:${settings.email}`} 
              className="text-xs sm:text-sm text-muted-foreground hover:text-emerald-academy transition-colors flex items-center gap-2"
            >
              <Mail className="size-4" /> {settings.email}
            </a>
            <a 
              href={whatsappLink(`Assalamu Alaikum, I am contacting you from the footer CTA.`)} 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs sm:text-sm text-muted-foreground hover:text-emerald-academy transition-colors flex items-center gap-2"
            >
              <MessageCircle className="size-4 text-[#25D366]" /> Chat on WhatsApp
            </a>
            <span className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2 leading-relaxed">
              <MapPin className="size-4 shrink-0 mt-0.5" /> {settings.address}
            </span>
          </div>

        </div>

        {/* Footer Base */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-foreground/5 pt-8 md:flex-row text-center sm:text-left">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {settings.academyName}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60 italic font-serif">
            Nurturing faith through authentic traditional learning.
          </p>
        </div>
      </div>
    </footer>
  );
}
