#!/usr/bin/env node
/**
 * Fix procedure thumbnail images:
 * 1. Re-download composite images from source URLs
 * 2. Crop top ~27% (just the first photo, avoiding bleed into the next)
 * 3. Resize to 800x600 for consistent card display
 * 
 * Requires: ImageMagick 7 (magick command)
 */

import { execSync } from 'node:child_process';
import { writeFile, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const PROCEDURES_DIR = join(import.meta.dirname, '..', 'public', 'images', 'procedures');

// Read the procedure-images.json to get source URLs
const procedureImages = JSON.parse(
  await readFile(join(import.meta.dirname, 'procedure-images.json'), 'utf-8')
);

// These are the images that need re-downloading and re-cropping
// (tall composites that were cropped too generously)
const COMPOSITES_TO_FIX = [
  // 576x1024 composites (3 sections: ~341px each, with logo or photo)
  'lipoescultura',
  'cellusculpt-pro', 
  'hiperhidrosis',
  'lifechip-testosterona',
  'bichectomia',
  'labioplastia-laser',
  'laser-fraccionado-co2',
  'lifting-labios-mayores',
  'mesoterapia-intima',
  'perfilado-mandibular',
  'plasma-rico-en-plaquetas',
  'plasma-rico-en-plaquetas-intimo',
  'rejuvenecimiento-intimo-laser-co2',
  'relleno-de-parpados',
  'vaginoplastia',
  
  // 900x1600 composites (3 sections: ~533px each)
  'abdominoplastia',
  'aumento-mamario',
  'lifting-de-brazos',
  'lifting-facial',
];

async function downloadImage(url) {
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      'Accept': 'image/*,*/*',
    },
    redirect: 'follow',
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return Buffer.from(await resp.arrayBuffer());
}

function getExtension(url) {
  try {
    const pathname = new URL(url).pathname;
    const ext = extname(pathname).split('?')[0];
    return ext || '.jpg';
  } catch {
    return '.jpg';
  }
}

async function main() {
  console.log(`Fixing ${COMPOSITES_TO_FIX.length} composite images...\n`);
  
  let fixed = 0;
  let failed = 0;
  
  for (const slug of COMPOSITES_TO_FIX) {
    const info = procedureImages[slug];
    if (!info?.sourceUrl) {
      console.log(`[skip] ${slug} - no source URL`);
      failed++;
      continue;
    }
    
    const ext = getExtension(info.sourceUrl);
    const filepath = join(PROCEDURES_DIR, `${slug}${ext}`);
    
    console.log(`[fix] ${slug}`);
    console.log(`  Downloading: ${info.sourceUrl}`);
    
    try {
      // Re-download original
      const buffer = await downloadImage(info.sourceUrl);
      const tempPath = filepath + '.tmp';
      await writeFile(tempPath, buffer);
      
      // Get dimensions
      const dims = execSync(`magick identify -format "%w %h" "${tempPath}"`, { encoding: 'utf-8' }).trim();
      const [w, h] = dims.split(' ').map(Number);
      console.log(`  Original: ${w}x${h}`);
      
      // Crop top portion - use 27% of height to avoid bleeding into next section
      // For a 3-section composite (each ~33%), 27% gives clean margin
      // For a 2-section composite, this also works well
      const cropH = Math.round(h * 0.27);
      
      // Crop and resize to 800x600
      execSync(
        `magick "${tempPath}" -crop ${w}x${cropH}+0+0 +repage -resize 800x600^ -gravity center -extent 800x600 -quality 90 "${filepath}"`,
        { encoding: 'utf-8' }
      );
      
      // Remove temp
      execSync(`rm "${tempPath}"`);
      
      console.log(`  Cropped: top ${w}x${cropH} -> 800x600`);
      fixed++;
    } catch (err) {
      console.log(`  [ERROR] ${err.message}`);
      failed++;
    }
    
    // Be polite to the server
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log(`\nDone: ${fixed} fixed, ${failed} failed`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
