#!/usr/bin/env node

/**
 * Icon Generation Script
 *
 * Converts SVG icons to PNG format for Chrome extension.
 *
 * Usage:
 * - pnpm generate-icons
 */

import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, "..", "src", "public", "icons");

async function generateIcons() {
  try {
    const sharp = (await import("sharp")).default;

    for (const size of sizes) {
      const svgPath = path.join(iconsDir, `icon-${size}.svg`);
      const pngPath = path.join(iconsDir, `icon-${size}.png`);

      if (fs.existsSync(svgPath)) {
        await sharp(svgPath).resize(size, size).png().toFile(pngPath);
        console.log(`Generated: icon-${size}.png`);
      }
    }

    console.log("Icon generation complete!");
  } catch (error) {
    console.error("Error generating icons:", error);
    process.exit(1);
  }
}

generateIcons();
