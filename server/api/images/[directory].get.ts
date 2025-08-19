import { promises as fs } from "fs";
import { join } from "path";

export default defineEventHandler(async (event) => {
	try {
		const directoryName = getRouterParam(event, "directory");

		if (!directoryName) {
			throw new Error("Directory name is required");
		}

		const directoryPath = join(
			process.cwd(),
			"public",
			"images",
			directoryName
		);

		// Check if directory exists
		try {
			await fs.access(directoryPath);
		} catch {
			throw new Error("Directory not found");
		}

		const entries = await fs.readdir(directoryPath, { withFileTypes: true });

		// Filter image files (jpg, jpeg, png, webp)
		const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
		const images = entries
			.filter(
				(entry) =>
					entry.isFile() &&
					imageExtensions.some((ext) => entry.name.toLowerCase().endsWith(ext))
			)
			.map((entry) => ({
				filename: entry.name,
				path: `/images/${directoryName}/${entry.name}`,
			}))
			.sort((a, b) => a.filename.localeCompare(b.filename));

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
