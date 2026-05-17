import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-classroom.jpg";
import { CourseCard } from "@/components/CourseCard";
import { FEATURED_COURSES } from "@/data/courses";
import { SITE, whatsappLink } from "@/lib/site";
import { BookOpen, Clock, ShieldCheck, Globe } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: `${SITE.name} — Learn Arabic & Islamic Studies Online` },
      { name: "description", content: SITE.tagline + " — Live one-on-one classes with certified scholars." },
      { property: "og:title", content: SITE.name },
      { property: "og:description", content: SITE.tagline },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const WHY = [
  { icon: ShieldCheck, title: "Verified Scholars", body: "Every teacher is vetted for scholarly integrity and pedagogical excellence." },
  { icon: Clock, title: "Flexible Learning", body: "Schedule one-on-one sessions in your own timezone — fit study around your life." },
  { icon: BookOpen, title: "Structured Path", body: "A complete curriculum from foundation to advanced, not isolated lessons." },
  { icon: Globe, title: "Global Community", body: "Join students from 40+ countries in a supportive, focused learning environment." },
];

const TESTIMONIALS = [
  { quote: "Studying at Zubair Academy connected me with the heart of our heritage with patience and clarity.", name: "Omar Al-Sayed", country: "United Kingdom" },
  { quote: "The structured curriculum transformed my understanding of Tajweed in just a few months.", name: "Aisha Rahman", country: "Canada" },
  { quote: "My teacher's depth of knowledge made classical Arabic finally click. I read Tafsir on my own now.", name: "Fatima Zahra", country: "Malaysia" },
];

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-20 sm:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center">
            <span className="mb-6 inline-block rounded-full bg-emerald-light px-3 py-1 text-xs font-semibold tracking-wider text-emerald-academy uppercase">
              Global Online Learning
            </span>
            <h1 className="mb-8 font-serif text-4xl leading-[1.1] sm:text-5xl lg:text-6xl text-balance text-foreground lg:max-w-[24ch]">
              Learn Arabic and Islamic Studies from Expert Teachers Worldwide
            </h1>
            <p className="mb-10 max-w-[58ch] text-base sm:text-lg text-muted-foreground text-pretty">
              Access authentic knowledge through structured curricula designed for the modern student.
              From foundational Tajweed to advanced Fiqh, our academy connects you with qualified scholars.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/register/student"
                className="rounded-md bg-emerald-academy px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition"
              >
                Apply Now
              </Link>
              <Link
                to="/courses"
                className="rounded-md bg-transparent px-6 py-3 text-sm font-medium text-foreground ring-1 ring-foreground/10 hover:bg-muted transition"
              >
                Explore Courses
              </Link>
            </div>
          </div>
          <div className="mt-16 sm:mt-20">
            <div className="overflow-hidden rounded-xl ring-1 ring-black/5">
              <img
                src={heroImg}
                alt="Modern Islamic studies classroom with natural light"
                width={1600}
                height={896}
                className="w-full aspect-[16/9] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted/40 py-20 sm:py-24 border-y border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-academy">Why Choose Us</span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-foreground">A learning experience rooted in tradition, built for today.</h2>
          </div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w) => (
              <div key={w.title} className="flex flex-col gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-academy text-white">
                  <w.icon className="size-5" />
                </div>
                <h3 className="font-serif text-lg text-foreground">{w.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-[50ch]">
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground">Featured Courses</h2>
              <p className="mt-3 text-muted-foreground">Explore our most popular programs designed to deepen your understanding and mastery.</p>
            </div>
            <Link to="/courses" className="text-sm font-medium text-emerald-academy hover:underline">
              View all courses →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FEATURED_COURSES.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-emerald-academy py-20 sm:py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-light/70">Student Voices</span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Trusted by students in 40+ countries.</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
                <blockquote className="font-serif text-lg leading-snug text-pretty">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 text-sm">
                  <span className="block font-medium">{t.name}</span>
                  <span className="text-xs text-emerald-light/70">{t.country}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">Begin your journey today.</h2>
          <p className="text-muted-foreground mb-8">Apply for a free trial session, or message us directly on WhatsApp.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register/student" className="rounded-md bg-emerald-academy px-6 py-3 text-sm font-medium text-white hover:opacity-90">
              Apply as Student
            </Link>
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="rounded-md px-6 py-3 text-sm font-medium text-foreground ring-1 ring-foreground/10 hover:bg-muted">
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
