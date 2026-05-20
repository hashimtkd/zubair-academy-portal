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
import { submitStudentRegistration } from "@/lib/registration.server";
import { useState } from "react";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";

// Validate search parameters to pre-select course
const searchSchema = z.object({
  course: z.string().optional().catch(""),
});

export const Route = createFileRoute("/register/student")({
  validateSearch: (search) => searchSchema.parse(search),
  component: StudentRegister,
  head: () => ({
    meta: [
      { title: "Student Admission Registration — Zubair Online Academy" },
      { name: "description", content: "Register for live 1-on-1 Arabic, Quran, and Islamic studies courses. Global student admissions open." },
      { property: "og:title", content: "Student Registration — Zubair Online Academy" },
      { property: "og:description", content: "Begin your sacred studies. Book a free live trial session today." },
      { property: "og:url", content: "/register/student" },
    ],
    links: [{ rel: "canonical", href: "/register/student" }],
  }),
});

// Zod form validation schema including file checks
const formSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  whatsapp: z.string().trim().min(7, "Include your international country code").max(20),
  country: z.string().min(1, "Select your country"),
  course: z.string().min(1, "Select a course"),
  gender: z.string().min(1, "Select your gender"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  education: z.string().trim().min(2, "Specify your highest education level").max(200),
  photo: z.any().refine((files) => files && files.length > 0, "Profile photo is required"),
  idProof: z.any().refine((files) => files && files.length > 0, "ID proof document is required"),
});
type FormValues = z.infer<typeof formSchema>;

function StudentRegister() {
  const { course: preselectedCourse } = Route.useSearch();
  const [successData, setSuccessData] = useState<{ name: string; course: string } | null>(null);

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
      course: preselectedCourse || "",
      gender: "",
      dateOfBirth: "",
      education: "",
    },
  });

  const photoFile = watch("photo");
  const idProofFile = watch("idProof");

  const onSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      formData.append("whatsapp", data.whatsapp);
      formData.append("country", data.country);
      formData.append("course", data.course);
      formData.append("gender", data.gender);
      formData.append("dateOfBirth", data.dateOfBirth);
      formData.append("education", data.education);
      
      if (data.photo?.[0]) {
        formData.append("photo", data.photo[0]);
      }
      if (data.idProof?.[0]) {
        formData.append("idProof", data.idProof[0]);
      }

      const res = await submitStudentRegistration({ data: formData });

      if (res.success) {
        toast.success("Application successfully submitted!", {
          description: "Your files have been securely uploaded and metadata saved.",
        });

        // Set success view
        setSuccessData({ name: data.fullName, course: data.course });
        
        // Open WhatsApp redirect
        const message = `Assalamu Alaikum, I have submitted my student registration for ${data.course}.\n\nName: ${data.fullName}\nEmail: ${data.email}\nCountry: ${data.country}\nRegistration ID: ${res.id}`;
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
            Student Admissions
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground font-semibold leading-tight text-balance">
            Begin Your Sacred Journey
          </h1>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed text-pretty">
            Submit your enrollment application below. Our admissions board reviews details and contacts applicants on WhatsApp within 24 hours.
          </p>
        </div>

        {successData ? (
          <div className="rounded-2xl border border-emerald-academy/20 bg-card p-8 text-center shadow-lg ring-1 ring-black/5">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-light text-emerald-academy mx-auto mb-6">
              <CheckCircle2 className="size-8" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">Application Received!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 text-pretty">
              JazakAllah Khair, <strong>{successData.name}</strong>, for applying for the <strong>{successData.course}</strong> program. Your application has been logged in our registry as <strong>pending review</strong>.
            </p>
            <p className="text-xs text-muted-foreground bg-muted/50 border border-border p-4 rounded-lg mb-8 leading-relaxed text-pretty">
              If the WhatsApp window did not open automatically, please click below to text our admissions desk to fast-track your scheduler.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={whatsappLink(`Assalamu Alaikum, I just submitted my student registration for ${successData.course}. Name: ${successData.name}.`)}
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
                Apply for Another Course
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-border bg-card shadow-lg p-6 sm:p-10 space-y-6">
            
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full Name" error={errors.fullName?.message}>
                <Input {...register("fullName")} placeholder="e.g. John Doe" className="bg-muted/10 border-border" />
              </Field>
              <Field label="Email Address" error={errors.email?.message}>
                <Input type="email" {...register("email")} placeholder="you@example.com" className="bg-muted/10 border-border" />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="WhatsApp Number (with Country Code)" error={errors.whatsapp?.message}>
                <Input {...register("whatsapp")} placeholder="e.g. +1 555 123 4567" className="bg-muted/10 border-border" />
              </Field>
              <Field label="Country" error={errors.country?.message}>
                <select
                  {...register("country")}
                  className="flex h-10 w-full rounded-md border border-border bg-muted/10 px-3 py-1.5 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-academy text-foreground"
                >
                  <option value="" className="text-muted-foreground">Select your country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Selected Course" error={errors.course?.message}>
              <select
                {...register("course")}
                className="flex h-10 w-full rounded-md border border-border bg-muted/10 px-3 py-1.5 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-academy text-foreground"
              >
                <option value="">Select a course</option>
                {COURSES.map((c) => <option key={c.id} value={c.title}>{c.title}</option>)}
              </select>
            </Field>

            <div className="grid gap-5 sm:grid-cols-3 border-t border-border pt-6">
              <Field label="Gender" error={errors.gender?.message}>
                <select
                  {...register("gender")}
                  className="flex h-10 w-full rounded-md border border-border bg-muted/10 px-3 py-1.5 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-academy text-foreground"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </Field>
              <Field label="Date of Birth" error={errors.dateOfBirth?.message}>
                <Input 
                  type="date" 
                  {...register("dateOfBirth")} 
                  className="bg-muted/10 border-border h-10 w-full rounded-md border text-foreground" 
                />
              </Field>
              <Field label="Education Level" error={errors.education?.message}>
                <Input 
                  {...register("education")} 
                  placeholder="e.g. High School, BSCS" 
                  className="bg-muted/10 border-border h-10 w-full rounded-md border text-foreground" 
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 border-t border-border pt-6">
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
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      {photoFile?.[0] ? photoFile[0].name : "Upload Image"}
                    </p>
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5">JPEG, PNG up to 5MB</p>
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
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      {idProofFile?.[0] ? idProofFile[0].name : "Upload Document"}
                    </p>
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5">PDF or Image up to 10MB</p>
                  </div>
                </div>
              </Field>
            </div>

            <div className="rounded-lg bg-emerald-light/40 border border-emerald-academy/10 p-4 flex gap-3 text-xs text-emerald-academy leading-relaxed">
              <AlertCircle className="size-5 shrink-0 mt-0.5 text-emerald-academy" />
              <p>
                <strong>Important:</strong> Uploaded documents are saved securely in your private Google Drive registration folder and reviewed solely by our credentialing administrators.
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-emerald-academy hover:bg-emerald-academy/95 text-white py-3.5 rounded-lg shadow-sm text-sm font-semibold"
            >
              {isSubmitting ? "Uploading Files & Submitting..." : "Submit Application"}
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
