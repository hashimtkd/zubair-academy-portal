import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES } from "@/data/countries";
import { whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/register/teacher")({
  component: TeacherRegister,
  head: () => ({
    meta: [
      { title: "Teacher Registration — Zubair Online Academy" },
      { name: "description", content: "Apply to teach Arabic or Islamic studies online at Zubair Online Academy. Worldwide faculty welcome." },
      { property: "og:title", content: "Teacher Registration — Zubair Online Academy" },
      { property: "og:description", content: "Share your knowledge with students around the world." },
      { property: "og:url", content: "/register/teacher" },
    ],
    links: [{ rel: "canonical", href: "/register/teacher" }],
  }),
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  whatsapp: z.string().trim().min(7, "Include country code").max(20),
  country: z.string().min(1, "Select your country"),
  qualification: z.string().trim().min(2, "Required").max(200),
  experience: z.string().trim().min(1, "Required").max(500),
});
type FormValues = z.infer<typeof schema>;

function TeacherRegister() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", whatsapp: "", country: "", qualification: "", experience: "" },
  });

  const onSubmit = (data: FormValues) => {
    toast.success("Application received!", {
      description: "Our team will reach out on WhatsApp to discuss next steps.",
    });
    const msg = `Assalamu Alaikum, I'd like to apply as a teacher.\n\nName: ${data.fullName}\nEmail: ${data.email}\nCountry: ${data.country}\nQualification: ${data.qualification}`;
    window.open(whatsappLink(msg), "_blank", "noopener");
    reset();
  };

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-emerald-light px-3 py-1 text-xs font-semibold tracking-wider text-emerald-academy uppercase mb-5">
            Teach With Us
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground text-balance">Join our faculty</h1>
          <p className="mt-4 text-muted-foreground">Share your knowledge with seekers around the world.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl bg-card ring-1 ring-black/5 p-6 sm:p-8 space-y-5">
          <Field label="Full Name" error={errors.fullName?.message}>
            <Input {...register("fullName")} placeholder="Your full name" autoComplete="name" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" {...register("email")} placeholder="you@example.com" autoComplete="email" />
            </Field>
            <Field label="WhatsApp Number" error={errors.whatsapp?.message}>
              <Input {...register("whatsapp")} placeholder="+20 100 0000000" autoComplete="tel" />
            </Field>
          </div>
          <Field label="Country" error={errors.country?.message}>
            <select
              {...register("country")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select country</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Qualification" error={errors.qualification?.message}>
            <Input {...register("qualification")} placeholder="e.g. Al-Azhar graduate, Ijazah in Tajweed" />
          </Field>
          <Field label="Teaching Experience" error={errors.experience?.message}>
            <Textarea
              {...register("experience")}
              placeholder="Briefly describe your teaching experience and subjects you can teach."
              rows={4}
            />
          </Field>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-academy text-white hover:bg-emerald-academy/90">
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
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
