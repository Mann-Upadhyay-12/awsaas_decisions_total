import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_DIR = path.join(__dirname, '../src/assets/raw');
const OUT_DIR = path.join(__dirname, '../public/assets');

const RESOLUTIONS = {
  small: 960,
  medium: 1920,
  large: 3840
};

function optimizeImage(file) {
  const ext = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    return;
  }

  const inputPath = path.join(RAW_DIR, file);
  console.log(`Processing image: ${file}`);

  // 1. Copy the original to public/assets/
  const originalDest = path.join(OUT_DIR, file);
  fs.copyFileSync(inputPath, originalDest);
  console.log(`  - Copied original to ${originalDest}`);

  // 2. Generate resolutions
  for (const [key, width] of Object.entries(RESOLUTIONS)) {
    const destDir = path.join(OUT_DIR, key);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const destPath = path.join(destDir, file);

    try {
      // Scale width to width, and height to be proportional (even number)
      const filter = `scale='min(${width},iw)':-2`;
      console.log(`  - Generating ${key} (${width}px wide)...`);
      execSync(`ffmpeg -y -i "${inputPath}" -vf "${filter}" "${destPath}"`, { stdio: 'ignore' });
    } catch (err) {
      console.error(`  - Failed to generate ${key} for ${file}:`, err.message);
    }
  }
}

function main() {
  if (!fs.existsSync(RAW_DIR)) {
    console.error(`Raw assets directory not found at ${RAW_DIR}`);
    process.exit(1);
  }

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(RAW_DIR);
  for (const file of files) {
    optimizeImage(file);
  }
  console.log('Image processing completed.');
}

main();
