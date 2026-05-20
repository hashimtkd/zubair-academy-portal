import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COUNTRIES } from "@/data/countries";
import { whatsappLink } from "@/lib/site";
import { submitTeacherRegistration } from "@/lib/registration.server";
import { useState } from "react";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/register/teacher")({
  component: TeacherRegister,
  head: () => ({
    meta: [
      { title: "Apply as Faculty — Zubair Online Academy" },
      { name: "description", content: "Join our global faculty of qualified Islamic and Arabic scholars. Teach live 1-on-1 classes online." },
      { property: "og:title", content: "Apply as Faculty — Zubair Online Academy" },
      { property: "og:description", content: "Submit your academic credentials, CV, and ID to join our worldwide scholar database." },
      { property: "og:url", content: "/register/teacher" },
    ],
    links: [{ rel: "canonical", href: "/register/teacher" }],
  }),
});

const formSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  whatsapp: z.string().trim().min(7, "Include your international country code").max(20),
  country: z.string().min(1, "Select your country of residence"),
  qualification: z.string().trim().min(5, "Detail your academic credentials & Ijazat").max(1000),
  experience: z.string().trim().min(5, "Outline your teaching background").max(1000),
  photo: z.any().refine((files) => files && files.length > 0, "Profile photo is required"),
  cv: z.any().refine((files) => files && files.length > 0, "Your curriculum vitae (CV) is required"),
  idProof: z.any().refine((files) => files && files.length > 0, "ID proof document is required"),
});
type FormValues = z.infer<typeof formSchema>;

