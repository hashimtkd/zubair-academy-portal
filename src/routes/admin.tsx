import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  getDocs,
  limit,
  serverTimestamp,
  addDoc
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User as FirebaseUser
} from "firebase/auth";
import { db, storage, auth } from "@/lib/firebase";
import { ref, deleteObject } from "firebase/storage";
import { 
  createDriveFolder, 
  uploadDriveFile, 
  getOrCreateCategoryFolderClient 
} from "@/lib/google-drive-oauth";
import { downloadTempFile } from "@/lib/registration.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  GraduationCap, 
  Users, 
  Key, 
  FolderSync, 
  Check, 
  X, 
  Clock, 
  Settings, 
  ExternalLink,
  Loader2,
  Trash2,
  LayoutDashboard,
  LogOut,
  Database,
  Search,
  Filter,
  FileText,
  MessageSquare,
  Eye,
  Lock,
  ChevronRight,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  FileDown
} from "lucide-react";
import { whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
  head: () => ({
    meta: [
      { title: "Portal Administrator — Zubair Online Academy" },
      { name: "description", content: "Review and approve student and teacher applications, syncing credentials directly to Google Drive." },
    ],
  }),
});

interface RegistrationDoc {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  country: string;
  status: "pending" | "approved" | "rejected";
  submittedAt?: any;
  createdAt?: any;
  uploadMethod?: string;
  driveFolderId?: string;
  driveFolderName?: string;
  internalNotes?: string;
  // Student fields
  course?: string;
  selectedCourse?: string;
  gender?: string;
  dateOfBirth?: string;
  education?: string;
  // Teacher fields
  qualification?: string;
  experience?: string;
  // File refs
  tempPhotoUrl?: string;
  tempPhotoPath?: string;
  tempCvUrl?: string;
  tempCvPath?: string;
  tempIdProofUrl?: string;
  tempIdProofPath?: string;
  photoUrl?: string;
  photoFileId?: string;
  idProofUrl?: string;
  idProofFileId?: string;
  cvUrl?: string;
  cvFileId?: string;
}

interface AdminProfile {
  fullName: string;
  role: "admin" | "super_admin";
  email: string;
}

// Convert base64 to Blob helper
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

