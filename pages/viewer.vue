<template>
  <div class="h-screen w-screen bg-white font-poppins flex flex-col">
    <NuxtLink
      to="/"
      class="absolute top-4 left-4 z-20 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
      title="Return to the main editor"
    >
      <span class="font-semibold">← Back to Editor</span>
    </NuxtLink>

    <div class="relative grow">
      <div ref="viewerContainer" class="bg-black w-full h-full"></div>

      <!-- Main Control Panel - Top Left -->
      <div
        class="absolute top-20 left-4 bg-black bg-opacity-70 text-white p-4 rounded-lg max-w-sm w-80 z-10"
      >
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="text-lg font-semibold">Configuration Viewer</h3>
            <div class="text-xs text-yellow-400 flex items-center mt-1">
              <span
                class="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-1"
              ></span>
              Read-only mode - No changes saved
            </div>
          </div>
        </div>

        <!-- Import Configuration Section -->
        <div v-if="!configLoaded" class="mb-4">
          <div class="text-center p-6 bg-gray-800 rounded">
            <div class="mb-4">
              <svg
                class="w-16 h-16 text-gray-400 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
            </div>
            <h4 class="text-lg font-medium mb-2">Load Content</h4>
            <p class="text-gray-400 text-sm mb-4">
              Import a configuration file or browse server directories to view
              panorama content.
            </p>
            <div
              class="text-xs text-yellow-400 bg-yellow-900 bg-opacity-30 p-2 rounded mb-4 border border-yellow-600"
            >
              <div class="flex items-center">
                <span
                  class="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-2"
                ></span>
                <span
                  ><strong>Read-Only Mode:</strong> This viewer will not modify
                  your working directory or save any changes.</span
                >
              </div>
            </div>

            <!-- Two options: Import Config or Browse Directories -->
            <div class="space-y-3">
              <button
                @click="triggerImportConfig"
                class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
              >
                📁 Import Configuration File
              </button>

              <div class="text-xs text-gray-400 text-center">or</div>

              <button
                @click="loadDirectories"
                class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium"
              >
                🗂️ Browse Server Directories
              </button>
            </div>
          </div>
        </div>

        <!-- Directory Browser (when directories are loaded) -->
        <div v-if="showDirectoryBrowser && !configLoaded" class="mb-4">
          <div class="p-3 bg-gray-800 rounded">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-medium text-gray-300">
                Browse Directories
              </h4>
              <button
                @click="closeBrowser"
                class="text-gray-400 hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            <!-- Project Selection (new structure) -->
            <div v-if="availableProjects.length > 0" class="space-y-2">
              <div class="relative">
                <select
                  v-model="selectedProject"
                  @change="onProjectChange(selectedProject)"
                  class="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
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
              </div>

              <!-- Section Selection -->
              <div
                v-if="selectedProject && availableSections.length > 0"
                class="relative"
              >
                <select
                  v-model="selectedSection"
                  @change="onSectionChange(selectedSection)"
                  class="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
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
              </div>

              <!-- SubSection Selection -->
              <div
                v-if="selectedSection && availableSubSections.length > 0"
                class="relative"
              >
                <select
                  v-model="selectedSubSection"
                  @change="onSubSectionChange(selectedSubSection)"
                  class="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
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
              </div>
            </div>

            <!-- Legacy Directory Selection -->
            <div v-else-if="availableDirectories.length > 0" class="relative">
              <select
                v-model="selectedDirectory"
                @change="onDirectoryChange(selectedDirectory)"
                class="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
              >
                <option value="" disabled>Select directory...</option>
                <option
                  v-for="directory in availableDirectories"
                  :key="directory.name"
                  :value="directory.name"
                >
                  {{ directory.name }}
                </option>
              </select>
            </div>

            <!-- Load Button -->
            <div v-if="canLoadDirectory" class="mt-3">
              <button
                @click="loadSelectedDirectory"
                class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                Load Directory Images
              </button>
            </div>
          </div>
        </div>

        <!-- Configuration Info (when loaded) -->
        <div v-if="configLoaded" class="mb-4">
          <div class="p-3 bg-gray-800 rounded">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-green-400">
                Configuration Loaded
              </span>
              <button
                @click="clearConfiguration"
                class="text-xs text-gray-400 hover:text-red-400"
              >
                Clear
              </button>
            </div>
            <div class="text-xs text-gray-300 space-y-1">
              <div v-if="configInfo.project">
                <strong>Project:</strong> {{ configInfo.project }}
              </div>
              <div v-if="configInfo.section">
                <strong>Section:</strong> {{ configInfo.section }}
              </div>
              <div v-if="configInfo.subSection">
                <strong>SubSection:</strong> {{ configInfo.subSection }}
              </div>
              <div v-if="configInfo.directoryName">
                <strong>Directory:</strong> {{ configInfo.directoryName }}
              </div>
              <div><strong>Images:</strong> {{ imageList.length }}</div>
              <div><strong>Links:</strong> {{ totalLinks }}</div>
              <div><strong>Calibrations:</strong> {{ totalCalibrations }}</div>
            </div>
          </div>
        </div>

        <!-- Current Image Info -->
        <div v-if="configLoaded" class="mb-4 p-2 bg-gray-800 rounded">
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

        <!-- Navigation Section -->
        <div v-if="configLoaded" class="mb-4">
          <label class="block text-sm text-gray-300 mb-2">Navigate:</label>

          <!-- Image Search/Select -->
          <div class="relative mb-2">
            <input
              v-model="searchQuery"
              @input="handleSearch"
              @focus="showSearchDropdown = true"
              type="text"
              placeholder="Search images..."
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

            <!-- Search Dropdown -->
            <div
              v-if="
                showSearchDropdown && (searchResults.length > 0 || !searchQuery)
              "
              class="absolute top-full left-0 right-0 mt-1 bg-gray-700 rounded shadow-lg max-h-48 overflow-y-auto z-20 border border-gray-600"
            >
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
              <div v-else class="px-3 py-2 text-sm text-gray-400 text-center">
                No images found
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
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

        <!-- Links Display -->
        <div v-if="configLoaded && currentNode?.links?.length > 0" class="mb-4">
          <label class="block text-sm text-gray-300 mb-2">
            <span
              class="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"
            ></span>
            Current Links ({{ currentNode.links.length }}):
          </label>
          <div class="space-y-1 max-h-32 overflow-y-auto">
            <div
              v-for="(link, index) in currentNode.links"
              :key="index"
              class="flex items-center justify-between bg-gray-700 px-2 py-1 rounded text-xs"
            >
              <span class="text-white truncate">
                {{ getImageNameById(link.nodeId) }}
              </span>
              <div class="flex items-center space-x-1">
                <span class="text-gray-400">#{{ link.nodeId }}</span>
                <button
                  @click="navigateToImage(link.nodeId)"
                  class="px-1 py-0.5 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                  title="Navigate to this image"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- No Links Message -->
        <div
          v-else-if="
            configLoaded &&
            currentNode &&
            (!currentNode.links || currentNode.links.length === 0)
          "
          class="mb-4"
        >
          <div class="p-2 bg-gray-800 rounded text-center">
            <div class="text-xs text-gray-400">
              <span
                class="inline-block w-2 h-2 bg-gray-400 rounded-full mr-1"
              ></span>
              No links configured for this image
            </div>
          </div>
        </div>

        <!-- File Input (hidden) -->
        <input
          ref="importFileInput"
          type="file"
          accept=".json"
          @change="handleImportConfig"
          class="hidden"
        />
      </div>

      <!-- Top Right Info -->
      <div
        class="absolute top-4 right-4 bg-black bg-opacity-60 px-3 py-2 rounded z-10"
      >
        <span class="text-white font-bold">Configuration Viewer</span>
        <div class="text-xs text-gray-300 mt-1">Read-only mode</div>
      </div>

      <!-- North Calibration Display -->
      <div
        v-if="configLoaded"
        class="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg w-80 z-10"
      >
        <h3 class="text-lg font-semibold mb-3">Compass & Navigation</h3>

        <!-- Current Heading Display -->
        <div class="p-3 bg-gray-800 rounded mb-3">
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
              Loading Configuration
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
        class="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded z-20"
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

