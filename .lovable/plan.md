## Plan: Zubair Online Academy — Minimal Modern Emerald

A polished, responsive, SEO-ready multi-page site. No backend for now: forms validate client-side and confirm via toast, plus an optional WhatsApp deep link with a prefilled message so leads still reach you while the database isn't wired up.

### Design system (from chosen prototype)
- Colors: `emerald-academy #065f46`, `emerald-light #ecfdf5`, neutrals on `zinc-50` background. Registered as oklch tokens in `src/styles.css`.
- Fonts: `Crimson Pro` (serif headings), `Inter` (body) via Google Fonts.
- UI primitives: shadcn `Button`, `Input`, `Label`, `Textarea`, `Select`, `Card`, `Sonner` toast.
- Sticky header, floating WhatsApp button site-wide.

### Pages & routes (TanStack file-based)
| Route | File | Sections |
|---|---|---|
| `/` | `src/routes/index.tsx` | Hero, Why Choose Us (3), Featured Courses (3), Testimonials, Footer CTA |
| `/about` | `about.tsx` | Mission, story, values, faculty teaser |
| `/courses` | `courses.tsx` | Grid of all courses with title, description, duration, fees |
| `/register/student` | `register.student.tsx` | Student form |
| `/register/teacher` | `register.teacher.tsx` | Teacher form |
| `/achievements` | `achievements.tsx` | Card grid: photo, name, country, achievement |
| `/contact` | `contact.tsx` | Academy info, WhatsApp, email, address, map placeholder |

Each route file sets its own `head()` with unique title + meta description + og tags. `/` adds JSON-LD `EducationalOrganization`.

### Shared components (`src/components/`)
- `SiteHeader.tsx` — sticky nav with all 7 links + Apply CTA, mobile sheet menu.
- `SiteFooter.tsx`
- `WhatsAppFAB.tsx` — fixed bottom-right, opens `wa.me/<number>` with prefilled text.
- `CourseCard.tsx`, `AchievementCard.tsx`, `FeatureCard.tsx`, `TestimonialCard.tsx`.
- `__root.tsx` wraps `Header` + `<Outlet/>` + `Footer` + `WhatsAppFAB` + `<Toaster />`.

### Forms
React Hook Form + Zod, accessible labels, validation messages, on submit:
1. Show success toast ("We'll contact you on WhatsApp shortly").
2. Open `wa.me` with a prefilled summary (name, country, course) so the lead actually reaches you.

Student fields: Full Name, Email, WhatsApp Number (with country code), Country (Select), Selected Course (Select fed from courses data).
Teacher fields: Full Name, Email, WhatsApp Number, Country, Qualification, Years of Experience.

### Content data
`src/data/courses.ts` — 6–8 courses (Quranic Arabic, Tajweed, Hifz, Fiqh, Aqeedah, Seerah, Hadith Sciences, Conversational Arabic) with duration & monthly fees.
`src/data/achievements.ts` — 6 sample student profiles.
`src/data/countries.ts` — country list for selects.

### Images
Generate 4 images via imagegen (hero, 3 course covers). Achievement and testimonial avatars use neutral initials placeholders for now (real photos can replace later).

### Placeholder contact details (you can edit anytime)
- WhatsApp: `+92 300 0000000`
- Email: `info@zubairacademy.com`
- Address: `Online — Worldwide`

### Out of scope (this round)
- Lovable Cloud / database persistence — when ready, I'll wire forms to a `registrations` table and an achievements admin.
- Auth, payments, blog.

### Technical notes
- Stack stays TanStack Start + Vite (project default), not Firebase — equivalent functionality available later via Lovable Cloud.
- Strict route-file creation before any `<Link to>` reference to satisfy typed routing.
- Responsive at 360–1920; tested via preview viewport switches.
