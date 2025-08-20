<template>
	<div class="h-screen w-screen bg-white font-poppins flex flex-col">
		<div class="relative grow">
			<div ref="viewerContainer" class="bg-black w-full h-full"></div>

			<!-- Main Control Panel - Top Left -->
			<div
				class="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded-lg max-w-sm w-80 z-10"
			>
				<h3 class="text-lg font-semibold mb-3">360° Image Linker</h3>

				<!-- Project & Directory Selection -->
				<div class="mb-4">
					<label class="block text-sm text-gray-300 mb-1"
						>Project & Section:</label
					>

					<!-- Project Selection -->
					<div class="relative mb-2">
						<select
							v-model="selectedProject"
							@change="onProjectChange(selectedProject)"
							class="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
						>
							<option value="" disabled>Select project...</option>
							<option
								v-for="project in availableProjects"
								:key="project.name"
								:value="project.name"
							>
								{{ project.name }}
							</option>
						</select>
						<div
							class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
						>
							<svg
								class="w-4 h-4 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								></path>
							</svg>
						</div>
					</div>

					<!-- Section Selection -->
					<div
						v-if="selectedProject && availableSections.length > 0"
						class="relative mb-2"
					>
						<select
							v-model="selectedSection"
							@change="onSectionChange(selectedSection)"
							class="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
						>
							<option value="" disabled>Select section...</option>
							<option
								v-for="section in availableSections"
								:key="section.name"
								:value="section.name"
							>
								{{ section.name }} ({{ section.subSections.length }}
								subsections)
							</option>
						</select>
						<div
							class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
						>
							<svg
								class="w-4 h-4 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								></path>
							</svg>
						</div>
					</div>

					<!-- SubSection Selection -->
					<div
						v-if="selectedSection && availableSubSections.length > 0"
						class="relative mb-2"
					>
						<select
							v-model="selectedSubSection"
							@change="onSubSectionChange(selectedSubSection)"
							class="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
						>
							<option value="" disabled>Select subsection...</option>
							<option
								v-for="subSection in availableSubSections"
								:key="subSection.name"
								:value="subSection.name"
							>
								{{ subSection.name }} ({{ subSection.imageCount }} images)
							</option>
						</select>
						<div
							class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
						>
							<svg
								class="w-4 h-4 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								></path>
							</svg>
						</div>
					</div>

					<div class="text-xs text-gray-400 mt-2">
						<span
							v-if="selectedProject && selectedSection && selectedSubSection"
						>
							{{ selectedProject }} / {{ selectedSection }} /
							{{ selectedSubSection }}
						</span>
						<span v-else-if="selectedProject && selectedSection">
							{{ selectedProject }} / {{ selectedSection }}
						</span>
						<span v-else-if="selectedProject">
							{{ selectedProject }}
						</span>
						<span v-else>No project selected</span>
						<br />
						{{ imageList.length }} images loaded
					</div>
				</div>

				<!-- Current Image Info -->
				<div class="mb-4 p-2 bg-gray-800 rounded">
					<div class="text-sm text-gray-300">Current Image:</div>
					<div class="font-medium">{{ currentImageName }}</div>
					<div class="text-xs text-gray-400">
						{{ currentImageIndex + 1 }} of {{ imageList.length }}
					</div>
					<!-- GPS Coordinates  -->
					<div
						v-if="currentNode?.gpsCoordinates"
						class="mt-2 pt-2 border-t border-gray-600"
					>
						<div class="text-xs text-gray-300">GPS Coordinates:</div>
						<div class="text-xs text-green-400 font-mono">
							{{ formatGpsCoordinates(currentNode.gpsCoordinates) }}
						</div>
					</div>
					<div v-else class="mt-2 pt-2 border-t border-gray-600">
						<div class="text-xs text-orange-400">
							<span
								class="inline-block w-2 h-2 bg-orange-400 rounded-full mr-1"
							></span>
							No GPS data available
						</div>
					</div>
				</div>

				<!-- Search/Select Image -->
				<div class="mb-4">
					<label class="block text-sm text-gray-300 mb-1"
						>Navigate to Image:</label
					>
					<div class="relative">
						<!-- Combined Input/Dropdown -->
						<div class="relative">
							<input
								v-model="searchQuery"
								@input="handleSearch"
								@focus="showSearchDropdown = true"
								type="text"
								placeholder="Search or click dropdown..."
								class="w-full px-3 py-2 pr-8 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<button
								@click="toggleSearchDropdown"
								class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
							>
								<svg
									class="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									></path>
								</svg>
							</button>
						</div>

						<!-- Dropdown Results -->
						<div
							v-if="
								showSearchDropdown && (searchResults.length > 0 || !searchQuery)
							"
							class="absolute top-full left-0 right-0 mt-1 bg-gray-700 rounded shadow-lg max-h-48 overflow-y-auto z-20 border border-gray-600"
						>
							<!-- Show filtered results when searching -->
							<div v-if="searchQuery && searchResults.length > 0">
								<div
									class="px-3 py-1 text-xs text-gray-400 bg-gray-800 border-b border-gray-600"
								>
									Search Results ({{ searchResults.length }})
								</div>
								<div
									v-for="result in searchResults"
									:key="result.id"
									@click="selectImageFromDropdown(result.id)"
									class="px-3 py-1.5 hover:bg-gray-600 cursor-pointer flex justify-between items-center"
									:class="{ 'bg-blue-700': result.id === currentNode?.id }"
								>
									<span class="truncate text-xs">{{ result.filename }}</span>
									<span class="text-xs text-gray-400 ml-1 shrink-0"
										>#{{ result.id }}</span
									>
								</div>
							</div>

							<!-- Show all images when no search query -->
							<div v-else-if="!searchQuery">
								<div
									class="px-3 py-1 text-xs text-gray-400 bg-gray-800 border-b border-gray-600"
								>
									All Images ({{ imageList.length }})
								</div>
								<div
									v-for="image in imageList"
									:key="image.id"
									@click="selectImageFromDropdown(image.id)"
									class="px-3 py-1.5 hover:bg-gray-600 cursor-pointer flex justify-between items-center"
									:class="{ 'bg-blue-700': image.id === currentNode?.id }"
								>
									<span class="truncate text-xs">{{ image.filename }}</span>
									<span class="text-xs text-gray-400 ml-1 shrink-0"
										>#{{ image.id }}</span
									>
								</div>
							</div>

							<!-- No results message -->
							<div v-else class="px-3 py-2 text-sm text-gray-400 text-center">
								No images found
							</div>
						</div>
					</div>
				</div>

				<!-- Navigation Controls -->
				<div class="mb-4">
					<label class="block text-sm text-gray-300 mb-2">Navigation:</label>
					<div class="flex space-x-2">
						<button
							@click="previousImage"
							:disabled="imageList.length === 0"
							class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm"
						>
							← Previous
						</button>
						<button
							@click="nextImage"
							:disabled="imageList.length === 0"
							class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm"
						>
							Next →
						</button>
					</div>
				</div>

				<!-- Link Management -->
				<div class="mb-4">
					<label class="block text-sm text-gray-300 mb-2"
						>Manage Navigation:</label
					>

					<!-- Current Navigation Links -->
					<div class="mb-3 p-2 bg-gray-800 rounded space-y-2">
						<!-- Next Link -->
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-2">
								<span class="text-xs text-gray-400">Next:</span>
								<span class="text-xs text-white">
									{{
										currentNode?.nextLink
											? getImageNameById(currentNode.nextLink)
											: "Not set"
									}}
								</span>
							</div>
							<div class="flex space-x-1">
								<button
									@click="openLinkSelector('next')"
									class="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
								>
									Set
								</button>
								<button
									v-if="currentNode?.nextLink"
									@click="removeDirectionalLink('next')"
									class="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
								>
									✕
								</button>
							</div>
						</div>

						<!-- Previous Link -->
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-2">
								<span class="text-xs text-gray-400">Previous:</span>
								<span class="text-xs text-white">
									{{
										currentNode?.previousLink
											? getImageNameById(currentNode.previousLink)
											: "Not set"
									}}
								</span>
							</div>
							<div class="flex space-x-1">
								<button
									@click="openLinkSelector('previous')"
									class="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
								>
									Set
								</button>
								<button
									v-if="currentNode?.previousLink"
									@click="removeDirectionalLink('previous')"
									class="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
								>
									✕
								</button>
							</div>
						</div>
					</div>

					<!-- Link Selector Modal -->
					<div
						v-if="showLinkSelector"
						class="space-y-2 p-3 bg-gray-900 rounded border border-gray-600"
					>
						<div class="flex justify-between items-center">
							<span class="text-sm text-gray-300">
								Set {{ linkDirection }} link for {{ currentImageName }}:
							</span>
							<button
								@click="closeLinkSelector"
								class="text-gray-400 hover:text-white"
							>
								✕
							</button>
						</div>

						<div class="relative">
							<input
								v-model="linkSearchQuery"
								@input="handleLinkSearch"
								@focus="showLinkDropdown = true"
								type="text"
								placeholder="Search or browse to link..."
								class="w-full px-3 py-1 pr-6 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
							/>
							<button
								@click="toggleLinkDropdown"
								class="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
							>
								<svg
									class="w-3 h-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									></path>
								</svg>
							</button>
						</div>

						<div
							v-if="
								showLinkDropdown &&
								(linkSearchResults.length > 0 || !linkSearchQuery)
							"
							class="bg-gray-700 rounded max-h-40 overflow-y-auto border border-gray-600"
						>
							<!-- Show filtered results when searching -->
							<div v-if="linkSearchQuery && linkSearchResults.length > 0">
								<div
									class="px-2 py-1 text-xs text-gray-400 bg-gray-800 border-b border-gray-600"
								>
									Available Images ({{ linkSearchResults.length }})
								</div>
								<div
									v-for="result in linkSearchResults"
									:key="result.id"
									@click="setDirectionalLink(result.id)"
									class="px-2 py-1 hover:bg-gray-600 cursor-pointer text-xs flex justify-between items-center"
								>
									<span class="truncate">{{ result.filename }}</span>
									<span class="text-xs text-gray-400 ml-1"
										>#{{ result.id }}</span
									>
								</div>
							</div>

							<!-- Show all available images when no search query -->
							<div v-else-if="!linkSearchQuery">
								<div
									class="px-2 py-1 text-xs text-gray-400 bg-gray-800 border-b border-gray-600"
								>
									Available Images ({{ availableForDirectionalLink.length }})
								</div>
								<div
									v-for="image in availableForDirectionalLink"
									:key="image.id"
									@click="setDirectionalLink(image.id)"
									class="px-2 py-1 hover:bg-gray-600 cursor-pointer text-xs flex justify-between items-center"
								>
									<span class="truncate">{{ image.filename }}</span>
									<span class="text-xs text-gray-400 ml-1"
										>#{{ image.id }}</span
									>
								</div>
							</div>

							<!-- No results message -->
							<div v-else class="px-2 py-1 text-xs text-gray-400 text-center">
								No images available
							</div>
						</div>
					</div>
				</div>

				<!-- Progress Management -->
				<div class="mb-4 p-3 bg-gray-800 rounded">
					<div class="flex items-center justify-between mb-2">
						<h4 class="text-sm font-medium text-gray-300">Progress</h4>
						<div class="flex items-center space-x-2">
							<label class="flex items-center space-x-1">
								<input
									v-model="saveProgress"
									type="checkbox"
									class="w-3 h-3 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
								/>
								<span class="text-xs text-gray-400">Auto-save</span>
							</label>
						</div>
					</div>

					<div v-if="lastSaved" class="text-xs text-gray-400 mb-2">
						Last saved: {{ lastSaved }}
					</div>

					<div class="flex space-x-2">
						<button
							@click="saveProgressToStorage('manual')"
							class="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
						>
							💾 Save
						</button>
						<button
							@click="loadProgressFromStorage"
							:disabled="!hasSavedProgress()"
							class="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-xs"
						>
							📁 Restore
						</button>
						<button
							@click="clearSavedProgress"
							:disabled="!hasSavedProgress()"
							class="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded text-xs"
						>
							🗑️ Clear
						</button>
					</div>
				</div>

				<!-- Quick Actions -->
				<div class="space-y-2">
					<button
						@click="clearAllLinks"
						class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
					>
						Clear All Links
					</button>
					<div class="flex space-x-2">
						<button
							@click="exportLinks"
							class="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
						>
							Export Configuration
						</button>
						<button
							@click="triggerImportConfig"
							class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
						>
							Import Configuration
						</button>
					</div>
					<!--  file input for import -->
					<input
						ref="importFileInput"
						type="file"
						accept=".json"
						@change="handleImportConfig"
						class="hidden"
					/>
				</div>
			</div>

			<div
				class="absolute top-4 right-4 bg-black bg-opacity-60 px-3 py-2 rounded"
			>
				<span class="text-white font-bold">360° Image Linker Tool</span>
			</div>

			<!-- North Calibration Control Panel  -->
			<div
				class="absolute bottom-24 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg w-80 z-10"
			>
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-lg font-semibold">Compass & Navigation</h3>
					<button
						@click="showCompassOverlay = !showCompassOverlay"
						class="text-gray-400 hover:text-white"
					>
						<svg
							class="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								v-if="showCompassOverlay"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							></path>
							<path
								v-else
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 15l7-7 7 7"
							></path>
						</svg>
					</button>
				</div>

				<div v-if="showCompassOverlay" class="space-y-4">
					<!-- Current Heading Display -->
					<div class="p-3 bg-gray-800 rounded">
						<div class="text-sm text-gray-300 mb-1">
							Current Rotation from Initial:
						</div>
						<div class="flex items-center justify-between">
							<span class="text-2xl font-bold text-blue-400"
								>{{ Math.round(currentHeading) }}°</span
							>
							<div class="text-xs text-gray-400">
								{{ isNorthCalibrated ? "North Calibrated" : "North Not Set" }}
							</div>
						</div>
					</div>

					<!-- North Calibration Status -->
					<div
						class="p-2 rounded"
						:class="isNorthCalibrated ? 'bg-green-800' : 'bg-orange-800'"
					>
						<div class="text-sm">
							<div v-if="isNorthCalibrated" class="flex items-center space-x-2">
								<span class="text-green-400">✓</span>
								<span>North direction calibrated</span>
							</div>
							<div v-else class="flex items-center space-x-2">
								<span class="text-orange-400">⚠</span>
								<span>North direction not set</span>
							</div>
						</div>
						<div
							v-if="isNorthCalibrated && currentNode?.northCalibration"
							class="text-xs text-gray-300 mt-1"
						>
							North at: {{ Math.round(currentNode.northCalibration.heading) }}°
							from initial
						</div>
					</div>

					<!-- Calibration Controls -->
					<div class="space-y-2">
						<div class="text-sm text-gray-300 mb-2">
							1. Rotate view to face north direction
							<br />
							2. Click "Set Current Direction as North"
						</div>

						<button
							@click="setNorthDirection"
							class="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium"
						>
							🧭 Set Current Direction as North
						</button>

						<button
							v-if="isNorthCalibrated"
							@click="clearNorthCalibration"
							class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
						>
							Clear North Calibration
						</button>
					</div>
				</div>
			</div>

			<!-- Import Progress Overlay -->
			<div
				v-if="importProgress.show"
				class="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
			>
				<div class="bg-white rounded-lg p-6 max-w-md w-80 mx-4">
					<div class="text-center">
						<div class="mb-4">
							<div
								class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
							></div>
						</div>
						<h3 class="text-lg font-semibold text-gray-900 mb-2">
							Importing Configuration
						</h3>
						<p class="text-gray-600 mb-4">{{ importProgress.message }}</p>
						<div class="w-full bg-gray-200 rounded-full h-2">
							<div
								class="bg-blue-600 h-2 rounded-full transition-all duration-300"
								:style="{ width: importProgress.percent + '%' }"
							></div>
						</div>
						<p class="text-sm text-gray-500 mt-2">
							{{ importProgress.percent }}% complete
						</p>
					</div>
				</div>
			</div>

			<!-- Status Messages -->
			<div
				v-if="statusMessage"
				class="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded"
			>
				{{ statusMessage }}
			</div>
		</div>
	</div>
