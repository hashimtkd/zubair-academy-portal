import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDocs, query, where } from "firebase/firestore";
import { collections } from "@/lib/firebase";
import { Reveal } from "@/components/Reveal";
import type { Teacher } from "@/data/teachers";
import { FALLBACK_TEACHERS } from "@/data/teachers";
import { Award, Globe } from "lucide-react";

export const Route = createFileRoute("/teachers")({
  component: TeachersPage,
  head: () => ({
    meta: [
      { title: "Our Faculty — Zubair Online Academy" },
      { name: "description", content: "Meet our certified global faculty of Islamic and Arabic studies scholars." },
      { property: "og:title", content: "Certified Islamic Scholars & Teachers — Zubair Online Academy" },
      { property: "og:description", content: "Learn from vetted graduates of Al-Azhar, Islamic University of Madinah, and other leading academic institutions." },
      { property: "og:url", content: "/teachers" },
    ],
    links: [{ rel: "canonical", href: "/teachers" }],
  }),
});

async function fetchApprovedTeachers(): Promise<Teacher[]> {
  const q = query(collections.teachers, where("status", "==", "approved"));
  const snap = await getDocs(q);

  if (snap.empty) {
    return FALLBACK_TEACHERS;
  }

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.fullName || data.name || "Teacher",
      photoUrl: data.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
      qualification: data.qualification || "Islamic Scholar",
      experience: data.experience || "Experienced Faculty",
      country: data.country || "Worldwide",
      status: "approved",
    };
  });
}

function TeachersPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["approved-teachers"],
    queryFn: fetchApprovedTeachers,
    staleTime: 60_000,
  });

  // Fallback to static mock faculty on query failure (e.g. firestore permissions)
  const teachers = data && data.length > 0 ? data : (isError ? FALLBACK_TEACHERS : data ?? []);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      
      {/* Intro Header */}
      <section className="bg-gradient-to-b from-emerald-light/60 via-background to-background py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-block rounded-full bg-emerald-light px-4 py-1.5 text-xs font-semibold tracking-wider text-emerald-academy uppercase mb-5 animate-fade-in-up">
            Our Faculty
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground font-semibold leading-tight text-balance mb-6 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            Learn from Certified Islamic Scholars
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty max-w-[65ch] mx-auto animate-fade-in-up" style={{ animationDelay: "180ms" }}>
            Every educator in our academy goes through a rigorous pedagogical vetting process. Our teachers hold academic degrees from leading Islamic institutions and traditional recitation chains (Ijazah).
          </p>
        </div>
      </section>

      {/* Faculty list */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : teachers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground max-w-lg mx-auto">
              <p className="text-base font-medium mb-2">No teachers registered yet</p>
              <p className="text-xs font-light">We are updating our list of faculty profiles. Please check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
              {teachers.map((t, i) => (
                <Reveal key={t.id || i} delay={i * 80}>
                  <article className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover-lift hover:shadow-lg h-full text-center p-6">
                    <div className="size-24 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-emerald-academy/10 group-hover:ring-emerald-academy/20 transition-all shrink-0">
                      <img
                        src={t.photoUrl}
                        alt={t.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    <h3 className="font-serif text-lg font-semibold text-foreground leading-tight mb-1">{t.name}</h3>
                    <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 mb-4">
                      <Globe className="size-3 text-muted-foreground" /> {t.country}
                    </span>
                    
                    <div className="flex-grow space-y-3">
                      <div className="bg-muted/40 rounded-lg p-3 border border-border">
                        <p className="text-xs font-semibold text-emerald-academy flex items-center justify-center gap-1 mb-1">
                          <Award className="size-3.5" /> Credentials
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed leading-normal">{t.qualification}</p>
                      </div>
                      
                      <div className="bg-muted/40 rounded-lg p-3 border border-border">
                        <p className="text-xs font-semibold text-foreground mb-1">Teaching Background</p>
                        <p className="text-xs text-muted-foreground leading-relaxed leading-normal">{t.experience}</p>
                      </div>
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
