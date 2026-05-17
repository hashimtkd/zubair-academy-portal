import { createFileRoute } from "@tanstack/react-router";
import { SITE, whatsappLink } from "@/lib/site";
import { Mail, MapPin, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — Zubair Online Academy" },
      { name: "description", content: "Get in touch with Zubair Online Academy — WhatsApp, email, and admissions info." },
      { property: "og:title", content: "Contact — Zubair Online Academy" },
      { property: "og:description", content: "Reach our admissions team by WhatsApp or email." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

function ContactPage() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-14 max-w-3xl">
          <span className="inline-block rounded-full bg-emerald-light px-3 py-1 text-xs font-semibold tracking-wider text-emerald-academy uppercase mb-5">
            Contact
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground text-balance">
            We'd love to hear from you.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Reach out with questions about courses, fees, or how to enrol. Our admissions team
            usually replies within a few hours.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="group rounded-xl bg-card ring-1 ring-black/5 p-6 hover:ring-emerald-academy/30 transition"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-academy text-white mb-4">
              <MessageCircle className="size-5" />
            </div>
            <h3 className="font-serif text-lg text-foreground mb-1">WhatsApp</h3>
            <p className="text-sm text-muted-foreground">{SITE.phone}</p>
            <p className="mt-3 text-xs font-semibold text-emerald-academy">Open chat →</p>
          </a>

          <a
            href={`mailto:${SITE.email}`}
            className="group rounded-xl bg-card ring-1 ring-black/5 p-6 hover:ring-emerald-academy/30 transition"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-academy text-white mb-4">
              <Mail className="size-5" />
            </div>
            <h3 className="font-serif text-lg text-foreground mb-1">Email</h3>
            <p className="text-sm text-muted-foreground">{SITE.email}</p>
            <p className="mt-3 text-xs font-semibold text-emerald-academy">Send a message →</p>
          </a>

          <div className="rounded-xl bg-card ring-1 ring-black/5 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-academy text-white mb-4">
              <MapPin className="size-5" />
            </div>
            <h3 className="font-serif text-lg text-foreground mb-1">Where we are</h3>
            <p className="text-sm text-muted-foreground">{SITE.address}</p>
            <p className="mt-3 text-xs text-muted-foreground">Classes run across all major timezones.</p>
          </div>
        </div>

        <div className="mt-14 rounded-xl bg-emerald-academy text-white p-8 sm:p-12">
          <h2 className="font-serif text-2xl sm:text-3xl mb-3">Academy details</h2>
          <p className="text-emerald-light/80 text-sm sm:text-base max-w-2xl">
            {SITE.name} is an online institution offering live, one-on-one classes in Arabic
            language and Islamic studies. We serve students from over 40 countries through
            structured programs led by certified scholars.
          </p>
        </div>
      </div>
    </section>
  );
}
