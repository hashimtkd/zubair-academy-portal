export type Achievement = {
  name: string;
  country: string;
  title: string;
  detail: string;
  initials: string;
  imageUrl?: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    name: "Aisha Rahman",
    country: "United Kingdom",
    title: "Completed Hifz in 3 Years",
    detail: "Aisha began her journey at 14 and completed memorisation of the entire Quran with Ijazah.",
    initials: "AR",
  },
  {
    name: "Omar Al-Sayed",
    country: "Canada",
    title: "Advanced Tajweed Graduate",
    detail: "Earned a certificate in Tajweed mastery and now teaches youth in his local community.",
    initials: "OA",
  },
  {
    name: "Fatima Zahra",
    country: "Malaysia",
    title: "Fluent Classical Arabic",
    detail: "Completed Levels I–III of Classical Arabic and now reads primary Tafsir texts independently.",
    initials: "FZ",
  },
  {
    name: "Zaid Mahmood",
    country: "South Africa",
    title: "Hifz Silver Medalist",
    detail: "Placed in the top three at an international Quran competition representing his country.",
    initials: "ZM",
  },
  {
    name: "Layla Hassan",
    country: "Egypt",
    title: "Fiqh of Worship Distinction",
    detail: "Graduated with distinction and went on to mentor new students enrolling in the program.",
    initials: "LH",
  },
  {
    name: "Yusuf Ibrahim",
    country: "Nigeria",
    title: "Seerah Capstone Honors",
    detail: "Completed the Seerah program with a research paper on the Madinan period.",
    initials: "YI",
  },
];
