import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';

type PostContentProps = {
  content: string;
};

export default function PostContent({ content }: PostContentProps) {
  return (
    <div
      className="prose max-w-none break-words prose-neutral dark:prose-invert
        prose-headings:text-foreground
        prose-p:text-foreground
        prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:opacity-80
        prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
        prose-strong:text-foreground
        prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none
        prose-th:border prose-th:border-border prose-th:bg-muted
        prose-td:border prose-td:border-border
        prose-img:rounded-lg
        prose-hr:border-border"
    >
      <MDXRemote
        source={content}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm]
          }
        }}
      />
    </div>
  );
}