import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";
import "@photo-sphere-viewer/virtual-tour-plugin/index.css";

// Page metadata
useHead({
  title: "Configuration Viewer - 360° Image Linker",
});

// Reactive data
const viewerContainer = ref();
const viewer = ref(null);
const virtualTour = ref(null);
const importFileInput = ref();

// Configuration state
const configLoaded = ref(false);
const configInfo = ref({});

// Directory browsing state
const showDirectoryBrowser = ref(false);
const selectedProject = ref("");
const selectedSection = ref("");
const selectedSubSection = ref("");
const selectedDirectory = ref("");
const availableProjects = ref([]);
const availableSections = ref([]);
const availableSubSections = ref([]);
const availableDirectories = ref([]);
const BASE_URL = ref("");
const IMAGE_FILES = ref([]);

// Image management
const imageList = ref([]);
const currentImageIndex = ref(0);
const currentImageName = ref("");
const currentNode = ref(null);

// Compass/North calibration
const currentHeading = ref(0);
const isNorthCalibrated = ref(false);

// Search functionality
const searchQuery = ref("");
const searchResults = ref([]);

// UI state
const statusMessage = ref("");
const showSearchDropdown = ref(false);

// Import progress tracking
const importProgress = ref({
  show: false,
  message: "",
  percent: 0,
});

