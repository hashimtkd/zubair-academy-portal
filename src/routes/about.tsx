import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About — Zubair Online Academy" },
      { name: "description", content: "Our mission is to make authentic Arabic and Islamic education accessible to every student, anywhere in the world." },
      { property: "og:title", content: "About — Zubair Online Academy" },
      { property: "og:description", content: "Mission, faculty, and approach behind Zubair Online Academy." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

const VALUES = [
  { title: "Authenticity", body: "Curriculum grounded in classical scholarship and the methodology of recognised institutions." },
  { title: "Accessibility", body: "Affordable, high-quality education available to every student — regardless of location." },
  { title: "Mentorship", body: "Personal, one-on-one attention. We treat every student as an amanah." },
];

function About() {
  return (
    <>
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-block rounded-full bg-emerald-light px-3 py-1 text-xs font-semibold tracking-wider text-emerald-academy uppercase mb-5">
            About the Academy
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground text-balance">
            A global home for the seekers of sacred knowledge.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            Zubair Online Academy was founded with a clear intention: to make traditional
            Arabic and Islamic education accessible to students wherever they are. We combine
            classical scholarship with modern teaching tools to create a learning experience
            that is structured, personal, and rooted in authenticity.
          </p>
        </div>
      </section>

      <section className="bg-muted/40 border-y border-border py-20">
        <div className="mx-auto max-w-7xl px-6 grid gap-12 md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title}>
              <h3 className="font-serif text-xl text-emerald-academy mb-3">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-6">Our story</h2>
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>What began as a small circle of online students has grown into a worldwide community of seekers, scholars and graduates. From the very first cohort, our focus has remained the same: knowledge transmitted with patience, integrity, and care.</p>
            <p>Our teachers come from leading Islamic institutions and bring decades of combined experience. Every lesson is designed to build a complete foundation — not just isolated information — so that students can carry their learning into a lifetime of practice.</p>
          </div>
          <div className="mt-10">
            <Link to="/courses" className="inline-flex items-center rounded-md bg-emerald-academy px-6 py-3 text-sm font-medium text-white hover:opacity-90">
              View our courses
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
