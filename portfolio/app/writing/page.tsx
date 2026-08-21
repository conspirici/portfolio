import Image from "next/image";
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

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
  cover_image_url?: string;
  read_time?: number;
  date_published?: string;
  tags: TagResponse[];
}

export default async function WritingPage() {
  let posts: BlogPostResponse[] = [];
  try {
    posts = await fetchApi('/public/posts', { next: { revalidate: 60 } });
  } catch {
    // no posts yet
  }

  return (
    <div
      className="relative min-h-screen"
      style={{ background: 'linear-gradient(120deg, #F5F7F4 0%, #D8ECEC 55%, #B7E5BA 100%)' }}
    >
      <div className="grain-overlay opacity-20" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        <header className="mb-14">
          <h1 className="font-display text-4xl sm:text-[48px] leading-tight text-charcoal-green mb-3">Writing</h1>
          <p className="font-sans text-charcoal-green/60 text-base sm:text-lg">
            Technical breakdowns and the occasional philosophical detour.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-px bg-charcoal-green/20" />
            <p className="font-mono text-sm text-charcoal-green/40 tracking-wider uppercase">No posts yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/writing/${post.slug}`}
                className="group block overflow-hidden relative aspect-[16/9] sm:aspect-[2/1] bg-forest-900"
              >
                {/* Background image */}
                {post.cover_image_url ? (
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 800px"
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  />
                ) : (
                  /* Gradient when no image */
                  <div
                    className="absolute inset-0 group-hover:opacity-90 transition-opacity"
                    style={{
                      background: 'linear-gradient(135deg, #123024 0%, #09606D 60%, #075057 100%)'
                    }}
                  />
                )}

                {/* Dark overlay — bottom-heavy gradient so text is always readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 group-hover:from-black/70 transition-all duration-300" />

                {/* Text content — sits on top of the image */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7">
                  {/* Meta */}
                  <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-white/50 mb-2">
                    {post.date_published && new Date(post.date_published).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    {post.date_published && post.read_time && ' · '}
                    {post.read_time && `${post.read_time} min`}
                  </p>

                  {/* Title */}
                  <h2 className="font-display text-xl sm:text-2xl font-medium text-white mb-2 leading-snug group-hover:text-white/90 transition-colors drop-shadow">
                    {post.title}
                  </h2>

                  {/* Teaser — slightly smaller, slightly muted */}
                  <p className="font-sans text-sm sm:text-base text-white/70 leading-relaxed line-clamp-2 mb-3">
                    {post.teaser}
                  </p>

                  {/* Tags + Read → */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="font-mono text-[9px] tracking-wider text-white/60 bg-white/10 border border-white/15 px-1.5 py-0.5 uppercase backdrop-blur-sm"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                    <span className="font-mono text-[10px] tracking-wider text-white/50 group-hover:text-white/80 transition-colors shrink-0">
                      Read →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
