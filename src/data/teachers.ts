export type Teacher = {
  id: string;
  name: string;
  photoUrl: string;
  qualification: string;
  experience: string;
  country: string;
  status: "approved" | "pending";
};

export const FALLBACK_TEACHERS: Teacher[] = [
  {
    id: "teacher-1",
    name: "Dr. Anis Al-Balawi",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    qualification: "PhD in Arabic Linguistics, Al-Azhar University",
    experience: "15+ Years teaching Classical Arabic & Rhetoric (Balaqah)",
    country: "Egypt",
    status: "approved",
  },
  {
    id: "teacher-2",
    name: "Ustadha Fatima Al-Hassan",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    qualification: "Ijazah in the Ten Qira'at, graduate of Tayyibun Institute",
    experience: "8 Years teaching Tajweed, Hifz, and Quran Recitation",
    country: "Jordan",
    status: "approved",
  },
  {
    id: "teacher-3",
    name: "Sheikh Muhammad Mansour",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    qualification: "MA in Islamic Law (Shariah), Islamic University of Madinah",
    experience: "12 Years teaching Fiqh of Worship, Aqeedah, and Hadith Studies",
    country: "Saudi Arabia",
    status: "approved",
  },
  {
    id: "teacher-4",
    name: "Ustadha Aisha Rahman",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
    qualification: "Bachelors in Islamic Studies & Ijazah in Tajweed",
    experience: "6 Years teaching introductory Arabic and Quran for women and children",
    country: "United Kingdom",
    status: "approved",
  },
];
