import { createFileRoute } from "@tanstack/react-router";
import { ACHIEVEMENTS } from "@/data/achievements";

export const Route = createFileRoute("/achievements")({
  component: AchievementsPage,
  head: () => ({
    meta: [
      { title: "Student Achievements — Zubair Online Academy" },
      { name: "description", content: "Celebrating the milestones of students from around the world studying at Zubair Online Academy." },
      { property: "og:title", content: "Student Achievements — Zubair Online Academy" },
      { property: "og:description", content: "Stories of Hifz completions, Tajweed mastery, and academic distinctions from our global student body." },
      { property: "og:url", content: "/achievements" },
    ],
    links: [{ rel: "canonical", href: "/achievements" }],
  }),
});

function AchievementsPage() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-3xl">
          <span className="inline-block rounded-full bg-emerald-light px-3 py-1 text-xs font-semibold tracking-wider text-emerald-academy uppercase mb-5">
            Achievements
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground text-balance">
            Celebrating our students' milestones.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Every certificate, every completed Hifz, every breakthrough in understanding — they all begin with the
            sincerity of a student and the patience of a teacher.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((a) => (
            <article key={a.name} className="rounded-xl bg-card ring-1 ring-black/5 p-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-full bg-emerald-light text-emerald-academy font-serif text-xl font-semibold">
                  {a.initials}
                </div>
                <div>
                  <h3 className="font-serif text-lg text-foreground leading-tight">{a.name}</h3>
                  <p className="text-xs text-muted-foreground">{a.country}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-academy mb-2">{a.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
