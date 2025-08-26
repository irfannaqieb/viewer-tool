import { promises as fs } from "fs";
import { join, dirname, basename, extname } from "path";
import sharp from "sharp";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { directoryPath, quality = 80, width = 4096 } = body;

    if (!directoryPath) {
      throw new Error("Directory path is required");
    }

    console.log("Starting compression for directory:", directoryPath);

    // Parse the directory path
    const pathParts = directoryPath.split("/");
    let fullDirectoryPath: string;
    if (pathParts.length === 3) {
      fullDirectoryPath = join(
        process.cwd(),
        "public",
        "images",
        pathParts[0], // project
        pathParts[1], // section
        pathParts[2] // subsection
      );
    } else {
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

    // Filter image files and exclude already compressed files
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const imageEntries = entries
      .filter(
        (entry) =>
          entry.isFile() &&
          imageExtensions.some((ext) =>
            entry.name.toLowerCase().endsWith(ext)
          ) &&
          !entry.name.includes("_compressed")
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`Found ${imageEntries.length} images to compress`);

    const compressionResults = [];
    let processed = 0;

    for (const entry of imageEntries) {
      try {
        const originalPath = join(fullDirectoryPath, entry.name);
        const name = basename(entry.name, extname(entry.name));
        const ext = extname(entry.name);
        const compressedName = `${name}_compressed${ext}`;
        const compressedPath = join(fullDirectoryPath, compressedName);

        // Check if compressed version already exists
        try {
          await fs.access(compressedPath);
          console.log(`Compressed version already exists: ${compressedName}`);

          // Get file sizes even for existing files
          const originalStats = await fs.stat(originalPath);
          const compressedStats = await fs.stat(compressedPath);
          const originalSize = originalStats.size;
          const compressedSize = compressedStats.size;
          const savings =
            ((originalSize - compressedSize) / originalSize) * 100;

          compressionResults.push({
            original: entry.name,
            compressed: compressedName,
            status: "already_exists",
            originalSize,
            compressedSize,
            savings: Math.round(savings * 100) / 100,
          });
          processed++;
          continue;
        } catch {
          // File doesn't exist, proceed with compression
        }

        // Get original file size
        const originalStats = await fs.stat(originalPath);
        const originalSize = originalStats.size;

        console.log(
          `Compressing: ${entry.name} (${(originalSize / 1024 / 1024).toFixed(
            2
          )}MB)`
        );

        // Compress the image
        await sharp(originalPath)
          .resize(width, width, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({
            quality: quality,
            progressive: true,
            mozjpeg: true,
          })
          .toFile(compressedPath);

        // Get compressed file size
        const compressedStats = await fs.stat(compressedPath);
        const compressedSize = compressedStats.size;
        const savings = ((originalSize - compressedSize) / originalSize) * 100;

        console.log(
          `Compressed: ${entry.name} -> ${compressedName} (${(
            compressedSize /
            1024 /
            1024
          ).toFixed(2)}MB, ${savings.toFixed(1)}% savings)`
        );

        compressionResults.push({
          original: entry.name,
          compressed: compressedName,
          status: "compressed",
          originalSize,
          compressedSize,
          savings: Math.round(savings * 100) / 100,
        });

        processed++;
      } catch (error) {
        console.error(`Error compressing ${entry.name}:`, error);
        compressionResults.push({
          original: entry.name,
          compressed: null,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
          originalSize: 0,
          compressedSize: 0,
          savings: 0,
        });
        processed++;
      }
    }

    // Calculate total savings
    const totalOriginalSize = compressionResults.reduce(
      (sum, result) => sum + result.originalSize,
      0
    );
    const totalCompressedSize = compressionResults.reduce(
      (sum, result) => sum + result.compressedSize,
      0
    );
    const totalSavings =
      totalOriginalSize > 0
        ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100
        : 0;

    return {
      success: true,
      directoryPath,
      processed,
      total: imageEntries.length,
      results: compressionResults,
      summary: {
        totalOriginalSize:
          Math.round((totalOriginalSize / 1024 / 1024) * 100) / 100, // MB
        totalCompressedSize:
          Math.round((totalCompressedSize / 1024 / 1024) * 100) / 100, // MB
        totalSavings: Math.round(totalSavings * 100) / 100, // percentage
        compressionSettings: {
          quality,
          maxWidth: width,
        },
      },
    };
  } catch (error) {
    console.error("Error compressing images:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to compress images",
    };
  }
});
