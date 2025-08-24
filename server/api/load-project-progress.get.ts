import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export default defineEventHandler(async (event) => {
	try {
		const query = getQuery(event);

		if (!query.projectPath) {
			throw createError({
				statusCode: 400,
				statusMessage: "projectPath is required",
			});
		}

		const { projectPath } = query as { projectPath: string };

		// Build directory path
		const publicDir = join(process.cwd(), "public");
		const progressDir = join(publicDir, "progress");
		const projectDir = join(progressDir, projectPath.replace(/[\/\\]/g, "_"));

		// Check if project directory exists
		if (!existsSync(projectDir)) {
			return {
				success: true,
				message: "No saved progress found for this project",
				projectPath,
				images: [],
			};
		}

		// Read all files in the project directory
		const files = await readdir(projectDir);
		const imageFiles = files.filter(
			(file) => file.startsWith("img_") && file.endsWith(".json")
		);

		if (imageFiles.length === 0) {
			return {
				success: true,
				message: "No saved images found for this project",
				projectPath,
				images: [],
			};
		}

		// Load all image progress files
		const images = [];
		let loadErrors = [];

		for (const fileName of imageFiles) {
			try {
				const filePath = join(projectDir, fileName);
				const fileContent = await readFile(filePath, "utf-8");
				const imageData = JSON.parse(fileContent);

				images.push({
					...imageData,
					loadedFrom: fileName,
				});
			} catch (error) {
				console.warn(`Failed to load ${fileName}:`, error);
				loadErrors.push({
					fileName,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		}

		return {
			success: true,
			message: `Loaded ${images.length} image progress files`,
			projectPath,
			images,
			totalFiles: imageFiles.length,
			loadedCount: images.length,
			errors: loadErrors.length > 0 ? loadErrors : undefined,
		};
	} catch (error) {
		console.error("Error loading project progress:", error);

		throw createError({
			statusCode: 500,
			statusMessage: `Failed to load project progress: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
		});
	}
});