function AdminDashboard() {
  // Google Drive Config States
  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_google_client_id") || "781719012793-admin.apps.googleusercontent.com";
    }
    return "";
  });

  const [parentFolderId, setParentFolderId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_drive_parent_folder_id") || "1djlvhpbBXsGomwCneG6tuJ17-T-z5gte";
    }
    return "";
  });

  const [accessToken, setAccessToken] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_google_access_token") || "";
    }
    return "";
  });

  // Firebase Auth & Roles States
  const [adminUser, setAdminUser] = useState<FirebaseUser | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [noAdminsExist, setNoAdminsExist] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Setup Initial Admin Form
  const [seedEmail, setSeedEmail] = useState("");
  const [seedPassword, setSeedPassword] = useState("");
  const [seedName, setSeedName] = useState("");
  const [seeding, setSeeding] = useState(false);

  // Firestore Data States
  const [allAdmissions, setAllAdmissions] = useState<RegistrationDoc[]>([]);
  const [allTeacherApps, setAllTeacherApps] = useState<RegistrationDoc[]>([]);
  const [approvedStudents, setApprovedStudents] = useState<any[]>([]);
  const [approvedTeachers, setApprovedTeachers] = useState<any[]>([]);

  // Navigation and Filtering States
  const [activeView, setActiveView] = useState<"dashboard" | "admissions" | "teachers" | "backups" | "config">("dashboard");
  const [admissionsTab, setAdmissionsTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [teachersTab, setTeachersTab] = useState<"pending" | "approved" | "rejected">("pending");
  
  // Filtering values
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  // Syncing & Processing States
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<string>("");
  const [backingUp, setBackingUp] = useState(false);
  const [updatingNotesId, setUpdatingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>("");

  // Document Viewer Modal State
  const [previewDoc, setPreviewDoc] = useState<{ name: string; url: string; type: "image" | "pdf" | "other" } | null>(null);

  // Load Google Identity Services client script
  useEffect(() => {
    if ((window as any).google) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  // Save config to LocalStorage
  useEffect(() => {
    localStorage.setItem("admin_google_client_id", googleClientId);
  }, [googleClientId]);

  useEffect(() => {
    localStorage.setItem("admin_drive_parent_folder_id", parentFolderId);
  }, [parentFolderId]);

  // Auth State Listener & Admin Role Verification
  useEffect(() => {
    const checkAdmins = async () => {
      try {
        const snap = await getDocs(query(collection(db, "admins"), limit(1)));
        setNoAdminsExist(snap.empty);
      } catch (err) {
        console.error("Error checking admins collection:", err);
      }
    };
    checkAdmins();

    const unsub = onAuthStateChanged(auth, async (user) => {
      setAdminUser(user);
      if (user) {
        try {
          const qAdmins = query(collection(db, "admins"), where("email", "==", user.email));
          const snap = await getDocs(qAdmins);
          if (!snap.empty) {
            const data = snap.docs[0].data();
            setAdminProfile({
              fullName: data.fullName || "Administrator",
              role: data.role || "admin",
              email: user.email || ""
            });
          } else {
            toast.error("Access denied. You are not registered as an administrator.");
            await signOut(auth);
            setAdminProfile(null);
          }
        } catch (err: any) {
          toast.error("Failed to load admin profile: " + err.message);
          await signOut(auth);
          setAdminProfile(null);
        }
      } else {
        setAdminProfile(null);
      }
      setCheckingAuth(false);
    });

    return () => unsub();
  }, []);

  // Subscribe to Firestore collections when logged in
  useEffect(() => {
    if (!adminProfile) return;

    // 1. Admissions (Students)
    const unsubAdmissions = onSnapshot(collection(db, "admissions"), (snap) => {
      const list: RegistrationDoc[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as RegistrationDoc));
      // Sort in-memory desc
      list.sort((a, b) => {
        const timeA = a.submittedAt?.seconds || a.createdAt?.seconds || 0;
        const timeB = b.submittedAt?.seconds || b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setAllAdmissions(list);
    });

    // 2. Teacher Applications
    const unsubTeacherApps = onSnapshot(collection(db, "teacher_applications"), (snap) => {
      const list: RegistrationDoc[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as RegistrationDoc));
      list.sort((a, b) => {
        const timeA = a.submittedAt?.seconds || a.createdAt?.seconds || 0;
        const timeB = b.submittedAt?.seconds || b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setAllTeacherApps(list);
    });

    // 3. Approved Students
    const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
      const list: any[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setApprovedStudents(list);
    });

    // 4. Approved Teachers
    const unsubTeachers = onSnapshot(collection(db, "teachers"), (snap) => {
      const list: any[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setApprovedTeachers(list);
    });

    return () => {
      unsubAdmissions();
      unsubTeacherApps();
      unsubStudents();
      unsubTeachers();
    };
  }, [adminProfile]);

  // Auth Functions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter your email and password.");
      return;
    }
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      toast.success("Welcome back!");
    } catch (err: any) {
      toast.error("Authentication failed: " + err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSeedAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedEmail || !seedPassword || !seedName) {
      toast.error("Please complete all fields.");
      return;
    }
    setSeeding(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, seedEmail, seedPassword);
      await setDoc(doc(db, "admins", cred.user.uid), {
        email: seedEmail,
        fullName: seedName,
        role: "super_admin",
        createdAt: serverTimestamp(),
      });
      toast.success("Super Admin account initialized successfully!");
      setNoAdminsExist(false);
    } catch (err: any) {
      toast.error("Setup failed: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAccessToken("");
      sessionStorage.removeItem("admin_google_access_token");
      toast.success("Logged out successfully.");
    } catch (err: any) {
      toast.error("Logout failed: " + err.message);
    }
  };

  // Google Drive Authentication
  const handleGoogleLogin = () => {
    if (!googleClientId) {
      toast.error("Configure Google Client ID in settings first.");
      return;
    }
    if (!(window as any).google) {
      toast.error("Google script is loading. Try again.");
      return;
    }

    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: googleClientId,
      scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive",
      callback: (tokenResponse: any) => {
        if (tokenResponse.error) {
          toast.error(`Auth failed: ${tokenResponse.error_description}`);
          return;
        }
        setAccessToken(tokenResponse.access_token);
        sessionStorage.setItem("admin_google_access_token", tokenResponse.access_token);
        toast.success("Authenticated with Google Drive!");
        toast.info("Drive synchronization has been unlocked.", { id: "drive-sync-toast" });
      },
    });
    client.requestAccessToken();
  };

  const handleDisconnectDrive = () => {
    setAccessToken("");
    sessionStorage.removeItem("admin_google_access_token");
    toast.success("Disconnected access token.");
  };

  // Approval Process (Sync Files + Copy Record)
  const handleApproveAdmission = async (docData: RegistrationDoc) => {
    if (!accessToken) {
      toast.error("Please authenticate with Google Drive first.");
      setActiveView("config");
      return;
    }
    if (!parentFolderId) {
      toast.error("Configure the Google Drive Parent Folder ID first.");
      setActiveView("config");
      return;
    }
    if (!window.confirm(`Approve enrollment for ${docData.fullName}? This will upload files to Google Drive and create a student profile.`)) return;

    setSyncingId(docData.id);
    setSyncProgress("Creating category folders...");

    try {
      const year = new Date().getFullYear();
      const folderName = `${docData.fullName.replace(/[^a-zA-Z0-9 ]/g, "")}_${year}`;
      
      // 1. Resolve 'Students' Root Category Folder
      const studentsFolderId = await getOrCreateCategoryFolderClient("Students", parentFolderId, accessToken);
      setSyncProgress(`Creating directory "Students/${folderName}"...`);

      // 2. Create Student Folder
      const docFolderId = await createDriveFolder(folderName, accessToken, studentsFolderId);
      setSyncProgress("Applicant directory ready. Syncing files from Storage...");

      let photoResult = { fileId: "", webViewUrl: "" };
      let idProofResult = { fileId: "", webViewUrl: "" };

      // 3. Sync Profile Photo
      if (docData.tempPhotoPath) {
        setSyncProgress("Downloading profile photo...");
        const res = await downloadTempFile({ data: docData.tempPhotoPath });
        if (res.success && res.base64) {
          setSyncProgress("Syncing profile photo to Drive...");
          const blob = base64ToBlob(res.base64, "image/jpeg");
          photoResult = await uploadDriveFile(blob, `photo_${docData.fullName.replace(/\s+/g, "_")}.jpg`, docFolderId, accessToken, true);
        }
      }

      // 4. Sync Government ID
      if (docData.tempIdProofPath) {
        setSyncProgress("Downloading ID proof document...");
        const res = await downloadTempFile({ data: docData.tempIdProofPath });
        if (res.success && res.base64) {
          setSyncProgress("Syncing ID proof to Drive...");
          const isPdf = docData.tempIdProofUrl?.includes(".pdf");
          const mime = isPdf ? "application/pdf" : "image/jpeg";
          const ext = isPdf ? ".pdf" : ".jpg";
          const blob = base64ToBlob(res.base64, mime);
          idProofResult = await uploadDriveFile(blob, `id_${docData.fullName.replace(/\s+/g, "_")}${ext}`, docFolderId, accessToken, false);
        }
      }

      setSyncProgress("Creating student database record...");

      // 5. Update Admission Status
      const admissionRef = doc(db, "admissions", docData.id);
      const updatePayload = {
        status: "approved" as const,
        driveFolderId: docFolderId,
        driveFolderName: folderName,
        photoUrl: photoResult.webViewUrl || docData.tempPhotoUrl || "",
        photoFileId: photoResult.fileId,
        idProofUrl: idProofResult.webViewUrl || docData.tempIdProofUrl || "",
        idProofFileId: idProofResult.fileId,
        uploadMethod: "google-oauth-client",
      };
      await updateDoc(admissionRef, updatePayload);

      // 6. Copy to Students Database
      const studentPayload = {
        fullName: docData.fullName,
        email: docData.email,
        whatsapp: docData.whatsapp,
        country: docData.country,
        selectedCourse: docData.selectedCourse || docData.course || "",
        course: docData.selectedCourse || docData.course || "",
        gender: docData.gender || "",
        dateOfBirth: docData.dateOfBirth || "",
        education: docData.education || "",
        photoUrl: photoResult.webViewUrl || docData.tempPhotoUrl || "",
        photoFileId: photoResult.fileId,
        idProofUrl: idProofResult.webViewUrl || docData.tempIdProofUrl || "",
        idProofFileId: idProofResult.fileId,
        driveFolderId: docFolderId,
        driveFolderName: folderName,
        admissionId: docData.id,
        joinedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "students"), studentPayload);

      // 7. Cleanup Temp Files in Storage
      try {
        setSyncProgress("Cleaning up temporary storage...");
        if (docData.tempPhotoPath) await deleteObject(ref(storage, docData.tempPhotoPath));
        if (docData.tempIdProofPath) await deleteObject(ref(storage, docData.tempIdProofPath));
      } catch (cleanupErr) {
        console.warn("Storage cleanup warning:", cleanupErr);
      }

      toast.success("Admission approved!", {
        description: `${docData.fullName} successfully registered as active student and synchronized to Drive.`
      });
      toast.info("Drive sync completed", { id: "drive-sync-complete-toast" });
    } catch (err: any) {
      console.error(err);
      toast.error("Approval process failed: " + err.message);
    } finally {
      setSyncingId(null);
      setSyncProgress("");
    }
  };

  const handleApproveTeacher = async (docData: RegistrationDoc) => {
    if (!accessToken) {
      toast.error("Please authenticate with Google Drive first.");
      setActiveView("config");
      return;
    }
    if (!parentFolderId) {
      toast.error("Configure the Google Drive Parent Folder ID first.");
      setActiveView("config");
      return;
    }
    if (!window.confirm(`Approve application for Sheikh/Sister ${docData.fullName}?`)) return;

    setSyncingId(docData.id);
    setSyncProgress("Creating category folders...");

    try {
      const year = new Date().getFullYear();
      const folderName = `${docData.fullName.replace(/[^a-zA-Z0-9 ]/g, "")}_${year}`;

      // 1. Resolve 'Teachers' Root Category Folder
      const teachersFolderId = await getOrCreateCategoryFolderClient("Teachers", parentFolderId, accessToken);
      setSyncProgress(`Creating directory "Teachers/${folderName}"...`);

      // 2. Create Teacher Folder
      const docFolderId = await createDriveFolder(folderName, accessToken, teachersFolderId);
      setSyncProgress("Faculty folder ready. Syncing files from Storage...");

      let photoResult = { fileId: "", webViewUrl: "" };
      let cvResult = { fileId: "", webViewUrl: "" };
      let idProofResult = { fileId: "", webViewUrl: "" };

      // 3. Sync Photo
      if (docData.tempPhotoPath) {
        setSyncProgress("Downloading profile photo...");
        const res = await downloadTempFile({ data: docData.tempPhotoPath });
        if (res.success && res.base64) {
          setSyncProgress("Syncing profile photo to Drive...");
          const blob = base64ToBlob(res.base64, "image/jpeg");
          photoResult = await uploadDriveFile(blob, `photo_${docData.fullName.replace(/\s+/g, "_")}.jpg`, docFolderId, accessToken, true);
        }
      }

      // 4. Sync CV
      if (docData.tempCvPath) {
        setSyncProgress("Downloading curriculum vitae (CV)...");
        const res = await downloadTempFile({ data: docData.tempCvPath });
        if (res.success && res.base64) {
          setSyncProgress("Syncing CV to Drive...");
          const isPdf = docData.tempCvUrl?.includes(".pdf");
          const mime = isPdf ? "application/pdf" : "application/octet-stream";
          const ext = isPdf ? ".pdf" : "";
          const blob = base64ToBlob(res.base64, mime);
          cvResult = await uploadDriveFile(blob, `cv_${docData.fullName.replace(/\s+/g, "_")}${ext}`, docFolderId, accessToken, false);
        }
      }

      // 5. Sync ID
      if (docData.tempIdProofPath) {
        setSyncProgress("Downloading government ID...");
        const res = await downloadTempFile({ data: docData.tempIdProofPath });
        if (res.success && res.base64) {
          setSyncProgress("Syncing ID to Drive...");
          const isPdf = docData.tempIdProofUrl?.includes(".pdf");
          const mime = isPdf ? "application/pdf" : "image/jpeg";
          const ext = isPdf ? ".pdf" : ".jpg";
          const blob = base64ToBlob(res.base64, mime);
          idProofResult = await uploadDriveFile(blob, `id_${docData.fullName.replace(/\s+/g, "_")}${ext}`, docFolderId, accessToken, false);
        }
      }

      setSyncProgress("Creating faculty database record...");

      // 6. Update Application Status
      const appRef = doc(db, "teacher_applications", docData.id);
      const updatePayload = {
        status: "approved" as const,
        driveFolderId: docFolderId,
        driveFolderName: folderName,
        photoUrl: photoResult.webViewUrl || docData.tempPhotoUrl || "",
        photoFileId: photoResult.fileId,
        cvUrl: cvResult.webViewUrl || docData.tempCvUrl || "",
        cvFileId: cvResult.fileId,
        idProofUrl: idProofResult.webViewUrl || docData.tempIdProofUrl || "",
        idProofFileId: idProofResult.fileId,
        uploadMethod: "google-oauth-client",
      };
      await updateDoc(appRef, updatePayload);

      // 7. Copy to Teachers Database
      const teacherPayload = {
        fullName: docData.fullName,
        email: docData.email,
        whatsapp: docData.whatsapp,
        country: docData.country,
        qualification: docData.qualification,
        experience: docData.experience,
        photoUrl: photoResult.webViewUrl || docData.tempPhotoUrl || "",
        photoFileId: photoResult.fileId,
        cvUrl: cvResult.webViewUrl || docData.tempCvUrl || "",
        cvFileId: cvResult.fileId,
        idProofUrl: idProofResult.webViewUrl || docData.tempIdProofUrl || "",
        idProofFileId: idProofResult.fileId,
        driveFolderId: docFolderId,
        driveFolderName: folderName,
        applicationId: docData.id,
        status: "approved",
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "teachers"), teacherPayload);

      // 8. Storage Cleanup
      try {
        setSyncProgress("Cleaning up temporary storage...");
        if (docData.tempPhotoPath) await deleteObject(ref(storage, docData.tempPhotoPath));
        if (docData.tempCvPath) await deleteObject(ref(storage, docData.tempCvPath));
        if (docData.tempIdProofPath) await deleteObject(ref(storage, docData.tempIdProofPath));
      } catch (cleanupErr) {
        console.warn("Storage cleanup warning:", cleanupErr);
      }

      toast.success("Teacher approved!", {
        description: `${docData.fullName} successfully registered as active faculty and synced to Drive.`
      });
      toast.info("Drive sync completed", { id: "drive-sync-complete-toast" });
    } catch (err: any) {
      console.error(err);
      toast.error("Approval failed: " + err.message);
    } finally {
      setSyncingId(null);
      setSyncProgress("");
    }
  };

  // Rejection Actions
  const handleRejectAdmission = async (docId: string, notes: string) => {
    if (!window.confirm("Are you sure you want to reject this admission?")) return;
    try {
      const admissionRef = doc(db, "admissions", docId);
      await updateDoc(admissionRef, {
        status: "rejected" as const,
        internalNotes: notes || ""
      });
      toast.success("Admission rejected", {
        description: "Application moved to rejected archives."
      });
    } catch (err: any) {
      toast.error("Failed to reject admission: " + err.message);
    }
  };

  const handleRejectTeacher = async (docId: string, notes: string) => {
    if (!window.confirm("Are you sure you want to reject this teacher applicant?")) return;
    try {
      const appRef = doc(db, "teacher_applications", docId);
      await updateDoc(appRef, {
        status: "rejected" as const,
        internalNotes: notes || ""
      });
      toast.success("Teacher rejected", {
        description: "Application moved to rejected archives."
      });
    } catch (err: any) {
      toast.error("Failed to reject teacher: " + err.message);
    }
  };

  // Permanent Delete Actions (super_admin only)
  const handleDeleteAdmission = async (docData: RegistrationDoc) => {
    if (adminProfile?.role !== "super_admin") {
      toast.error("Permission denied. Only Super Administrators can delete records permanently.");
      return;
    }
    if (!window.confirm(`PERMANENT DELETE: Remove all traces of ${docData.fullName} from admissions registry? This cannot be undone.`)) return;

    try {
      await deleteDoc(doc(db, "admissions", docData.id));
      
      // Attempt storage cleanup if temp files exist
      if (docData.tempPhotoPath) await deleteObject(ref(storage, docData.tempPhotoPath)).catch(() => {});
      if (docData.tempIdProofPath) await deleteObject(ref(storage, docData.tempIdProofPath)).catch(() => {});
      
      toast.success("Admission record permanently deleted.");
    } catch (err: any) {
      toast.error("Deletion failed: " + err.message);
    }
  };

  const handleDeleteTeacherApp = async (docData: RegistrationDoc) => {
    if (adminProfile?.role !== "super_admin") {
      toast.error("Permission denied. Only Super Administrators can delete records permanently.");
      return;
    }
    if (!window.confirm(`PERMANENT DELETE: Remove all traces of ${docData.fullName} from teacher registry?`)) return;

    try {
      await deleteDoc(doc(db, "teacher_applications", docData.id));
      
      if (docData.tempPhotoPath) await deleteObject(ref(storage, docData.tempPhotoPath)).catch(() => {});
      if (docData.tempCvPath) await deleteObject(ref(storage, docData.tempCvPath)).catch(() => {});
      if (docData.tempIdProofPath) await deleteObject(ref(storage, docData.tempIdProofPath)).catch(() => {});
      
      toast.success("Teacher application permanently deleted.");
    } catch (err: any) {
      toast.error("Deletion failed: " + err.message);
    }
  };

  // Note updates
  const handleSaveNotes = async (docId: string, isTeacher: boolean) => {
    try {
      const docRef = doc(db, isTeacher ? "teacher_applications" : "admissions", docId);
      await updateDoc(docRef, { internalNotes: tempNotes });
      toast.success("Internal notes updated successfully.");
      setUpdatingNotesId(null);
    } catch (err: any) {
      toast.error("Failed to update notes: " + err.message);
    }
  };

  // Database Backup to Google Drive (super_admin only)
  const handleBackupDatabase = async () => {
    if (adminProfile?.role !== "super_admin") {
      toast.error("Access denied. Only Super Administrators can trigger database backups.");
      return;
    }
    if (!accessToken) {
      toast.error("Please authenticate with Google Drive first.");
      setActiveView("config");
      return;
    }
    if (!parentFolderId) {
      toast.error("Configure Google Drive Parent Folder ID first.");
      setActiveView("config");
      return;
    }
    if (!window.confirm("Trigger manual backup of all Firestore collections to Google Drive?")) return;

    setBackingUp(true);
    try {
      // 1. Fetch collections
      const fetchCollectionData = async (colName: string) => {
        const snap = await getDocs(collection(db, colName));
        const list: any[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        return list;
      };

      const backupObj = {
        backupDate: new Date().toISOString(),
        backupTriggeredBy: adminProfile.email,
        admissions: await fetchCollectionData("admissions"),
        students: await fetchCollectionData("students"),
        teachers: await fetchCollectionData("teachers"),
        teacher_applications: await fetchCollectionData("teacher_applications"),
        courses: await fetchCollectionData("courses"),
        achievements: await fetchCollectionData("achievements"),
        settings: await fetchCollectionData("settings"),
      };

      // 2. Format JSON and create File Blob
      const jsonString = JSON.stringify(backupObj, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const filename = `db_backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

      // 3. Resolve 'Backups' folder in Drive
      const backupsFolderId = await getOrCreateCategoryFolderClient("Backups", parentFolderId, accessToken);
      
      // 4. Upload file
      const upload = await uploadDriveFile(blob, filename, backupsFolderId, accessToken, false);

      toast.success("Backup successfully completed!", {
        description: `Export file "${filename}" saved to Google Drive (ID: ${upload.fileId}).`
      });
      toast.info("Drive sync completed", { id: "backup-drive-sync" });
    } catch (err: any) {
      console.error(err);
      toast.error("Backup failed: " + err.message);
    } finally {
      setBackingUp(false);
    }
  };

  // Filter Data client-side
  const filteredAdmissions = useMemo(() => {
    return allAdmissions.filter((doc) => {
      if (doc.status !== admissionsTab) return false;
      
      const queryLower = searchQuery.toLowerCase();
      const matchQuery = 
        doc.fullName.toLowerCase().includes(queryLower) ||
        doc.email.toLowerCase().includes(queryLower) ||
        doc.whatsapp.includes(queryLower);
      
      const selectedCourse = doc.selectedCourse || doc.course || "";
      const matchCourse = !courseFilter || selectedCourse === courseFilter;
      const matchCountry = !countryFilter || doc.country === countryFilter;
      
      return matchQuery && matchCourse && matchCountry;
    });
  }, [allAdmissions, admissionsTab, searchQuery, courseFilter, countryFilter]);

  const filteredTeachers = useMemo(() => {
    return allTeacherApps.filter((doc) => {
      if (doc.status !== teachersTab) return false;

      const queryLower = searchQuery.toLowerCase();
      const matchQuery = 
        doc.fullName.toLowerCase().includes(queryLower) ||
        doc.email.toLowerCase().includes(queryLower) ||
        doc.whatsapp.includes(queryLower);

      const matchCountry = !countryFilter || doc.country === countryFilter;

      return matchQuery && matchCountry;
    });
  }, [allTeacherApps, teachersTab, searchQuery, countryFilter]);

  // Extract unique courses and countries for dropdown filters
  const coursesList = useMemo(() => {
    const set = new Set<string>();
    allAdmissions.forEach((a) => {
      const c = a.selectedCourse || a.course;
      if (c) set.add(c);
    });
    return Array.from(set);
  }, [allAdmissions]);

  const countriesList = useMemo(() => {
    const set = new Set<string>();
    allAdmissions.forEach((a) => { if (a.country) set.add(a.country); });
    allTeacherApps.forEach((t) => { if (t.country) set.add(t.country); });
    return Array.from(set);
  }, [allAdmissions, allTeacherApps]);

  // Merge activity logs for Feed
  const recentActivities = useMemo(() => {
    const activities: { id: string; type: "admission" | "teacher"; title: string; time: any; status: string; label: string }[] = [];
    
    allAdmissions.forEach((a) => {
      let title = "";
      if (a.status === "pending") title = `New student application by ${a.fullName}`;
      else if (a.status === "approved") title = `Student admission approved: ${a.fullName}`;
      else title = `Student admission rejected: ${a.fullName}`;
      
      activities.push({
        id: `adm-${a.id}-${a.status}`,
        type: "admission",
        title,
        time: a.submittedAt || a.createdAt,
        status: a.status,
        label: a.selectedCourse || a.course || "Course Study"
      });
    });

    allTeacherApps.forEach((t) => {
      let title = "";
      if (t.status === "pending") title = `New teacher application by ${t.fullName}`;
      else if (t.status === "approved") title = `Teacher registration approved: ${t.fullName}`;
      else title = `Teacher application rejected: ${t.fullName}`;

      activities.push({
        id: `tch-${t.id}-${t.status}`,
        type: "teacher",
        title,
        time: t.submittedAt || t.createdAt,
        status: t.status,
        label: "Faculty Candidate"
      });
    });

    return activities
      .sort((a, b) => {
        const secondsA = a.time?.seconds || 0;
        const secondsB = b.time?.seconds || 0;
        return secondsB - secondsA;
      })
      .slice(0, 10);
  }, [allAdmissions, allTeacherApps]);

  // Render Loader screen
  if (checkingAuth) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground gap-4">
        <Loader2 className="size-10 animate-spin text-emerald-academy" />
        <p className="font-serif text-lg font-bold">Authenticating Administrator Session...</p>
      </div>
    );
  }

  // Render Seeding screen if database is empty
  if (noAdminsExist) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-light/20 via-background to-background p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-academy text-white mx-auto mb-4">
              <FolderSync className="size-8" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Configure Admin Database</h1>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              No administrator accounts were detected in this Firestore database instance. Configure the root Super Administrator account to seed the configuration.
            </p>
          </div>

          <form onSubmit={handleSeedAdminSubmit} className="space-y-4 text-left">
            <div className="flex flex-col">
              <Label htmlFor="seedName" className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
              <Input id="seedName" value={seedName} onChange={(e) => setSeedName(e.target.value)} placeholder="e.g. Master Administrator" required className="bg-muted/10 border-border" />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="seedEmail" className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
              <Input id="seedEmail" type="email" value={seedEmail} onChange={(e) => setSeedEmail(e.target.value)} placeholder="admin@zubairacademy.com" required className="bg-muted/10 border-border" />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="seedPass" className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Access Password</Label>
              <Input id="seedPass" type="password" value={seedPassword} onChange={(e) => setSeedPassword(e.target.value)} placeholder="••••••••" required className="bg-muted/10 border-border" />
            </div>

            <Button type="submit" disabled={seeding} className="w-full bg-emerald-academy hover:bg-emerald-academy/95 text-white py-2.5 rounded-lg shadow-sm font-semibold mt-4">
              {seeding ? <><Loader2 className="size-4 animate-spin mr-2" /> Initializing Portal...</> : "Initialize Super Admin"}
            </Button>
          </form>
        </div>
      </section>
    );
  }

  // Render Login Panel if not authenticated
  if (!adminProfile) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-light/20 via-background to-background p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-academy text-white mx-auto mb-4">
              <Lock className="size-6" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Academy Portal Log In</h1>
            <p className="text-xs text-muted-foreground mt-2">Enter credentials associated with your administrator account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="flex flex-col">
              <Label htmlFor="email" className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Email</Label>
              <Input id="email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@zubairacademy.com" required className="bg-muted/10 border-border" />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="pass" className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
              <Input id="pass" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" required className="bg-muted/10 border-border" />
            </div>

            <Button type="submit" disabled={loginLoading} className="w-full bg-emerald-academy hover:bg-emerald-academy/95 text-white py-2.5 rounded-lg shadow-sm font-semibold mt-4">
              {loginLoading ? <><Loader2 className="size-4 animate-spin mr-2" /> Validating Credentials...</> : "Access Administrator Panel"}
            </Button>
          </form>
        </div>
      </section>
    );
  }

  // Authenticated Admin Dashboard Layout
  return (
    <section className="min-h-screen bg-muted/10 dark:bg-zinc-950/20 text-left flex flex-col md:flex-row">
      
      {/* Sidebar Nav */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card flex flex-col justify-between shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-academy text-white">
              <GraduationCap className="size-5" />
            </div>
            <span className="font-serif text-lg font-bold text-foreground">Zubair Academy</span>
          </div>

          <div className="mb-6 bg-muted/50 p-3 rounded-lg border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Operator</p>
            <p className="font-serif font-bold text-foreground text-sm truncate">{adminProfile.fullName}</p>
            <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded mt-1.5 ${
              adminProfile.role === "super_admin" ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" : "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
            }`}>
              {adminProfile.role === "super_admin" ? "Super Admin" : "Admin Staff"}
            </span>
          </div>

          <nav className="space-y-1.5">
            <SidebarLink active={activeView === "dashboard"} onClick={() => setActiveView("dashboard")}>
              <LayoutDashboard className="size-4" /> Dashboard Overview
            </SidebarLink>
            <SidebarLink active={activeView === "admissions"} onClick={() => setActiveView("admissions")}>
              <GraduationCap className="size-4" /> Student Admissions
              {allAdmissions.filter((a) => a.status === "pending").length > 0 && (
                <span className="ml-auto bg-emerald-academy text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {allAdmissions.filter((a) => a.status === "pending").length}
                </span>
              )}
            </SidebarLink>
            <SidebarLink active={activeView === "teachers"} onClick={() => setActiveView("teachers")}>
              <Users className="size-4" /> Faculty Applications
              {allTeacherApps.filter((t) => t.status === "pending").length > 0 && (
                <span className="ml-auto bg-emerald-academy text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {allTeacherApps.filter((t) => t.status === "pending").length}
                </span>
              )}
            </SidebarLink>
            {adminProfile.role === "super_admin" && (
              <SidebarLink active={activeView === "backups"} onClick={() => setActiveView("backups")}>
                <Database className="size-4" /> Database Backups
              </SidebarLink>
            )}
            <SidebarLink active={activeView === "config"} onClick={() => setActiveView("config")}>
              <Settings className="size-4" /> Settings &amp; API
            </SidebarLink>
          </nav>
        </div>

        <div className="p-6 border-t border-border flex flex-col gap-2">
          {accessToken ? (
            <div className="flex items-center justify-between text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 p-2.5 rounded-lg dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
              <span className="flex items-center gap-1.5"><Check className="size-3.5" /> Drive Connected</span>
              <button onClick={handleDisconnectDrive} className="text-xs font-bold underline hover:no-underline text-emerald-800 dark:text-emerald-300">Disconnect</button>
            </div>
          ) : (
            <Button onClick={handleGoogleLogin} variant="outline" className="w-full text-xs font-bold text-[#4285F4] border-[#4285F4]/30 hover:bg-[#4285F4]/5 h-9 flex items-center justify-center gap-2">
              <Key className="size-3.5" /> Connect Google Drive
            </Button>
          )}

          <Button onClick={handleLogout} variant="ghost" className="w-full text-muted-foreground hover:text-foreground h-9 justify-start gap-2">
            <LogOut className="size-4" /> End Session
          </Button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 p-6 md:p-10 flex flex-col gap-6 overflow-hidden">
        
        {/* Syncing/Processing Notification Bar */}
        {(syncingId || backingUp) && (
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 text-xs flex items-center gap-3 animate-pulse dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-300">
            <Loader2 className="size-5 shrink-0 animate-spin text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-bold">{backingUp ? "Backing up collections..." : "Uploading applicant documentation to Google Drive..."}</p>
              <p className="text-blue-700/80 font-mono mt-0.5 dark:text-blue-400/70">{syncProgress || "Processing drive metadata sync..."}</p>
            </div>
          </div>
        )}

        {/* 1. Dashboard Overview View */}
        {activeView === "dashboard" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground">System Summary Overview</h2>
              <p className="text-xs text-muted-foreground mt-1">Review live student counts, pending requests, and administrative operations feed.</p>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard title="Total Admissions" value={allAdmissions.length} desc="Student requests" icon={<FileText className="size-5" />} />
              <StatCard title="Pending Admissions" value={allAdmissions.filter((a) => a.status === "pending").length} desc="Awaiting review" icon={<Clock className="size-5" />} highlight />
              <StatCard title="Approved Students" value={approvedStudents.length} desc="Active database" icon={<GraduationCap className="size-5 text-emerald-academy" />} />
              <StatCard title="Pending Teachers" value={allTeacherApps.filter((t) => t.status === "pending").length} desc="Scholar applicants" icon={<Clock className="size-5" />} highlight />
              <StatCard title="Approved Teachers" value={approvedTeachers.length} desc="Active faculty" icon={<Users className="size-5 text-emerald-academy" />} />
            </div>

            {/* Activity Feed */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-foreground mb-4">Real-time Administrative Activity Feed</h3>
              {recentActivities.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">No recent registry changes or form submissions detected.</div>
              ) : (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {recentActivities.map((act, idx) => (
                      <li key={act.id}>
                        <div className="relative pb-8">
                          {idx !== recentActivities.length - 1 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                          )}
                          <div className="relative flex space-x-3 text-left">
                            <div>
                              <span className={`size-8 rounded-full flex items-center justify-center ring-8 ring-card ${
                                act.status === "approved" 
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" 
                                  : act.status === "rejected" 
                                    ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" 
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                              }`}>
                                {act.status === "approved" ? <Check className="size-4" /> : act.status === "rejected" ? <X className="size-4" /> : <Clock className="size-4" />}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-xs text-foreground font-semibold">{act.title}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{act.label}</p>
                              </div>
                              <div className="text-right text-[10px] whitespace-nowrap text-muted-foreground font-mono">
                                {act.time ? new Date(act.time.seconds * 1000).toLocaleString() : "Just now"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Admissions Panel (Students) */}
        {activeView === "admissions" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground">Student Admissions Registry</h2>
                <p className="text-xs text-muted-foreground mt-1">Review student applications, upload documents to Google Drive, and activate student profiles.</p>
              </div>

              {/* Subtabs */}
              <div className="flex border border-border rounded-lg bg-card overflow-hidden shrink-0">
                <SubTabButton active={admissionsTab === "pending"} onClick={() => setAdmissionsTab("pending")}>
                  Pending ({allAdmissions.filter((a) => a.status === "pending").length})
                </SubTabButton>
                <SubTabButton active={admissionsTab === "approved"} onClick={() => setAdmissionsTab("approved")}>
                  Approved ({allAdmissions.filter((a) => a.status === "approved").length})
                </SubTabButton>
                <SubTabButton active={admissionsTab === "rejected"} onClick={() => setAdmissionsTab("rejected")}>
                  Rejected ({allAdmissions.filter((a) => a.status === "rejected").length})
                </SubTabButton>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid gap-3 sm:grid-cols-3 bg-card border border-border p-4 rounded-xl">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, email..." className="pl-9 bg-muted/10 border-border" />
              </div>

              <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="w-full rounded-md border border-border bg-muted/10 px-3 py-1.5 text-xs sm:text-sm text-foreground focus:outline-none">
                <option value="">All Courses</option>
                {coursesList.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="w-full rounded-md border border-border bg-muted/10 px-3 py-1.5 text-xs sm:text-sm text-foreground focus:outline-none">
                <option value="">All Countries</option>
                {countriesList.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* List */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              {filteredAdmissions.length === 0 ? (
                <EmptyState text={`No ${admissionsTab} student admissions match selected filters.`} />
              ) : (
                <div className="divide-y divide-border">
                  {filteredAdmissions.map((student) => (
                    <div key={student.id} className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:bg-muted/5 transition">
                      <div className="space-y-2 max-w-xl text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-lg font-bold text-foreground">{student.fullName}</h4>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            student.status === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40" : student.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-950/40" : "bg-amber-100 text-amber-700 dark:bg-amber-950/40"
                          }`}>
                            {student.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {student.email} | WhatsApp: <a href={whatsappLink(`Assalamu Alaikum ${student.fullName}, regarding your registry request.`)} target="_blank" rel="noreferrer" className="font-mono text-emerald-academy underline hover:no-underline">{student.whatsapp}</a> | Country: {student.country}
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-muted/50 p-2.5 rounded-lg text-[11px] border border-border text-foreground">
                          <p><strong>Course:</strong> {student.selectedCourse || student.course || "N/A"}</p>
                          <p><strong>Gender:</strong> {student.gender || "N/A"}</p>
                          <p><strong>Education:</strong> {student.education || "N/A"}</p>
                          <p><strong>DOB:</strong> {student.dateOfBirth || "N/A"}</p>
                        </div>

                        {student.driveFolderId && (
                          <div className="text-[10px] bg-emerald-50 border border-emerald-100 p-2 rounded text-emerald-700 flex items-center gap-1.5 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
                            <FolderSync className="size-3.5" /> Google Drive Folder:
                            <a href={`https://drive.google.com/drive/folders/${student.driveFolderId}`} target="_blank" rel="noreferrer" className="underline font-bold hover:no-underline font-mono truncate">{student.driveFolderName || student.driveFolderId}</a>
                          </div>
                        )}

                        {/* Internal Notes Section */}
                        <div className="text-[11px] space-y-1">
                          <p className="font-bold text-muted-foreground flex items-center gap-1"><MessageSquare className="size-3.5" /> Internal Notes:</p>
                          {updatingNotesId === student.id ? (
                            <div className="flex gap-2 mt-1">
                              <Input value={tempNotes} onChange={(e) => setTempNotes(e.target.value)} className="h-8 text-xs bg-card" />
                              <Button onClick={() => handleSaveNotes(student.id, false)} className="h-8 bg-emerald-academy text-white text-xs px-3">Save</Button>
                              <Button onClick={() => setUpdatingNotesId(null)} variant="outline" className="h-8 text-xs px-3">Cancel</Button>
                            </div>
                          ) : (
                            <p className="text-muted-foreground italic flex items-center justify-between bg-muted/30 p-2 rounded border border-border">
                              <span>{student.internalNotes || "No internal notes added."}</span>
                              <button onClick={() => { setUpdatingNotesId(student.id); setTempNotes(student.internalNotes || ""); }} className="text-emerald-academy underline ml-2 font-bold cursor-pointer">Edit</button>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Document List & Actions */}
                      <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
                        <div className="flex flex-wrap gap-2">
                          {/* Render Profile Photo Link */}
                          {(student.photoUrl || student.tempPhotoUrl) && (
                            <Button variant="outline" size="sm" onClick={() => setPreviewDoc({ name: `Profile Photo - ${student.fullName}`, url: student.photoUrl || student.tempPhotoUrl || "", type: "image" })} className="text-xs h-8 border-border flex items-center gap-1 bg-card">
                              <Eye className="size-3.5" /> Photo
                            </Button>
                          )}

                          {/* Render ID Proof Link */}
                          {(student.idProofUrl || student.tempIdProofUrl) && (
                            <Button variant="outline" size="sm" onClick={() => {
                              const url = student.idProofUrl || student.tempIdProofUrl || "";
                              const isPdf = url.includes(".pdf") || student.tempIdProofPath?.includes(".pdf");
                              setPreviewDoc({ name: `ID Proof - ${student.fullName}`, url, type: isPdf ? "pdf" : "image" });
                            }} className="text-xs h-8 border-border flex items-center gap-1 bg-card">
                              <FileText className="size-3.5" /> ID Proof
                            </Button>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {student.status === "pending" && (
                          <div className="flex gap-2 w-full lg:w-auto justify-end">
                            <Button onClick={() => handleApproveAdmission(student)} disabled={!!syncingId} className="bg-emerald-academy hover:bg-emerald-academy/95 text-white text-xs h-8 flex items-center gap-1.5 shadow-sm font-semibold">
                              <CheckCircle className="size-4" /> Approve &amp; Sync
                            </Button>
                            <Button onClick={() => handleRejectAdmission(student.id, student.internalNotes || "")} disabled={!!syncingId} variant="outline" className="text-xs h-8 text-destructive border-destructive/20 hover:bg-destructive/5 font-semibold">
                              <XCircle className="size-4 mr-1 inline" /> Reject
                            </Button>
                          </div>
                        )}

                        {student.status !== "pending" && adminProfile.role === "super_admin" && (
                          <Button onClick={() => handleDeleteAdmission(student)} variant="destructive" className="h-8 text-xs font-semibold px-3 flex items-center gap-1.5 ml-auto">
                            <Trash2 className="size-3.5" /> Permanently Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Teacher Applications View */}
        {activeView === "teachers" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground">Teacher Applications Registry</h2>
                <p className="text-xs text-muted-foreground mt-1">Review incoming teacher applications, check credentials, CVs, and approve faculty profiles.</p>
              </div>

              {/* Subtabs */}
              <div className="flex border border-border rounded-lg bg-card overflow-hidden shrink-0">
                <SubTabButton active={teachersTab === "pending"} onClick={() => setTeachersTab("pending")}>
                  Pending ({allTeacherApps.filter((t) => t.status === "pending").length})
                </SubTabButton>
                <SubTabButton active={teachersTab === "approved"} onClick={() => setTeachersTab("approved")}>
                  Approved ({allTeacherApps.filter((t) => t.status === "approved").length})
                </SubTabButton>
                <SubTabButton active={teachersTab === "rejected"} onClick={() => setTeachersTab("rejected")}>
                  Rejected ({allTeacherApps.filter((t) => t.status === "rejected").length})
                </SubTabButton>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid gap-3 sm:grid-cols-2 bg-card border border-border p-4 rounded-xl">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search faculty by name..." className="pl-9 bg-muted/10 border-border" />
              </div>

              <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="w-full rounded-md border border-border bg-muted/10 px-3 py-1.5 text-xs sm:text-sm text-foreground focus:outline-none">
                <option value="">All Countries</option>
                {countriesList.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* List */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              {filteredTeachers.length === 0 ? (
                <EmptyState text={`No ${teachersTab} teacher applications match selected filters.`} />
              ) : (
                <div className="divide-y divide-border">
                  {filteredTeachers.map((teacher) => (
                    <div key={teacher.id} className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:bg-muted/5 transition">
                      <div className="space-y-2 max-w-xl text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-lg font-bold text-foreground">{teacher.fullName}</h4>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            teacher.status === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40" : teacher.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-950/40" : "bg-amber-100 text-amber-700 dark:bg-amber-950/40"
                          }`}>
                            {teacher.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {teacher.email} | WhatsApp: <a href={whatsappLink(`Assalamu Alaikum Sheikh ${teacher.fullName}, regarding your faculty request.`)} target="_blank" rel="noreferrer" className="font-mono text-emerald-academy underline hover:no-underline">{teacher.whatsapp}</a> | Residence: {teacher.country}
                        </p>
                        <div className="space-y-1 text-xs text-foreground bg-muted/50 p-3 rounded-lg border border-border">
                          <p><strong>Academic Qualifications:</strong> {teacher.qualification}</p>
                          <p><strong>Teaching Experience:</strong> {teacher.experience}</p>
                        </div>

                        {teacher.driveFolderId && (
                          <div className="text-[10px] bg-emerald-50 border border-emerald-100 p-2 rounded text-emerald-700 flex items-center gap-1.5 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
                            <FolderSync className="size-3.5" /> Google Drive Folder:
                            <a href={`https://drive.google.com/drive/folders/${teacher.driveFolderId}`} target="_blank" rel="noreferrer" className="underline font-bold hover:no-underline font-mono truncate">{teacher.driveFolderName || teacher.driveFolderId}</a>
                          </div>
                        )}

                        {/* Internal Notes */}
                        <div className="text-[11px] space-y-1">
                          <p className="font-bold text-muted-foreground flex items-center gap-1"><MessageSquare className="size-3.5" /> Internal Notes:</p>
                          {updatingNotesId === teacher.id ? (
                            <div className="flex gap-2 mt-1">
                              <Input value={tempNotes} onChange={(e) => setTempNotes(e.target.value)} className="h-8 text-xs bg-card" />
                              <Button onClick={() => handleSaveNotes(teacher.id, true)} className="h-8 bg-emerald-academy text-white text-xs px-3">Save</Button>
                              <Button onClick={() => setUpdatingNotesId(null)} variant="outline" className="h-8 text-xs px-3">Cancel</Button>
                            </div>
                          ) : (
                            <p className="text-muted-foreground italic flex items-center justify-between bg-muted/30 p-2 rounded border border-border">
                              <span>{teacher.internalNotes || "No internal notes added."}</span>
                              <button onClick={() => { setUpdatingNotesId(teacher.id); setTempNotes(teacher.internalNotes || ""); }} className="text-emerald-academy underline ml-2 font-bold cursor-pointer">Edit</button>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Documents & Actions */}
                      <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
                        <div className="flex flex-wrap gap-2">
                          {(teacher.photoUrl || teacher.tempPhotoUrl) && (
                            <Button variant="outline" size="sm" onClick={() => setPreviewDoc({ name: `Faculty Photo - ${teacher.fullName}`, url: teacher.photoUrl || teacher.tempPhotoUrl || "", type: "image" })} className="text-xs h-8 border-border flex items-center gap-1 bg-card">
                              <Eye className="size-3.5" /> Photo
                            </Button>
                          )}

                          {(teacher.cvUrl || teacher.tempCvUrl) && (
                            <Button variant="outline" size="sm" onClick={() => {
                              const url = teacher.cvUrl || teacher.tempCvUrl || "";
                              const isPdf = url.includes(".pdf") || teacher.tempCvPath?.includes(".pdf");
                              setPreviewDoc({ name: `Faculty CV - ${teacher.fullName}`, url, type: isPdf ? "pdf" : "other" });
                            }} className="text-xs h-8 border-border flex items-center gap-1 bg-card">
                              <FileText className="size-3.5" /> View CV
                            </Button>
                          )}

                          {(teacher.idProofUrl || teacher.tempIdProofUrl) && (
                            <Button variant="outline" size="sm" onClick={() => {
                              const url = teacher.idProofUrl || teacher.tempIdProofUrl || "";
                              const isPdf = url.includes(".pdf") || teacher.tempIdProofPath?.includes(".pdf");
                              setPreviewDoc({ name: `Faculty ID - ${teacher.fullName}`, url, type: isPdf ? "pdf" : "image" });
                            }} className="text-xs h-8 border-border flex items-center gap-1 bg-card">
                              <FileText className="size-3.5" /> ID Proof
                            </Button>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {teacher.status === "pending" && (
                          <div className="flex gap-2 w-full lg:w-auto justify-end">
                            <Button onClick={() => handleApproveTeacher(teacher)} disabled={!!syncingId} className="bg-emerald-academy hover:bg-emerald-academy/95 text-white text-xs h-8 flex items-center gap-1.5 shadow-sm font-semibold">
                              <CheckCircle className="size-4" /> Approve &amp; Sync
                            </Button>
                            <Button onClick={() => handleRejectTeacher(teacher.id, teacher.internalNotes || "")} disabled={!!syncingId} variant="outline" className="text-xs h-8 text-destructive border-destructive/20 hover:bg-destructive/5 font-semibold">
                              <XCircle className="size-4 mr-1 inline" /> Reject
                            </Button>
                          </div>
                        )}

                        {teacher.status !== "pending" && adminProfile.role === "super_admin" && (
                          <Button onClick={() => handleDeleteTeacherApp(teacher)} variant="destructive" className="h-8 text-xs font-semibold px-3 flex items-center gap-1.5 ml-auto">
                            <Trash2 className="size-3.5" /> Permanently Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Database Backups View (super_admin only) */}
        {activeView === "backups" && adminProfile.role === "super_admin" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground">Database Backup Center</h2>
              <p className="text-xs text-muted-foreground mt-1">Export entire Firestore document registries and upload them as JSON backups to Google Drive.</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2 max-w-xl text-left">
                <h3 className="font-serif text-lg font-bold text-foreground">Manual Registry Backup Export</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This command fetches all records in <code className="bg-muted px-1.5 py-0.5 rounded font-mono">admissions</code>, <code className="bg-muted px-1.5 py-0.5 rounded font-mono">students</code>, <code className="bg-muted px-1.5 py-0.5 rounded font-mono">teachers</code>, <code className="bg-muted px-1.5 py-0.5 rounded font-mono">teacher_applications</code>, and configuration settings, bundles them into a formatted JSON archive, and automatically syncs it under the folder <code className="bg-muted px-1.5 py-0.5 rounded font-mono">Zubair Online Academy/Backups/</code>.
                </p>
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-4 text-xs text-amber-700 leading-relaxed dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400 flex gap-2.5">
                  <AlertTriangle className="size-5 shrink-0" />
                  <p><strong>Note for Security:</strong> Access to Backup Triggering and registry downloads is strictly limited to accounts with Super Administrator authorization privileges.</p>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <Button onClick={handleBackupDatabase} disabled={backingUp || !accessToken} className="w-full bg-emerald-academy hover:bg-emerald-academy/95 text-white font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-2.5 shadow-sm">
                  {backingUp ? <><Loader2 className="size-5 animate-spin" /> Compiling Backup...</> : <><FileDown className="size-5" /> Backup Database</>}
                </Button>
                {!accessToken && <p className="text-[10px] text-destructive font-bold text-center mt-2">Connect Google Drive to Backup</p>}
              </div>
            </div>
          </div>
        )}

        {/* 5. Configuration Settings View */}
        {activeView === "config" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground">API Credentials &amp; Folder Config</h2>
              <p className="text-xs text-muted-foreground mt-1">Configure client-side OAuth details, redirect boundaries, and default Google Drive target folders.</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
              <h3 className="font-serif text-xl font-semibold text-foreground">Google OAuth API Setup</h3>
              
              <div className="grid gap-6 md:grid-cols-2 text-left">
                <div className="flex flex-col">
                  <Label className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Google OAuth Client ID</Label>
                  <Input 
                    type="text" 
                    value={googleClientId} 
                    onChange={(e) => setGoogleClientId(e.target.value)} 
                    placeholder="e.g. xxxxxxxx.apps.googleusercontent.com"
                    className="bg-muted/10 border-border"
                  />
                  <span className="mt-1.5 text-[10px] text-muted-foreground">
                    Google Identity console client credentials. Needed to generate browser OAuth authentication tokens.
                  </span>
                </div>

                <div className="flex flex-col">
                  <Label className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Google Drive Parent Folder ID</Label>
                  <Input 
                    type="text" 
                    value={parentFolderId} 
                    onChange={(e) => setParentFolderId(e.target.value)} 
                    placeholder="e.g. 1djlvhpbBXsGomwCneG6tuJ17-..."
                    className="bg-muted/10 border-border"
                  />
                  <span className="mt-1.5 text-[10px] text-muted-foreground">
                    Master root folder ID for Zubair Online Academy directories under which categories (Students, Teachers, Backups) live.
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-emerald-light/40 border border-emerald-academy/10 p-4 text-xs text-emerald-academy leading-relaxed dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
                <h5 className="font-bold mb-1">Configuration &amp; Operations guide:</h5>
                <ol className="list-decimal pl-4 space-y-1.5">
                  <li>Retrieve OAuth Client ID credentials from the Google Cloud Console dashboard credentials repository.</li>
                  <li>Assign authorized Javascript Origins to include this domain (e.g. <code className="bg-card px-1 py-0.5 rounded font-mono">http://localhost:3000</code> or your live production domain).</li>
                  <li>Click <strong>Connect Google Drive</strong> to grant OAuth access scoping rights so files sync seamlessly.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-4xl rounded-2xl flex flex-col shadow-2xl h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-serif text-lg font-bold text-foreground truncate">{previewDoc.name}</h3>
              <div className="flex items-center gap-2">
                <a href={previewDoc.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-academy bg-emerald-light/60 px-3 py-1.5 rounded-lg flex items-center gap-1 dark:bg-emerald-950/40">
                  Open Original <ExternalLink className="size-3.5" />
                </a>
                <button onClick={() => setPreviewDoc(null)} className="p-1 text-muted-foreground hover:text-foreground rounded-lg border border-border bg-card">
                  <X className="size-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-muted/10 p-6 flex items-center justify-center overflow-auto">
              {previewDoc.type === "image" ? (
                <img src={previewDoc.url} alt={previewDoc.name} className="max-h-full max-w-full object-contain rounded shadow-md border" />
              ) : previewDoc.type === "pdf" ? (
                <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewDoc.url)}&embedded=true`} className="w-full h-full border rounded shadow-inner" title="PDF Viewer" />
              ) : (
                <div className="text-center p-6 space-y-4">
                  <HelpCircle className="size-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-foreground">Preview unavailable for this file format.</p>
                  <a href={previewDoc.url} target="_blank" rel="noreferrer" className="inline-block bg-emerald-academy text-white px-4 py-2 rounded-lg text-xs font-semibold shadow hover:opacity-90">Open Direct Link</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

function SidebarLink({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition text-left cursor-pointer ${
        active 
          ? "bg-emerald-academy text-white font-bold" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
      }`}
    >
      {children}
    </button>
  );
}

function SubTabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-bold text-xs transition-all cursor-pointer ${
        active 
          ? "bg-emerald-academy text-white" 
          : "text-muted-foreground hover:text-foreground bg-card hover:bg-muted/10"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ title, value, desc, icon, highlight = false }: { title: string; value: number; desc: string; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`bg-card border border-border p-4.5 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden ${
      highlight ? "ring-1 ring-amber-500/20 bg-amber-500/[0.02]" : ""
    }`}>
      <div className="space-y-1 text-left">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
        <h4 className="text-2xl font-bold font-serif text-foreground">{value}</h4>
        <p className="text-[9px] text-muted-foreground">{desc}</p>
      </div>
      <div className={`p-2.5 rounded-lg bg-muted border border-border shrink-0 ${
        highlight ? "bg-amber-100/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400" : "text-muted-foreground"
      }`}>
        {icon}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-20 text-center px-6">
      <HelpCircle className="size-10 text-muted-foreground/60 mx-auto mb-3" />
      <h5 className="font-serif text-base font-bold text-foreground">Registry Empty</h5>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">{text}</p>
    </div>
  );
}
