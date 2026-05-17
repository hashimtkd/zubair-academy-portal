import { createFileRoute } from "@tanstack/react-router";
import { CourseCard } from "@/components/CourseCard";
import { Reveal } from "@/components/Reveal";
import { COURSES } from "@/data/courses";

export const Route = createFileRoute("/courses")({
  component: CoursesPage,
  head: () => ({
    meta: [
      { title: "Courses — Zubair Online Academy" },
      { name: "description", content: "Arabic, Quran, Tajweed, Fiqh, Aqeedah, Hadith and Seerah — explore our full course catalogue." },
      { property: "og:title", content: "Courses — Zubair Online Academy" },
      { property: "og:description", content: "Browse our full catalogue of online Arabic and Islamic studies courses." },
      { property: "og:url", content: "/courses" },
    ],
    links: [{ rel: "canonical", href: "/courses" }],
  }),
});

function CoursesPage() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-3xl animate-fade-in-up">
          <span className="inline-block rounded-full bg-emerald-light px-3 py-1 text-xs font-semibold tracking-wider text-emerald-academy uppercase mb-5">
            Curriculum
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground text-balance">
            Programs for every stage of the journey.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Live, one-on-one classes with certified instructors. All courses begin with a free trial session.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((c, i) => (
            <Reveal key={c.id} delay={i * 80}>
              <CourseCard course={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
