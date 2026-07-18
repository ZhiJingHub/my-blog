export interface PostMeta {
  title: string
  date: string
  description?: string
  tags?: string[]
  cover?: string
  draft?: boolean
}

export interface Post extends PostMeta {
  slug: string
  content: string
}
