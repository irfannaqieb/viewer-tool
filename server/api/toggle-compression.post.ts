import { promises as fs } from "fs";
import { join } from "path";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { directoryPath, useCompressed = true } = body;

    if (!directoryPath) {
      throw new Error("Directory path is required");
    }

    console.log(
      `Switching to ${useCompressed ? "compressed" : "original"} images for:`,
      directoryPath
    );

    // Parse the directory path
    const pathParts = directoryPath.split("/");
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

    // Check if directory exists
    try {
      await fs.access(fullDirectoryPath);
    } catch {
      throw new Error("Directory not found");
    }

    const entries = await fs.readdir(fullDirectoryPath, {
      withFileTypes: true,
    });

    // Filter image files
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

    // Create mapping between original and compressed
    const imageMapping = new Map();

    originalImages.forEach((original) => {
      const baseName = original.name.replace(/\.(jpg|jpeg|png|webp)$/i, "");
      const compressedName = `${baseName}_compressed`;
      const compressed = compressedImages.find((comp) =>
        comp.name.toLowerCase().startsWith(compressedName.toLowerCase())
      );

      imageMapping.set(original.name, {
        original: original.name,
        compressed: compressed?.name || null,
        hasCompressed: !!compressed,
      });
    });

    // Determine which images to serve
    const imagesToServe = [];
    const unavailableImages = [];

    for (const [originalName, mapping] of imageMapping) {
      if (useCompressed) {
        if (mapping.hasCompressed) {
          imagesToServe.push({
            filename: mapping.compressed,
            originalFilename: mapping.original,
            isCompressed: true,
          });
        } else {
          imagesToServe.push({
            filename: mapping.original,
            originalFilename: mapping.original,
            isCompressed: false,
          });
          unavailableImages.push(mapping.original);
        }
      } else {
        imagesToServe.push({
          filename: mapping.original,
          originalFilename: mapping.original,
          isCompressed: false,
        });
      }
    }

    // for statistics
    const stats = {
      totalOriginalImages: originalImages.length,
      totalCompressedImages: compressedImages.length,
      imagesWithCompressed: Array.from(imageMapping.values()).filter(
        (m) => m.hasCompressed
      ).length,
      imagesWithoutCompressed: Array.from(imageMapping.values()).filter(
        (m) => !m.hasCompressed
      ).length,
      currentMode: useCompressed ? "compressed" : "original",
      fallbackCount: unavailableImages.length,
    };

    return {
      success: true,
      directoryPath,
      useCompressed,
      imagesToServe,
      unavailableImages,
      stats,
      imageMapping: Object.fromEntries(imageMapping),
    };
  } catch (error) {
    console.error("Error switching image mode:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to switch image mode",
    };
  }
});
