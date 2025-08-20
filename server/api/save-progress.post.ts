import { writeFile } from "fs/promises";
import { join } from "path";

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);

		if (!body || !body.progressData) {
			throw createError({
				statusCode: 400,
				statusMessage: "Progress data is required",
			});
		}

		// Get the path to the public directory
		const publicDir = join(process.cwd(), "public");
		const filePath = join(publicDir, "saved_output.json");

		// Write the progress data to the file
		await writeFile(
			filePath,
			JSON.stringify(body.progressData, null, 2),
			"utf-8"
		);

		return {
			success: true,
			message: "Progress saved to file successfully",
			timestamp: new Date().toISOString(),
		};
	} catch (error) {
		console.error("Error saving progress to file:", error);

		throw createError({
			statusCode: 500,
			statusMessage: `Failed to save progress to file: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
		});
	}
});