// Computed properties
const totalLinks = computed(() => {
  return imageList.value.reduce((count, image) => {
    return count + (image.links ? image.links.length : 0);
  }, 0);
});

const totalCalibrations = computed(() => {
  return imageList.value.filter((image) => image.northCalibration?.isSet)
    .length;
});

const canLoadDirectory = computed(() => {
  if (availableProjects.value.length > 0) {
    return (
      selectedProject.value && selectedSection.value && selectedSubSection.value
    );
  } else {
    return selectedDirectory.value;
  }
});

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
    importProgress.value.percent = 30;

    await loadConfiguration(config);

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

const loadConfiguration = async (config) => {
  try {
    // Validate the configuration format
    if (!config.images || !Array.isArray(config.images)) {
      throw new Error("Invalid configuration format: missing images array");
    }

    importProgress.value.message = "Processing images...";
    importProgress.value.percent = 50;

    // Extract configuration info
    const firstImage = config.images[0];
    if (firstImage?._metadata) {
      configInfo.value = {
        project: firstImage._metadata.project,
        section: firstImage._metadata.section,
        subSection: firstImage._metadata.subSection,
        directoryName:
          firstImage._metadata.directoryPath || config.directoryName,
      };
    } else {
      configInfo.value = {
        directoryName: config.directoryName,
      };
    }

    importProgress.value.message = "Building image data...";
    importProgress.value.percent = 70;

    // Convert config images to our format - LOAD ALL IMAGES, no wasVisible filter
    imageList.value = config.images.map((configImage, index) => {
      // Parse GPS coordinates from config format [longitude, latitude, altitude?]
      const gpsCoordinates = Array.isArray(configImage.gps)
        ? {
            longitude: configImage.gps[0],
            latitude: configImage.gps[1],
            altitude: configImage.gps[2],
          }
        : null;

      // Get sphereCorrection pan value (keep as numeric degrees, do NOT convert to radians)
      const sphereCorrectionPan =
        configImage.sphereCorrection?.pan ??
        configImage._metadata?.northCalibration?.heading;

      // Parse north calibration from sphereCorrection or metadata
      let northCalibration = null;
      if (configImage._metadata?.northCalibration?.isSet) {
        northCalibration = configImage._metadata.northCalibration;
      } else if (
        configImage.sphereCorrection?.pan &&
        configImage.sphereCorrection.pan !== 0
      ) {
        northCalibration = {
          heading: configImage.sphereCorrection.pan,
          isSet: true,
        };
      }

      // Extract filename from panorama URL or metadata
      const filename =
        configImage._metadata?.filename ||
        configImage.panorama.split("/").pop();

      return {
        id: configImage.id,
        filename: filename,
        panorama: configImage.panorama,
        links: configImage.links || [],
        gpsCoordinates, // <-- keep GPS here
        northCalibration: northCalibration, // (for UI)
        sphereCorrectionPan, // <-- numeric degrees (do NOT convert to radians)
      };
    });

    console.log("Loaded configuration summary:", {
      totalImages: imageList.value.length,
      imagesWithGPS: imageList.value.filter((img) => img.gpsCoordinates).length,
      imagesWithSphereCorrection: imageList.value.filter(
        (img) => img.sphereCorrectionPan != null
      ).length,
      firstImage: imageList.value[0]
        ? {
            id: imageList.value[0].id,
            filename: imageList.value[0].filename,
            hasGps: !!imageList.value[0].gpsCoordinates,
            gps: imageList.value[0].gpsCoordinates,
            sphereCorrectionPan: imageList.value[0].sphereCorrectionPan,
            linkCount: imageList.value[0].links?.length || 0,
          }
        : null,
    });

    importProgress.value.message = "Initializing viewer...";
    importProgress.value.percent = 90;

    // Set initial state
    if (imageList.value.length > 0) {
      currentImageIndex.value = 0;
      currentImageName.value = imageList.value[0].filename;
      currentNode.value = imageList.value[0];
      updateCompassState();

      // Initialize or update viewer
      if (viewer.value) {
        updateViewerNodes();
      } else {
        initializeViewer();
      }
    }

    configLoaded.value = true;
    importProgress.value.percent = 100;

    showStatus(
      `Configuration loaded: ${imageList.value.length} images, ${totalLinks.value} links, ${totalCalibrations.value} calibrations`
    );
  } catch (error) {
    console.error("Error loading configuration:", error);
    throw error;
  }
};

