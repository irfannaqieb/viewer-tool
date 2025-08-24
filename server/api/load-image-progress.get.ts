import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export default defineEventHandler(async (event) => {
	try {
		const query = getQuery(event);

		if (!query.imageId || !query.filename || !query.projectPath) {
			throw createError({
				statusCode: 400,
				statusMessage: "imageId, filename, and projectPath are required",
			});
		}

		const { imageId, filename, projectPath } = query as {
			imageId: string;
			filename: string;
			projectPath: string;
		};

		// Build file path
		const publicDir = join(process.cwd(), "public");
		const progressDir = join(publicDir, "progress");
		const projectDir = join(progressDir, projectPath.replace(/[\/\\]/g, "_"));

		const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
		const fileName = `img_${imageId}_${safeFilename}.json`;
		const filePath = join(projectDir, fileName);

		// Check if file exists
		if (!existsSync(filePath)) {
			return {
				success: false,
				message: "No saved progress found for this image",
				imageId,
				filename,
			};
		}

		// Read and parse the file
		const fileContent = await readFile(filePath, "utf-8");
		const imageData = JSON.parse(fileContent);

		return {
			success: true,
			message: "Image progress loaded successfully",
			imageData,
			loadedFrom: fileName,
		};
	} catch (error) {
		console.error("Error loading image progress:", error);

		// If it's a file not found or parse error, return not found
		if (
			error instanceof Error &&
			(error.message.includes("ENOENT") || error.message.includes("JSON"))
		) {
			const query = getQuery(event) as { imageId?: string; filename?: string };
			return {
				success: false,
				message: "No saved progress found for this image",
				imageId: query.imageId,
				filename: query.filename,
			};
		}

		throw createError({
			statusCode: 500,
			statusMessage: `Failed to load image progress: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
		});
	}
});
