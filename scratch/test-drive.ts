// Script to test Google Drive authentication, folder creation, and file uploading.
// Execute using: npx tsx scratch/test-drive.ts

import * as fs from "fs";
import * as path from "path";
import { 
  getOrCreateCategoryFolder, 
  createGoogleDriveFolder, 
  uploadFileToGoogleDrive 
} from "../src/lib/google-drive.server";

// Manually parse .env to avoid external dependencies
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split(/\r?\n/)) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        // Strip outer quotes if any
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.slice(1, -1);
        }
        // Convert literal \n to real newlines
        val = val.replace(/\\n/g, "\n");
        process.env[key] = val;
      }
    }
  }
} catch (e) {
  console.warn("Could not read .env file:", e);
}

async function runTest() {
  console.log("--------------------------------------------------");
  console.log("Starting Google Drive Integration Test...");
  console.log("Service Account Email:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || "";
  console.log("Raw Private Key Length:", rawKey.length);
  
  // Debug what importPrivateKey gets
  const cleanPem = rawKey
    .replace(/\\n/g, "")
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");

  console.log("Clean PEM Length:", cleanPem.length);
  console.log("Clean PEM First 40 chars:", cleanPem.slice(0, 40));
  console.log("Clean PEM Last 40 chars:", cleanPem.slice(-40));
  
  // Let's test atob directly on it
  try {
    const decoded = atob(cleanPem);
    console.log("Direct atob test succeeded! Decoded length:", decoded.length);
  } catch (err: any) {
    console.error("Direct atob test failed:", err.message);
    // Find first invalid base64 character
    const b64Chars = /^[A-Za-z0-9+/=]+$/;
    for (let i = 0; i < cleanPem.length; i++) {
      const char = cleanPem[i];
      if (!b64Chars.test(char)) {
        console.error(`Invalid character at index ${i}: '${char}' (code: ${char.charCodeAt(0)})`);
      }
    }
  }

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.error("Error: Google Drive credentials not loaded. Check .env file path.");
    return;
  }

  try {
    console.log("\n1. Testing category folder lookup/creation for 'Students'...");
    const studentsFolderId = await getOrCreateCategoryFolder("Students");
    console.log("Success! 'Students' folder ID:", studentsFolderId);

    console.log("\n2. Creating a test student folder...");
    const testFolderName = `Test Student ${new Date().getFullYear()}`;
    const testFolderId = await createGoogleDriveFolder(testFolderName, studentsFolderId);
    console.log("Success! Created folder:", testFolderName, "with ID:", testFolderId);

    console.log("\n3. Uploading a dummy file to the test folder...");
    const dummyBlob = new Blob(["Assalamu Alaikum. This is a verification file from the Zubair Online Academy portal integration."], {
      type: "text/plain"
    });
    
    const uploadResult = await uploadFileToGoogleDrive(
      dummyBlob,
      "verification_test.txt",
      testFolderId,
      false // Keep private
    );
    
    console.log("Success! File uploaded.");
    console.log("File ID:", uploadResult.fileId);
    console.log("Web View URL:", uploadResult.webViewUrl);
    console.log("--------------------------------------------------");
    console.log("TEST COMPLETED SUCCESSFULLY! Google Drive is fully operational.");
  } catch (err: any) {
    console.error("\nTest failed!");
    console.error("Error Message:", err.message);
  }
}

runTest();
