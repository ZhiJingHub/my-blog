export interface PostMetadata {
  title: string;
  published: string;
  description: string;
  image?: string;
  tags?: string[];
  draft?: boolean;
  updated?: string;
  author?: string;
  pinned?: boolean;
}

export interface PostModule {
  slug: string;
  metadata: PostMetadata;
  content: string;
}
