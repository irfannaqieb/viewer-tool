import { promises as fs } from "fs";
import { join } from "path";
import exifr from "exifr";

export default defineEventHandler(async (event) => {
	try {
		const directoryName = getRouterParam(event, "directory");

		if (!directoryName) {
			throw new Error("Directory name is required");
		}

		console.log("Processing simple directory:", directoryName);

		// For simple directory names (legacy support)
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
		const imageEntries = entries
			.filter(
				(entry) =>
					entry.isFile() &&
					imageExtensions.some((ext) => entry.name.toLowerCase().endsWith(ext))
			)
			.sort((a, b) => a.name.localeCompare(b.name));

		const images = await Promise.all(
			imageEntries.map(async (entry) => {
				const imagePath = `/images/${directoryName}/${entry.name}`;

				let gps: {
					latitude: number;
					longitude: number;
					altitude?: number;
				} | null = null;
				try {
					const filePath = join(directoryPath, entry.name);
					const buffer = await fs.readFile(filePath);
					const gpsData = await exifr.gps(buffer);
					if (
						gpsData &&
						(gpsData as any).latitude !== undefined &&
						(gpsData as any).longitude !== undefined
					) {
						gps = {
							latitude: (gpsData as any).latitude as number,
							longitude: (gpsData as any).longitude as number,
							...((gpsData as any).altitude !== undefined
								? { altitude: (gpsData as any).altitude as number }
								: {}),
						};
					}
				} catch (ex) {
					console.warn(`GPS extraction failed for ${entry.name}:`, ex);
				}

				return {
					filename: entry.name,
					path: imagePath,
					gps,
				};
			})
		);

		console.log(
			`Found ${images.length} images in simple directory ${directoryName}`
		);

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
