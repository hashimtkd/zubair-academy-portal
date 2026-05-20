import { useQuery } from "@tanstack/react-query";
import { getDocs } from "firebase/firestore";
import { collections } from "@/lib/firebase";
import { SITE } from "@/lib/site";

export type AcademySettings = {
  academyName: string;
  tagline: string;
  aboutUs: string;
  whatsappNumber: string; // clean digits for wa.me link
  displayPhone: string;   // formatted for display
  email: string;
  address: string;
  logoUrl?: string;
  heroImageUrl?: string;
};

async function fetchSettingsFromFirestore(): Promise<AcademySettings> {
  const snap = await getDocs(collections.settings);
  if (snap.empty) {
    throw new Error("No settings found in database");
  }
  
  const doc = snap.docs[0];
  const data = doc.data();
  
  // Format WhatsApp number
  const rawWa = data.whatsapp || data.whatsappNumber || SITE.whatsappNumber;
  const cleanWa = String(rawWa).replace(/\D/g, ""); // keep only digits
  const displayPhone = data.phone || (cleanWa.startsWith("92") ? `+92 ${cleanWa.slice(2)}` : `+${cleanWa}`);
  
  return {
    academyName: data.academyName || SITE.name,
    tagline: data.tagline || SITE.tagline,
    aboutUs: data.aboutUs || SITE.tagline,
    whatsappNumber: cleanWa,
    displayPhone: displayPhone,
    email: data.email || SITE.email,
    address: data.address || SITE.address,
    logoUrl: data.logo || data.logoUrl || undefined,
    heroImageUrl: data.heroImage || data.heroImageUrl || undefined,
  };
}

export function useSettings() {
  const { data, isLoading, isError } = useQuery<AcademySettings>({
    queryKey: ["settings"],
    queryFn: fetchSettingsFromFirestore,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1,
  });

  const defaultSettings: AcademySettings = {
    academyName: SITE.name,
    tagline: SITE.tagline,
    aboutUs: "Preserving traditional Islamic knowledge through innovative online learning. Join a global community of students and scholars.",
    whatsappNumber: SITE.whatsappNumber,
    displayPhone: SITE.phone,
    email: SITE.email,
    address: SITE.address,
    logoUrl: undefined,
    heroImageUrl: undefined,
  };

  return {
    settings: data || defaultSettings,
    isLoading,
    isError,
  };
}