</template>

<script setup>
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import { VirtualTourPlugin } from "@photo-sphere-viewer/virtual-tour-plugin";
import { gps } from "exifr";

import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";
import "@photo-sphere-viewer/virtual-tour-plugin/index.css";

// Reactive data
const viewerContainer = ref();
const viewer = ref(null);
const virtualTour = ref(null);
const importFileInput = ref();

// Image management
const imageList = ref([]);
const currentImageIndex = ref(0);
const currentImageName = ref("");
const currentNode = ref(null);

// Compass/North calibration
const currentHeading = ref(0);
const isNorthCalibrated = ref(false);
const showCompassOverlay = ref(true);

// Search functionality
const searchQuery = ref("");
const searchResults = ref([]);
const linkSearchQuery = ref("");
const linkSearchResults = ref([]);

// UI state
const statusMessage = ref("");
const showSearchDropdown = ref(false);
const showLinkDropdown = ref(false);

// Directional linking state
const showLinkSelector = ref(false);
const linkDirection = ref(""); // 'next' or 'previous'

// Project and directory management
const selectedProject = ref("");
const selectedSection = ref("");
const selectedSubSection = ref("");
const availableProjects = ref([]);
const availableSections = ref([]);
const availableSubSections = ref([]);
const selectedDirectory = ref(""); // Keep for backward compatibility
const availableDirectories = ref([]); // Keep for backward compatibility
const BASE_URL = ref("");
const IMAGE_FILES = ref([]);

