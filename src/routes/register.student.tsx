import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COUNTRIES } from "@/data/countries";
import { COURSES } from "@/data/courses";
import { whatsappLink } from "@/lib/site";
import { collections } from "@/lib/firebase";
import { addDoc, serverTimestamp } from "firebase/firestore";

export const Route = createFileRoute("/register/student")({
  component: StudentRegister,
  head: () => ({
    meta: [
      { title: "Student Registration — Zubair Online Academy" },
      { name: "description", content: "Apply for online Arabic and Islamic studies courses at Zubair Online Academy. Worldwide enrollment." },
      { property: "og:title", content: "Student Registration — Zubair Online Academy" },
      { property: "og:description", content: "Begin your journey — apply now for a free trial session." },
      { property: "og:url", content: "/register/student" },
    ],
    links: [{ rel: "canonical", href: "/register/student" }],
  }),
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  whatsapp: z.string().trim().min(7, "Include country code").max(20),
  country: z.string().min(1, "Select your country"),
  course: z.string().min(1, "Select a course"),
});
type FormValues = z.infer<typeof schema>;

function StudentRegister() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", whatsapp: "", country: "", course: "" },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await addDoc(collections.students, { ...data, createdAt: serverTimestamp() });
      toast.success("Registration received!", {
        description: "We'll contact you on WhatsApp shortly to schedule your free trial.",
      });
      const msg = `Assalamu Alaikum, I'd like to register as a student.\n\nName: ${data.fullName}\nEmail: ${data.email}\nCountry: ${data.country}\nCourse: ${data.course}`;
      window.open(whatsappLink(msg), "_blank", "noopener");
      reset();
    } catch (err) {
      console.error(err);
      toast.error("Could not submit registration", {
        description: "Please check your connection and try again.",
      });
    }
  };

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-emerald-light px-3 py-1 text-xs font-semibold tracking-wider text-emerald-academy uppercase mb-5">
            Student Registration
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground text-balance">Apply for admission</h1>
          <p className="mt-4 text-muted-foreground">Fill in the form below and our admissions team will reach out on WhatsApp.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl bg-card ring-1 ring-black/5 p-6 sm:p-8 space-y-5">
          <Field label="Full Name" error={errors.fullName?.message}>
            <Input {...register("fullName")} placeholder="Your full name" autoComplete="name" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} placeholder="you@example.com" autoComplete="email" />
          </Field>
          <Field label="WhatsApp Number" error={errors.whatsapp?.message}>
            <Input {...register("whatsapp")} placeholder="+92 300 0000000" autoComplete="tel" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Country" error={errors.country?.message}>
              <select
                {...register("country")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Selected Course" error={errors.course?.message}>
              <select
                {...register("course")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a course</option>
                {COURSES.map((c) => <option key={c.id} value={c.title}>{c.title}</option>)}
              </select>
            </Field>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-academy text-white hover:bg-emerald-academy/90">
            {isSubmitting ? "Submitting..." : "Submit Registration"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            By submitting, you agree to be contacted by our admissions team.
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block text-sm font-medium text-foreground">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
