# 360° Image Linker Tool

A tool for linking 360° images to generate in sequence viewing.

## Features

- Load and view 360° panoramic images
- Create bidirectional links between images (next/previous)
- Compass calibration for north direction
- GPS coordinates display (extracted from image EXIF data)
- Export configuration

## Getting Started

1. Install dependencies:

```bash
bun install
```

2. **IMPORTANT**: Place your 360° images in the /public/images directory following the **new nested folder structure**: `project/section/subsection`

   **Example structure:**

   ```
   public/images/
   ├── ProjectName/
   │   ├── SectionA/
   │   │   ├── SubsectionA1/
   │   │   │   ├── image1.jpg
   │   │   │   ├── image2.jpg
   │   │   │   └── image3.jpg
   │   │   └── SubsectionA2/
   │   │       ├── image4.jpg
   │   │       └── image5.jpg
   │   └── SectionB/
   │       └── SubsectionB1/
   │           ├── image6.jpg
   │           └── image7.jpg
   └── AnotherProject/
       └── MainSection/
           └── Area1/
               ├── image8.jpg
               └── image9.jpg
   ```

   **Example in our case:**

   ```
   public/images/
   ├── Pertamina/
   │   ├── CintaP/
   │   │   ├── 04CintaP_CellarDeckOperation/
   │   │   │   ├── entrance_001.jpg
   │   │   │   └── entrance_002.jpg
   │   │   └── 08CintaP_UpperMainDeck/
   │   │       ├── main_001.jpg
   │   │       └── main_002.jpg
   │   └── PlantB/
   │       └── Overview/
   │           ├── overview_001.jpg
   │           └── overview_002.jpg
   ```

3. Run the development server:

```bash
bun run dev
```

4. If working locally, open your browser and navigate to the local development URL

## How To Use

1. **Directory Selection**: Choose a project/section/subsection path
2. **Image Navigation**: Browse through images using next/previous buttons
3. **Creating Links**:
   - Select an image
   - Click "Set" next to "Next" or "Previous"
   - Choose target image from the list
   - Links are bidirectional (if A → B is set as "next", B → A is automatically set as "previous")
4. **Compass Calibration**:
   - Rotate view to face north
   - Click "Set Current Direction as North"
   - The heading value on the screen is relative to the initial point
5. **Auto-Save**: Your progress (links, compass calibrations, etc.) is automatically saved to your browser's localStorage as you work. To be safe, export the json config when working in large directories. You can import the same config back to resume the progress. But make sure the project folder structure stays the same.
6. **Export**: When exporting, it will generate a json configuration file compatible with Photo Sphere Viewer
7. **Result**: Example output result is as in example-output.json for reference
