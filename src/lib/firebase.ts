import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, type QueryDocumentSnapshot } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD92Hlm6Z5tIPjvPEexMfhH4wrbOoZZxWE",
  authDomain: "zubair-online-academy.firebaseapp.com",
  projectId: "zubair-online-academy",
  storageBucket: "zubair-online-academy.firebasestorage.app",
  messagingSenderId: "781719012793",
  appId: "1:781719012793:web:2f9bee909852d9dfa02268",
  measurementId: "G-K1L8PFPYX9",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// Typed collection refs
export const collections = {
  students: collection(db, "students"),
  teachers: collection(db, "teachers"),
  courses: collection(db, "courses"),
  achievements: collection(db, "achievements"),
  settings: collection(db, "settings"),
  admins: collection(db, "admins"),
};

// Lazy analytics — only in the browser, and only if supported.
export async function initAnalytics() {
  if (typeof window === "undefined") return null;
  const { isSupported, getAnalytics } = await import("firebase/analytics");
  if (await isSupported()) return getAnalytics(firebaseApp);
  return null;
}
