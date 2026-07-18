import { siteConfig } from '@/lib/config/site';
import { escapeXml } from '@/lib/utils/xml';
import { getAllPosts } from '@/lib/utils/posts';

export async function GET() {
  const staticPages = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/blog/', changefreq: 'daily', priority: '0.9' },
    { path: '/cover/', changefreq: 'monthly', priority: '0.6' },
    { path: '/convert/', changefreq: 'monthly', priority: '0.6' },
    { path: '/watermark/', changefreq: 'monthly', priority: '0.6' },
    { path: '/friends/', changefreq: 'weekly', priority: '0.5' }
  ];

  const staticUrls = staticPages.map(
    (p) =>
      `<url><loc>${escapeXml(siteConfig.url + p.path)}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
  );

  const posts = getAllPosts();
  const postUrls = posts.map(
    (post) =>
      `<url><loc>${escapeXml(siteConfig.url + '/posts/' + post.slug)}</loc><lastmod>${post.date}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...postUrls].join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}
