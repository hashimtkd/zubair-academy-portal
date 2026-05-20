import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDocs, query, where, limit } from "firebase/firestore";
import { collections } from "@/lib/firebase";
import heroImg from "@/assets/hero-classroom.jpg";
import { CourseCard } from "@/components/CourseCard";
import { Reveal } from "@/components/Reveal";
import { FEATURED_COURSES, Course } from "@/data/courses";
import { ACHIEVEMENTS as FALLBACK_ACHIEVEMENTS } from "@/data/achievements";
import { useSettings } from "@/hooks/useSettings";
import { whatsappLink, SITE } from "@/lib/site";
import { 
  BookOpen, 
  Clock, 
  ShieldCheck, 
  Globe, 
  CheckCircle, 
  HelpCircle,
  TrendingUp,
  Award,
  Users
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: `Zubair Online Academy — Learn Arabic & Islamic Studies Online` },
      { name: "description", content: "Access traditional, authentic Quranic and Islamic education from anywhere in the world. live 1-on-1 classes scheduled in your timezone." },
      { property: "og:title", content: "Zubair Online Academy" },
      { property: "og:description", content: "Learn Arabic & Islamic Studies Online with certified scholars. Live 1-on-1 trial classes." },
      { property: "og:url", content: "/" },
      { property: "og:image", content: "/src/assets/hero-classroom.jpg" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const WHY = [
  { icon: ShieldCheck, title: "Verified Scholars", body: "Every teacher is vetted for academic credentials, spiritual integrity, and pedagogy." },
  { icon: Clock, title: "1-on-1 Flexible Scheduling", body: "Schedule classes in your local timezone. Perfect for busy students and professionals." },
  { icon: BookOpen, title: "Structured Curriculum", body: "From alphabets to advanced scholastic reading, follow a structured, proven methodology." },
  { icon: Globe, title: "Global Community", body: "Serving seekers of knowledge from over 40 countries, including US, UK, Canada, & Gulf." },
];

const FAQS = [
  { q: "How do the classes take place?", a: "Classes are held live, one-on-one over Zoom or Google Meet. You get dedicated time with your personal teacher." },
  { q: "Can I choose my own class timings?", a: "Yes. Our global faculty operates across all major timezones, allowing you to select timings that suit your schedule." },
  { q: "Is there a trial class available?", a: "Yes, we offer a free 1-on-1 trial session for any course. No payment details are required to register." },
  { q: "Do you have female teachers for female students?", a: "Yes, we have qualified female scholars available for sisters and children." }
];

async function fetchFeaturedCourses(): Promise<Course[]> {
  const q = query(collections.courses, where("isActive", "==", true), limit(3));
  const snap = await getDocs(q);
  if (snap.empty) return FEATURED_COURSES.slice(0, 3);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title || "Untitled Course",
      level: data.level || "Beginner",
      duration: data.duration || "12 Weeks",
      fee: typeof data.fee === "number" ? `$${data.fee} / month` : data.fee || "$30 / month",
      description: data.description || "",
      image: data.imageUrl || data.image || ""
    } as Course;
  });
}

async function fetchFeaturedAchievements() {
  const q = query(collections.achievements, where("isActive", "==", true), limit(3));
  const snap = await getDocs(q);
  if (snap.empty) return FALLBACK_ACHIEVEMENTS.slice(0, 3);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      name: data.studentName || data.name || "Student",
      country: data.country || "Worldwide",
      title: data.achievementTitle || data.title || "Completed Level",
      detail: data.detail || "",
      initials: data.initials || (data.studentName || data.name || "S").substring(0, 2).toUpperCase()
    };
  });
}

