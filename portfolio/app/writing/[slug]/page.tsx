import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Aside, ImageCarousel, ImageGrid, VideoEmbed, Mermaid } from "@/components/mdx";
import { sharedRehypePlugins } from "@/lib/mdx-plugins";

const components = {
  Aside,
  ImageCarousel,
  ImageGrid,
  VideoEmbed,
  Mermaid,
  pre: (props: any) => {
    const child = props.children;
    const isMermaid = child?.props?.['data-mermaid'];
    if (isMermaid) return <>{props.children}</>;
    return <pre {...props} />;
  },
  code: (props: any) => {
    if (props["data-mermaid"]) {
      return <Mermaid chart={props.children} />;
    }
    return <code {...props} />;
  },
};

interface TagResponse {
  id: string;
  name: string;
  type: string;
}

interface BlogPostResponse {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  body: string;
  cover_image_url?: string;
  read_time?: number;
  date_published?: string;
  tags: TagResponse[];
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) notFound();

  let post: BlogPostResponse | null = null;
  try {
    post = await fetchApi(`/public/posts/${slug}`, { next: { revalidate: 60 } });
  } catch {
    notFound();
  }

  if (!post) notFound();

  return (
    <article>
      <div className="max-w-3xl mx-auto px-6 sm:px-10 pt-10">
        {/* ── Hero banner: image with title on top ── */}
        <div className="relative w-full aspect-[16/7] min-h-[260px] max-h-[420px] overflow-hidden bg-forest-900">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, #123024 0%, #0D2B33 60%, #075057 100%)' }}
            />
          )}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

          {/* Text overlaid on image */}
          <div className="absolute inset-0 flex flex-col justify-end px-5 sm:px-8 pb-6">
            <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-sage-white/60 mb-2">
              {post.date_published && new Date(post.date_published).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {post.date_published && post.read_time && ' — '}
              {post.read_time && `${post.read_time} min read`}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-medium leading-tight text-white mb-3 drop-shadow-md">
              {post.title}
            </h1>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="font-mono text-[10px] tracking-wider text-sage-white/70 bg-white/10 border border-white/20 px-2 py-0.5 uppercase backdrop-blur-sm"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Article body ── */}
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-14">
        {/* Teaser / subtitle */}
        <p className="text-lg sm:text-xl text-charcoal-green/60 font-sans leading-relaxed mb-10 border-l-2 border-forest-500 pl-4 italic">
          {post.teaser}
        </p>

        <div className="prose prose-teal max-w-none">
          <MDXRemote
            source={post.body || ""}
            components={components}
            options={{
              mdxOptions: {
                rehypePlugins: sharedRehypePlugins as any
              }
            }}
          />
        </div>
      </div>
    </article>
  );
}
