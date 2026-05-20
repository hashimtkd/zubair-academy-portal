import type { Course } from "@/data/courses";
import { Link } from "@tanstack/react-router";

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover-lift hover:shadow-lg h-full">
      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        <img
          src={course.image || "https://cdn.pixabay.com/photo/2021/12/11/09/19/quran-6862296_1280.jpg"}
          alt={course.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="rounded-full bg-emerald-academy px-2.5 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider shadow-sm">
            {course.level}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center text-xs text-muted-foreground">
          <span>{course.duration}</span>
        </div>
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{course.title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6 flex-grow">{course.description}</p>
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <span className="font-serif font-bold text-emerald-academy text-sm">{course.fee}</span>
          <Link
            to="/register/student"
            search={{ course: course.title }}
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-academy hover:underline"
          >
            Enroll Now &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}
