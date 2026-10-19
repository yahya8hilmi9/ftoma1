// Generates share/<id>.html (OG previews for WhatsApp), sitemap.xml and robots.txt
// Run: node tools-build-seo.js   (after changing the catalogue)
const fs = require('fs'), vm = require('vm');
const sb = { window: {}, localStorage: { getItem() { return null; }, setItem() {} }, console };
vm.createContext(sb);
['js/data/config.js', 'js/data/catalog.js', 'js/store.js'].forEach(f => vm.runInContext(fs.readFileSync(f, 'utf8'), sb));
const F = sb.window.FATOUMA, base = F.config.siteUrl;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
fs.mkdirSync('share', { recursive: true });
F.items.forEach(it => {
  const img = it.image ? base + it.image : base + 'img/og.jpg';
  const title = it.ar + ' — فطومة · Fatouma', desc = (it.desc || '') + ' — ' + it.price + ' ' + F.config.currency;
  fs.writeFileSync('share/' + it.id + '.html', `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<meta property="og:type" content="product"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${img}"><meta property="og:url" content="${base}share/${it.id}.html"><meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${base}#/product/${it.id}"><meta http-equiv="refresh" content="0;url=../#/product/${it.id}"></head>
<body><p><a href="../#/product/${it.id}">${esc(it.ar)} — فطومة</a></p></body></html>`);
});
const urls = ['', ...['shop', 'breakfast', 'corporate', 'track'].map(x => '#/' + x), ...Object.keys(F.occasionPages || { ramadan: 1, eid: 1, wedding: 1, aqiqah: 1 }).map(x => '#/occasion/' + x)];
fs.writeFileSync('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => `<url><loc>${base}${u}</loc></url>`).join('\n') + '\n' + F.items.map(i => `<url><loc>${base}share/${i.id}.html</loc></url>`).join('\n') + '\n</urlset>\n');
fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin.html\nSitemap: ${base}sitemap.xml\n`);
console.log('share pages:', F.items.length);
