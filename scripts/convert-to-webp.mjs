#!/usr/bin/env node
/**
 * Convert all images to WebP format and reorganize.
 * 
 * Steps:
 * 1. Convert procedures/ images to .webp (resize oversized ones to 800x600)
 * 2. Convert site/ images to .webp
 * 3. Move used blog images from wp/ to blog/ as .webp (resize to 1200px wide)
 * 4. Delete the wp/ folder entirely
 * 5. Update all frontmatter references in .md files
 * 6. Update hardcoded paths in .astro files
 * 
 * Requires: ImageMagick 7 (magick command)
 */

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const PUBLIC = join(ROOT, 'public', 'images');
const SRC = join(ROOT, 'src');

function magick(input, output, opts = '') {
  execSync(`magick "${input}" ${opts} "${output}"`, { encoding: 'utf-8' });
}

// ============================================================
// 1. Convert procedures/ to WebP
// ============================================================
function convertProcedures() {
  const dir = join(PUBLIC, 'procedures');
  const files = readdirSync(dir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  
  console.log(`\n=== Converting ${files.length} procedure images to WebP ===`);
  
  for (const file of files.sort()) {
    const input = join(dir, file);
    const name = basename(file, extname(file));
    const output = join(dir, `${name}.webp`);
    
    // Check dimensions
    const dims = execSync(`magick identify -format "%w %h" "${input}"`, { encoding: 'utf-8' }).trim();
    const [w, h] = dims.split(' ').map(Number);
    
    // Resize if oversized (the shutterstock JPGs are 2560px+)
    if (w > 800 || h > 600) {
      magick(input, output, '-resize 800x600^ -gravity center -extent 800x600 -quality 80');
      console.log(`  [resize+webp] ${file} (${w}x${h}) -> ${name}.webp`);
    } else {
      magick(input, output, '-quality 80');
      console.log(`  [webp] ${file} -> ${name}.webp`);
    }
    
    // Remove original
    rmSync(input);
  }
}

// ============================================================
// 2. Convert site/ to WebP
// ============================================================
function convertSite() {
  const dir = join(PUBLIC, 'site');
  if (!existsSync(dir)) return;
  
  const files = readdirSync(dir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  
  console.log(`\n=== Converting ${files.length} site images to WebP ===`);
  
  for (const file of files.sort()) {
    const input = join(dir, file);
    const name = basename(file, extname(file));
    const output = join(dir, `${name}.webp`);
    
    magick(input, output, '-quality 80');
    console.log(`  [webp] ${file} -> ${name}.webp`);
    
    rmSync(input);
  }
}

// ============================================================
// 3. Move blog images from wp/ to blog/ as WebP
// ============================================================
function convertBlog() {
  const blogDir = join(PUBLIC, 'blog');
  if (!existsSync(blogDir)) mkdirSync(blogDir, { recursive: true });
  
  // Find all blog .md files and extract their thumbnail paths
  const blogContentDir = join(SRC, 'content', 'blog');
  const mdFiles = readdirSync(blogContentDir).filter(f => f.endsWith('.md'));
  
  console.log(`\n=== Converting ${mdFiles.length} blog images to WebP ===`);
  
  const pathMap = {}; // old path -> new path
  
  for (const mdFile of mdFiles) {
    const content = readFileSync(join(blogContentDir, mdFile), 'utf-8');
    const match = content.match(/thumbnailImage:\s*"([^"]+)"/);
    if (!match) continue;
    
    const oldPath = match[1]; // e.g. /images/wp/2025/03/Blog-Clinica-Bendov-1.png
    const slug = basename(mdFile, '.md'); // e.g. liposuccion-vaser-vs-tradicional
    const newPath = `/images/blog/${slug}.webp`;
    
    const inputFile = join(ROOT, 'public', oldPath);
    const outputFile = join(blogDir, `${slug}.webp`);
    
    if (existsSync(inputFile)) {
      // Resize to 1200px wide max and convert to WebP
      magick(inputFile, outputFile, '-resize 1200x720^ -gravity center -extent 1200x720 -quality 80');
      console.log(`  [webp] ${basename(oldPath)} -> blog/${slug}.webp`);
      pathMap[oldPath] = newPath;
    } else {
      console.log(`  [MISSING] ${oldPath}`);
    }
  }
  
  return pathMap;
}

// ============================================================
// 4. Update all references
// ============================================================
function updateReferences(blogPathMap) {
  console.log('\n=== Updating image references ===');
  
  // Update procedure .md files: .png/.jpg -> .webp
  const procCollections = ['procedimientos-corporales', 'procedimientos-faciales', 'procedimientos-intimos'];
  
  for (const collection of procCollections) {
    const dir = join(SRC, 'content', collection);
    const files = readdirSync(dir).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      const filePath = join(dir, file);
      let content = readFileSync(filePath, 'utf-8');
      
      // Replace .png and .jpg extensions in thumbnailImage and heroImage
      const newContent = content
        .replace(/(thumbnailImage:\s*"\/images\/procedures\/[^"]+)\.(png|jpg|jpeg)"/g, '$1.webp"')
        .replace(/(heroImage:\s*"\/images\/procedures\/[^"]+)\.(png|jpg|jpeg)"/g, '$1.webp"');
      
      if (newContent !== content) {
        writeFileSync(filePath, newContent);
        console.log(`  [updated] ${collection}/${file}`);
      }
    }
  }
  
  // Update blog .md files with new paths
  const blogDir = join(SRC, 'content', 'blog');
  const blogFiles = readdirSync(blogDir).filter(f => f.endsWith('.md'));
  
  for (const file of blogFiles) {
    const filePath = join(blogDir, file);
    let content = readFileSync(filePath, 'utf-8');
    let changed = false;
    
    for (const [oldPath, newPath] of Object.entries(blogPathMap)) {
      if (content.includes(oldPath)) {
        content = content.replace(oldPath, newPath);
        changed = true;
      }
    }
    
    if (changed) {
      writeFileSync(filePath, content);
      console.log(`  [updated] blog/${file}`);
    }
  }
  
  // Update .astro files: site/ images .png/.jpg -> .webp
  const astroPatterns = [
    join(SRC, 'pages'),
    join(SRC, 'components'),
    join(SRC, 'layouts'),
  ];
  
  for (const dir of astroPatterns) {
    const files = readdirSync(dir, { recursive: true }).filter(f => 
      f.endsWith('.astro') || f.endsWith('.tsx') || f.endsWith('.ts')
    );
    
    for (const file of files) {
      const filePath = join(dir, file);
      let content = readFileSync(filePath, 'utf-8');
      
      // Replace site/ image extensions
      const newContent = content
        .replace(/(\/images\/site\/[^"]+)\.(png|jpg|jpeg)/g, '$1.webp');
      
      if (newContent !== content) {
        writeFileSync(filePath, newContent);
        console.log(`  [updated] ${file}`);
      }
    }
  }
}

// ============================================================
// 5. Delete wp/ folder
// ============================================================
function deleteWpFolder() {
  const wpDir = join(PUBLIC, 'wp');
  if (existsSync(wpDir)) {
    const fileCount = execSync(`find "${wpDir}" -type f | wc -l`, { encoding: 'utf-8' }).trim();
    rmSync(wpDir, { recursive: true });
    console.log(`\n=== Deleted wp/ folder (${fileCount} files) ===`);
  }
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log('Converting all images to WebP...\n');
  
  // Get sizes before
  const sizeBefore = execSync(`du -sh "${PUBLIC}"`, { encoding: 'utf-8' }).trim();
  console.log(`Before: ${sizeBefore}`);
  
  convertProcedures();
  convertSite();
  const blogPathMap = convertBlog();
  updateReferences(blogPathMap);
  deleteWpFolder();
  
  // Get sizes after
  const sizeAfter = execSync(`du -sh "${PUBLIC}"`, { encoding: 'utf-8' }).trim();
  console.log(`\nAfter: ${sizeAfter}`);
  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
