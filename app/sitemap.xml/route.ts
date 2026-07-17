import { getAllPosts } from '@/lib/utils/posts';
import { siteConfig } from '@/lib/config/site';
import { escapeXml } from '@/lib/utils/xml';

function formatSitemapDate(dateStr: string | undefined): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return d.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export async function GET() {
  const posts = getAllPosts();

  const staticPages = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/posts/', changefreq: 'daily', priority: '0.9' },
    { path: '/cover/', changefreq: 'monthly', priority: '0.6' },
    { path: '/convert/', changefreq: 'monthly', priority: '0.6' },
    { path: '/watermark/', changefreq: 'monthly', priority: '0.6' },
    { path: '/friends/', changefreq: 'weekly', priority: '0.5' }
  ];

  const urls = staticPages.map(
    (p) =>
      `<url><loc>${escapeXml(siteConfig.url + p.path)}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
  );

  for (const post of posts) {
    const lastmod = formatSitemapDate(post.metadata.updated || post.metadata.published);
    urls.push(
      `<url><loc>${escapeXml(`${siteConfig.url}/posts/${post.slug}/`)}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`
    );
  }

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
