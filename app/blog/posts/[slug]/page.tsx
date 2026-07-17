type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  return null;
}