const clearConfiguration = () => {
  configLoaded.value = false;
  configInfo.value = {};
  imageList.value = [];
  currentImageIndex.value = 0;
  currentImageName.value = "";
  currentNode.value = null;
  currentHeading.value = 0;
  isNorthCalibrated.value = false;
  searchQuery.value = "";
  searchResults.value = [];
  showSearchDropdown.value = false;

  // Clear directory browser state
  showDirectoryBrowser.value = false;
  selectedProject.value = "";
  selectedSection.value = "";
  selectedSubSection.value = "";
  selectedDirectory.value = "";
  availableProjects.value = [];
  availableSections.value = [];
  availableSubSections.value = [];
  availableDirectories.value = [];

  // Clear viewer
  if (virtualTour.value && imageList.value.length === 0) {
    // The viewer will show a black screen when no nodes are available
    virtualTour.value.setNodes([]);
  }

  showStatus("Configuration cleared");
};

// ------------- Directory browsing functions -------------
const loadDirectories = async () => {
  try {
    showDirectoryBrowser.value = true;

    // Try new project structure first
    const projectResponse = await $fetch("/api/projects");
    if (projectResponse.success && projectResponse.projects.length > 0) {
      availableProjects.value = projectResponse.projects;
    } else {
      // Fallback to old directory structure
      const response = await $fetch("/api/images/directories");
      if (response.success) {
        availableDirectories.value = response.directories;
      }
    }
  } catch (error) {
    console.error("Error loading directories:", error);
    showStatus("Failed to load image directories");
  }
};

const closeBrowser = () => {
  showDirectoryBrowser.value = false;
  selectedProject.value = "";
  selectedSection.value = "";
  selectedSubSection.value = "";
  selectedDirectory.value = "";
  availableProjects.value = [];
  availableSections.value = [];
  availableSubSections.value = [];
  availableDirectories.value = [];
};

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
};

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
};

const onSubSectionChange = async (subSectionName) => {
  if (!subSectionName || !selectedProject.value || !selectedSection.value)
    return;

  selectedSubSection.value = subSectionName;
};

