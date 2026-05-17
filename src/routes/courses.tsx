import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDocs, query, orderBy } from "firebase/firestore";
import { CourseCard } from "@/components/CourseCard";
import { Reveal } from "@/components/Reveal";
import { collections } from "@/lib/firebase";
import type { Course } from "@/data/courses";
import { COURSES as FALLBACK_COURSES } from "@/data/courses";

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

async function fetchCourses(): Promise<Course[]> {
  const snap = await getDocs(query(collections.courses, orderBy("title")));
  return snap.docs.map((d) => {
    const data = d.data() as Partial<Course>;
    return {
      id: d.id,
      title: data.title ?? "Untitled course",
      level: data.level ?? "All Levels",
      duration: data.duration ?? "",
      fee: data.fee ?? "",
      description: data.description ?? "",
      image: data.image ?? "",
    };
  });
}

function CoursesPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
    staleTime: 60_000,
  });

  // Fall back to local catalogue if Firestore is empty or unreachable
  const courses = data && data.length > 0 ? data : (isError ? FALLBACK_COURSES : data ?? []);

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

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No courses available yet. Please check back soon.
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
  );
}
