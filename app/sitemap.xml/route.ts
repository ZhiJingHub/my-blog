import { siteConfig } from '@/lib/config/site';
import { escapeXml } from '@/lib/utils/xml';

export async function GET() {
  const staticPages = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/cover/', changefreq: 'monthly', priority: '0.6' },
    { path: '/convert/', changefreq: 'monthly', priority: '0.6' },
    { path: '/watermark/', changefreq: 'monthly', priority: '0.6' },
    { path: '/friends/', changefreq: 'weekly', priority: '0.5' }
  ];

  const urls = staticPages.map(
    (p) =>
      `<url><loc>${escapeXml(siteConfig.url + p.path)}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}
