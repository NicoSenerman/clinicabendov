#!/usr/bin/env node
/**
 * WordPress XML to Astro Content Migration Script
 * Parses WP eXtended RSS (WXR) export and generates Markdown content files.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { XMLParser } from 'fast-xml-parser';

// ── Configuration ──────────────────────────────────────────────────────
const XML_PATH = '/home/nico/Documents/ClinicaBendov/bendovclnicaesttica.WordPress.2026-02-05.xml';
const OUTPUT_DIR = '/home/nico/Documents/Projects/ClinicaBendov/src/content';
const IMAGES_LOG = '/home/nico/Documents/Projects/ClinicaBendov/scripts/images-to-download.json';

// Map WP page IDs/slugs to Astro collection categories
const CORPORAL_SLUGS = new Set([
  'liposuccion-vaser', 'minilipo-vaser', 'lipoescultura', 'lipo-transferencia',
  'lipo-en-ginecomastia', 'carboxiterapia', 'lifechip-testosterona',
  'cellusculpt-pro', 'hiperhidrosis', 'abdominoplastia', 'aumento-mamario',
  'lifting-de-brazos',
]);

const FACIAL_SLUGS = new Set([
  'blefaroplastia-o-cirugia-de-parpados', 'toxina-botulinica', 'rellenos-faciales',
  'plasma-rico-en-plaquetas', 'bioestimulador-de-colageno-1', 'mesoterapia-con-elastica',
  'hilos-tensores', 'bichectomia', 'bioplastia-de-menton', 'bioplastia-de-pomulos',
  'rinomodelacion', 'laser_fraccionado_de_co2', 'lobuloplastia',
  'perfilado-mandibular-rejuvenecimiento-facial', 'relleno-de-parpados',
  'bioestimuladores', 'lifting-facial',
]);

const INTIMO_SLUGS = new Set([
  'rejuvenecimiento-intimo-laser-co2', 'labioplastia-laser',
  'vaginoplastia-rejuvenecimiento-vaginal', 'plasma-rico-en-plaquetas-intimo',
  'mesoterapia-intima-vaginal', 'lifting-labios-mayores-rejuvenecimiento-volumen',
]);

// Slug remapping for cleaner URLs
const SLUG_REMAP = {
  'blefaroplastia-o-cirugia-de-parpados': 'blefaroplastia',
  'bioestimulador-de-colageno-1': 'bioestimulador-de-colageno',
  'laser_fraccionado_de_co2': 'laser-fraccionado-co2',
  'perfilado-mandibular-rejuvenecimiento-facial': 'perfilado-mandibular',
  'vaginoplastia-rejuvenecimiento-vaginal': 'vaginoplastia',
  'mesoterapia-intima-vaginal': 'mesoterapia-intima',
  'lifting-labios-mayores-rejuvenecimiento-volumen': 'lifting-labios-mayores',
  'relleno-de-parpados': 'relleno-de-parpados',
  'clinicabendov-cl-labioplastia-laser': 'labioplastia-laser',
  'clinicabendov-cl-rejuvenecimiento-vaginal-laser': 'rejuvenecimiento-vaginal-laser',
};

// Blog category mapping
const BLOG_CATEGORY_MAP = {
  'procedimientos-corporales': 'Procedimientos Corporales',
  'armonizacion-facial': 'Armonización Facial',
  'ginecologia-estetica': 'Ginecología Estética',
  'cirugia-mamaria': 'Cirugía Mamaria',
  'lifechip-pellet-testosterona': 'LifeChip',
};

// ── WPBakery Shortcode Stripper ────────────────────────────────────────

function stripShortcodes(content) {
  if (!content) return '';

  let text = String(content);

  // Decode HTML entities
  text = decodeEntities(text);

  // Remove vc_raw_html (often contains base64 encoded tracking scripts)
  text = text.replace(/\[vc_raw_html\].*?\[\/vc_raw_html\]/gs, '');
  text = text.replace(/\[vc_raw_html[^\]]*\].*?\[\/vc_raw_html\]/gs, '');

  // Remove specific non-content shortcodes
  text = text.replace(/\[sr-spacer[^\]]*\]/g, '');
  text = text.replace(/\[vc_separator[^\]]*\]/g, '');
  text = text.replace(/\[vc_empty_space[^\]]*\]/g, '');
  text = text.replace(/\[vc_row[^\]]*\]/g, '');
  text = text.replace(/\[\/vc_row\]/g, '');
  text = text.replace(/\[vc_column[^\]]*\]/g, '');
  text = text.replace(/\[\/vc_column\]/g, '');
  text = text.replace(/\[vc_column_text[^\]]*\]/g, '');
  text = text.replace(/\[\/vc_column_text\]/g, '');
  text = text.replace(/\[vc_section[^\]]*\]/g, '');
  text = text.replace(/\[\/vc_section\]/g, '');
  text = text.replace(/\[vc_single_image[^\]]*\]/g, ''); // We'll handle images from attachment metadata
  text = text.replace(/\[vc_masonry_media_grid[^\]]*\]/g, '');
  text = text.replace(/\[columnsection[^\]]*\]/g, '');
  text = text.replace(/\[\/columnsection\]/g, '');
  text = text.replace(/\[col[^\]]*\]/g, '');
  text = text.replace(/\[\/col\]/g, '');
  text = text.replace(/\[iconfont[^\]]*\]/g, '');
  text = text.replace(/\[vc_btn[^\]]*\]/g, '');
  text = text.replace(/\[vc_video[^\]]*\]/g, '');
  text = text.replace(/\[vc_row_inner[^\]]*\]/g, '');
  text = text.replace(/\[\/vc_row_inner\]/g, '');
  text = text.replace(/\[vc_column_inner[^\]]*\]/g, '');
  text = text.replace(/\[\/vc_column_inner\]/g, '');

  // Strip any remaining shortcodes
  text = text.replace(/\[[^\]]*\]/g, '');

  // Convert HTML to Markdown
  text = htmlToMarkdown(text);

  // Clean up excessive whitespace
  text = text.replace(/\n{4,}/g, '\n\n\n');
  text = text.trim();

  return text;
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&Ntilde;/g, 'Ñ')
    .replace(/&iquest;/g, '¿')
    .replace(/&iexcl;/g, '¡');
}

function htmlToMarkdown(html) {
  let md = html;

  // Headers
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n\n# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n\n## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n\n### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n\n#### $1\n\n');
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n\n##### $1\n\n');

  // Bold and italic
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Lists
  md = md.replace(/<ul[^>]*>/gi, '\n');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>/gi, '\n');
  md = md.replace(/<\/ol>/gi, '\n');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');

  // Paragraphs and breaks
  md = md.replace(/<p[^>]*>/gi, '\n\n');
  md = md.replace(/<\/p>/gi, '\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // Remove all remaining HTML tags
  md = md.replace(/<style[^>]*>.*?<\/style>/gis, '');
  md = md.replace(/<script[^>]*>.*?<\/script>/gis, '');
  md = md.replace(/<[^>]+>/g, '');

  return md;
}

// ── XML Parser ─────────────────────────────────────────────────────────

function parseXML(xmlPath) {
  console.log(`Reading XML from: ${xmlPath}`);
  const xml = readFileSync(xmlPath, 'utf-8');

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    isArray: (name) => ['item', 'wp:postmeta', 'wp:comment', 'category'].includes(name),
    processEntities: false,
    htmlEntities: false,
    tagValueProcessor: (tagName, val) => val, // Don't trim CDATA
  });

  const result = parser.parse(xml);
  const channel = result.rss.channel;

  console.log(`Site: ${channel.title}`);
  console.log(`Items found: ${channel.item?.length || 0}`);

  return channel;
}

// ── Extract post metadata ──────────────────────────────────────────────

function getPostMeta(item, key) {
  const metas = item['wp:postmeta'];
  if (!metas) return null;
  const meta = metas.find((m) => m['wp:meta_key'] === key);
  return meta?.['wp:meta_value'] || null;
}

function getCategories(item) {
  const cats = item.category;
  if (!cats) return [];
  const catArray = Array.isArray(cats) ? cats : [cats];
  return catArray
    .filter((c) => c['@_domain'] === 'category')
    .map((c) => (typeof c === 'object' ? c['#text'] || c['@_nicename'] : String(c)));
}

function getCategoryNicenames(item) {
  const cats = item.category;
  if (!cats) return [];
  const catArray = Array.isArray(cats) ? cats : [cats];
  return catArray
    .filter((c) => c['@_domain'] === 'category')
    .map((c) => c['@_nicename'] || '');
}

// ── Main migration logic ───────────────────────────────────────────────

function migrate() {
  const channel = parseXML(XML_PATH);
  const items = channel.item || [];

  // Build attachment URL map (ID -> URL)
  const attachmentMap = new Map();
  for (const item of items) {
    if (item['wp:post_type'] === 'attachment' && item['wp:attachment_url']) {
      attachmentMap.set(String(item['wp:post_id']), item['wp:attachment_url']);
    }
  }

  // Collect all image URLs for downloading
  const imageUrls = new Set();
  for (const [, url] of attachmentMap) {
    if (url && typeof url === 'string') {
      imageUrls.add(url);
    }
  }

  // Filter published pages and posts
  const publishedPages = items.filter(
    (i) => i['wp:post_type'] === 'page' && i['wp:status'] === 'publish'
  );
  const publishedPosts = items.filter(
    (i) => i['wp:post_type'] === 'post' && i['wp:status'] === 'publish'
  );

  console.log(`\nPublished pages: ${publishedPages.length}`);
  console.log(`Published posts: ${publishedPosts.length}`);
  console.log(`Attachments (images): ${attachmentMap.size}`);

  // ── Process procedure pages ────────────────────────────────────────

  let corporalCount = 0;
  let facialCount = 0;
  let intimoCount = 0;
  let skippedPages = [];

  for (const page of publishedPages) {
    const wpSlug = String(page['wp:post_name'] || '');
    const title = cleanTitle(page.title);
    const content = page['content:encoded'] || '';
    const seoTitle = getPostMeta(page, 'rank_math_title') || '';
    const seoDesc = getPostMeta(page, 'rank_math_description') || '';
    const seoKeyword = getPostMeta(page, 'rank_math_focus_keyword') || '';
    const thumbnailId = getPostMeta(page, '_thumbnail_id');
    const thumbnailUrl = thumbnailId ? (attachmentMap.get(String(thumbnailId)) || '') : '';

    let collection = null;
    let category = '';

    if (CORPORAL_SLUGS.has(wpSlug)) {
      collection = 'procedimientos-corporales';
      category = 'corporales';
      corporalCount++;
    } else if (FACIAL_SLUGS.has(wpSlug)) {
      collection = 'procedimientos-faciales';
      category = 'faciales';
      facialCount++;
    } else if (INTIMO_SLUGS.has(wpSlug)) {
      collection = 'procedimientos-intimos';
      category = 'intimos';
      intimoCount++;
    } else {
      skippedPages.push({ slug: wpSlug, title });
      continue;
    }

    const newSlug = SLUG_REMAP[wpSlug] || wpSlug;
    const markdownContent = stripShortcodes(content);

    // Build frontmatter
    const frontmatter = {
      title: cleanQuotes(title),
      slug: newSlug,
      category,
      description: cleanQuotes(extractDescription(markdownContent, seoDesc)),
      seoTitle: cleanQuotes(seoTitle.replace(/%sitename%/g, 'Bendov Clínica Estética').replace(/%sep%/g, '-')),
      seoDescription: cleanQuotes(seoDesc),
      seoKeywords: cleanQuotes(seoKeyword),
      heroImage: '',
      thumbnailImage: thumbnailUrl || '',
      order: 0,
      draft: false,
    };

    const md = buildMarkdownFile(frontmatter, markdownContent);
    const outPath = join(OUTPUT_DIR, collection, `${newSlug}.md`);
    ensureDir(outPath);
    writeFileSync(outPath, md, 'utf-8');
    console.log(`  ✓ [${collection}] ${title} → ${newSlug}.md`);
  }

  console.log(`\nProcedure pages migrated: ${corporalCount} corporal, ${facialCount} facial, ${intimoCount} intimo`);
  console.log(`Skipped pages (not procedures): ${skippedPages.length}`);

  // ── Process blog posts ─────────────────────────────────────────────

  let blogCount = 0;

  for (const post of publishedPosts) {
    const wpSlug = String(post['wp:post_name'] || '');
    const title = cleanTitle(post.title);
    const content = post['content:encoded'] || '';
    const date = post['wp:post_date'] || '';
    const author = post['dc:creator'] || 'Clinica Bendov';
    const categories = getCategories(post).filter((c) => c !== 'Blog' && c !== 'Sin categoría');
    const seoTitle = getPostMeta(post, 'rank_math_title') || '';
    const seoDesc = getPostMeta(post, 'rank_math_description') || '';
    const thumbnailId = getPostMeta(post, '_thumbnail_id');
    const thumbnailUrl = thumbnailId ? (attachmentMap.get(String(thumbnailId)) || '') : '';

    const newSlug = SLUG_REMAP[wpSlug] || wpSlug;
    const markdownContent = stripShortcodes(content);

    const dateStr = date ? date.split(' ')[0] : '2025-01-01';

    const frontmatter = {
      title: cleanQuotes(title),
      slug: newSlug,
      date: dateStr,
      author: cleanQuotes(typeof author === 'string' ? author : 'Clinica Bendov'),
      categories: categories.length > 0 ? categories : ['Blog'],
      description: cleanQuotes(extractDescription(markdownContent, seoDesc)),
      seoTitle: cleanQuotes(seoTitle.replace(/%sitename%/g, 'Bendov Clínica Estética').replace(/%sep%/g, '-')),
      seoDescription: cleanQuotes(seoDesc),
      heroImage: '',
      thumbnailImage: thumbnailUrl || '',
      draft: false,
    };

    const md = buildBlogMarkdownFile(frontmatter, markdownContent);
    const outPath = join(OUTPUT_DIR, 'blog', `${newSlug}.md`);
    ensureDir(outPath);
    writeFileSync(outPath, md, 'utf-8');
    console.log(`  ✓ [blog] ${title} → ${newSlug}.md`);
    blogCount++;
  }

  console.log(`\nBlog posts migrated: ${blogCount}`);

  // ── Save image download list ───────────────────────────────────────

  const imageList = [...imageUrls].filter((u) => typeof u === 'string' && u.startsWith('http'));
  writeFileSync(IMAGES_LOG, JSON.stringify(imageList, null, 2), 'utf-8');
  console.log(`\nImage URLs saved to: ${IMAGES_LOG} (${imageList.length} images)`);

  // ── Summary ────────────────────────────────────────────────────────

  console.log('\n═══════════════════════════════════════');
  console.log('Migration Summary:');
  console.log(`  Corporal procedures: ${corporalCount}`);
  console.log(`  Facial procedures:   ${facialCount}`);
  console.log(`  Intimate procedures: ${intimoCount}`);
  console.log(`  Blog posts:          ${blogCount}`);
  console.log(`  Images to download:  ${imageList.length}`);
  console.log(`  Skipped pages:       ${skippedPages.length}`);
  console.log('═══════════════════════════════════════');

  if (skippedPages.length > 0) {
    console.log('\nSkipped pages (non-procedure):');
    for (const p of skippedPages) {
      console.log(`  - ${p.slug} (${p.title})`);
    }
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

function cleanTitle(title) {
  if (!title) return 'Sin título';
  let t = typeof title === 'object' ? (title['#text'] || '') : String(title);
  return decodeEntities(t).trim();
}

function cleanQuotes(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '\\"').trim();
}

function extractDescription(markdown, seoDesc) {
  if (seoDesc) return seoDesc;
  // Get first meaningful paragraph
  const lines = markdown.split('\n').filter((l) => l.trim() && !l.startsWith('#') && !l.startsWith('-'));
  const first = lines[0] || '';
  return first.slice(0, 200).trim();
}

function ensureDir(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function buildMarkdownFile(fm, content) {
  return `---
title: "${fm.title}"
slug: "${fm.slug}"
category: "${fm.category}"
description: "${fm.description}"
seoTitle: "${fm.seoTitle}"
seoDescription: "${fm.seoDescription}"
seoKeywords: "${fm.seoKeywords}"
heroImage: "${fm.heroImage}"
thumbnailImage: "${fm.thumbnailImage}"
order: ${fm.order}
draft: ${fm.draft}
---

${content}
`;
}

function buildBlogMarkdownFile(fm, content) {
  const catsYaml = fm.categories.map((c) => `  - "${c}"`).join('\n');
  return `---
title: "${fm.title}"
slug: "${fm.slug}"
date: ${fm.date}
author: "${fm.author}"
categories:
${catsYaml}
description: "${fm.description}"
seoTitle: "${fm.seoTitle}"
seoDescription: "${fm.seoDescription}"
heroImage: "${fm.heroImage}"
thumbnailImage: "${fm.thumbnailImage}"
draft: ${fm.draft}
---

${content}
`;
}

// ── Run ────────────────────────────────────────────────────────────────

migrate();
