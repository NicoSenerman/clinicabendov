#!/usr/bin/env node
/**
 * Download all WordPress images for the migration.
 * Reads URLs from images-to-download.json and saves to public/images/
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, createWriteStream } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { pipeline } from 'node:stream/promises';

const IMAGES_JSON = '/home/nico/Documents/Projects/ClinicaBendov/scripts/images-to-download.json';
const OUTPUT_DIR = '/home/nico/Documents/Projects/ClinicaBendov/public/images/wp';
const CONCURRENCY = 5;

async function downloadImage(url, outPath) {
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MigrationBot/1.0)',
      },
      signal: AbortSignal.timeout(30000),
    });
    if (!resp.ok) {
      return { url, status: resp.status, ok: false };
    }
    const ws = createWriteStream(outPath);
    await pipeline(resp.body, ws);
    return { url, outPath, ok: true };
  } catch (err) {
    return { url, error: err.message, ok: false };
  }
}

async function main() {
  const urls = JSON.parse(readFileSync(IMAGES_JSON, 'utf-8'));
  console.log(`Total images to download: ${urls.length}`);

  mkdirSync(OUTPUT_DIR, { recursive: true });

  let downloaded = 0;
  let failed = 0;
  const failures = [];

  // Process in batches
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    const promises = batch.map((url) => {
      // Create a path preserving some structure
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.replace('/wp-content/uploads/', '').split('/');
      const fileName = pathParts.pop();
      const subDir = pathParts.join('/');
      const outDir = join(OUTPUT_DIR, subDir);
      mkdirSync(outDir, { recursive: true });
      const outPath = join(outDir, fileName);

      if (existsSync(outPath)) {
        downloaded++;
        return Promise.resolve({ url, outPath, ok: true, cached: true });
      }

      return downloadImage(url, outPath);
    });

    const results = await Promise.all(promises);
    for (const r of results) {
      if (r.ok) {
        downloaded++;
      } else {
        failed++;
        failures.push(r);
      }
    }

    // Progress
    const total = downloaded + failed;
    if (total % 20 === 0 || i + CONCURRENCY >= urls.length) {
      console.log(`  Progress: ${total}/${urls.length} (${downloaded} ok, ${failed} failed)`);
    }
  }

  console.log(`\nDone! Downloaded: ${downloaded}, Failed: ${failed}`);

  if (failures.length > 0) {
    console.log('\nFailed downloads:');
    for (const f of failures.slice(0, 20)) {
      console.log(`  ${f.url} → ${f.error || f.status}`);
    }
    writeFileSync(
      join(OUTPUT_DIR, '..', 'failed-images.json'),
      JSON.stringify(failures, null, 2),
      'utf-8'
    );
  }
}

main().catch(console.error);