const onDirectoryChange = async (directoryName) => {
  if (!directoryName) return;
  selectedDirectory.value = directoryName;
};

const loadSelectedDirectory = async () => {
  try {
    let directoryPath;
    let baseUrl;

    if (
      selectedProject.value &&
      selectedSection.value &&
      selectedSubSection.value
    ) {
      // New nested structure
      directoryPath = `${selectedProject.value}/${selectedSection.value}/${selectedSubSection.value}`;
      const project = availableProjects.value.find(
        (p) => p.name === selectedProject.value
      );
      const section = project?.sections.find(
        (s) => s.name === selectedSection.value
      );
      const subSection = section?.subSections.find(
        (s) => s.name === selectedSubSection.value
      );
      baseUrl = subSection?.path;
    } else if (selectedDirectory.value) {
      // Legacy structure
      directoryPath = selectedDirectory.value;
      const directory = availableDirectories.value.find(
        (d) => d.name === selectedDirectory.value
      );
      baseUrl = directory?.path;
    } else {
      throw new Error("No directory selected");
    }

    // Load images from the directory
    await loadImagesFromDirectory(directoryPath, baseUrl);

    // Close browser and show content
    showDirectoryBrowser.value = false;
    configLoaded.value = true;

    // Set config info
    configInfo.value = {
      project: selectedProject.value,
      section: selectedSection.value,
      subSection: selectedSubSection.value,
      directoryName: directoryPath,
    };

    showStatus(`Loaded ${imageList.value.length} images from ${directoryPath}`);
  } catch (error) {
    console.error("Error loading directory:", error);
    showStatus("Failed to load directory images");
  }
};

const loadImagesFromDirectory = async (directoryName, baseUrl) => {
  try {
    let apiUrl;
    if (directoryName.includes("/")) {
      // Use query parameter for nested paths
      apiUrl = `/api/images/nested?path=${encodeURIComponent(directoryName)}`;
    } else {
      // Use regular path for simple directory names
      apiUrl = `/api/images/${encodeURIComponent(directoryName)}`;
    }

    const response = await $fetch(apiUrl);

    if (response.success) {
      IMAGE_FILES.value = response.images;
      BASE_URL.value = baseUrl || "";
      await initializeImages();
    } else {
      throw new Error(response.error || "Failed to load images");
    }
  } catch (error) {
    console.error("Error loading images from directory:", error);
    throw error;
  }
};

const initializeImages = async () => {
  if (IMAGE_FILES.value.length === 0) return;

  const imagePromises = IMAGE_FILES.value.map(async (imageInfo, index) => {
    return {
      id: (index + 1).toString(),
      filename: imageInfo.filename,
      panorama: imageInfo.path,
      links: [],
      northCalibration: null,
      gpsCoordinates: null,
    };
  });

  imageList.value = await Promise.all(imagePromises);

  if (imageList.value.length > 0) {
    currentImageIndex.value = 0;
    currentImageName.value = imageList.value[0].filename;
    currentNode.value = imageList.value[0];
    updateCompassState();

    // Initialize or update viewer
    if (viewer.value) {
      updateViewerNodes();
    } else {
      initializeViewer();
    }
  }
};

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

const toggleSearchDropdown = () => {
  showSearchDropdown.value = !showSearchDropdown.value;
};

const selectImageFromDropdown = (imageId) => {
  navigateToImage(imageId);
  showSearchDropdown.value = false;
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
  }
};

const nextImage = () => {
  // Always navigate sequentially through the image list
  if (currentImageIndex.value < imageList.value.length - 1) {
    navigateToImage(imageList.value[currentImageIndex.value + 1].id);
  } else {
    navigateToImage(imageList.value[0].id); // Loop to first
  }
};

