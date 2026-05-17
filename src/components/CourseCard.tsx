import type { Course } from "@/data/courses";

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="group relative flex flex-col bg-card ring-1 ring-black/5 rounded-xl overflow-hidden transition-shadow hover:shadow-md">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={course.image}
          alt={course.title}
          loading="lazy"
          width={1024}
          height={768}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex gap-2 items-center">
          <span className="rounded-full bg-emerald-light px-2 py-0.5 text-[10px] font-semibold text-emerald-academy uppercase tracking-wider">
            {course.level}
          </span>
          <span className="text-xs text-muted-foreground">{course.duration}</span>
        </div>
        <h3 className="font-serif text-xl text-foreground mb-2">{course.title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{course.description}</p>
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <span className="font-medium text-foreground">{course.fee}</span>
          <span className="text-xs font-semibold text-emerald-academy">Enroll →</span>
        </div>
      </div>
    </article>
  );
}
