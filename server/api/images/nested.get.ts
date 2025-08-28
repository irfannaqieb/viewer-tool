import { promises as fs } from "fs";
import { join } from "path";
import exifr from "exifr";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const directoryPath = query.path as string;
    const useCompressed = query.compressed === "true";

    if (!directoryPath) {
      throw new Error("Directory path is required");
    }

    console.log(
      "Processing nested directory path:",
      directoryPath,
      "| UseCompressed:",
      useCompressed
    );

    // Parse the directory path which should be in format: project/section/subsection
    const pathParts = directoryPath.split("/");
    console.log("Path parts:", pathParts);

    let fullDirectoryPath: string;
    if (pathParts.length === 3) {
      // New nested structure: project/section/subsection
      fullDirectoryPath = join(
        process.cwd(),
        "public",
        "images",
        pathParts[0], // project
        pathParts[1], // section
        pathParts[2] // subsection
      );
    } else {
      // Legacy structure: direct directory
      fullDirectoryPath = join(
        process.cwd(),
        "public",
        "images",
        directoryPath
      );
    }

    console.log("Full directory path:", fullDirectoryPath);

    // Check if directory exists
    try {
      await fs.access(fullDirectoryPath);
    } catch {
      throw new Error("Directory not found");
    }

    const entries = await fs.readdir(fullDirectoryPath, {
      withFileTypes: true,
    });

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

    // Create mapping and determine which images to serve
    const imageEntries: any[] = [];
    if (useCompressed) {
      // Try to use compressed versions, fallback to original
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
      // Use original images
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
        let imagePath: string;
        if (pathParts.length === 3) {
          // New nested structure
          imagePath = `/images/${pathParts[0]}/${pathParts[1]}/${pathParts[2]}/${entry.name}`;
        } else {
          // Legacy structure
          imagePath = `/images/${directoryPath}/${entry.name}`;
        }

        // Attempt to extract GPS on the server
        let gps: {
          latitude: number;
          longitude: number;
          altitude?: number;
        } | null = null;
        try {
          // For compressed images, read GPS from the original file
          const filePathForGPS = entry.isCompressed
            ? join(fullDirectoryPath, entry.originalName)
            : join(fullDirectoryPath, entry.name);

          const buffer = await fs.readFile(filePathForGPS);

          // Extract GPS coordinates using exifr.gps()
          const gpsData = await exifr.gps(buffer);

          // Also extract specific GPS tags including altitude
          const gpsExif = await exifr.parse(buffer, {
            gps: true,
            pick: [
              "GPSLatitude",
              "GPSLongitude",
              "GPSAltitude",
              "GPSAltitudeRef",
            ],
          });

          if (
            gpsData &&
            gpsData.latitude !== undefined &&
            gpsData.longitude !== undefined
          ) {
            gps = {
              latitude: gpsData.latitude,
              longitude: gpsData.longitude,
            };

            // Try to get altitude from the specific GPS EXIF data
            if (gpsExif && gpsExif.GPSAltitude !== undefined) {
              let altitude = gpsExif.GPSAltitude;

              // Handle altitude reference (0 = above sea level, 1 = below sea level)
              if (gpsExif.GPSAltitudeRef === 1) {
                altitude = -altitude;
              }

              gps.altitude = altitude;
              console.log(`  Final altitude: ${altitude}`);
            } else {
              console.log("  No altitude data found in EXIF");
            }

            // console.log(`  Final GPS object:`, gps);
          } else {
            console.log("  No valid GPS coordinates found");
          }
        } catch (ex) {
          // Non-fatal: just skip GPS if it fails
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

    console.log(`Found ${images.length} images in ${directoryPath}`);

    return {
      directory: directoryPath,
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
