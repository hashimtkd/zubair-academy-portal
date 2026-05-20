// Google Drive REST API helper using OAuth Access Tokens.
// Safe for both client and server bundlers since it uses standard Web Fetch APIs.

export async function createDriveFolder(
  name: string,
  accessToken: string,
  parentId?: string
): Promise<string> {
  const body = {
    name,
    mimeType: "application/vnd.google-apps.folder",
    parents: parentId ? [parentId] : undefined,
  };

  const res = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
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

export async function uploadDriveFile(
  blob: Blob | File,
  name: string,
  folderId: string,
  accessToken: string,
  makePublic = false
): Promise<{ fileId: string; webViewUrl: string }> {
  const boundary = "-------314159265358979323846";
  
  const metadata = {
    name,
    parents: [folderId],
  };

  const metadataHeader = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}\r\n`;
  const fileHeader = `--${boundary}\r\nContent-Type: ${blob.type || "application/octet-stream"}\r\n\r\n`;
  const fileFooter = `\r\n--${boundary}--`;

  const encoder = new TextEncoder();
  const metadataBytes = encoder.encode(metadataHeader);
  const headerBytes = encoder.encode(fileHeader);
  const fileBytes = new Uint8Array(await blob.arrayBuffer());
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
        Authorization: `Bearer ${accessToken}`,
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
    await makeFilePublic(data.id, accessToken);
  }

  const isImage = blob.type?.startsWith("image/");
  const webViewUrl = isImage
    ? `https://lh3.googleusercontent.com/d/${data.id}`
    : data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`;

  return {
    fileId: data.id,
    webViewUrl,
  };
}

async function makeFilePublic(fileId: string, accessToken: string): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
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

export async function getOrCreateCategoryFolderClient(
  categoryName: "Students" | "Teachers" | "Courses" | "Achievements" | "Backups",
  parentId: string,
  accessToken: string
): Promise<string> {
  const q = `name = '${categoryName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (res.ok) {
    const data = (await res.json()) as { files: { id: string }[] };
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  return await createDriveFolder(categoryName, accessToken, parentId);
}
