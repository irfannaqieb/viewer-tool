import { promises as fs } from "fs";
import { join } from "path";
import exifr from "exifr";

export default defineEventHandler(async (event) => {
  try {
    const directoryName = getRouterParam(event, "directory");
    // serve compressed image if true otherwise, serve original
    const query = getQuery(event);
    const useCompressed = query.compressed === "true";

    if (!directoryName) {
      throw new Error("Directory name is required");
    }

    console.log(
      "Processing simple directory:",
      directoryName,
      "| UseCompressed:",
      useCompressed
    );

    const directoryPath = join(
      process.cwd(),
      "public",
      "images",
      directoryName
    );

    try {
      await fs.access(directoryPath);
    } catch {
      throw new Error("Directory not found");
    }

    const entries = await fs.readdir(directoryPath, { withFileTypes: true });

    // Filter image files (jpg, jpeg, png, webp)
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const allImageEntries = entries
      .filter(
        (entry) =>
          entry.isFile() &&
          imageExtensions.some((ext) => entry.name.toLowerCase().endsWith(ext))
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    // Separate original and compressed images
    const originalImages = allImageEntries.filter(
      (entry) => !entry.name.includes("_compressed")
    );
    const compressedImages = allImageEntries.filter((entry) =>
      entry.name.includes("_compressed")
    );

    // mapping between original and compressed images
    const imageEntries: any[] = [];

    // try to find its corresponding compressed image
    if (useCompressed) {
      // Try to use compressed versions, otherwise fallback to original
      originalImages.forEach((original) => {
        const baseName = original.name.replace(/\.(jpg|jpeg|png|webp)$/i, "");
        const compressedName = `${baseName}_compressed`;
        const compressed = compressedImages.find((comp) =>
          comp.name.toLowerCase().startsWith(compressedName.toLowerCase())
        );

        if (compressed) {
          imageEntries.push({
            ...compressed,
            originalName: original.name,
            isCompressed: true,
          });
        } else {
          imageEntries.push({
            ...original,
            originalName: original.name,
            isCompressed: false,
          });
        }
      });
    } else {
      // otherwise, use original images
      originalImages.forEach((original) => {
        imageEntries.push({
          ...original,
          originalName: original.name,
          isCompressed: false,
        });
      });
    }

    const images = await Promise.all(
      imageEntries.map(async (entry) => {
        const imagePath = `/images/${directoryName}/${entry.name}`;

        // Attempt to extract GPS on the server
        let gps: {
          latitude: number;
          longitude: number;
          altitude?: number;
        } | null = null;
        try {
          // For compressed images, read GPS from the original file
          const filePathForGPS = entry.isCompressed
            ? join(directoryPath, entry.originalName)
            : join(directoryPath, entry.name);

          const buffer = await fs.readFile(filePathForGPS);
          const gpsData = await exifr.gps(buffer);
          if (
            gpsData &&
            (gpsData as any).latitude !== undefined &&
            (gpsData as any).longitude !== undefined
          ) {
            gps = {
              latitude: (gpsData as any).latitude as number,
              longitude: (gpsData as any).longitude as number,
              ...((gpsData as any).altitude !== undefined
                ? { altitude: (gpsData as any).altitude as number }
                : {}),
            };
          }
        } catch (ex) {
          console.warn(`GPS extraction failed for ${entry.name}:`, ex);
        }

        return {
          filename: entry.name,
          originalFilename: entry.originalName || entry.name,
          isCompressed: entry.isCompressed || false,
          path: imagePath,
          gps,
        };
      })
    );

    console.log(
      `Found ${images.length} images in simple directory ${directoryName}`
    );

    return {
      directory: directoryName,
      images,
      success: true,
      count: images.length,
    };
  } catch (error) {
    console.error("Error reading directory images:", error);
    return {
      directory: null,
      images: [],
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to read directory images",
    };
  }
});
