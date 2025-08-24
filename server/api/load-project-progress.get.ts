import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export default defineEventHandler(async (event) => {
	try {
		const query = getQuery(event);

		// Handle undefined projectPath
		if (!query.projectPath) {
			throw createError({
				statusCode: 400,
				statusMessage: "projectPath query parameter is required",
			});
		}

		// Normalize projectPath: handle string, string[], or other types
		let projectPath: string;
		if (Array.isArray(query.projectPath)) {
			projectPath = query.projectPath[0]?.toString().trim();
		} else {
			projectPath = query.projectPath?.toString().trim();
		}

		// Validate projectPath is not empty after trimming
		if (!projectPath) {
			throw createError({
				statusCode: 400,
				statusMessage: "projectPath query parameter cannot be empty",
			});
		}

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
		// Check if this is already an HTTP error (has numeric statusCode)
		if (
			error &&
			typeof error === "object" &&
			"statusCode" in error &&
			typeof error.statusCode === "number"
		) {
			throw error;
		}

		// For other errors, log and throw a 500 error
		console.error("Error loading project progress:", error);

		throw createError({
			statusCode: 500,
			statusMessage: `Failed to load project progress: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
		});
	}
});
