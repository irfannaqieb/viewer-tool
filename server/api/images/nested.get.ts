import { promises as fs } from "fs";
import { join } from "path";
import exifr from "exifr";

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
		const imageEntries = entries
			.filter(
				(entry) =>
					entry.isFile() &&
					imageExtensions.some((ext) => entry.name.toLowerCase().endsWith(ext))
			)
			.sort((a, b) => a.name.localeCompare(b.name));

		const images = await Promise.all(
			imageEntries.map(async (entry) => {
				let imagePath: string;
				if (pathParts.length === 3) {
					// New nested structure
					imagePath = `/images/${pathParts[0]}/${pathParts[1]}/${pathParts[2]}/${entry.name}`;
				} else {
					// Legacy structure
					imagePath = `/images/${directoryPath}/${entry.name}`;
				}

				// Attempt to extract GPS on the server
				let gps: {
					latitude: number;
					longitude: number;
					altitude?: number;
				} | null = null;
				try {
					const filePath = join(fullDirectoryPath, entry.name);
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
					// Non-fatal: just skip GPS if it fails
					console.warn(`GPS extraction failed for ${entry.name}:`, ex);
				}

				return {
					filename: entry.name,
					path: imagePath,
					gps,
				};
			})
		);

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
