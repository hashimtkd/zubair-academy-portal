import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { whatsappLink } from "@/lib/site";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact Admissions Desk — Zubair Online Academy" },
      { name: "description", content: "Have questions about courses, class timings, or fees? Get in touch with our global admissions team via WhatsApp or email." },
      { property: "og:title", content: "Contact Admissions — Zubair Online Academy" },
      { property: "og:description", content: "Reach our admissions team by WhatsApp, email, or submission form." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name"),
  email: z.string().trim().email("Please enter a valid email address"),
  whatsapp: z.string().trim().min(7, "Please include country code"),
  message: z.string().trim().min(10, "Message should be at least 10 characters long"),
});
type ContactFormValues = z.infer<typeof contactSchema>;

function ContactPage() {
  const { settings } = useSettings();
  
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: "", email: "", whatsapp: "", message: "" }
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      // Simulate submission & trigger WhatsApp link prefilled
      const waMsg = `Assalamu Alaikum, I am contacting you from the Zubair Online Academy portal.\n\nName: ${data.fullName}\nEmail: ${data.email}\nMessage: ${data.message}`;
      
      toast.success("Message logged successfully!", {
        description: "Opening WhatsApp to connect you directly with a counselor.",
      });

      window.open(whatsappLink(waMsg), "_blank", "noopener,noreferrer");
      reset();
    } catch (err) {
      toast.error("Form submission failed", {
        description: "Please try again later or contact us directly on WhatsApp."
      });
    }
  };

  return (
    <section className="py-20 sm:py-24 bg-gradient-to-b from-emerald-light/20 via-background to-background">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Intro */}
        <div className="mb-14 max-w-3xl text-left">
          <span className="inline-block rounded-full bg-emerald-light px-4 py-1.5 text-xs font-semibold tracking-wider text-emerald-academy uppercase mb-5 shadow-sm">
            Support Desk
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground font-semibold leading-tight text-balance">
            We are here to assist you.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty">
            Have questions about course pathways, trial sessions, scheduling, or payment options? Contact our global support desk. We operate 24/7 across all student timezones.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Details Column */}
          <div className="lg:col-span-5 space-y-6">
            
            <a
              href={whatsappLink(`Assalamu Alaikum, I have questions regarding admissions at ${settings.academyName}.`)}
              target="_blank"
              rel="noreferrer"
              className="group flex gap-5 rounded-2xl bg-card border border-border p-6 hover:border-emerald-academy/30 transition shadow-sm"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-academy text-white shadow-sm">
                <MessageCircle className="size-6" />
              </div>
              <div className="text-left">
                <h3 className="font-serif text-lg font-bold text-foreground mb-1">WhatsApp Chat</h3>
                <p className="text-sm text-muted-foreground mb-1">Chat live with our advisor desk.</p>
                <p className="text-xs font-semibold text-emerald-academy font-mono">+{settings.whatsappNumber}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-emerald-academy group-hover:underline">Open chat &rarr;</p>
              </div>
            </a>

            <a
              href={`mailto:${settings.email}`}
              className="group flex gap-5 rounded-2xl bg-card border border-border p-6 hover:border-emerald-academy/30 transition shadow-sm"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-academy text-white shadow-sm">
                <Mail className="size-6" />
              </div>
              <div className="text-left">
                <h3 className="font-serif text-lg font-bold text-foreground mb-1">Email Admission</h3>
                <p className="text-sm text-muted-foreground mb-1">For general inquiries and academic credentials.</p>
                <p className="text-xs font-semibold text-emerald-academy font-mono">{settings.email}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-emerald-academy group-hover:underline">Send email &rarr;</p>
              </div>
            </a>

            <div className="flex gap-5 rounded-2xl bg-card border border-border p-6 shadow-sm">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-academy text-white shadow-sm">
                <MapPin className="size-6" />
              </div>
              <div className="text-left">
                <h3 className="font-serif text-lg font-bold text-foreground mb-1">Academy Office</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{settings.address}</p>
                <p className="mt-3 text-xs text-muted-foreground/60 leading-normal">
                  All programs are conducted virtually. Teachers are distributed globally.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-academy text-white p-8 shadow-lg relative overflow-hidden">
              <div className="absolute right-0 bottom-0 top-0 w-1/4 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>
              <h4 className="font-serif text-xl font-bold mb-3">{settings.academyName}</h4>
              <p className="text-xs sm:text-sm text-emerald-light/95 leading-relaxed text-pretty">
                {settings.aboutUs || "An international online Islamic education gateway providing authentic Arabic, Quranic, and scholastic jurisprudence courses to seekers of knowledge across the globe."}
              </p>
            </div>

          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-border bg-card shadow-lg p-6 sm:p-10 space-y-6">
              <h3 className="font-serif text-2xl font-semibold text-foreground text-left">Send a Direct Message</h3>
              
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col text-left">
                  <Label className="mb-2 text-xs font-semibold text-foreground uppercase tracking-wider">Your Name</Label>
                  <Input {...register("fullName")} placeholder="John Doe" className="bg-muted/10 border-border" />
                  {errors.fullName?.message && <span className="mt-1 text-[10px] text-destructive font-semibold">{errors.fullName.message}</span>}
                </div>
                
                <div className="flex flex-col text-left">
                  <Label className="mb-2 text-xs font-semibold text-foreground uppercase tracking-wider">Email Address</Label>
                  <Input type="email" {...register("email")} placeholder="you@example.com" className="bg-muted/10 border-border" />
                  {errors.email?.message && <span className="mt-1 text-[10px] text-destructive font-semibold">{errors.email.message}</span>}
                </div>
              </div>

              <div className="flex flex-col text-left">
                <Label className="mb-2 text-xs font-semibold text-foreground uppercase tracking-wider">WhatsApp Number (with Country Code)</Label>
                <Input {...register("whatsapp")} placeholder="e.g. +1 555 123 4567" className="bg-muted/10 border-border" />
                {errors.whatsapp?.message && <span className="mt-1 text-[10px] text-destructive font-semibold">{errors.whatsapp.message}</span>}
              </div>

              <div className="flex flex-col text-left">
                <Label className="mb-2 text-xs font-semibold text-foreground uppercase tracking-wider">Your Message</Label>
                <textarea
                  {...register("message")}
                  placeholder="How can we help you? Let us know if you want information on a specific course or custom timings..."
                  className="flex min-h-[120px] w-full rounded-md border border-border bg-muted/10 px-3 py-2 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-academy text-foreground placeholder:text-muted-foreground/60"
                />
                {errors.message?.message && <span className="mt-1 text-[10px] text-destructive font-semibold">{errors.message.message}</span>}
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-emerald-academy hover:bg-emerald-academy/95 text-white py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 shadow"
              >
                <Send className="size-4" />
                {isSubmitting ? "Submitting Message..." : "Submit Message"}
              </Button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
}