function Home() {
  const { settings } = useSettings();
  const [selectedRegion, setSelectedRegion] = useState("EST");

  const { data: courses = FEATURED_COURSES.slice(0, 3), isLoading: loadingCourses } = useQuery({
    queryKey: ["featured-courses"],
    queryFn: fetchFeaturedCourses,
    staleTime: 60_000
  });

  const { data: achievements = FALLBACK_ACHIEVEMENTS.slice(0, 3), isLoading: loadingAchievements } = useQuery({
    queryKey: ["featured-achievements"],
    queryFn: fetchFeaturedAchievements,
    staleTime: 60_000
  });

  // Timezone schedules helper
  const regionTimes: Record<string, string> = {
    EST: "Morning: 8:00 AM - 12:00 PM | Evening: 4:00 PM - 10:00 PM EST",
    GMT: "Morning: 9:00 AM - 1:00 PM | Evening: 5:00 PM - 11:00 PM GMT",
    GST: "Morning: 7:00 AM - 11:00 AM | Evening: 3:00 PM - 9:00 PM GST",
    AEST: "Morning: 10:00 AM - 2:00 PM | Evening: 6:00 PM - 10:00 PM AEST"
  };

  return (
    <div className="flex flex-col w-full overflow-hidden">
      
      {/* Dynamic Hero Section */}
      <section className="relative bg-gradient-to-b from-emerald-light/60 via-background to-background py-16 sm:py-24 md:py-32">
        {/* Subtle background Islamic geometric grid overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#065f46_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            <div className="lg:col-span-7 flex flex-col text-left">
              <span className="self-start inline-flex items-center gap-2 rounded-full bg-emerald-light px-4 py-1.5 text-xs font-semibold tracking-wider text-emerald-academy uppercase mb-6 animate-fade-in-up">
                <Globe className="size-3.5 animate-spin" style={{ animationDuration: '6s' }} /> 
                Worldwide Online Admissions Open
              </span>
              
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground font-semibold leading-[1.15] text-balance mb-6 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
                Learn Arabic &amp; Islamic Studies <span className="text-emerald-academy relative inline-block">From Anywhere<span className="absolute bottom-0 left-0 w-full h-[4px] bg-emerald-academy/20 rounded"></span></span> In The World
              </h1>
              
              <p className="max-w-[62ch] text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed text-pretty animate-fade-in-up" style={{ animationDelay: "180ms" }}>
                {settings.tagline || "Access authentic knowledge through structured curricula designed for the modern student. From Tajweed to Fiqh, connect live 1-on-1 with vetted, certified scholars."}
              </p>
              
              {/* Dynamic trust signals */}
              <div className="flex flex-wrap items-center gap-5 sm:gap-8 mb-8 text-xs sm:text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "220ms" }}>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="size-4 text-emerald-academy" /> 100% Live 1-on-1 Classes
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="size-4 text-emerald-academy" /> Free 1-on-1 Trial Session
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="size-4 text-emerald-academy" /> Male &amp; Female Faculty
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3.5 animate-fade-in-up" style={{ animationDelay: "260ms" }}>
                <Link
                  to="/register/student"
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-academy px-7 py-3.5 text-sm font-medium text-white shadow-md transition-all hover:bg-emerald-academy/95 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  Book Free Trial
                </Link>
                <a
                  href={whatsappLink(`Assalamu Alaikum, I am interested in applying for admissions at ${settings.academyName || SITE.name}. Please guide me.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-7 py-3.5 text-sm font-medium text-foreground transition-all hover:bg-muted hover:-translate-y-0.5"
                >
                  <svg className="size-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Connect on WhatsApp
                </a>
              </div>
            </div>
            
            <div className="lg:col-span-5 relative w-full flex justify-center animate-fade-in" style={{ animationDelay: "350ms" }}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 max-w-[480px] lg:max-w-full aspect-[4/3] sm:aspect-[16/11] w-full">
                <img
                  src={settings.heroImageUrl || heroImg}
                  alt="Zubair Online Academy Classroom Study"
                  className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute bottom-5 left-5 right-5 bg-background/95 backdrop-blur-sm p-4 rounded-xl shadow-lg ring-1 ring-black/5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-academy">Live Cohort</p>
                    <p className="text-sm font-semibold text-foreground">Interactive Virtual Studies</p>
                  </div>
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                  </span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Academy Introduction */}
      <section className="py-20 sm:py-24 bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-academy mb-3 block">Academy Introduction</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-semibold leading-tight text-balance mb-6">
                Rooted in Classical Tradition, Designed for Global Citizens
              </h2>
              <div className="h-1.5 w-16 bg-emerald-academy rounded mb-8"></div>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                {settings.aboutUs || "Zubair Online Academy bridges the gap between traditional Islamic scholarship and contemporary lifestyles. Our students receive focused, individual mentoring from qualified teachers, enabling proper reading, understanding, and application of sacred sciences from their homes."}
              </p>
            </div>
            
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
              <div className="bg-background rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition">
                <h3 className="font-serif text-lg text-emerald-academy font-semibold mb-2">Our Mission</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To nurture faith through deep, authentic understanding of the Quran, Arabic language, and fundamental Islamic beliefs, preserving traditional transmission.
                </p>
              </div>
              <div className="bg-background rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition">
                <h3 className="font-serif text-lg text-emerald-academy font-semibold mb-2">Global Access</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Providing verified scholars to households in Western countries, Asia, Africa, and Australia with complete flexibility and schedule-friendly routines.
                </p>
              </div>
              <div className="bg-background rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition">
                <h3 className="font-serif text-lg text-emerald-academy font-semibold mb-2">Pedagogical Integrity</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We employ certified Ijazah-holders and university graduates, ensuring every student has direct, authentic access to standard traditional methods.
                </p>
              </div>
              <div className="bg-background rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition">
                <h3 className="font-serif text-lg text-emerald-academy font-semibold mb-2">Personal Mentoring</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  One-to-one interactive classrooms mean teachers adapt instruction directly to the student's pace, age, capability, and schedules.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Admission & Timezone Widget (International Focus) */}
      <section className="bg-muted/40 py-16 border-b border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-2xl bg-emerald-academy text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
            {/* Islamic motif background effect */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-[0.04] pointer-events-none bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:30px_30px]"></div>
            
            <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7">
                <span className="text-xs font-semibold tracking-wider bg-white/15 px-3 py-1 rounded-full uppercase mb-4 inline-block">International Student Focus</span>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold mb-4 text-balance">
                  Fits Perfectly in Your Timezone
                </h3>
                <p className="text-emerald-light/80 text-sm sm:text-base leading-relaxed mb-6 max-w-[55ch]">
                  Select your timezone region to see typical slots available for live 1-on-1 tutoring. All lectures are scheduled dynamically for your comfort.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {Object.keys(regionTimes).map((reg) => (
                    <button
                      key={reg}
                      onClick={() => setSelectedRegion(reg)}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
                        selectedRegion === reg
                          ? "bg-white text-emerald-academy font-semibold shadow"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {reg === "EST" ? "🇺🇸 North America (EST)" : reg === "GMT" ? "🇬🇧 United Kingdom (GMT)" : reg === "GST" ? "🇦🇪 Middle East (GST)" : "🇦🇺 Australia (AEST)"}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="lg:col-span-5 bg-white/10 backdrop-blur-sm p-6 rounded-xl ring-1 ring-white/15">
                <span className="text-[10px] uppercase font-bold text-emerald-light block mb-1">Current Active Slots For Region</span>
                <p className="font-serif text-xl font-medium mb-3">{selectedRegion === "EST" ? "North America Timezone" : selectedRegion === "GMT" ? "UK & Europe Timezone" : selectedRegion === "GST" ? "Gulf & Middle East Timezone" : "Australia Timezone"}</p>
                <p className="text-sm text-emerald-light/95 leading-relaxed bg-black/10 p-3 rounded-lg border border-white/5 font-mono mb-4">
                  {regionTimes[selectedRegion]}
                </p>
                <Link
                  to="/register/student"
                  className="w-full inline-flex justify-center items-center rounded-lg bg-white text-emerald-academy hover:bg-emerald-light py-3 text-xs font-bold transition shadow"
                >
                  Request Time Slot
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="max-w-[50ch]">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-academy mb-3 block">Admissions Open</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-semibold">Featured Programs</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Unlock structured classical syllabi taught by native expert tutors. Access standard credentials.
              </p>
            </div>
            <Link to="/courses" className="text-sm font-semibold text-emerald-academy hover:underline inline-flex items-center gap-1">
              View all courses &rarr;
            </Link>
          </Reveal>

          {loadingCourses ? (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((c, i) => (
                <Reveal key={c.id} delay={i * 90}>
                  <CourseCard course={c} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted/40 py-20 sm:py-24 border-y border-border">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-14 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-academy mb-3 block">Why Choose Us</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-semibold">
              Delivering Scholarly Excellence directly to your home.
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 100} className="flex flex-col gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-academy text-white shadow-sm">
                  <w.icon className="size-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mt-2">{w.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{w.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Student Achievements */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-academy mb-3 block">Student Milestones</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground font-semibold">Recent Global Achievements</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-[55ch]">
                Celebrating the dedication of our international students who complete memorization programs or academic certificates.
              </p>
            </div>
            <Link to="/achievements" className="text-sm font-semibold text-emerald-academy hover:underline">
              View all achievements &rarr;
            </Link>
          </Reveal>

          {loadingAchievements ? (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {achievements.map((a, i) => (
                <Reveal key={i} delay={i * 90}>
                  <article className="rounded-xl bg-card border border-border shadow-sm p-6 flex flex-col justify-between h-full hover:shadow-md transition">
                    <div>
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="flex size-12 items-center justify-center rounded-full bg-emerald-light text-emerald-academy font-serif text-lg font-bold border border-emerald-academy/10 shadow-sm">
                          {a.initials}
                        </div>
                        <div>
                          <h4 className="font-serif text-base font-semibold text-foreground leading-none">{a.name}</h4>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">{a.country}</span>
                        </div>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-academy mb-2 flex items-center gap-1">
                        <Award className="size-3.5 text-emerald-academy" /> {a.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed text-pretty">
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

      {/* Global Academy Stats */}
      <section className="bg-emerald-academy text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-serif text-4xl sm:text-5xl font-bold mb-2">40+</p>
              <p className="text-xs sm:text-sm text-emerald-light/80 uppercase font-semibold tracking-wider">Countries Represented</p>
            </div>
            <div>
              <p className="font-serif text-4xl sm:text-5xl font-bold mb-2">1,500+</p>
              <p className="text-xs sm:text-sm text-emerald-light/80 uppercase font-semibold tracking-wider">Active Students</p>
            </div>
            <div>
              <p className="font-serif text-4xl sm:text-5xl font-bold mb-2">98%</p>
              <p className="text-xs sm:text-sm text-emerald-light/80 uppercase font-semibold tracking-wider">Satisfaction Rate</p>
            </div>
            <div>
              <p className="font-serif text-4xl sm:text-5xl font-bold mb-2">100%</p>
              <p className="text-xs sm:text-sm text-emerald-light/80 uppercase font-semibold tracking-wider">Verified Scholars</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 sm:py-24 bg-card border-b border-border">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-academy mb-2 block">Support</span>
            <h2 className="font-serif text-3xl font-semibold text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-border pb-5 last:border-0 last:pb-0">
                <h4 className="font-serif text-base font-semibold text-foreground flex items-start gap-2.5 mb-2">
                  <HelpCircle className="size-5 text-emerald-academy shrink-0 mt-0.5" />
                  {faq.q}
                </h4>
                <p className="text-sm text-muted-foreground pl-7 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global CTA Section */}
      <section className="relative overflow-hidden py-24 text-center bg-gradient-to-t from-emerald-light/35 via-background to-background">
        <div className="mx-auto max-w-4xl px-6 relative z-10">
          <h2 className="font-serif text-3xl sm:text-5xl text-foreground font-semibold mb-5 text-balance">
            Begin Your Quranic &amp; Arabic Studies Today
          </h2>
          <p className="text-base text-muted-foreground mb-10 max-w-[60ch] mx-auto leading-relaxed">
            Apply today and schedule your free, no-obligation trial slot. Our counselors will reach you on WhatsApp within hours to arrange classes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register/student"
              className="rounded-lg bg-emerald-academy text-white px-8 py-4 text-sm font-semibold shadow hover:bg-emerald-academy/95 transition"
            >
              Start Admission Process
            </Link>
            <a
              href={whatsappLink(`Assalamu Alaikum, I would like to schedule a trial session.`)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border bg-card text-foreground px-8 py-4 text-sm font-semibold shadow-sm hover:bg-muted transition"
            >
              Ask Questions on WhatsApp
            </a>
          </div>
        </div>
      </section>
      
    </div>
  );
}
