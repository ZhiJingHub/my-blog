import { getAllPosts } from '@/lib/utils/posts';
import { siteConfig } from '@/lib/config/site';
import { escapeXml } from '@/lib/utils/xml';

export async function GET() {
  const posts = getAllPosts();

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.metadata.title)}</title>
      <link>${escapeXml(`${siteConfig.url}/posts/${post.slug}/`)}</link>
      <description>${escapeXml(post.metadata.description)}</description>
      <pubDate>${new Date(post.metadata.published).toUTCString()}</pubDate>
      <guid>${escapeXml(`${siteConfig.url}/posts/${post.slug}/`)}</guid>
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>zh-CN</language>
    <atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}
