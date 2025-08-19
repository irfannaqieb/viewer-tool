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

2. Place your 360° images in subdirectories under `public/images/`
   Example structure:

   ```
   public/images/
   ├── dir1/
   │   ├── image1.jpg
   │   ├── image2.jpg
   ├── dir2/
   │   ├── image3.jpg
   ```

3. Run the development server:

```bash
bun run dev
```

4. Open your browser and navigate to the local development URL

## How It Works

1. **Directory Selection**: Choose a directory containing your 360° images
2. **Image Navigation**: Browse through images using next/previous buttons
3. **Creating Links**:
   - Select an image
   - Click "Set" next to "Next" or "Previous"
   - Choose target image from the list
   - Links are bidirectional (if A → B is set as "next", B → A is automatically set as "previous")
4. **Compass Calibration**:
   - Rotate view to face north
   - Click "Set Current Direction as North"
5. **Export**: Generate a tour configuration file compatible with Photo Sphere Viewer
6. **Result** Example output result is as in example-output.json
