import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDocs, query, where, orderBy } from "firebase/firestore";
import { Reveal } from "@/components/Reveal";
import { collections } from "@/lib/firebase";
import type { Achievement } from "@/data/achievements";
import { ACHIEVEMENTS as FALLBACK_ACHIEVEMENTS } from "@/data/achievements";
import { Award, Globe } from "lucide-react";

export const Route = createFileRoute("/achievements")({
  component: AchievementsPage,
  head: () => ({
    meta: [
      { title: "Student Achievements — Zubair Online Academy" },
      { name: "description", content: "Read success stories and completed milestones of Quran, Tajweed, and Arabic students worldwide." },
      { property: "og:title", content: "Student Achievements — Zubair Online Academy" },
      { property: "og:description", content: "Hifz completions, Tajweed distinctions, and academic achievements from our worldwide community." },
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

async function fetchAchievements(): Promise<(Achievement & { imageUrl?: string })[]> {
  const snap = await getDocs(query(collections.achievements, where("isActive", "==", true)));
  
  if (snap.empty) {
    return FALLBACK_ACHIEVEMENTS;
  }

  return snap.docs.map((d) => {
    const data = d.data();
    const name = data.studentName || data.name || "Anonymous";
    return {
      name,
      country: data.country ?? "Worldwide",
      title: (data.achievementTitle || data.title) ?? "Achievement Completed",
      detail: data.detail ?? "",
      initials: data.initials ?? initialsFromName(name),
      imageUrl: data.imageUrl || data.image || undefined,
    };
  });
}

function AchievementsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["active-achievements"],
    queryFn: fetchAchievements,
    staleTime: 60_000,
  });

  const items = data && data.length > 0 ? data : (isError ? FALLBACK_ACHIEVEMENTS : data ?? []);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      
      {/* Intro header */}
      <section className="bg-gradient-to-b from-emerald-light/60 via-background to-background py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-block rounded-full bg-emerald-light px-4 py-1.5 text-xs font-semibold tracking-wider text-emerald-academy uppercase mb-5 animate-fade-in-up">
            Milestones
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground font-semibold leading-tight text-balance mb-6 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            Celebrating Student Achievements
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty max-w-[65ch] mx-auto animate-fade-in-up" style={{ animationDelay: "180ms" }}>
            Every completed Quranic recitation, every certificate of Tajweed mastery, and every level of Arabic grammar fluency represents years of dedication and spiritual growth.
          </p>
        </div>
      </section>

      {/* Grid of accomplishments */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-52 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground max-w-lg mx-auto">
              <p className="text-base font-medium mb-2">No achievements published yet</p>
              <p className="text-xs">Our student body is constantly striving. When milestone certificates are published, they will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {items.map((a, i) => (
                <Reveal key={`${a.name}-${i}`} delay={i * 90}>
                  <article className="rounded-xl bg-card border border-border shadow-sm p-6 flex flex-col justify-between h-full hover:shadow-md transition">
                    <div>
                      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                        {a.imageUrl ? (
                          <div className="size-14 rounded-full overflow-hidden ring-2 ring-emerald-academy/15 shrink-0">
                            <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-light text-emerald-academy font-serif text-xl font-bold shrink-0 border border-emerald-academy/10 shadow-sm">
                            {a.initials}
                          </div>
                        )}
                        <div>
                          <h3 className="font-serif text-lg font-semibold text-foreground leading-tight">{a.name}</h3>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                            <Globe className="size-3 text-muted-foreground" /> {a.country}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-academy mb-2 flex items-center gap-1">
                        <Award className="size-4 text-emerald-academy" /> {a.title}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty">
                        {a.detail}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
