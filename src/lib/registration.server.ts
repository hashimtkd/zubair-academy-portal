import { createServerFn } from "@tanstack/react-start";
import { db, storage } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, getBytes } from "firebase/storage";

// Helper to upload files to Firebase Storage
async function uploadToFirebase(file: File, folder: string): Promise<{ url: string; path: string }> {
  const filePath = `${folder}/${Date.now()}_${file.name}`;
  const fileRef = ref(storage, filePath);
  
  const bytes = new Uint8Array(await file.arrayBuffer());
  
  await uploadBytes(fileRef, bytes, {
    contentType: file.type || "application/octet-stream"
  });
  
  const url = await getDownloadURL(fileRef);
  return { url, path: filePath };
}

export const submitStudentRegistration = createServerFn({ method: "POST" })
  .inputValidator((data: FormData) => data)
  .handler(async ({ data }) => {
    try {
      const fullName = data.get("fullName") as string;
      const email = data.get("email") as string;
      const whatsapp = data.get("whatsapp") as string;
      const country = data.get("country") as string;
      const course = data.get("course") as string; // mapped to selectedCourse
      const gender = data.get("gender") as string;
      const dateOfBirth = data.get("dateOfBirth") as string;
      const education = data.get("education") as string;

      const photoFile = data.get("photo") as File | null;
      const idProofFile = data.get("idProof") as File | null;

      if (!fullName || !email || !whatsapp || !country || !course || !gender || !dateOfBirth || !education) {
        throw new Error("Missing required registration fields.");
      }

      console.log("Uploading student files to Firebase Storage...");
      let tempPhotoUrl = "";
      let tempPhotoPath = "";
      let tempIdProofUrl = "";
      let tempIdProofPath = "";

      if (photoFile && photoFile.size > 0) {
        const upload = await uploadToFirebase(photoFile, "temp/students/photos");
        tempPhotoUrl = upload.url;
        tempPhotoPath = upload.path;
      }

      if (idProofFile && idProofFile.size > 0) {
        const upload = await uploadToFirebase(idProofFile, "temp/students/id_proofs");
        tempIdProofUrl = upload.url;
        tempIdProofPath = upload.path;
      }

      const registrationData = {
        fullName,
        email,
        whatsapp,
        country,
        selectedCourse: course, // save as selectedCourse as per requirements
        course, // keep course for compatibility
        gender,
        dateOfBirth,
        education,
        // Temporary Firebase storage file references
        tempPhotoUrl,
        tempPhotoPath,
        tempIdProofUrl,
        tempIdProofPath,
        // Google Drive sync attributes to be filled later by the admin
        driveFolderId: "",
        driveFolderName: "",
        photoUrl: "",
        photoFileId: "",
        idProofUrl: "",
        idProofFileId: "",
        status: "pending",
        uploadMethod: "pending-drive-sync",
      };

      // Save registration document to Firestore admissions collection
      const docRef = await addDoc(collection(db, "admissions"), {
        ...registrationData,
        submittedAt: serverTimestamp(),
        createdAt: serverTimestamp() // Compatibility
      });

      return {
        success: true,
        id: docRef.id,
        fullName,
        course,
      };
    } catch (err: any) {
      console.error("Student registration failed:", err);
      return {
        success: false,
        error: err.message || "An unexpected error occurred during submission."
      };
    }
  });

export const submitTeacherRegistration = createServerFn({ method: "POST" })
  .inputValidator((data: FormData) => data)
  .handler(async ({ data }) => {
    try {
      const fullName = data.get("fullName") as string;
      const email = data.get("email") as string;
      const whatsapp = data.get("whatsapp") as string;
      const country = data.get("country") as string;
      const qualification = data.get("qualification") as string;
      const experience = data.get("experience") as string;

      const photoFile = data.get("photo") as File | null;
      const cvFile = data.get("cv") as File | null;
      const idProofFile = data.get("idProof") as File | null;

      if (!fullName || !email || !whatsapp || !country || !qualification || !experience) {
        throw new Error("Missing required registration fields.");
      }

      console.log("Uploading teacher files to Firebase Storage...");
      let tempPhotoUrl = "";
      let tempPhotoPath = "";
      let tempCvUrl = "";
      let tempCvPath = "";
      let tempIdProofUrl = "";
      let tempIdProofPath = "";

      if (photoFile && photoFile.size > 0) {
        const upload = await uploadToFirebase(photoFile, "temp/teachers/photos");
        tempPhotoUrl = upload.url;
        tempPhotoPath = upload.path;
      }
      
      if (cvFile && cvFile.size > 0) {
        const upload = await uploadToFirebase(cvFile, "temp/teachers/cvs");
        tempCvUrl = upload.url;
        tempCvPath = upload.path;
      }

      if (idProofFile && idProofFile.size > 0) {
        const upload = await uploadToFirebase(idProofFile, "temp/teachers/id_proofs");
        tempIdProofUrl = upload.url;
        tempIdProofPath = upload.path;
      }

      const registrationData = {
        fullName,
        email,
        whatsapp,
        country,
        qualification,
        experience,
        // Temporary Firebase storage references
        tempPhotoUrl,
        tempPhotoPath,
        tempCvUrl,
        tempCvPath,
        tempIdProofUrl,
        tempIdProofPath,
        // Google Drive sync attributes to be filled later by the admin
        driveFolderId: "",
        driveFolderName: "",
        photoUrl: "",
        photoFileId: "",
        cvUrl: "",
        cvFileId: "",
        idProofUrl: "",
        idProofFileId: "",
        status: "pending",
        uploadMethod: "pending-drive-sync",
      };

      // Save registration document to Firestore teacher_applications collection
      const docRef = await addDoc(collection(db, "teacher_applications"), {
        ...registrationData,
        submittedAt: serverTimestamp(),
        createdAt: serverTimestamp() // Compatibility
      });

      return {
        success: true,
        id: docRef.id,
        fullName,
      };
    } catch (err: any) {
      console.error("Teacher registration failed:", err);
      return {
        success: false,
        error: err.message || "An unexpected error occurred during submission."
      };
    }
  });

export const downloadTempFile = createServerFn({ method: "POST" })
  .inputValidator((path: string) => path)
  .handler(async ({ data: path }) => {
    try {
      const fileRef = ref(storage, path);
      const buffer = await getBytes(fileRef);
      // Convert ArrayBuffer to base64
      const base64 = Buffer.from(buffer).toString("base64");
      return { success: true, base64 };
    } catch (err: any) {
      console.error("Failed to download temp file:", err);
      return { success: false, error: err.message };
    }
  });
