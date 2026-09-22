import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { SITE } from './src/config/site.js';

const ROOT = import.meta.dirname;
const PARTIALS_DIR = resolve(ROOT, 'src/partials');

const INCLUDE_RE = /<include\s+src="([^"]+)"\s*\/?>(?:\s*<\/include>)?/g;
const FEATURE_RE = /<!--\s*feature:(\w+)\s*-->([\s\S]*?)<!--\s*\/feature:\1\s*-->/g;
const VAR_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

function inlineIncludes(html, baseDir, depth = 0) {
  if (depth > 10) throw new Error('html-partials: include depth exceeded (circular include?)');
  return html.replace(INCLUDE_RE, (_, src) => {
    const file = resolve(baseDir, src);
    return inlineIncludes(readFileSync(file, 'utf8'), dirname(file), depth + 1);
  });
}

function renderTemplate(html) {
  return html
    .replace(FEATURE_RE, (_, flag, body) => {
      if (!(flag in SITE.features)) throw new Error(`html-partials: unknown feature "${flag}"`);
      return SITE.features[flag] ? body : '';
    })
    .replace(VAR_RE, (_, key) => {
      const value = key.split('.').reduce((obj, k) => obj?.[k], SITE);
      if (value == null) throw new Error(`html-partials: unknown template variable "${key}"`);
      return String(value);
    });
}

/** Build-time HTML partials (<include src>), {{site vars}} and feature-flag blocks. */
function htmlPartials() {
  return {
    name: 'html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler: (html, ctx) => renderTemplate(inlineIncludes(html, dirname(ctx.filename))),
    },
    configureServer(server) {
      server.watcher.add(PARTIALS_DIR);
      server.watcher.on('change', (file) => {
        if (file.startsWith(PARTIALS_DIR)) server.ws.send({ type: 'full-reload' });
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          `  <url><loc>${SITE.url}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n` +
          '</urlset>\n',
      });
    },
  };
}

export default defineConfig({
  plugins: [htmlPartials()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        main: resolve(ROOT, 'index.html'),
        notFound: resolve(ROOT, '404.html'),
      },
    },
  },
  server: { host: true },
  preview: { host: true },
});
