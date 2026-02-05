#!/usr/bin/env node
/**
 * Crop composite procedure images to extract just the top photo.
 * 
 * Many procedure images from the WP site are tall composites (576x1024 or 900x1600)
 * with 2-3 stacked photos, sometimes with a Bendov logo band in between.
 * When displayed in a 4:3 card grid with object-cover, the logo or middle section shows.
 * 
 * This script crops each composite to extract the top ~1/3 of the image (the first photo),
 * then resizes to a consistent 800x600 (4:3) for optimal card display.
 * 
 * Requires: ImageMagick 7 (magick command)
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const PROCEDURES_DIR = join(import.meta.dirname, '..', 'public', 'images', 'procedures');

// Images that are tall composites and need cropping.
// We'll identify them by checking if height > width * 1.3 (portrait composites)
// Skip images that are already good standalone photos (like the .jpg shutterstock images)

async function getImageDimensions(filepath) {
  try {
    const output = execSync(`magick identify -format "%w %h" "${filepath}"`, { encoding: 'utf-8' }).trim();
    const [w, h] = output.split(' ').map(Number);
    return { width: w, height: h };
  } catch {
    return null;
  }
}

async function cropTopThird(filepath, dims) {
  const { width, height } = dims;
  
  // For 576x1024 images: top 1/3 = ~341px height. Crop to 576x341 then scale to 800x600
  // For 900x1600 images: top 1/3 = ~533px height. Crop to 900x533 then scale to 800x600
  // We want a 4:3 aspect ratio crop from the top
  
  const cropHeight = Math.round(height / 3);
  // Ensure we get at least a 4:3 ratio from the top
  const targetRatio = 4 / 3;
  const cropForRatio = Math.round(width / targetRatio);
  
  // Use whichever is smaller to ensure we don't go past the first photo
  const finalCropH = Math.min(cropHeight, cropForRatio);
  
  const backupPath = filepath.replace(/(\.\w+)$/, '-original$1');
  
  // Backup original
  if (!existsSync(backupPath)) {
    execSync(`cp "${filepath}" "${backupPath}"`);
  }
  
  // Crop from top-left, then resize to 800x600
  execSync(
    `magick "${filepath}" -gravity North -crop ${width}x${finalCropH}+0+0 +repage -resize 800x600^ -gravity center -extent 800x600 "${filepath}"`,
    { encoding: 'utf-8' }
  );
  
  console.log(`  Cropped: ${width}x${height} -> top ${width}x${finalCropH} -> 800x600`);
}

async function main() {
  const { readdirSync } = await import('node:fs');
  const files = readdirSync(PROCEDURES_DIR).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  
  console.log(`Found ${files.length} procedure images\n`);
  
  let cropped = 0;
  let skipped = 0;
  
  for (const file of files.sort()) {
    // Skip backup files
    if (file.includes('-original')) continue;
    
    const filepath = join(PROCEDURES_DIR, file);
    const dims = await getImageDimensions(filepath);
    
    if (!dims) {
      console.log(`[skip] ${file} - could not read dimensions`);
      skipped++;
      continue;
    }
    
    const { width, height } = dims;
    const ratio = height / width;
    
    // Only crop if it's a tall composite (portrait, height > 1.3x width)
    if (ratio > 1.3) {
      console.log(`[crop] ${file} (${width}x${height}, ratio ${ratio.toFixed(2)})`);
      await cropTopThird(filepath, dims);
      cropped++;
    } else {
      console.log(`[ok]   ${file} (${width}x${height}, ratio ${ratio.toFixed(2)}) - already good`);
      skipped++;
    }
  }
  
  console.log(`\nDone: ${cropped} cropped, ${skipped} skipped`);
  console.log(`Originals backed up as *-original.{ext}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