// Progress saving
const STORAGE_KEY = "panorama-linker-progress";
const saveProgress = ref(true); // Toggle for auto-save
const lastSaved = ref(null);

// Import progress tracking
const importProgress = ref({
	show: false,
	message: "",
	percent: 0,
});

// Load available projects and maintain backward compatibility
const loadDirectories = async () => {
	try {
		// Try new project structure first
		const projectResponse = await $fetch("/api/projects");
		if (projectResponse.success && projectResponse.projects.length > 0) {
			availableProjects.value = projectResponse.projects;

			// Set default selections if available
			if (availableProjects.value.length > 0) {
				const defaultProject = availableProjects.value[0];
				selectedProject.value = defaultProject.name;

				if (defaultProject.sections.length > 0) {
					const defaultSection = defaultProject.sections[0];
					selectedSection.value = defaultSection.name;
					availableSections.value = defaultProject.sections;

					if (defaultSection.subSections.length > 0) {
						const defaultSubSection = defaultSection.subSections[0];
						selectedSubSection.value = defaultSubSection.name;
						availableSubSections.value = defaultSection.subSections;

						// Load images from default subsection
						const directoryPath = `${selectedProject.value}/${selectedSection.value}/${selectedSubSection.value}`;
						selectedDirectory.value = directoryPath;
						BASE_URL.value = defaultSubSection.path;

						try {
							await loadImagesFromDirectory(directoryPath);
						} catch (error) {
							console.error("Error loading default images:", error);
							showStatus(`Failed to load images from ${directoryPath}`);
						}
					}
				}
			}
		} else {
			// Fallback to old directory structure
			const response = await $fetch("/api/images/directories");
			if (response.success) {
				availableDirectories.value = response.directories;
				// Set default directory if available
				if (availableDirectories.value.length > 0) {
					const defaultDir =
						availableDirectories.value.find((dir) =>
							dir.name.includes("08CintaP_UpperMainDeck_20250624")
						) || availableDirectories.value[0];

					selectedDirectory.value = defaultDir.name;
					BASE_URL.value = defaultDir.path;
					await loadImagesFromDirectory(defaultDir.name);
				}
			}
		}
	} catch (error) {
		console.error("Error loading directories:", error);
		showStatus("Failed to load image directories");
	}
};

