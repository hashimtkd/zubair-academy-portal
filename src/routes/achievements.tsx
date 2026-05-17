import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDocs, query, orderBy } from "firebase/firestore";
import { Reveal } from "@/components/Reveal";
import { collections } from "@/lib/firebase";
import type { Achievement } from "@/data/achievements";
import { ACHIEVEMENTS as FALLBACK_ACHIEVEMENTS } from "@/data/achievements";

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

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

async function fetchAchievements(): Promise<Achievement[]> {
  const snap = await getDocs(query(collections.achievements, orderBy("name")));
  return snap.docs.map((d) => {
    const data = d.data() as Partial<Achievement>;
    const name = data.name ?? "Anonymous";
    return {
      name,
      country: data.country ?? "",
      title: data.title ?? "",
      detail: data.detail ?? "",
      initials: data.initials ?? initialsFromName(name),
    };
  });
}

function AchievementsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["achievements"],
    queryFn: fetchAchievements,
    staleTime: 60_000,
  });

  const items =
    data && data.length > 0 ? data : isError ? FALLBACK_ACHIEVEMENTS : data ?? [];

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-3xl animate-fade-in-up">
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

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No achievements published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((a, i) => (
              <Reveal key={`${a.name}-${i}`} delay={i * 90}>
                <article className="rounded-xl bg-card ring-1 ring-black/5 p-6 flex flex-col gap-4 hover-lift hover:shadow-lg h-full">
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
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
