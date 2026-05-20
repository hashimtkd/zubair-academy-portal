import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { useSettings } from "@/hooks/useSettings";
import { BookOpen, ShieldCheck, Heart, MapPin, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About Us — Zubair Online Academy" },
      { name: "description", content: "Learn about the history, mission, founder's message, and teaching methodology of Zubair Online Academy." },
      { property: "og:title", content: "About Us — Zubair Online Academy" },
      { property: "og:description", content: "Discover how we preserve traditional Islamic knowledge and make it accessible worldwide." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

const METHODOLOGY = [
  {
    icon: BookOpen,
    title: "1. Direct Interactive Instruction",
    desc: "We avoid pre-recorded modules. All classes are live, one-on-one sessions, giving students the full, undivided attention of their mentors."
  },
  {
    icon: ShieldCheck,
    title: "2. Classical Gradation (Tadrij)",
    desc: "Lessons are built incrementally. Students perfect basic pronunciation before Tajweed rules, and master basic grammar before reading primary Arabic texts."
  },
  {
    icon: Award,
    title: "3. Traditional Sanad & Ijazah",
    desc: "Our senior teachers possess traditional chains of transmission (Sanad) tracing back to the Prophet ﷺ, certifying students upon completion."
  },
  {
    icon: Heart,
    title: "4. Amanah (Sacred Trust)",
    desc: "We treat education as a sacred trust. Our teachers are trained to support students with patience, respect, and deep care."
  }
];

function About() {
  const { settings } = useSettings();

  return (
    <div className="flex flex-col w-full overflow-hidden">
      
      {/* Header section */}
      <section className="bg-gradient-to-b from-emerald-light/60 via-background to-background py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-block rounded-full bg-emerald-light px-4 py-1.5 text-xs font-semibold tracking-wider text-emerald-academy uppercase mb-5 animate-fade-in-up">
            Our Identity &amp; Mission
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground font-semibold leading-tight text-balance mb-6 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            Preserving Sacred Knowledge, Connecting Global Seekers
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty animate-fade-in-up" style={{ animationDelay: "180ms" }}>
            {settings.aboutUs || "Zubair Online Academy was founded to make traditional Arabic and Islamic education accessible to students wherever they reside. We combine classical scholarship with modern digital tools to create a learning experience that is structured, personal, and rooted in authenticity."}
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-card border-y border-border py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-2">
            <Reveal className="p-8 rounded-2xl bg-muted/30 border border-border">
              <h3 className="font-serif text-2xl text-emerald-academy font-semibold mb-4">Our Vision</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                To become a premier global institution for online Islamic studies, recognized for scholarly integrity, pedagogical innovation, and spiritual growth. We envision a world where any seeker—regardless of location or background—can directly access qualified, authentic scholarship.
              </p>
            </Reveal>
            <Reveal delay={150} className="p-8 rounded-2xl bg-muted/30 border border-border">
              <h3 className="font-serif text-2xl text-emerald-academy font-semibold mb-4">Our Mission</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                To deliver structured, personalized 1-on-1 education in the Holy Quran, Classical Arabic grammar, and foundational Islamic sciences. By utilizing vetted instructors and rigorous traditional curricula, we ensure that faith is nurtured through authentic, structured understanding.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Academy History */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-academy mb-3 block">Our Heritage</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-semibold mb-6">How We Began</h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed text-pretty">
              <p>
                Zubair Online Academy began as a modest online Quranic study circle, catering to a small group of students in Western Europe and North America who struggled to find local scholars with flexible hours.
              </p>
              <p>
                Seeing a deep, unmet global demand for structured Arabic grammar and traditional Islamic jurisprudence, the academy expanded its faculty. We brought in graduates from distinguished Islamic universities, including Al-Azhar (Cairo) and the Islamic University of Madinah.
              </p>
              <p>
                Today, the academy serves thousands of students across 40+ countries. Through modern software integrations, structured scheduling, and robust quality control, we maintain the authentic warmth and rigor of traditional one-to-one tutoring (Talaqqi) in a modern digital environment.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Founder Message */}
      <section className="bg-muted/40 py-20 border-y border-border">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-2xl bg-card border border-border shadow-md p-8 sm:p-12">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-4 flex flex-col items-center text-center">
                <div className="size-32 rounded-full overflow-hidden mb-4 ring-4 ring-emerald-academy/20">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250" 
                    alt="Founder of Zubair Academy" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h4 className="font-serif text-lg font-bold text-foreground">Sheikh Zubair Al-Hafiz</h4>
                <p className="text-xs text-muted-foreground">Founder &amp; Director</p>
              </div>
              <div className="md:col-span-8">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-academy block mb-2">A Message from the Founder</span>
                <blockquote className="font-serif text-base sm:text-lg italic text-foreground leading-relaxed text-pretty mb-6">
                  &ldquo;Knowledge is not merely information memorized; it is a light placed in the heart that guides one's actions. Our goal is to make the acquisition of this light as simple, accessible, and authentic as possible. We treat every student who joins our academy as an Amanah—a sacred trust—and we strive to guide them with the utmost sincerity.&rdquo;
                </blockquote>
                <div className="h-0.5 w-12 bg-emerald-academy/20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teaching Methodology */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-academy mb-2 block">Pedagogical Framework</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-semibold">Our Teaching Methodology</h2>
            <p className="text-sm text-muted-foreground mt-3">
              We employ a methodology refined over centuries, tailored for the modern, digital-first student.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {METHODOLOGY.map((m, i) => (
              <Reveal key={m.title} delay={i * 90} className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="size-10 rounded-lg bg-emerald-light text-emerald-academy flex items-center justify-center mb-4">
                  <m.icon className="size-5" />
                </div>
                <h4 className="font-serif text-lg font-bold text-foreground mb-3">{m.title}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Global Community Section */}
      <section className="py-20 bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-1 bg-emerald-light text-emerald-academy px-4 py-2 rounded-full text-xs font-semibold">
              <MapPin className="size-3.5" /> Serving Students Worldwide
            </div>
          </div>
          <h2 className="font-serif text-3xl font-semibold mb-6">Join Our Global Learning Community</h2>
          <p className="text-muted-foreground leading-relaxed max-w-[62ch] mx-auto mb-10">
            From the bustling cities of the United States and Canada, to quiet suburbs in Europe, Australia, and the Middle East, our virtual academy brings certified scholars straight to your screens.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/register/student" 
              className="px-8 py-4 bg-emerald-academy text-white rounded-lg text-sm font-semibold hover:bg-emerald-academy/95 shadow transition"
            >
              Start Your Free Trial
            </Link>
            <Link 
              to="/courses" 
              className="px-8 py-4 border border-border bg-card text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition"
            >
              Explore Course Catalog
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
}
