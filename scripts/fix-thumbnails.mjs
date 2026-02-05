#!/usr/bin/env node
/**
 * Find the correct content images for procedures that have
 * placeholder/wrong thumbnails by parsing vc_single_image from WP XML.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { XMLParser } from 'fast-xml-parser';

const XML_PATH = '/home/nico/Documents/ClinicaBendov/bendovclnicaesttica.WordPress.2026-02-05.xml';
const CONTENT_DIR = '/home/nico/Documents/Projects/ClinicaBendov/src/content';

// Parse XML
const xml = readFileSync(XML_PATH, 'utf-8');
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => ['item', 'wp:postmeta', 'category'].includes(name),
  processEntities: false,
});
const channel = parser.parse(xml).rss.channel;
const items = channel.item || [];

// Build attachment ID → URL map
const attachMap = new Map();
for (const item of items) {
  if (item['wp:post_type'] === 'attachment' && item['wp:attachment_url']) {
    attachMap.set(String(item['wp:post_id']), String(item['wp:attachment_url']));
  }
}

// Find procedure pages and extract their vc_single_image IDs
const pages = items.filter(i => i['wp:post_type'] === 'page' && i['wp:status'] === 'publish');

console.log('Procedure → Content Images:\n');

for (const page of pages) {
  const slug = String(page['wp:post_name'] || '');
  const content = String(page['content:encoded'] || '');
  
  // Find all vc_single_image references
  const imageIds = [];
  const regex = /vc_single_image[^]]*image="(\d+)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    imageIds.push(match[1]);
  }
  
  // Also find img src in content
  const imgSrcs = [];
  const imgRegex = /<img[^>]*src="([^"]*clinicabendov[^"]*)"/g;
  while ((match = imgRegex.exec(content)) !== null) {
    imgSrcs.push(match[1]);
  }

  if (imageIds.length === 0 && imgSrcs.length === 0) continue;

  const urls = imageIds.map(id => attachMap.get(id)).filter(Boolean);
  const allUrls = [...urls, ...imgSrcs];
  
  if (allUrls.length > 0) {
    console.log(`${slug}:`);
    for (const u of allUrls) {
      const local = u.replace('https://clinicabendov.cl/wp-content/uploads/', '/images/wp/');
      console.log(`  ${local}`);
    }
  }
}