// Load images from selected directory
const loadImagesFromDirectory = async (directoryName) => {
	try {
		console.log("Loading images from directory:", directoryName);
		// For nested paths, we need to handle them differently
		let apiUrl;
		if (directoryName.includes("/")) {
			// Use query parameter for nested paths to avoid URL encoding issues
			apiUrl = `/api/images/nested?path=${encodeURIComponent(directoryName)}`;
		} else {
			// Use regular path for simple directory names
			apiUrl = `/api/images/${encodeURIComponent(directoryName)}`;
		}
		console.log("API URL:", apiUrl);
		const response = await $fetch(apiUrl);
		console.log("API response:", response);

		if (response.success) {
			IMAGE_FILES.value = response.images;
			console.log("IMAGE_FILES loaded:", IMAGE_FILES.value.length, "files");
			await initializeImages();
		} else {
			throw new Error(response.error || "Failed to load images");
		}
	} catch (error) {
		console.error("Error loading images from directory:", error);
		showStatus(`Failed to load images from ${directoryName}`);
		throw error; // Re-throw to handle in calling function
	}
};

// savee progress to localStorage
const saveProgressToStorage = () => {
	if (!saveProgress.value) return;

	try {
		const progressData = {
			version: "1.0",
			timestamp: Date.now(),
			directoryInfo: {
				selectedDirectory: selectedDirectory.value,
				selectedProject: selectedProject.value,
				selectedSection: selectedSection.value,
				selectedSubSection: selectedSubSection.value,
				baseUrl: BASE_URL.value,
			},
			images: imageList.value.map((img) => ({
				id: img.id,
				filename: img.filename,
				links: img.links,
				nextLink: img.nextLink,
				previousLink: img.previousLink,
				northCalibration: img.northCalibration,
				gpsCoordinates: img.gpsCoordinates,
			})),
			currentImage: {
				index: currentImageIndex.value,
				name: currentImageName.value,
				nodeId: currentNode.value?.id || null,
			},
			ui: {
				showCompassOverlay: showCompassOverlay.value,
			},
		};

		localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
		lastSaved.value = new Date().toLocaleTimeString();

		if (arguments[0] === "manual") {
			showStatus("Progress saved successfully");
		}
	} catch (error) {
		console.error("Error saving progress:", error);
		showStatus("Failed to save progress");
	}
};

// Load progress from localStorage
const loadProgressFromStorage = async () => {
	try {
		const savedData = localStorage.getItem(STORAGE_KEY);
		if (!savedData) return false;

		const progressData = JSON.parse(savedData);

		// Check version compatibility
		if (!progressData.version || progressData.version !== "1.0") {
			console.warn("Saved progress version mismatch, skipping restore");
			return false;
		}

		// Restore directory info
		if (progressData.directoryInfo) {
			const dirInfo = progressData.directoryInfo;

			// Check if this is the new nested structure
			if (
				dirInfo.selectedProject &&
				dirInfo.selectedSection &&
				dirInfo.selectedSubSection
			) {
				// Restore nested structure
				selectedProject.value = dirInfo.selectedProject;
				selectedSection.value = dirInfo.selectedSection;
				selectedSubSection.value = dirInfo.selectedSubSection;
				selectedDirectory.value = dirInfo.selectedDirectory;
				BASE_URL.value = dirInfo.baseUrl;

				// Load projects and set up the structure
				await loadDirectories();

				// Load images from the specific subsection
				if (dirInfo.selectedDirectory) {
					await loadImagesFromDirectory(dirInfo.selectedDirectory);
				}
			} else {
				// Restore legacy directory structure
				selectedDirectory.value = dirInfo.selectedDirectory;
				BASE_URL.value = dirInfo.baseUrl;

				// Load images from server directory
				if (dirInfo.selectedDirectory) {
					await loadImagesFromDirectory(dirInfo.selectedDirectory);
				}
			}
		}

		// Restore image data (links, calibrations, etc.)
		if (progressData.images && imageList.value.length > 0) {
			progressData.images.forEach((savedImg) => {
				const currentImg = imageList.value.find(
					(img) => img.filename === savedImg.filename || img.id === savedImg.id
				);

				if (currentImg) {
					// Restore links and calibrations
					currentImg.links = savedImg.links || [];
					currentImg.nextLink = savedImg.nextLink;
					currentImg.previousLink = savedImg.previousLink;
					currentImg.northCalibration = savedImg.northCalibration;
					// Don't override GPS coordinates from EXIF, but restore if none found
					if (!currentImg.gpsCoordinates && savedImg.gpsCoordinates) {
						currentImg.gpsCoordinates = savedImg.gpsCoordinates;
					}
				}
			});

			// Update viewer with restored links
			updateViewerNodes();
		}

		// Restore current image
		if (progressData.currentImage && imageList.value.length > 0) {
			const currentImg = progressData.currentImage;
			if (currentImg.nodeId) {
				// Try to navigate to the same image by ID or filename
				const targetImage = imageList.value.find(
					(img) =>
						img.id === currentImg.nodeId || img.filename === currentImg.name
				);
				if (targetImage) {
					navigateToImage(targetImage.id);
				}
			}
		}

		// Restore UI state
		if (progressData.ui) {
			showCompassOverlay.value = progressData.ui.showCompassOverlay ?? true;
		}

		lastSaved.value = new Date(progressData.timestamp).toLocaleTimeString();
		showStatus(`Progress restored from ${lastSaved.value}`);
		return true;
	} catch (error) {
		console.error("Error loading progress:", error);
		showStatus("Failed to load saved progress");
		return false;
	}
};

// Clear saved progress
const clearSavedProgress = () => {
	try {
		localStorage.removeItem(STORAGE_KEY);
		lastSaved.value = null;
		showStatus("Saved progress cleared");
	} catch (error) {
		console.error("Error clearing progress:", error);
		showStatus("Failed to clear saved progress");
	}
};

