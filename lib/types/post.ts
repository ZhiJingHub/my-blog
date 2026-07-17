export interface PostStats {
  wordCount: number;
  readTime: number;
  imageCount: number;
}

export interface PostMetadata {
  title: string;
  image?: string;
  published: string;
  pinned?: boolean;
  description: string;
  draft?: boolean;
  updated?: string;
  tags?: string[];
  author?: string;
  stats: PostStats;
}

export interface PostModule {
  slug: string;
  metadata: PostMetadata;
  content: string;
}
