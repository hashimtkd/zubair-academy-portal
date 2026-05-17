import quran from "@/assets/course-quran.jpg";
import fiqh from "@/assets/course-fiqh.jpg";
import arabic from "@/assets/course-arabic.jpg";

export type Course = {
  id: string;
  title: string;
  level: string;
  duration: string;
  fee: string;
  description: string;
  image: string;
};

export const COURSES: Course[] = [
  {
    id: "quranic-arabic",
    title: "Classical Arabic Foundations",
    level: "Beginner",
    duration: "12 Weeks",
    fee: "$30 / month",
    description:
      "Master the essentials of Arabic grammar (Nahw) and vocabulary to unlock the meanings of the Quran.",
    image: arabic,
  },
  {
    id: "tajweed",
    title: "Advanced Tajweed Masterclass",
    level: "All Levels",
    duration: "Ongoing",
    fee: "$25 / month",
    description:
      "Perfect your recitation with personalised feedback from certified Ijazah-holding instructors.",
    image: quran,
  },
  {
    id: "hifz",
    title: "Hifz-ul-Quran Program",
    level: "Long-term",
    duration: "2–4 Years",
    fee: "$40 / month",
    description:
      "Structured memorisation program with daily one-on-one revision and milestone tracking.",
    image: quran,
  },
  {
    id: "fiqh",
    title: "Fiqh of Worship",
    level: "Intermediate",
    duration: "24 Weeks",
    fee: "$35 / month",
    description:
      "A comprehensive study of the rulings of Salah, Zakat, Fasting and Hajj from authentic sources.",
    image: fiqh,
  },
  {
    id: "aqeedah",
    title: "Essentials of Aqeedah",
    level: "Beginner",
    duration: "8 Weeks",
    fee: "$25 / month",
    description:
      "Build a firm understanding of Islamic creed through classical scholastic works.",
    image: fiqh,
  },
  {
    id: "seerah",
    title: "Seerah of the Prophet ﷺ",
    level: "All Levels",
    duration: "16 Weeks",
    fee: "$25 / month",
    description:
      "Walk through the life of the Messenger of Allah ﷺ with deep historical and spiritual reflection.",
    image: arabic,
  },
  {
    id: "conversational-arabic",
    title: "Conversational Arabic",
    level: "Beginner",
    duration: "10 Weeks",
    fee: "$28 / month",
    description:
      "Develop everyday speaking confidence through immersive practice with native tutors.",
    image: arabic,
  },
  {
    id: "hadith",
    title: "Introduction to Hadith Sciences",
    level: "Intermediate",
    duration: "12 Weeks",
    fee: "$30 / month",
    description:
      "Learn the methodology of hadith study and explore selected narrations with classical commentary.",
    image: fiqh,
  },
];

export const FEATURED_COURSES = COURSES.slice(0, 3);
