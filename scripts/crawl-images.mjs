#!/usr/bin/env node
/**
 * Crawl clinicabendov.cl procedure pages to find the REAL main content images.
 * 
 * Strategy (in priority order):
 * 1. data-vc-parallax-image attribute (parallax background images in content area)
 * 2. First bv-data-src or src img inside #page-body from wp-content/uploads (not logo, not tiny)
 * 3. og:image meta tag as fallback
 * 
 * The site uses BirdVision lazy loading (bv-data-src instead of src for many images).
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const PROCEDURES = {
  // CORPORALES
  'liposuccion-vaser': 'https://clinicabendov.cl/procedimientos-corporales/liposuccion-vaser/',
  'lipoescultura': 'https://clinicabendov.cl/procedimientos-corporales/lipoescultura/',
  'carboxiterapia': 'https://clinicabendov.cl/procedimientos-corporales/carboxiterapia/',
  'lipo-en-ginecomastia': 'https://clinicabendov.cl/procedimientos-corporales/lipo-en-ginecomastia/',
  'lipo-transferencia': 'https://clinicabendov.cl/procedimientos-corporales/lipo-transferencia/',
  'lifechip-testosterona': 'https://clinicabendov.cl/procedimientos-corporales/lifechip-testosterona/',
  'abdominoplastia': 'https://clinicabendov.cl/procedimientos-corporales/abdominoplastia/',
  'aumento-mamario': 'https://clinicabendov.cl/procedimientos-corporales/aumento-mamario/',
  'cellusculpt-pro': 'https://clinicabendov.cl/procedimientos-corporales/cellusculpt-pro/',
  'hiperhidrosis': 'https://clinicabendov.cl/procedimientos-corporales/hiperhidrosis/',
  'lifting-de-brazos': 'https://clinicabendov.cl/procedimientos-corporales/lifting-de-brazos/',
  'minilipo-vaser': 'https://clinicabendov.cl/procedimientos-corporales/minilipo-vaser/',

  // FACIALES
  'blefaroplastia': 'https://clinicabendov.cl/procedimientos-faciales/blefaroplastia-o-cirugia-de-parpados/',
  'toxina-botulinica': 'https://clinicabendov.cl/procedimientos-faciales/toxina-botulinica/',
  'rellenos-faciales': 'https://clinicabendov.cl/procedimientos-faciales/rellenos-faciales/',
  'plasma-rico-en-plaquetas': 'https://clinicabendov.cl/procedimientos-faciales/plasma-rico-en-plaquetas/',
  'bioestimulador-de-colageno': 'https://clinicabendov.cl/procedimientos-faciales/bioestimulador-de-colageno-1/',
  'mesoterapia-con-elastica': 'https://clinicabendov.cl/procedimientos-faciales/mesoterapia-con-elastica/',
  'hilos-tensores': 'https://clinicabendov.cl/procedimientos-faciales/hilos-tensores/',
  'bichectomia': 'https://clinicabendov.cl/procedimientos-faciales/bichectomia/',
  'bioplastia-de-menton': 'https://clinicabendov.cl/procedimientos-faciales/bioplastia-de-menton/',
  'bioplastia-de-pomulos': 'https://clinicabendov.cl/procedimientos-faciales/bioplastia-de-pomulos/',
  'rinomodelacion': 'https://clinicabendov.cl/procedimientos-faciales/rinomodelacion/',
  'laser-fraccionado-co2': 'https://clinicabendov.cl/procedimientos-faciales/laser_fraccionado_de_co2/',
  'lobuloplastia': 'https://clinicabendov.cl/procedimientos-faciales/lobuloplastia/',
  'perfilado-mandibular': 'https://clinicabendov.cl/procedimientos-faciales/perfilado-mandibular-rejuvenecimiento-facial/',
  'relleno-de-parpados': 'https://clinicabendov.cl/procedimientos-faciales/relleno-de-parpados/',
  'bioestimuladores': 'https://clinicabendov.cl/procedimientos-faciales/bioestimuladores/',
  'lifting-facial': 'https://clinicabendov.cl/procedimientos-faciales/lifting-facial/',

  // INTIMOS
  'rejuvenecimiento-intimo-laser-co2': 'https://clinicabendov.cl/procedimientos-intimos/rejuvenecimiento-intimo-laser-co2/',
  'labioplastia-laser': 'https://clinicabendov.cl/procedimientos-intimos/labioplastia-laser/',
  'vaginoplastia': 'https://clinicabendov.cl/procedimientos-intimos/vaginoplastia-rejuvenecimiento-vaginal/',
  'plasma-rico-en-plaquetas-intimo': 'https://clinicabendov.cl/procedimientos-intimos/plasma-rico-en-plaquetas-intimo/',
  'mesoterapia-intima': 'https://clinicabendov.cl/procedimientos-intimos/mesoterapia-intima-vaginal/',
  'lifting-labios-mayores': 'https://clinicabendov.cl/procedimientos-intimos/lifting-labios-mayores-rejuvenecimiento-volumen/',
};

const OUTPUT_DIR = join(import.meta.dirname, '..', 'public', 'images', 'procedures');
const JSON_OUTPUT = join(import.meta.dirname, 'procedure-images.json');

// Patterns to exclude
const LOGO_PATTERNS = [
  /logo/i,
  /BENDOV-CLINICA-ESTETICA_Logo/i,
  /bendov.*logo/i,
];

const BANNER_PATTERNS = [
  /Sin-titulo-900-x-1600/i,  // The site-wide banner image
  /al_opt_content/i,          // CDN-optimized tiny thumbnails (usually resized logos/banners)
];

function isExcludedImage(url) {
  // Skip logo images
  for (const pattern of LOGO_PATTERNS) {
    if (pattern.test(url)) return true;
  }
  // Skip banner/CDN-optimized tiny images
  for (const pattern of BANNER_PATTERNS) {
    if (pattern.test(url)) return true;
  }
  return false;
}

function isTooSmall(imgTag) {
  const widthMatch = imgTag.match(/width[=:]["']?(\d+)/i);
  const heightMatch = imgTag.match(/height[=:]["']?(\d+)/i);
  if (widthMatch && parseInt(widthMatch[1]) < 200) return true;
  if (heightMatch && parseInt(heightMatch[1]) < 200) return true;
  // Check for dimension patterns in filename like -300x91.
  const dimMatch = imgTag.match(/[-_](\d+)x(\d+)\./);
  if (dimMatch) {
    const w = parseInt(dimMatch[1]);
    const h = parseInt(dimMatch[2]);
    if (w < 200 && h < 200) return true;
  }
  return false;
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function findContentImage(html) {
  // Extract the page-body section
  const pageBodyIdx = html.indexOf('id="page-body"');
  if (pageBodyIdx === -1) {
    console.log('    [warn] No #page-body found');
    return findOgImage(html);
  }

  const pageBody = html.slice(pageBodyIdx);

  // Strategy 1: data-vc-parallax-image (parallax background images)
  const parallaxRegex = /data-vc-parallax-image="([^"]+)"/g;
  let match;
  while ((match = parallaxRegex.exec(pageBody)) !== null) {
    const url = decodeHtmlEntities(match[1]);
    if (url.includes('wp-content/uploads') && !isExcludedImage(url)) {
      console.log('    [parallax] Found:', url);
      return url;
    }
  }

  // Strategy 2: Look for img tags with bv-data-src or src from wp-content/uploads
  // First try bv-data-src (lazy loaded actual images), then regular src
  const imgRegex = /<img[^>]+>/gi;
  const candidates = [];

  while ((match = imgRegex.exec(pageBody)) !== null) {
    const imgTag = match[0];

    // Skip tiny images
    if (isTooSmall(imgTag)) continue;

    // Try bv-data-src first (the real image URL for lazy-loaded images)
    const bvSrcMatch = imgTag.match(/bv-data-src="([^"]+)"/);
    if (bvSrcMatch) {
      const url = decodeHtmlEntities(bvSrcMatch[1]);
      if (url.includes('wp-content/uploads') && !isExcludedImage(url)) {
        candidates.push({ url, tag: imgTag, source: 'bv-data-src' });
        continue;
      }
    }

    // Try regular src
    const srcMatch = imgTag.match(/\bsrc="([^"]+)"/);
    if (srcMatch) {
      const url = decodeHtmlEntities(srcMatch[1]);
      if (url.includes('wp-content/uploads') && !isExcludedImage(url) && !url.startsWith('data:')) {
        candidates.push({ url, tag: imgTag, source: 'src' });
      }
    }
  }

  // Strategy 2b: Also look for background-image: url(...) in inline styles within page-body
  const bgRegex = /background-image:\s*url\(["']?([^"')]+)["']?\)/gi;
  while ((match = bgRegex.exec(pageBody)) !== null) {
    const url = decodeHtmlEntities(match[1]);
    if (url.includes('wp-content/uploads') && !isExcludedImage(url)) {
      console.log('    [bg-image] Found:', url);
      return url;
    }
  }

  if (candidates.length > 0) {
    // Return the first non-before/after-slider image if possible,
    // otherwise return the first candidate
    const firstCandidate = candidates[0];
    console.log(`    [${firstCandidate.source}] Found:`, firstCandidate.url);
    return firstCandidate.url;
  }

  // Strategy 3: og:image meta tag
  return findOgImage(html);
}

function findOgImage(html) {
  // Look in the full HTML for og:image
  const ogMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
  if (ogMatch) {
    const url = decodeHtmlEntities(ogMatch[1]);
    if (url.includes('wp-content/uploads') && !isExcludedImage(url)) {
      console.log('    [og:image] Found:', url);
      return url;
    }
  }

  console.log('    [NONE] No suitable image found');
  return null;
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

async function downloadImage(url, slug) {
  const ext = getExtension(url);
  const filename = `${slug}${ext}`;
  const filepath = join(OUTPUT_DIR, filename);

  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/*,*/*',
      },
      redirect: 'follow',
    });

    if (!resp.ok) {
      console.log(`    [download FAIL] ${resp.status} ${resp.statusText}`);
      return null;
    }

    const buffer = Buffer.from(await resp.arrayBuffer());
    await writeFile(filepath, buffer);

    const sizekb = (buffer.length / 1024).toFixed(1);
    console.log(`    [saved] ${filename} (${sizekb} KB)`);
    return `images/procedures/${filename}`;
  } catch (err) {
    console.log(`    [download ERROR] ${err.message}`);
    return null;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}`);
  }

  const results = {};
  const slugs = Object.keys(PROCEDURES);
  const total = slugs.length;

  console.log(`\nCrawling ${total} procedure pages...\n`);

  for (let i = 0; i < total; i++) {
    const slug = slugs[i];
    const url = PROCEDURES[slug];
    console.log(`[${i + 1}/${total}] ${slug}`);
    console.log(`  URL: ${url}`);

    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'follow',
      });

      if (!resp.ok) {
        console.log(`  [FETCH FAIL] ${resp.status} ${resp.statusText}`);
        results[slug] = null;
        await sleep(500);
        continue;
      }

      const html = await resp.text();
      const imageUrl = findContentImage(html);

      if (imageUrl) {
        const localPath = await downloadImage(imageUrl, slug);
        results[slug] = {
          sourceUrl: imageUrl,
          localPath: localPath,
        };
      } else {
        results[slug] = null;
      }
    } catch (err) {
      console.log(`  [ERROR] ${err.message}`);
      results[slug] = null;
    }

    // Be polite to the server
    if (i < total - 1) {
      await sleep(500);
    }
  }

  // Write JSON output
  await writeFile(JSON_OUTPUT, JSON.stringify(results, null, 2));
  console.log(`\n\nResults written to: ${JSON_OUTPUT}`);

  // Summary
  const found = Object.values(results).filter(v => v?.localPath).length;
  const failed = total - found;
  console.log(`\nSummary: ${found}/${total} images downloaded, ${failed} failed/missing`);

  if (failed > 0) {
    console.log('\nMissing images for:');
    for (const [slug, val] of Object.entries(results)) {
      if (!val?.localPath) {
        console.log(`  - ${slug}`);
      }
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