function TeacherRegister() {
  const [successData, setSuccessData] = useState<{ name: string } | null>(null);

  const { 
    register, 
    handleSubmit, 
    reset, 
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      fullName: "", 
      email: "", 
      whatsapp: "", 
      country: "", 
      qualification: "",
      experience: ""
    },
  });

  const photoFile = watch("photo");
  const cvFile = watch("cv");
  const idProofFile = watch("idProof");

  const onSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      formData.append("whatsapp", data.whatsapp);
      formData.append("country", data.country);
      formData.append("qualification", data.qualification);
      formData.append("experience", data.experience);
      
      if (data.photo?.[0]) {
        formData.append("photo", data.photo[0]);
      }
      if (data.cv?.[0]) {
        formData.append("cv", data.cv[0]);
      }
      if (data.idProof?.[0]) {
        formData.append("idProof", data.idProof[0]);
      }

      const res = await submitTeacherRegistration({ data: formData });

      if (res.success) {
        toast.success("Application successfully submitted!", {
          description: "Your files have been securely uploaded to your candidate directory.",
        });

        // Set success view
        setSuccessData({ name: data.fullName });
        
        // Open WhatsApp redirect
        const message = `Assalamu Alaikum, I have submitted my application to join the faculty at Zubair Online Academy.\n\nName: ${data.fullName}\nEmail: ${data.email}\nCountry: ${data.country}\nRegistration ID: ${res.id}`;
        window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
        
        reset();
      } else {
        throw new Error(res.error || "Submission failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Submission failed", {
        description: err.message || "Please check your network and files, then try again.",
      });
    }
  };

  return (
    <section className="py-20 sm:py-24 bg-gradient-to-b from-emerald-light/20 via-background to-background">
      <div className="mx-auto max-w-2xl px-6">
        
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-emerald-light px-3 py-1.5 text-xs font-semibold tracking-wider text-emerald-academy uppercase mb-4 shadow-sm">
            Faculty Admissions
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground font-semibold leading-tight text-balance">
            Join Our Faculty
          </h1>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed text-pretty">
            We are always seeking certified scholars, Quran teachers, and linguists to guide our global student base. Submit your details below.
          </p>
        </div>

        {successData ? (
          <div className="rounded-2xl border border-emerald-academy/20 bg-card p-8 text-center shadow-lg ring-1 ring-black/5">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-light text-emerald-academy mx-auto mb-6">
              <CheckCircle2 className="size-8" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">Application Submitted!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 text-pretty">
              JazakAllah Khair, <strong>{successData.name}</strong>. Your faculty application has been securely saved in our registry and is <strong>pending review</strong>.
            </p>
            <p className="text-xs text-muted-foreground bg-muted/50 border border-border p-4 rounded-lg mb-8 leading-relaxed text-pretty">
              If the WhatsApp window did not open automatically, please click below to contact our academic committee to fast-track your verification interview.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={whatsappLink(`Assalamu Alaikum, I just submitted my application to join the faculty. Name: ${successData.name}.`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex justify-center items-center rounded-lg bg-[#25D366] text-white hover:bg-[#20ba59] px-6 py-3.5 text-xs sm:text-sm font-semibold shadow transition"
              >
                Chat on WhatsApp
              </a>
              <button
                onClick={() => setSuccessData(null)}
                className="inline-flex justify-center items-center rounded-lg border border-border bg-card text-foreground hover:bg-muted px-6 py-3.5 text-xs sm:text-sm font-semibold transition"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-border bg-card shadow-lg p-6 sm:p-10 space-y-6">
            
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full Name" error={errors.fullName?.message}>
                <Input {...register("fullName")} placeholder="e.g. Sheikh Anis" className="bg-muted/10 border-border" />
              </Field>
              <Field label="Email Address" error={errors.email?.message}>
                <Input type="email" {...register("email")} placeholder="you@example.com" className="bg-muted/10 border-border" />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="WhatsApp Number (with Country Code)" error={errors.whatsapp?.message}>
                <Input {...register("whatsapp")} placeholder="e.g. +92 300 1234567" className="bg-muted/10 border-border" />
              </Field>
              <Field label="Country of Residence" error={errors.country?.message}>
                <select
                  {...register("country")}
                  className="flex h-10 w-full rounded-md border border-border bg-muted/10 px-3 py-1.5 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-academy text-foreground"
                >
                  <option value="" className="text-muted-foreground">Select your country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Academic Qualifications &amp; Ijazat" error={errors.qualification?.message}>
              <textarea
                {...register("qualification")}
                placeholder="e.g. MA in Shariah (Islamic University of Madinah), Ijazah in the Ten Qira'at from Sheikh..."
                className="flex min-h-[80px] w-full rounded-md border border-border bg-muted/10 px-3 py-2 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-academy text-foreground placeholder:text-muted-foreground/60"
              />
            </Field>

            <Field label="Teaching Experience" error={errors.experience?.message}>
              <textarea
                {...register("experience")}
                placeholder="e.g. 8 years teaching Arabic grammar and Quran memorization to children and adults online..."
                className="flex min-h-[80px] w-full rounded-md border border-border bg-muted/10 px-3 py-2 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-academy text-foreground placeholder:text-muted-foreground/60"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3 border-t border-border pt-6">
              <Field label="Profile Photo" error={errors.photo?.message as string | undefined}>
                <div className="relative flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/5 p-4 hover:bg-muted/10 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    {...register("photo")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    <Upload className="size-5 text-muted-foreground mx-auto mb-1.5" />
                    <p className="text-[9px] text-muted-foreground font-semibold">
                      {photoFile?.[0] ? photoFile[0].name : "Upload Photo"}
                    </p>
                    <p className="text-[8px] text-muted-foreground/50 mt-0.5">JPEG, PNG</p>
                  </div>
                </div>
              </Field>

              <Field label="Curriculum Vitae (CV)" error={errors.cv?.message as string | undefined}>
                <div className="relative flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/5 p-4 hover:bg-muted/10 transition-colors">
                  <input
                    type="file"
                    accept="application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    {...register("cv")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    <Upload className="size-5 text-muted-foreground mx-auto mb-1.5" />
                    <p className="text-[9px] text-muted-foreground font-semibold">
                      {cvFile?.[0] ? cvFile[0].name : "Upload CV"}
                    </p>
                    <p className="text-[8px] text-muted-foreground/50 mt-0.5">PDF, DOCX</p>
                  </div>
                </div>
              </Field>

              <Field label="Government ID Proof" error={errors.idProof?.message as string | undefined}>
                <div className="relative flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/5 p-4 hover:bg-muted/10 transition-colors">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    {...register("idProof")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    <Upload className="size-5 text-muted-foreground mx-auto mb-1.5" />
                    <p className="text-[9px] text-muted-foreground font-semibold">
                      {idProofFile?.[0] ? idProofFile[0].name : "Upload ID"}
                    </p>
                    <p className="text-[8px] text-muted-foreground/50 mt-0.5">PDF, Image</p>
                  </div>
                </div>
              </Field>
            </div>

            <div className="rounded-lg bg-emerald-light/40 border border-emerald-academy/10 p-4 flex gap-3 text-xs text-emerald-academy leading-relaxed">
              <AlertCircle className="size-5 shrink-0 mt-0.5 text-emerald-academy" />
              <p>
                <strong>Security note:</strong> Uploaded materials are stored in your candidate folder in Google Drive and reviewed in strict confidentiality by the admissions panel.
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-emerald-academy hover:bg-emerald-academy/95 text-white py-3.5 rounded-lg shadow-sm text-sm font-semibold"
            >
              {isSubmitting ? "Uploading Materials & Submitting..." : "Submit Candidate Application"}
            </Button>
            
          </form>
        )}
      </div>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full text-left">
      <Label className="mb-2 text-xs font-semibold text-foreground uppercase tracking-wider">{label}</Label>
      {children}
      {error && <p className="mt-1.5 text-[10px] font-semibold text-destructive">{error}</p>}
    </div>
  );
}
