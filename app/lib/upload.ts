import { put } from "@vercel/blob";
import { env } from "../env";

export async function uploadImageAction({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    // Validate file size (4.5MB limit)
    const maxSize = 4.5 * 1024 * 1024; // 4.5MB
    if (file.size > maxSize) {
      throw new Error("File size must be less than 4.5MB");
    }

    // Generate a unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `images/${timestamp}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      token: env.BLOB_READ_WRITE_TOKEN,
    });

    return {
      success: true,
      url: blob.url,
      filename: blob.pathname,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}
