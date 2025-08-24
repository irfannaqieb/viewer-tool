import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);

		if (!body || !body.imageData) {
			throw createError({
				statusCode: 400,
				statusMessage: "Image data is required",
			});
		}

		const { imageData } = body;

		// Validate required fields
		if (!imageData.imageId || !imageData.filename || !imageData.projectPath) {
			throw createError({
				statusCode: 400,
				statusMessage: "imageId, filename, and projectPath are required",
			});
		}

		// Create directory structure: public/progress/{projectPath}/
		const publicDir = join(process.cwd(), "public");
		const progressDir = join(publicDir, "progress");
		const projectDir = join(
			progressDir,
			imageData.projectPath.replace(/[\/\\]/g, "_")
		);

		// Ensure directories exist
		if (!existsSync(progressDir)) {
			await mkdir(progressDir, { recursive: true });
		}
		if (!existsSync(projectDir)) {
			await mkdir(projectDir, { recursive: true });
		}

		// Create filename: img_{imageId}_{filename}.json
		const safeFilename = imageData.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
		const fileName = `img_${imageData.imageId}_${safeFilename}.json`;
		const filePath = join(projectDir, fileName);

		// Prepare save data with metadata
		const saveData = {
			imageId: imageData.imageId,
			filename: imageData.filename,
			projectPath: imageData.projectPath,
			links: imageData.links || [],
			northCalibration: imageData.northCalibration || null,
			gpsCoordinates: imageData.gpsCoordinates || null,
			lastModified: new Date().toISOString(),
			version: "1.0",
		};

		// Write the image data to file
		await writeFile(filePath, JSON.stringify(saveData, null, 2), "utf-8");

		return {
			success: true,
			message: "Image progress saved successfully",
			imageId: imageData.imageId,
			filename: imageData.filename,
			savedTo: fileName,
			timestamp: saveData.lastModified,
		};
	} catch (error) {
		console.error("Error saving image progress:", error);

		throw createError({
			statusCode: 500,
			statusMessage: `Failed to save image progress: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
		});
	}
});
