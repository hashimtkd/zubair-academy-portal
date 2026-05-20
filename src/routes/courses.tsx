import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDocs, query, where, orderBy } from "firebase/firestore";
import { CourseCard } from "@/components/CourseCard";
import { Reveal } from "@/components/Reveal";
import { collections } from "@/lib/firebase";
import type { Course } from "@/data/courses";
import { COURSES as FALLBACK_COURSES } from "@/data/courses";

export const Route = createFileRoute("/courses")({
  component: CoursesPage,
  head: () => ({
    meta: [
      { title: "Our Courses — Zubair Online Academy" },
      { name: "description", content: "Explore our dynamic portfolio of 1-on-1 Quran, Tajweed, Classical Arabic, and Islamic studies programs." },
      { property: "og:title", content: "Arabic & Islamic Studies Courses — Zubair Online Academy" },
      { property: "og:description", content: "Live 1-on-1 trial classes. Learn Quran, Tajweed, Arabic grammar, Fiqh, and Seerah from certified scholars." },
      { property: "og:url", content: "/courses" },
    ],
    links: [{ rel: "canonical", href: "/courses" }],
  }),
});

async function fetchCourses(): Promise<Course[]> {
  const q = query(collections.courses, where("isActive", "==", true), orderBy("title"));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    return FALLBACK_COURSES;
  }

  return snap.docs.map((d) => {
    const data = d.data() as Partial<Course> & { isActive?: boolean; imageUrl?: string };
    return {
      id: d.id,
      title: data.title ?? "Untitled Course",
      level: data.level ?? "All Levels",
      duration: data.duration ?? "Ongoing",
      fee: typeof data.fee === "number" ? `$${data.fee} / month` : data.fee || "$30 / month",
      description: data.description ?? "",
      image: data.imageUrl || data.image || "",
    };
  });
}

function CoursesPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["courses-catalog"],
    queryFn: fetchCourses,
    staleTime: 60_000,
  });

  // Fall back to local catalogue if Firestore is empty or unreachable
  const courses = data && data.length > 0 ? data : (isError ? FALLBACK_COURSES : data ?? []);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      
      {/* Intro section */}
      <section className="bg-gradient-to-b from-emerald-light/60 via-background to-background py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-block rounded-full bg-emerald-light px-4 py-1.5 text-xs font-semibold tracking-wider text-emerald-academy uppercase mb-5 animate-fade-in-up">
            Our Catalog
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground font-semibold leading-tight text-balance mb-6 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            Nurturing Minds, Deepening Understandings
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty max-w-[65ch] mx-auto animate-fade-in-up" style={{ animationDelay: "180ms" }}>
            Live, one-on-one virtual lectures scheduled completely around your time zone. Scroll through our core disciplines. All courses start with a free trial session.
          </p>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground max-w-lg mx-auto">
              <p className="text-base font-medium mb-2">No active courses available</p>
              <p className="text-xs">We are currently updating our curricula details. Please contact admissions via WhatsApp to discuss availability.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((c, i) => (
                <Reveal key={c.id} delay={i * 80}>
                  <CourseCard course={c} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Structured Trial CTA */}
      <section className="py-16 sm:py-20 border-t border-border bg-muted/20 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold mb-4">Unsure where to start?</h3>
          <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-[55ch] mx-auto">
            Book a trial session and speak with an advisor. We will assess your reading level, goals, and customize a course curriculum tailored to you.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a 
              href="https://wa.me/923000000000?text=Assalamu%20Alaikum%2C%20I%20would%20like%20to%20speak%20with%20an%20admissions%20advisor."
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-lg text-xs sm:text-sm font-semibold border border-border bg-card text-foreground hover:bg-muted transition shadow-sm"
            >
              Consult Admissions Team
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
