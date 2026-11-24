import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

export type MediaKind = "image" | "video" | "document";

export interface UploadResult {
  url: string;
  provider: "local" | "cloudinary" | "supabase";
  size: number;
  mimeType: string;
}

const ALLOWED_RULES: Record<
  MediaKind,
  { mimes: string[]; exts: string[]; maxBytes: number; folder: string }
> = {
  image: {
    mimes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    exts: [".jpg", ".jpeg", ".png", ".webp"],
    maxBytes: 10 * 1024 * 1024, // 10 MB
    folder: "images",
  },
  video: {
    mimes: ["video/mp4", "video/webm", "video/quicktime"],
    exts: [".mp4", ".webm", ".mov"],
    maxBytes: 150 * 1024 * 1024, // 150 MB
    folder: "videos",
  },
  document: {
    mimes: ["application/pdf"],
    exts: [".pdf"],
    maxBytes: 10 * 1024 * 1024, // 10 MB
    folder: "documents",
  },
};

export function validateUploadFile(file: File, kind: MediaKind): { ext: string } {
  const rules = ALLOWED_RULES[kind];
  if (!file || file.size === 0) {
    throw new Error("No file provided or file is empty.");
  }

  if (file.size > rules.maxBytes) {
    const maxMb = Math.round(rules.maxBytes / (1024 * 1024));
    throw new Error(`File exceeds maximum allowed size of ${maxMb} MB.`);
  }

  const ext = path.extname(file.name || "").toLowerCase();
  const mime = (file.type || "").toLowerCase();

  if (!rules.exts.includes(ext)) {
    throw new Error(
      `Unsupported file extension "${ext || "unknown"}". Allowed: ${rules.exts.join(", ")}`
    );
  }

  if (mime && !rules.mimes.includes(mime)) {
    throw new Error(`Unsupported MIME type "${mime}". Allowed: ${rules.mimes.join(", ")}`);
  }

  return { ext };
}

function getActiveStorageProvider(): "cloudinary" | "supabase" | "local" {
  const configured = (process.env.STORAGE_PROVIDER || "").toLowerCase();
  if (
    configured === "cloudinary" &&
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    return "cloudinary";
  }
  if (
    configured === "supabase" &&
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return "supabase";
  }
  if (
    !configured &&
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    return "cloudinary";
  }
  if (!configured && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return "supabase";
  }
  return "local";
}

async function uploadToCloudinary(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  kind: MediaKind
): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const folder = `${process.env.CLOUDINARY_UPLOAD_FOLDER || "sanjana-portfolio"}/${ALLOWED_RULES[kind].folder}`;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const resourceType = kind === "video" ? "video" : kind === "document" ? "raw" : "image";

  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
  formData.append("file", blob, fileName);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("folder", folder);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errText}`);
  }

  const data = (await response.json()) as { secure_url: string };
  return {
    url: data.secure_url,
    provider: "cloudinary",
    size: buffer.length,
    mimeType,
  };
}

async function uploadToSupabase(
  buffer: Buffer,
  safeFileName: string,
  mimeType: string,
  kind: MediaKind
): Promise<UploadResult> {
  const supabaseUrl = process.env.SUPABASE_URL!.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "portfolio-media";
  const objectPath = `${ALLOWED_RULES[kind].folder}/${safeFileName}`;

  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": mimeType,
      "x-upsert": "true",
    },
    body: new Uint8Array(buffer),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Supabase Storage upload failed: ${errText}`);
  }

  return {
    url: `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`,
    provider: "supabase",
    size: buffer.length,
    mimeType,
  };
}

async function uploadToLocal(
  buffer: Buffer,
  safeFileName: string,
  mimeType: string,
  kind: MediaKind
): Promise<UploadResult> {
  const subFolder = ALLOWED_RULES[kind].folder;
  const uploadDir = path.join(process.cwd(), "public", "uploads", subFolder);
  await fs.mkdir(uploadDir, { recursive: true });
  const destination = path.join(uploadDir, safeFileName);
  await fs.writeFile(destination, buffer);

  return {
    url: `/uploads/${subFolder}/${safeFileName}`,
    provider: "local",
    size: buffer.length,
    mimeType,
  };
}

export async function storeMediaFile(file: File, kind: MediaKind): Promise<UploadResult> {
  const { ext } = validateUploadFile(file, kind);
  const buffer = Buffer.from(await file.arrayBuffer());
  const uniqueId = crypto.randomUUID();
  const safeFileName = `${Date.now()}-${uniqueId}${ext}`;
  const mimeType = file.type || ALLOWED_RULES[kind].mimes[0];

  const provider = getActiveStorageProvider();

  if (provider === "cloudinary") {
    return uploadToCloudinary(buffer, safeFileName, mimeType, kind);
  }
  if (provider === "supabase") {
    return uploadToSupabase(buffer, safeFileName, mimeType, kind);
  }
  return uploadToLocal(buffer, safeFileName, mimeType, kind);
}

export async function deleteLocalUploadedAsset(assetUrl: string | null | undefined): Promise<void> {
  if (!assetUrl || !assetUrl.startsWith("/uploads/")) return;
  const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");
  const relativePath = assetUrl.replace(/^\/uploads\//, "");
  const targetPath = path.resolve(uploadsRoot, relativePath);
  if (!targetPath.startsWith(uploadsRoot + path.sep)) {
    return;
  }
  try {
    await fs.unlink(targetPath);
  } catch {
    // Ignore missing local file
  }
}
