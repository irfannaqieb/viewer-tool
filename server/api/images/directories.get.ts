import { promises as fs } from "fs";
import { join } from "path";

export default defineEventHandler(async (event) => {
  try {
    const publicImagesPath = join(process.cwd(), "public", "images");
    const entries = await fs.readdir(publicImagesPath, { withFileTypes: true });

    // Filter only directories
    const directories = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        name: entry.name,
        path: `/images/${entry.name}/`,
      }));

    return {
      directories,
      success: true,
    };
  } catch (error) {
    console.error("Error reading image directories:", error);
    return {
      directories: [],
      success: false,
      error: "Failed to read image directories",
    };
  }
});
