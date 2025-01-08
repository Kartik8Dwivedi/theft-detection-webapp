//@ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import sharp from "sharp";
import path from "path";

// Temporary directory for file uploads
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function POST(req: NextRequest) {
  try {
    // Parse the form data (using a workaround since Next.js does not have native multipart support)
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, message: "Invalid content type" },
        { status: 400 }
      );
    }

    // Read the request body as a buffer
    const buffer = await req.arrayBuffer();
    const boundary = contentType.split("boundary=")[1];
    const parts = parseMultipart(Buffer.from(buffer), boundary);

    // Ensure files directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    // Save the uploaded files locally
    const initialFile = parts.find((part) => part.name === "initialImage");
    const finalFile = parts.find((part) => part.name === "finalImage");

    if (!initialFile || !finalFile) {
      return NextResponse.json(
        { success: false, message: "Both images are required" },
        { status: 400 }
      );
    }

    const initialFilePath = path.join(UPLOAD_DIR, "initialImage.jpg");
    const finalFilePath = path.join(UPLOAD_DIR, "finalImage.jpg");

    await fs.writeFile(initialFilePath, initialFile.data);
    await fs.writeFile(finalFilePath, finalFile.data);

    // Process images
    const initialGray = await sharp(initialFilePath).grayscale().toBuffer();
    const finalGray = await sharp(finalFilePath).grayscale().toBuffer();
    const diff = await compareImages(initialGray, finalGray);

    // Return the response
    return NextResponse.json({ success: true, diff });
  } catch (error) {
    console.error("Error processing images:", error);
    return NextResponse.json(
      { success: false, message: "Image processing failed", error },
      { status: 500 }
    );
  }
}

// Helper function to parse multipart form data
function parseMultipart(buffer, boundary) {
  const parts = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const boundaryEndBuffer = Buffer.from(`--${boundary}--`);

  let start = buffer.indexOf(boundaryBuffer) + boundaryBuffer.length + 2;
  while (start < buffer.length) {
    const end = buffer.indexOf(boundaryBuffer, start);
    const endData = end === -1 ? buffer.indexOf(boundaryEndBuffer, start) : end;

    const headerEnd = buffer.indexOf("\r\n\r\n", start);
    const header = buffer.slice(start, headerEnd).toString();
    const contentDisposition = header.match(/name="([^"]+)"/);
    const name = contentDisposition ? contentDisposition[1] : null;

    const data = buffer.slice(headerEnd + 4, endData);
    parts.push({ name, data });

    start = endData + boundaryBuffer.length + 2;
  }

  return parts;
}

// Helper function to compare images and detect changes
async function compareImages(initialBuffer, finalBuffer) {
  const width = 800; // Adjust as per your requirement
  const height = 600;

  // Resize both images to the same dimensions
  const resizedInitial = await sharp(initialBuffer)
    .resize(width, height)
    .raw()
    .toBuffer();
  const resizedFinal = await sharp(finalBuffer)
    .resize(width, height)
    .raw()
    .toBuffer();

  // Calculate pixel-by-pixel difference
  const diff = [];
  for (let i = 0; i < resizedInitial.length; i++) {
    const delta = Math.abs(resizedInitial[i] - resizedFinal[i]);
    diff.push(delta);
  }

  // Threshold to detect significant differences
  const significantDiff = diff.filter((value) => value > 50); // Adjust threshold if needed

  // Return whether significant differences were found
  return significantDiff.length > 0 ? "Mishandled" : "No Change";
}
