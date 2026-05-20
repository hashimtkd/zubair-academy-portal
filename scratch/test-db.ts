import { db } from "../src/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

async function main() {
  console.log("Checking Firestore collections with target filters...");
  
  // 1. Settings
  try {
    const snap = await getDocs(collection(db, "settings"));
    console.log(`Settings count: ${snap.size}`);
    snap.docs.forEach(doc => console.log("Settings document:", doc.id, JSON.stringify(doc.data(), null, 2)));
  } catch (err: any) {
    console.error("Error settings:", err.message);
  }

  // 2. Courses (isActive == true)
  try {
    const snap = await getDocs(query(collection(db, "courses"), where("isActive", "==", true)));
    console.log(`Active courses count: ${snap.size}`);
    snap.docs.forEach(doc => console.log("Course:", doc.id, doc.data()));
  } catch (err: any) {
    console.error("Error courses:", err.message);
  }

  // 3. Achievements (isActive == true)
  try {
    const snap = await getDocs(query(collection(db, "achievements"), where("isActive", "==", true)));
    console.log(`Active achievements count: ${snap.size}`);
    snap.docs.forEach(doc => console.log("Achievement:", doc.id, doc.data()));
  } catch (err: any) {
    console.error("Error achievements:", err.message);
  }

  // 4. Approved Teachers (status == approved)
  try {
    const snap = await getDocs(query(collection(db, "teachers"), where("status", "==", "approved")));
    console.log(`Approved teachers count: ${snap.size}`);
    snap.docs.forEach(doc => console.log("Approved Teacher:", doc.id, doc.data()));
  } catch (err: any) {
    console.error("Error approved teachers:", err.message);
  }
}

main().catch(console.error);


main().catch(console.error);
