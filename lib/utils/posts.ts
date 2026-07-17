import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { PostMetadata, PostModule } from '@/lib/types/post';

const DEFAULT_STATS = { wordCount: 0, readTime: 0, imageCount: 0 };

function getPublishedDate(meta: PostMetadata): number {
  const timestamp = new Date(meta.published).getTime();
  return isNaN(timestamp) ? 0 : timestamp;
}

export function getAllPosts(): PostModule[] {
  const postsDir = path.join(process.cwd(), 'content', 'posts');

  if (!fs.existsSync(postsDir)) {
    return [];
  }

  const posts: PostModule[] = [];
  const slugs = fs.readdirSync(postsDir);

  for (const slug of slugs) {
    const postDir = path.join(postsDir, slug);
    const postFile = path.join(postDir, 'index.md');

    if (!fs.existsSync(postFile)) continue;

    const fileContent = fs.readFileSync(postFile, 'utf-8');
    const { data, content } = matter(fileContent);

    if (!data.title || !data.description || (!data.published && !data.date)) {
      console.warn(`[posts] Invalid metadata in ${postFile}, skipping`);
      continue;
    }

    if (data.draft) continue;

    // Calculate stats
    const wordCount = content.replace(/[#*`\[\]()]/g, '').split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    const imageCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;

    const metadata: PostMetadata = {
      title: data.title,
      image: data.image,
      published: data.published ?? data.date ?? '',
      pinned: data.pinned,
      description: data.description,
      draft: data.draft,
      updated: data.updated,
      tags: data.tags,
      author: data.author,
      stats: {
        wordCount,
        readTime,
        imageCount
      }
    };

    posts.push({ slug, metadata, content });
  }

  return posts.sort((a, b) => {
    if (a.metadata.pinned && !b.metadata.pinned) return -1;
    if (!a.metadata.pinned && b.metadata.pinned) return 1;
    return getPublishedDate(b.metadata) - getPublishedDate(a.metadata);
  });
}

export function getPostBySlug(slug: string): PostModule | undefined {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug);
}