// Check if there's saved progress
const hasSavedProgress = () => {
	try {
		const savedData = localStorage.getItem(STORAGE_KEY);
		return !!savedData;
	} catch {
		return false;
	}
};

// Handle project selection change
const onProjectChange = async (projectName) => {
	if (!projectName) return;

	const project = availableProjects.value.find(
		(proj) => proj.name === projectName
	);
	if (!project) return;

	selectedProject.value = projectName;
	selectedSection.value = "";
	selectedSubSection.value = "";
	availableSections.value = project.sections;
	availableSubSections.value = [];

	// Clear current data
	clearCurrentImageData();

	showStatus(`Selected project: ${projectName}`);
};

// Handle section selection change
const onSectionChange = async (sectionName) => {
	if (!sectionName || !selectedProject.value) return;

	const project = availableProjects.value.find(
		(proj) => proj.name === selectedProject.value
	);
	if (!project) return;

	const section = project.sections.find((sec) => sec.name === sectionName);
	if (!section) return;

	selectedSection.value = sectionName;
	selectedSubSection.value = "";
	availableSubSections.value = section.subSections;

	// Clear current data
	clearCurrentImageData();

	showStatus(`Selected section: ${sectionName}`);
};

// Handle subsection selection change
const onSubSectionChange = async (subSectionName) => {
	if (!subSectionName || !selectedProject.value || !selectedSection.value)
		return;

	const project = availableProjects.value.find(
		(proj) => proj.name === selectedProject.value
	);
	if (!project) return;

	const section = project.sections.find(
		(sec) => sec.name === selectedSection.value
	);
	if (!section) return;

	const subSection = section.subSections.find(
		(sub) => sub.name === subSectionName
	);
	if (!subSection) return;

	selectedSubSection.value = subSectionName;

	// Set directory path and BASE_URL
	const directoryPath = `${selectedProject.value}/${selectedSection.value}/${subSectionName}`;
	selectedDirectory.value = directoryPath;
	BASE_URL.value = subSection.path;

	// Clear current data
	clearCurrentImageData();

	// Load new images
	await loadImagesFromDirectory(directoryPath);

	// Update viewer with new images if viewer is ready
	if (virtualTour.value && imageList.value.length > 0) {
		updateViewerNodes();
	}

	showStatus(
		`Loaded ${IMAGE_FILES.value.length} images from ${selectedProject.value}/${selectedSection.value}/${subSectionName}`
	);

	// Auto-save progress after directory change
	saveProgressToStorage();
};

// Helper function to clear current image data
const clearCurrentImageData = () => {
	imageList.value = [];
	currentImageIndex.value = 0;
	currentImageName.value = "";
	currentNode.value = null;
};

// Handle directory selection change (for backward compatibility)
const onDirectoryChange = async (directoryName) => {
	if (!directoryName) return;

	const directory = availableDirectories.value.find(
		(dir) => dir.name === directoryName
	);
	if (!directory) return;

	selectedDirectory.value = directoryName;
	BASE_URL.value = directory.path;

	// Clear current data
	clearCurrentImageData();

	// Load new images
	await loadImagesFromDirectory(directoryName);

	// Update viewer with new images if viewer is ready
	if (virtualTour.value && imageList.value.length > 0) {
		updateViewerNodes();
	}

	showStatus(`Loaded ${IMAGE_FILES.value.length} images from ${directoryName}`);

	// Auto-save progress after directory change
	saveProgressToStorage();
};

// Initialize image data
const initializeImages = async () => {
	if (IMAGE_FILES.value.length === 0) return;

	const imagePromises = IMAGE_FILES.value.map(async (imageInfo, index) => {
		const imageData = {
			id: (index + 1).toString(),
			filename: imageInfo.filename,
			panorama: imageInfo.path,
			links: [],
			nextLink: null,
			previousLink: null,
			northCalibration: null, // { heading: number, isSet: boolean }
			gpsCoordinates: null, // { latitude: number, longitude: number, altitude?: number }
		};

		// Extract GPS coordinates from EXIF data
		try {
			const gpsData = await extractGpsFromImage(imageInfo.path);
			if (gpsData) {
				imageData.gpsCoordinates = gpsData;
			}
		} catch (error) {
			console.warn(
				`Could not extract GPS data from ${imageInfo.filename}:`,
				error
			);
		}

		return imageData;
	});

	imageList.value = await Promise.all(imagePromises);

	if (imageList.value.length > 0) {
		currentImageName.value = imageList.value[0].filename;
		currentNode.value = imageList.value[0];
		updateCompassState();

		// Update viewer nodes if viewer is ready
		if (virtualTour.value) {
			updateViewerNodes();
		}
	}
};

// return all images except the current image
const availableForDirectionalLink = computed(() => {
	if (!currentNode.value) return imageList.value;

	// For directional linking, exclude only the current image
	return imageList.value.filter((image) => image.id !== currentNode.value?.id);
});

// ------------- Search functionality -------------
const handleSearch = () => {
	if (!searchQuery.value.trim()) {
		searchResults.value = [];
		return;
	}

	searchResults.value = imageList.value
		.filter((image) =>
			image.filename.toLowerCase().includes(searchQuery.value.toLowerCase())
		)
		.slice(0, 10); // Limit results
};

const handleLinkSearch = () => {
	if (!linkSearchQuery.value.trim()) {
		linkSearchResults.value = [];
		return;
	}

	// For directional linking, only exclude current image
	linkSearchResults.value = imageList.value
		.filter(
			(image) =>
				image.id !== currentNode.value?.id &&
				image.filename
					.toLowerCase()
					.includes(linkSearchQuery.value.toLowerCase())
		)
		.slice(0, 10);
};

// ------------- Dropdown functions -------------
const toggleSearchDropdown = () => {
	showSearchDropdown.value = !showSearchDropdown.value;
	if (showSearchDropdown.value) {
		showLinkDropdown.value = false;
	}
};

const toggleLinkDropdown = () => {
	showLinkDropdown.value = !showLinkDropdown.value;
	if (showLinkDropdown.value) {
		showSearchDropdown.value = false;
	}
};

const selectImageFromDropdown = (imageId) => {
	navigateToImage(imageId);
	showSearchDropdown.value = false;
};

// ------------- Directional linking functions -------------
const openLinkSelector = (direction) => {
	linkDirection.value = direction;
	showLinkSelector.value = true;
	linkSearchQuery.value = "";
	linkSearchResults.value = [];
	showLinkDropdown.value = false;
};

