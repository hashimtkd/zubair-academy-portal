// Google Drive REST API helper for server-side environments (Node.js, Cloudflare Workers).
// Uses native fetch and Web Crypto API to avoid bundling issues in edge environments.

// Helper to base64url-encode
function base64url(arr: Uint8Array): string {
  const binary = Array.from(arr).map(b => String.fromCharCode(b)).join("");
  return btoa(binary)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert a base64 string to a Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Import PEM private key to CryptoKey
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const cleanPem = pem
    .replace(/\\n/g, "")
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\\/g, "") // Robustly strip stray backslash typos
    .replace(/\s+/g, "");
  
  const keyBuffer = base64ToUint8Array(cleanPem);
  return await crypto.subtle.importKey(
    "pkcs8",
    keyBuffer.buffer as ArrayBuffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );
}

// Sign JWT for Google OAuth
async function signJwt(clientEmail: string, privateKeyPem: string): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/drive",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const headerB64 = base64url(stringToUint8Array(JSON.stringify(header)));
  const claimB64 = base64url(stringToUint8Array(JSON.stringify(claim)));
  const payload = `${headerB64}.${claimB64}`;

  const privateKey = await importPrivateKey(privateKeyPem);
  const payloadBytes = stringToUint8Array(payload);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    payloadBytes.buffer as ArrayBuffer
  );

  return `${payload}.${base64url(new Uint8Array(signature))}`;
}

export function isGoogleDriveConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID
  );
}

// Retrieve access token
export async function getGoogleDriveAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) {
    throw new Error("Google Drive credentials not set in environment.");
  }

  const assertion = await signJwt(email, privateKey);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: assertion,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google OAuth failed: ${res.statusText} - ${errorText}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

// Create a folder in Google Drive
export async function createGoogleDriveFolder(
  name: string,
  parentId?: string
): Promise<string> {
  const token = await getGoogleDriveAccessToken();
  const parent = parentId || process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
  
  const body = {
    name,
    mimeType: "application/vnd.google-apps.folder",
    parents: parent ? [parent] : undefined,
  };

  const res = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create folder "${name}": ${err}`);
  }

  const data = (await res.json()) as { id: string };
  return data.id;
}

// Upload file to Google Drive
export async function uploadFileToGoogleDrive(
  file: Blob | File,
  name: string,
  folderId: string,
  makePublic = false
): Promise<{ fileId: string; webViewUrl: string }> {
  const token = await getGoogleDriveAccessToken();
  const boundary = "-------314159265358979323846";
  
  const metadata = {
    name,
    parents: [folderId],
  };

  const metadataHeader = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}\r\n`;
  const fileHeader = `--${boundary}\r\nContent-Type: ${file.type || "application/octet-stream"}\r\n\r\n`;
  const fileFooter = `\r\n--${boundary}--`;

  const encoder = new TextEncoder();
  const metadataBytes = encoder.encode(metadataHeader);
  const headerBytes = encoder.encode(fileHeader);
  const fileBytes = new Uint8Array(await file.arrayBuffer());
  const footerBytes = encoder.encode(fileFooter);

  const totalLength =
    metadataBytes.byteLength + headerBytes.byteLength + fileBytes.byteLength + footerBytes.byteLength;
  const multipartBody = new Uint8Array(totalLength);

  let offset = 0;
  multipartBody.set(metadataBytes, offset);
  offset += metadataBytes.byteLength;
  multipartBody.set(headerBytes, offset);
  offset += headerBytes.byteLength;
  multipartBody.set(fileBytes, offset);
  offset += fileBytes.byteLength;
  multipartBody.set(footerBytes, offset);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Drive upload failed for "${name}": ${err}`);
  }

  const data = (await res.json()) as { id: string; webViewLink?: string };

  if (makePublic) {
    await makeGoogleDriveFilePublic(data.id, token);
  }

  // Construct direct display link for images, else fall back to webViewLink
  const isImage = file.type?.startsWith("image/");
  const webViewUrl = isImage
    ? `https://lh3.googleusercontent.com/d/${data.id}`
    : data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`;

  return {
    fileId: data.id,
    webViewUrl,
  };
}

// Make a file publicly readable
async function makeGoogleDriveFilePublic(fileId: string, token: string): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role: "reader",
      type: "anyone",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Warning: could not make file public: ${err}`);
  }
}

// Helper to look up or create parent folders for Students / Teachers structure
export async function getOrCreateCategoryFolder(categoryName: "Students" | "Teachers" | "Courses" | "Achievements"): Promise<string> {
  const token = await getGoogleDriveAccessToken();
  const parentId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
  
  if (!parentId) {
    throw new Error("GOOGLE_DRIVE_PARENT_FOLDER_ID is required.");
  }

  // Search for the category folder in the parent
  const q = `name = '${categoryName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (res.ok) {
    const data = (await res.json()) as { files: { id: string }[] };
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // If not found, create it
  return await createGoogleDriveFolder(categoryName, parentId);
}
