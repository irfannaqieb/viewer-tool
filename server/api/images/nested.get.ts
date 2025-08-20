import { promises as fs } from "fs";
import { join } from "path";

export default defineEventHandler(async (event) => {
	try {
		const query = getQuery(event);
		const directoryPath = query.path as string;

		if (!directoryPath) {
			throw new Error("Directory path is required");
		}

		console.log("Processing nested directory path:", directoryPath);

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
		const images = entries
			.filter(
				(entry) =>
					entry.isFile() &&
					imageExtensions.some((ext) => entry.name.toLowerCase().endsWith(ext))
			)
			.map((entry) => {
				let imagePath: string;
				if (pathParts.length === 3) {
					// New nested structure
					imagePath = `/images/${pathParts[0]}/${pathParts[1]}/${pathParts[2]}/${entry.name}`;
				} else {
					// Legacy structure
					imagePath = `/images/${directoryPath}/${entry.name}`;
				}

				return {
					filename: entry.name,
					path: imagePath,
				};
			})
			.sort((a, b) => a.filename.localeCompare(b.filename));

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