const closeLinkSelector = () => {
	showLinkSelector.value = false;
	linkDirection.value = "";
	linkSearchQuery.value = "";
	linkSearchResults.value = [];
	showLinkDropdown.value = false;
};

const setDirectionalLink = (targetImageId) => {
	if (!currentNode.value) return;

	const currentImage = imageList.value.find(
		(img) => img.id === currentNode.value.id
	);
	const targetImage = imageList.value.find((img) => img.id === targetImageId);

	if (!currentImage || !targetImage) return;

	if (linkDirection.value === "next") {
		// Remove existing next link if it exists
		if (currentImage.nextLink) {
			const oldTargetImage = imageList.value.find(
				(img) => img.id === currentImage.nextLink
			);
			if (oldTargetImage && oldTargetImage.previousLink === currentImage.id) {
				oldTargetImage.previousLink = null;
			}
		}

		// Remove existing previous link from target if it exists
		if (targetImage.previousLink) {
			const oldSourceImage = imageList.value.find(
				(img) => img.id === targetImage.previousLink
			);
			if (oldSourceImage && oldSourceImage.nextLink === targetImage.id) {
				oldSourceImage.nextLink = null;
			}
		}

		// Set current -> target as next
		currentImage.nextLink = targetImageId;
		// Set target -> current as previous (bidirectional)
		targetImage.previousLink = currentImage.id;
		showStatus(
			`Set next link: ${getImageNameById(targetImageId)} (bidirectional)`
		);
	} else if (linkDirection.value === "previous") {
		// Remove existing previous link if it exists
		if (currentImage.previousLink) {
			const oldTargetImage = imageList.value.find(
				(img) => img.id === currentImage.previousLink
			);
			if (oldTargetImage && oldTargetImage.nextLink === currentImage.id) {
				oldTargetImage.nextLink = null;
			}
		}

		// Remove existing next link from target if it exists
		if (targetImage.nextLink) {
			const oldSourceImage = imageList.value.find(
				(img) => img.id === targetImage.nextLink
			);
			if (oldSourceImage && oldSourceImage.previousLink === targetImage.id) {
				oldSourceImage.previousLink = null;
			}
		}

		// Set current -> target as previous
		currentImage.previousLink = targetImageId;
		// Set target -> current as next (bidirectional)
		targetImage.nextLink = currentImage.id;
		showStatus(
			`Set previous link: ${getImageNameById(targetImageId)} (bidirectional)`
		);
	}

	// Update the viewer nodes to reflect changes
	updateViewerNodes();
	closeLinkSelector();

	// Auto-save progress
	saveProgressToStorage();
};

const removeDirectionalLink = (direction) => {
	if (!currentNode.value) return;

	const currentImage = imageList.value.find(
		(img) => img.id === currentNode.value.id
	);
	if (!currentImage) return;

	if (direction === "next" && currentImage.nextLink) {
		// Find the target image and remove its reverse link
		const targetImage = imageList.value.find(
			(img) => img.id === currentImage.nextLink
		);
		if (targetImage && targetImage.previousLink === currentImage.id) {
			targetImage.previousLink = null;
		}
		// Remove the next link from current image
		currentImage.nextLink = null;
		showStatus("Removed next link (bidirectional)");
	} else if (direction === "previous" && currentImage.previousLink) {
		// Find the target image and remove its reverse link
		const targetImage = imageList.value.find(
			(img) => img.id === currentImage.previousLink
		);
		if (targetImage && targetImage.nextLink === currentImage.id) {
			targetImage.nextLink = null;
		}
		// Remove the previous link from current image
		currentImage.previousLink = null;
		showStatus("Removed previous link (bidirectional)");
	}

	// Update the viewer nodes to reflect changes
	updateViewerNodes();

	// Auto-save progress
	saveProgressToStorage();
};

// ------------- Navigation -------------
const navigateToImage = (imageId) => {
	const imageIndex = imageList.value.findIndex((img) => img.id === imageId);
	if (imageIndex !== -1) {
		currentImageIndex.value = imageIndex;
		currentImageName.value = imageList.value[imageIndex].filename;
		currentNode.value = imageList.value[imageIndex];

		// Update compass state for new image
		updateCompassState();

		// Update viewer
		if (virtualTour.value) {
			virtualTour.value.setCurrentNode(imageId);
		}

		// Clear search and close dropdowns
		searchQuery.value = "";
		searchResults.value = [];
		showSearchDropdown.value = false;
		showLinkDropdown.value = false;
	}
};

const nextImage = () => {
	if (currentNode.value?.nextLink) {
		// Use the set next link
		navigateToImage(currentNode.value.nextLink);
	} else {
		// Fallback to sequential navigation
		if (currentImageIndex.value < imageList.value.length - 1) {
			navigateToImage(imageList.value[currentImageIndex.value + 1].id);
		} else {
			navigateToImage(imageList.value[0].id); // Loop to first
		}
	}
};

const previousImage = () => {
	if (currentNode.value?.previousLink) {
		// Use the set previous link
		navigateToImage(currentNode.value.previousLink);
	} else {
		// Fallback to sequential navigation
		if (currentImageIndex.value > 0) {
			navigateToImage(imageList.value[currentImageIndex.value - 1].id);
		} else {
			navigateToImage(imageList.value[imageList.value.length - 1].id); // Loop to last
		}
	}
};

