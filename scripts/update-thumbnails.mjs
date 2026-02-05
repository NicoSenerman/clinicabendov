#!/usr/bin/env node
/**
 * Update all procedure content files to use the crawled images.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const MAPPING = JSON.parse(readFileSync('/home/nico/Documents/Projects/ClinicaBendov/scripts/procedure-images.json', 'utf-8'));
const CONTENT_DIR = '/home/nico/Documents/Projects/ClinicaBendov/src/content';

const DIRS = {
  'procedimientos-corporales': ['liposuccion-vaser', 'lipoescultura', 'carboxiterapia', 'lipo-en-ginecomastia', 'lipo-transferencia', 'lifechip-testosterona', 'abdominoplastia', 'aumento-mamario', 'cellusculpt-pro', 'hiperhidrosis', 'lifting-de-brazos', 'minilipo-vaser'],
  'procedimientos-faciales': ['blefaroplastia', 'toxina-botulinica', 'rellenos-faciales', 'plasma-rico-en-plaquetas', 'bioestimulador-de-colageno', 'mesoterapia-con-elastica', 'hilos-tensores', 'bichectomia', 'bioplastia-de-menton', 'bioplastia-de-pomulos', 'rinomodelacion', 'laser-fraccionado-co2', 'lobuloplastia', 'perfilado-mandibular', 'relleno-de-parpados', 'bioestimuladores', 'lifting-facial'],
  'procedimientos-intimos': ['rejuvenecimiento-intimo-laser-co2', 'labioplastia-laser', 'vaginoplastia', 'plasma-rico-en-plaquetas-intimo', 'mesoterapia-intima', 'lifting-labios-mayores', 'rejuvenecimiento-laser-co2'],
};

let updated = 0;

for (const [dir, slugs] of Object.entries(DIRS)) {
  for (const slug of slugs) {
    const filePath = join(CONTENT_DIR, dir, `${slug}.md`);
    let content;
    try {
      content = readFileSync(filePath, 'utf-8');
    } catch {
      console.log(`  SKIP: ${filePath} not found`);
      continue;
    }

    // Find mapping - for rejuvenecimiento-laser-co2, use the intimo version
    let mapSlug = slug;
    if (slug === 'rejuvenecimiento-laser-co2') mapSlug = 'rejuvenecimiento-intimo-laser-co2';
    
    const entry = MAPPING[mapSlug];
    if (!entry) {
      console.log(`  SKIP: No image mapping for ${slug}`);
      continue;
    }

    const newPath = `/${entry.localPath}`;
    
    // Replace thumbnailImage line
    const newContent = content.replace(
      /^thumbnailImage: ".*"$/m,
      `thumbnailImage: "${newPath}"`
    );

    if (newContent !== content) {
      writeFileSync(filePath, newContent, 'utf-8');
      console.log(`  ✓ ${slug} → ${newPath}`);
      updated++;
    } else {
      console.log(`  = ${slug} (no change needed)`);
    }
  }
}

console.log(`\nUpdated ${updated} files.`);
