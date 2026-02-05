#!/usr/bin/env node
/**
 * Find images embedded inside WP procedure page content.
 * Looks for image URLs inside vc_single_image shortcodes and <img> tags.
 */
import { readFileSync } from 'node:fs';
import { XMLParser } from 'fast-xml-parser';

const XML_PATH = '/home/nico/Documents/ClinicaBendov/bendovclnicaesttica.WordPress.2026-02-05.xml';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => ['item', 'wp:postmeta'].includes(name),
  processEntities: false,
});

const xml = readFileSync(XML_PATH, 'utf-8');
const result = parser.parse(xml);
const items = result.rss.channel.item || [];

// Build attachment map: ID -> URL
const attachmentMap = new Map();
for (const item of items) {
  if (item['wp:post_type'] === 'attachment') {
    attachmentMap.set(String(item['wp:post_id']), item['wp:attachment_url'] || '');
  }
}

// Find all published pages
const pages = items.filter(i => i['wp:post_type'] === 'page' && i['wp:status'] === 'publish');

for (const page of pages) {
  const slug = String(page['wp:post_name'] || '');
  const content = String(page['content:encoded'] || '');
  
  // Find image IDs from vc_single_image shortcodes
  const vcImages = [...content.matchAll(/\[vc_single_image[^\]]*image="(\d+)"[^\]]*\]/g)];
  
  // Find direct img src URLs
  const imgTags = [...content.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/g)];
  
  // Find image URLs directly in content
  const directUrls = [...content.matchAll(/https?:\/\/clinicabendov\.cl\/wp-content\/uploads\/[^\s"'<\]]+\.(jpg|jpeg|png|webp)/gi)];
  
  const imageUrls = new Set();
  
  for (const m of vcImages) {
    const url = attachmentMap.get(m[1]);
    if (url) imageUrls.add(url);
  }
  for (const m of imgTags) {
    if (m[1].includes('clinicabendov') || m[1].includes('wp-content')) {
      imageUrls.add(m[1]);
    }
  }
  for (const m of directUrls) {
    imageUrls.add(m[0]);
  }
  
  if (imageUrls.size > 0) {
    console.log(`${slug}:`);
    for (const url of imageUrls) {
      const local = url.replace('https://clinicabendov.cl/wp-content/uploads/', '/images/wp/');
      console.log(`  ${local}`);
    }
  }
}
