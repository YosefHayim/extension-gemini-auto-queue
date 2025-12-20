#!/usr/bin/env node

/**
 * Icon Generation Script
 *
 * This script converts SVG icons to PNG format for Chrome extension.
 *
 * Prerequisites:
 * - Install sharp: npm install sharp --save-dev
 *
 * Usage:
 * - node scripts/generate-icons.js
 *
 * Note: For now, the extension uses SVG icons which WXT will handle.
 * If you need PNG icons, run this script after installing sharp.
 */

const fs = require("fs");
const path = require("path");

const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, "..", "public", "icons");

async function generateIcons() {
  try {
    // Check if sharp is available
    let sharp;
    try {
      sharp = require("sharp");
    } catch {
      console.log("Sharp not installed. To generate PNG icons, run:");
      console.log("  npm install sharp --save-dev");
      console.log("  node scripts/generate-icons.js");
      console.log("");
      console.log("For now, SVG icons are being used.");
      return;
    }

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
  }
}

generateIcons();
