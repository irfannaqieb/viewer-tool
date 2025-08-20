import { promises as fs } from "fs";
import { join } from "path";

interface SubSection {
	name: string;
	path: string;
	imageCount: number;
}

interface Section {
	name: string;
	subSections: SubSection[];
}

interface Project {
	name: string;
	sections: Section[];
}

export default defineEventHandler(async (event) => {
	try {
		const publicImagesPath = join(process.cwd(), "public", "images");

		// Check if images directory exists
		try {
			await fs.access(publicImagesPath);
		} catch {
			return {
				projects: [],
				success: true,
				message: "Images directory not found",
			};
		}

		const projectEntries = await fs.readdir(publicImagesPath, {
			withFileTypes: true,
		});

		// Filter only directories (these are projects)
		const projects: Project[] = [];

		for (const projectEntry of projectEntries) {
			if (!projectEntry.isDirectory()) continue;

			const projectPath = join(publicImagesPath, projectEntry.name);
			const project: Project = {
				name: projectEntry.name,
				sections: [],
			};

			try {
				const sectionEntries = await fs.readdir(projectPath, {
					withFileTypes: true,
				});

				for (const sectionEntry of sectionEntries) {
					if (!sectionEntry.isDirectory()) continue;

					const sectionPath = join(projectPath, sectionEntry.name);
					const section: Section = {
						name: sectionEntry.name,
						subSections: [],
					};

					try {
						const subSectionEntries = await fs.readdir(sectionPath, {
							withFileTypes: true,
						});

						for (const subSectionEntry of subSectionEntries) {
							if (!subSectionEntry.isDirectory()) continue;

							const subSectionPath = join(sectionPath, subSectionEntry.name);

							// Count images in this subsection
							let imageCount = 0;
							try {
								const files = await fs.readdir(subSectionPath, {
									withFileTypes: true,
								});
								const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
								imageCount = files.filter(
									(file) =>
										file.isFile() &&
										imageExtensions.some((ext) =>
											file.name.toLowerCase().endsWith(ext)
										)
								).length;
							} catch (error) {
								console.warn(
									`Error counting images in ${subSectionPath}:`,
									error
								);
							}

							section.subSections.push({
								name: subSectionEntry.name,
								path: `/images/${projectEntry.name}/${sectionEntry.name}/${subSectionEntry.name}/`,
								imageCount,
							});
						}
					} catch (error) {
						console.warn(`Error reading section ${sectionPath}:`, error);
					}

					// Only add section if it has subsections
					if (section.subSections.length > 0) {
						project.sections.push(section);
					}
				}
			} catch (error) {
				console.warn(`Error reading project ${projectPath}:`, error);
			}

			// Only add project if it has sections
			if (project.sections.length > 0) {
				projects.push(project);
			}
		}

		return {
			projects,
			success: true,
		};
	} catch (error) {
		console.error("Error reading project structure:", error);
		return {
			projects: [],
			success: false,
			error: "Failed to read project structure",
		};
	}
});