const previousImage = () => {
  // Always navigate sequentially through the image list
  if (currentImageIndex.value > 0) {
    navigateToImage(imageList.value[currentImageIndex.value - 1].id);
  } else {
    navigateToImage(imageList.value[imageList.value.length - 1].id); // Loop to last
  }
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

// Viewer management
const updateViewerNodes = () => {
  if (!virtualTour.value || imageList.value.length === 0) return;

  try {
    console.log("Building nodes for", imageList.value.length, "images");

    const nodes = imageList.value.map((image) => {
      // Build GPS coordinates for the node
      const nodeGps = image.gpsCoordinates
        ? [
            image.gpsCoordinates.longitude,
            image.gpsCoordinates.latitude,
            image.gpsCoordinates.altitude,
          ]
        : undefined;

      // Build sphere correction (align pano north to real north)
      const nodeSphereCorrection =
        image.sphereCorrectionPan != null
          ? {
              pan: `${image.sphereCorrectionPan}deg`,
              tilt: "0deg",
              roll: "0deg",
            }
          : undefined;

      // Only include links if they actually exist and are valid
      const validLinks = (image.links || [])
        .filter((link) => {
          // Make sure the target node exists in our image list
          return imageList.value.some((img) => img.id === link.nodeId);
        })
        .map((link) => ({ nodeId: link.nodeId }));

      const node = {
        id: image.id,
        panorama: image.panorama,
        name: image.filename,
        gps: nodeGps, // <-- required for GPS bearings
        sphereCorrection: nodeSphereCorrection, // <-- align pano north to real north
      };

      // Only add links property if there are actual valid links
      if (validLinks.length > 0) {
        node.links = validLinks;
      }

      console.log("Created node:", {
        id: node.id,
        name: node.name,
        hasGps: !!node.gps,
        linkCount: validLinks.length,
        links: validLinks.map((l) => l.nodeId),
        hasLinksProperty: "links" in node,
      });

      return node;
    });

    console.log("Setting nodes in VirtualTour plugin...");
    virtualTour.value.setNodes(
      nodes,
      currentNode.value?.id || imageList.value[0]?.id
    );
    console.log("Nodes set successfully");

    // Log summary of links
    const nodesWithLinks = nodes.filter((n) => n.links.length > 0);
    const nodesWithoutLinks = nodes.filter((n) => n.links.length === 0);
    console.log(
      `Nodes with links: ${nodesWithLinks.length}, without links: ${nodesWithoutLinks.length}`
    );
  } catch (error) {
    console.error("Error updating viewer nodes:", error);
    showStatus("Failed to update viewer nodes: " + error.message);
  }
};

// Initialize viewer
const initializeViewer = () => {
  if (!viewerContainer.value || viewer.value) return; // Prevent re-initialization

  try {
    console.log("Initializing viewer with GPS mode...");

    viewer.value = new Viewer({
      container: viewerContainer.value,
      plugins: [
        MarkersPlugin,
        [
          VirtualTourPlugin,
          {
            dataMode: "client",
            positionMode: "gps",
            renderMode: "3d",
            linksOnCompass: true,
          },
        ],
      ],
    });

    virtualTour.value = viewer.value.getPlugin(VirtualTourPlugin);
    console.log("VirtualTour plugin initialized successfully");

    // Listen for node changes
    virtualTour.value.addEventListener("node-changed", ({ node }) => {
      console.log("Node changed to:", node.id);
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

    // Set initial nodes if we have images
    if (imageList.value.length > 0) {
      console.log("Setting initial nodes, count:", imageList.value.length);
      updateViewerNodes();
      updateCompassState();
    }

    console.log("Viewer initialization completed successfully");
  } catch (error) {
    console.error("Error initializing viewer:", error);
    showStatus("Failed to initialize viewer: " + error.message);
  }
};

// Initialize on mount
onMounted(() => {
  // Add click-outside handler to close dropdowns
  const handleClickOutside = (event) => {
    const searchContainer = event.target.closest(".relative");
    if (!searchContainer) {
      showSearchDropdown.value = false;
    }
  };
  document.addEventListener("click", handleClickOutside);

  // Do not initialize viewer on mount, wait for content to be loaded
  // initializeViewer();
});

// Cleanup on unmount
onUnmounted(() => {
  if (typeof document !== "undefined") {
    document.removeEventListener("click", () => {});
  }
});
</script>

<style lang="scss" scoped></style>