// ------------- GPS extraction -------------
const extractGpsFromImage = async (imageUrl) => {
	try {
		const response = await fetch(imageUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch image: ${response.statusText}`);
		}
		const blob = await response.blob();
		const gpsData = await gps(blob);

		if (
			gpsData &&
			gpsData.latitude !== undefined &&
			gpsData.longitude !== undefined
		) {
			const result = {
				latitude: gpsData.latitude,
				longitude: gpsData.longitude,
			};

			return result;
		}

		return null;
	} catch (error) {
		console.warn(`Error extracting GPS from ${imageUrl}:`, error);
		return null;
	}
};

// Format GPS coordinates (for display)
const formatGpsCoordinates = (coords) => {
	if (!coords) return "N/A";

	const lat = coords.latitude.toFixed(6);
	const lon = coords.longitude.toFixed(6);

	let formatted = `${lat}, ${lon}`;

	if (coords.altitude !== undefined) {
		formatted += ` (${coords.altitude.toFixed(1)}m)`;
	}

	return formatted;
};

// ------------- Utility functions -------------
const getImageNameById = (imageId) => {
	const image = imageList.value.find((img) => img.id === imageId);
	return image ? image.filename : "Unknown";
};

const showStatus = (message) => {
	statusMessage.value = message;
	setTimeout(() => {
		statusMessage.value = "";
	}, 3000);
};

const clearAllLinks = () => {
	imageList.value.forEach((image) => {
		image.links = [];
		image.nextLink = null;
		image.previousLink = null;
		image.northCalibration = null;
	});

	// Update compass state
	updateCompassState();

	updateViewerNodes();
	showStatus("Cleared all links and compass calibrations");
};

const exportLinks = () => {
	const config = {
		baseUrl: BASE_URL.value,
		directoryName: selectedDirectory.value,
		images: imageList.value.map((img) => {
			// Format GPS coordinates as array [longitude, latitude, altitude]
			let gps = null;
			if (img.gpsCoordinates) {
				gps = [img.gpsCoordinates.longitude, img.gpsCoordinates.latitude];
				// Add altitude if available
				if (img.gpsCoordinates.altitude !== undefined) {
					gps.push(img.gpsCoordinates.altitude);
				}
			}

			// Format links as next/prev object
			const links = {};
			if (img.nextLink) {
				links.next = { nodeId: img.nextLink };
			}
			if (img.previousLink) {
				links.prev = { nodeId: img.previousLink };
			}

			// Get pose heading from north calibration
			let poseHeading = 0;
			if (img.northCalibration && img.northCalibration.isSet) {
				poseHeading = img.northCalibration.heading;
			}

			return {
				id: img.id,
				panorama: BASE_URL.value + img.filename,
				gps: gps,
				panoData: { poseHeading: poseHeading },
				links: Object.keys(links).length > 0 ? links : {},
				// Keep metadata for reference
				_metadata: {
					filename: img.filename,
					northCalibration: img.northCalibration,
					project: selectedProject.value,
					section: selectedSection.value,
					subSection: selectedSubSection.value,
					directoryPath: selectedDirectory.value,
				},
			};
		}),
	};

	// Download as JSON
	const blob = new Blob([JSON.stringify(config, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "panorama-tour-config.json";
	a.click();
	URL.revokeObjectURL(url);

	showStatus("Configuration exported in tour format");
};

// ------------- Import configuration functions -------------
const triggerImportConfig = () => {
	importFileInput.value?.click();
};

const handleImportConfig = async (event) => {
	const file = event.target.files?.[0];
	if (!file) return;

	try {
		// Show progress overlay
		importProgress.value.show = true;
		importProgress.value.message = "Loading configuration file...";
		importProgress.value.percent = 10;

		const text = await file.text();
		const config = JSON.parse(text);

		importProgress.value.message = "Parsing configuration...";
		importProgress.value.percent = 20;

		await importConfiguration(config);

		// Clear the file input
		event.target.value = "";
	} catch (error) {
		console.error("Error importing configuration:", error);
		showStatus("Failed to import configuration: " + error.message);
	} finally {
		// Hide progress overlay
		importProgress.value.show = false;
		importProgress.value.percent = 0;
		importProgress.value.message = "";
	}
};

const importConfiguration = async (config) => {
	try {
		// Validate the configuration format
		if (!config.images || !Array.isArray(config.images)) {
			throw new Error("Invalid configuration format: missing images array");
		}

		importProgress.value.message = "Validating configuration...";
		importProgress.value.percent = 30;

		// Check if we need to switch directories first
		if (
			config.directoryName &&
			config.directoryName !== selectedDirectory.value
		) {
			importProgress.value.message = `Switching to directory: ${config.directoryName}`;
			importProgress.value.percent = 40;

			// Try to find and load the matching directory
			if (config.directoryName.includes("/")) {
				// Handle nested directory structure
				const pathParts = config.directoryName.split("/");
				if (pathParts.length >= 3) {
					const [project, section, subSection] = pathParts;

					// Find matching project
					const matchingProject = availableProjects.value.find(
						(p) => p.name === project
					);
					if (matchingProject) {
						importProgress.value.message = `Loading project: ${project}`;
						await onProjectChange(project);

						// Find matching section
						const matchingSection = matchingProject.sections.find(
							(s) => s.name === section
						);
						if (matchingSection) {
							importProgress.value.message = `Loading section: ${section}`;
							await onSectionChange(section);

							// Find matching subsection
							const matchingSubSection = matchingSection.subSections.find(
								(s) => s.name === subSection
							);
							if (matchingSubSection) {
								importProgress.value.message = `Loading subsection: ${subSection}`;
								await onSubSectionChange(subSection);
							} else {
								throw new Error(
									`SubSection '${subSection}' not found in project structure`
								);
							}
						} else {
							throw new Error(
								`Section '${section}' not found in project structure`
							);
						}
					} else {
						throw new Error(
							`Project '${project}' not found in available projects`
						);
					}
				}
			} else {
				// Handle legacy directory structure
				const matchingDir = availableDirectories.value.find(
					(d) => d.name === config.directoryName
				);
				if (matchingDir) {
					await onDirectoryChange(config.directoryName);
				} else {
					throw new Error(
						`Directory '${config.directoryName}' not found in available directories`
					);
				}
			}

			importProgress.value.message = "Loading images...";
			importProgress.value.percent = 60;

			// Wait a bit for the directory change to complete
			await new Promise((resolve) => setTimeout(resolve, 500));
		}

		// Validate that we have matching images
		if (imageList.value.length === 0) {
			throw new Error("No images loaded in current directory");
		}

		importProgress.value.message = "Restoring links and calibrations...";
		importProgress.value.percent = 70;

		// Import links and calibrations
		let importedCount = 0;
		let calibrationCount = 0;
		const totalImages = config.images.length;
		let processedImages = 0;

		// Process images with progress updates
		for (const configImage of config.images) {
			// Find matching image by filename (more reliable than ID)
			const filename =
				configImage._metadata?.filename ||
				configImage.panorama.split("/").pop();
			const currentImage = imageList.value.find(
				(img) => img.filename === filename
			);

			if (currentImage) {
				// Import next/prev links
				if (configImage.links) {
					if (configImage.links.next?.nodeId) {
						// Find target image by ID from config
						const targetConfigImage = config.images.find(
							(ci) => ci.id === configImage.links.next.nodeId
						);
						if (targetConfigImage) {
							const targetFilename =
								targetConfigImage._metadata?.filename ||
								targetConfigImage.panorama.split("/").pop();
							const targetImage = imageList.value.find(
								(img) => img.filename === targetFilename
							);
							if (targetImage) {
								currentImage.nextLink = targetImage.id;
								importedCount++;
							}
						}
					}

					if (configImage.links.prev?.nodeId) {
						// Find target image by ID from config
						const targetConfigImage = config.images.find(
							(ci) => ci.id === configImage.links.prev.nodeId
						);
						if (targetConfigImage) {
							const targetFilename =
								targetConfigImage._metadata?.filename ||
								targetConfigImage.panorama.split("/").pop();
							const targetImage = imageList.value.find(
								(img) => img.filename === targetFilename
							);
							if (targetImage) {
								currentImage.previousLink = targetImage.id;
								importedCount++;
							}
						}
					}
				}

				// Import north calibration
				if (configImage._metadata?.northCalibration) {
					currentImage.northCalibration = {
						heading: configImage._metadata.northCalibration.heading,
						isSet: configImage._metadata.northCalibration.isSet,
					};
					calibrationCount++;
				} else if (
					configImage.panoData?.poseHeading &&
					configImage.panoData.poseHeading !== 0
				) {
					// Fallback: use poseHeading if available
					currentImage.northCalibration = {
						heading: configImage.panoData.poseHeading,
						isSet: true,
					};
					calibrationCount++;
				}
			}

			// Update progress
			processedImages++;
			const progressPercent =
				70 + Math.round((processedImages / totalImages) * 20);
			importProgress.value.percent = progressPercent;
			importProgress.value.message = `Processing image ${processedImages}/${totalImages}...`;

			// Small delay to show progress updates
			if (processedImages % 3 === 0) {
				await new Promise((resolve) => setTimeout(resolve, 50));
			}
		}

		importProgress.value.message = "Updating viewer...";
		importProgress.value.percent = 95;

		// Update viewer and UI state
		updateViewerNodes();
		updateCompassState();

		// Auto-save the imported configuration
		saveProgressToStorage();

		importProgress.value.percent = 100;

		showStatus(
			`Configuration imported successfully! ${importedCount} links and ${calibrationCount} north calibrations restored.`
		);
	} catch (error) {
		console.error("Error importing configuration:", error);
		throw error;
	}
};

// ------------- Compass/North calibration functions -------------
const updateCompassState = () => {
	if (!currentNode.value) return;

	// Reset heading to 0 when switching images
	currentHeading.value = 0;

	// Check if current image has north calibration
	isNorthCalibrated.value = !!currentNode.value.northCalibration?.isSet;
};

const normalizeHeading = (degrees) => {
	// Normalize to 0-360 range
	let normalized = degrees % 360;
	if (normalized < 0) normalized += 360;
	return normalized;
};

const setNorthDirection = () => {
	if (!currentNode.value) return;

	// Save current heading as north reference
	currentNode.value.northCalibration = {
		heading: normalizeHeading(currentHeading.value),
		isSet: true,
	};

	isNorthCalibrated.value = true;

	showStatus(
		`North direction set at ${Math.round(
			currentHeading.value
		)}° from initial orientation`
	);

	// Auto-save progress
	saveProgressToStorage();
};

const clearNorthCalibration = () => {
	if (!currentNode.value) return;

	currentNode.value.northCalibration = null;
	isNorthCalibrated.value = false;

	// Compass is now a UI overlay, no viewer markers to remove

	showStatus("North calibration cleared");

	// Auto-save progress
	saveProgressToStorage();
};

// Viewer management
const updateViewerNodes = () => {
	if (!virtualTour.value || imageList.value.length === 0) return;

	const nodes = imageList.value.map((image) => {
		const viewerLinks = [];

		// Add next link if set
		if (image.nextLink) {
			viewerLinks.push({
				nodeId: image.nextLink,
				position: { yaw: "0deg", pitch: "0deg" }, // Front position
			});
		}

		// Add previous link if set
		if (image.previousLink) {
			viewerLinks.push({
				nodeId: image.previousLink,
				position: { yaw: "180deg", pitch: "0deg" }, // Back position
			});
		}

		// Add any additional custom links from the old system
		if (image.links && image.links.length > 0) {
			viewerLinks.push(...image.links);
		}

		return {
			id: image.id,
			panorama: image.panorama,
			links: viewerLinks,
			name: image.filename,
		};
	});

	virtualTour.value.setNodes(nodes, currentNode.value?.id || "1");
};

// Initialize viewer after images are loaded
const initializeViewer = () => {
	if (!viewerContainer.value) return;

	viewer.value = new Viewer({
		container: viewerContainer.value,
		plugins: [
			MarkersPlugin,
			[
				VirtualTourPlugin,
				{
					positionMode: "manual",
					renderMode: "3d",
				},
			],
		],
	});

	virtualTour.value = viewer.value.getPlugin(VirtualTourPlugin);

	// Listen for node changes
	virtualTour.value.addEventListener("node-changed", ({ node }) => {
		const imageIndex = imageList.value.findIndex((img) => img.id === node.id);
		if (imageIndex !== -1) {
			currentImageIndex.value = imageIndex;
			currentImageName.value = imageList.value[imageIndex].filename;
			currentNode.value = imageList.value[imageIndex];

			updateCompassState();
		}
	});

	// Track heading changes (user rotation)
	viewer.value.addEventListener("position-updated", ({ position }) => {
		// Convert yaw from radians to degrees and track relative to initial position
		const yawDegrees = (position.yaw * 180) / Math.PI;
		currentHeading.value = normalizeHeading(yawDegrees);
	});

	// Set initial nodes and compass state only if we have images
	if (imageList.value.length > 0) {
		updateViewerNodes();
		updateCompassState();
	}
};

// Initialize on mount
onMounted(async () => {
	// Add click-outside handler to close dropdowns
	const handleClickOutside = (event) => {
		const searchContainer = event.target.closest(".relative");
		if (!searchContainer) {
			showSearchDropdown.value = false;
			showLinkDropdown.value = false;
		}
	};
	document.addEventListener("click", handleClickOutside);

	// Initialize viewer first (without nodes)
	initializeViewer();

	// Load directories and images
	try {
		await loadDirectories();

		// Try to restore saved progress
		if (hasSavedProgress()) {
			await loadProgressFromStorage();
		}
	} catch (error) {
		console.error("Error during initialization:", error);
		showStatus("Failed to initialize viewer");
	}
});

// Cleanup on unmount - moved outside of async onMounted
onUnmounted(() => {
	if (typeof document !== "undefined") {
		const existingHandler = document.querySelector(".relative");
		if (existingHandler) {
			document.removeEventListener("click", () => {});
		}
	}
});
</script>

<style lang="scss" scoped></style>
