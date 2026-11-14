import Image from "next/image";
import ScatteredLogos from "@/components/ScatteredLogos";
import Hero from "@/components/Hero";
import { site } from "@/config/site";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { fetchContent } from "@/lib/content";
import { PrintedPhotoFrame } from "@/components/ui/PrintedPhotoFrame";
import { TagPill } from "@/components/ui/TagPill";

interface TagResponse {
  id: string;
  name: string;
  type: string;
}

interface ProjectResponse {
  id: string;
  slug: string;
  title: string;
  summary: string;
  thumbnail_url: string;
  tags: TagResponse[];
}

interface BlogPostResponse {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  date_published?: string;
  tags: TagResponse[];
}

interface HomeContentResponse {
  hero_line_1: string;
  hero_line_2: string;
  hero_line_3?: string;
  hero_headline?: string;
  hero_subheadline?: string;
  hero_image_url?: string;
  hero_logo_urls?: string[];
  featured_projects: ProjectResponse[];
  featured_posts: BlogPostResponse[];
}

export default async function Home() {
  // Try to get personalized home-content first
  const homeData = await fetchContent<HomeContentResponse>('/public/home-content', 'home-content');
  let featuredProjects = homeData?.featured_projects ?? [];
  let featuredPosts = homeData?.featured_posts ?? [];

  // Fall back to latest published content if home-content has no featured items
  if (featuredProjects.length === 0) {
    const all = await fetchContent<ProjectResponse[]>('/public/projects', 'projects');
    featuredProjects = (all ?? []).slice(0, 4);
  }
  if (featuredPosts.length === 0) {
    const all = await fetchContent<BlogPostResponse[]>('/public/posts', 'posts');
    featuredPosts = (all ?? []).slice(0, 4);
  }

  const headline = homeData?.hero_headline || "Mansoor Syed";
  const subheadline = homeData?.hero_subheadline || "Software Engineer & Designer";
  const heroImage = homeData?.hero_image_url || "";
  const logos = homeData?.hero_logo_urls || [];

  return (
    <div>
      {/* ─── 1. Hero ─── */}
      {/* The hero image is the section's background: it covers the whole hero,
          edge to edge, and the text sits on top of it. Without an image the
          section falls back to the light gradient with dark text. */}
      <section
        id="hero-container"
        className="relative w-full pt-10 md:pt-16 pb-0 flex flex-col items-start justify-start overflow-hidden min-h-[calc(100svh-5rem)]"
        style={heroImage ? { backgroundColor: '#123024' } : { background: 'linear-gradient(135deg, #F5F7F4 0%, #E8EBE6 100%)' }}
      >
        {heroImage ? (
          <>
            <Image
              id="hero-photo"
              src={heroImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            {/* Scrim: darkens the top-left, where the text is, so the headline
                stays readable whatever the photo looks like. */}
            <div
              className="absolute inset-0 z-[1] pointer-events-none"
              style={{
                background: [
                  'linear-gradient(180deg, rgba(13,31,26,0.70) 0%, rgba(13,31,26,0.30) 50%, rgba(13,31,26,0.10) 100%)',
                  'linear-gradient(90deg, rgba(13,31,26,0.45) 0%, rgba(13,31,26,0) 65%)',
                ].join(', '),
              }}
            />
          </>
        ) : (
          <div className="grain-overlay opacity-[0.15]" />
        )}

        {/* TEXT CONTENT - Upper Left */}
        <div className="z-30 relative px-6 md:px-16 mt-0 w-full max-w-7xl mx-auto pointer-events-none">
          <div id="hero-text" className="max-w-[800px] inline-flex flex-col items-start pointer-events-auto">
            <h1
              className={`font-display text-[40px] sm:text-5xl md:text-6xl lg:text-[72px] leading-[1.1] mb-4 ${
                heroImage ? 'text-sage-white [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]' : 'text-charcoal-green'
              }`}
            >
              {headline}
            </h1>
            <p
              className={`font-sans text-base md:text-lg lg:text-xl mb-6 md:mb-8 max-w-[500px] ${
                heroImage ? 'text-sage-white/90 [text-shadow:0_1px_16px_rgba(0,0,0,0.4)]' : 'text-forest-900'
              }`}
            >
              {subheadline}
            </p>
            <a
              href="/work"
              className={`inline-flex items-center gap-2 px-6 py-2.5 md:px-8 md:py-3 border font-mono text-xs md:text-sm uppercase tracking-wider transition-all cursor-pointer relative z-40 group shadow-sm backdrop-blur-sm ${
                heroImage
                  ? 'border-sage-white text-sage-white bg-charcoal-green/30 hover:bg-sage-white hover:text-forest-900'
                  : 'border-forest-700 text-forest-700 bg-sage-white/50 hover:bg-forest-700 hover:text-sage-white'
              }`}
            >
              View Work
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* SCATTERED LOGOS - Global Background (z-10) */}
        {logos && logos.length > 0 && <ScatteredLogos logos={logos} />}
      </section>

      {/* ─── 3. Work Preview ─── */}
      {featuredProjects.length > 0 && (
        <section 
          className="relative overflow-hidden py-20 sm:py-28"
          style={{ background: 'linear-gradient(135deg, #123024 0%, #0D2B33 50%, #075057 100%)' }}
        >
          <div className="grain-overlay" />
          <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
            <div className="flex items-baseline justify-between mb-10">
              <div>
                <p className="font-mono text-[12px] tracking-[0.08em] uppercase text-sage-white/70 mb-2.5">
                  Selected Work
                </p>
                <p className="font-sans text-sage-white/90 text-sm">
                  A few systems I have designed, built, and shipped.
                </p>
              </div>
              <Link
                href="/work"
                className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[12px] tracking-[0.04em] uppercase text-sage-white/70 border-b border-sage-white/70 pb-0.5 hover:opacity-70 transition-opacity"
              >
                See all work
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
              {featuredProjects.map((project) => (
                <Link href={`/work/${project.slug}`} key={project.slug} className="group flex flex-col bg-white/5 backdrop-blur-sm p-4 border border-sage-white/10 hover:bg-white/10 transition-colors">
                  <div className="mb-6 transition-transform group-hover:-translate-y-1 overflow-hidden">
                    <PrintedPhotoFrame
                      src={project.thumbnail_url}
                      alt={project.title}
                      width={800}
                      height={600}
                    />
                  </div>
                  <h2 className="font-display text-2xl text-sage-white mb-3 group-hover:text-white transition-colors">{project.title}</h2>
                  <p className="font-sans text-sage-white/70 mb-5 flex-grow">{project.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <TagPill key={tag.id} label={tag.name} type="tech" className="bg-transparent border-sage-white/30 text-sage-white/80" />
                    ))}
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile "See all work" link */}
            <Link
              href="/work"
              className="sm:hidden mt-6 inline-flex items-center gap-1.5 font-mono text-[12px] tracking-[0.04em] uppercase text-sage-white/70 border-b border-sage-white/70 pb-0.5"
            >
              See all work
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </section>
      )}

      {/* ─── 4. Writing Preview ─── */}
      {featuredPosts.length > 0 && (
        <section 
          className="relative overflow-hidden py-16 sm:py-20"
          style={{ background: 'linear-gradient(180deg, #288760 0%, #075057 100%)' }}
        >
          <div className="grain-overlay" />
          <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
            <div className="flex items-baseline justify-between mb-8">
              <p className="font-mono text-[12px] tracking-[0.08em] uppercase text-sage-white/80 mb-2.5">
                Writing
              </p>
              <Link
                href="/writing"
                className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[12px] tracking-[0.04em] uppercase text-sage-white/80 border-b border-sage-white/80 pb-0.5 hover:opacity-70 transition-opacity"
              >
                Read all writing
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="font-sans text-sage-white text-base max-w-lg mb-10">
              Technical breakdowns and the occasional philosophical detour.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Link href={`/writing/${post.slug}`} key={post.slug} className="group flex flex-col p-5 bg-white/5 hover:bg-white/10 border border-sage-white/10 transition-colors">
                  {post.date_published && (
                    <time className="font-mono text-[11px] tracking-wider text-sage-white/60 uppercase mb-3">
                      {new Date(post.date_published).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </time>
                  )}
                  <h3 className="font-display text-2xl text-sage-white group-hover:text-white transition-colors mb-2">
                    {post.title}
                  </h3>
                  <p className="font-sans text-sage-white/70 mb-5 flex-grow">
                    {post.teaser}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <TagPill key={tag.id} label={tag.name} type="topic" className="bg-transparent border-sage-white/30 text-sage-white/80" />
                    ))}
                  </div>
                </Link>
              ))}
            </div>

            <Link
              href="/writing"
              className="sm:hidden mt-8 inline-flex items-center gap-1.5 font-mono text-[12px] tracking-[0.04em] uppercase text-sage-white/80 border-b border-sage-white/80 pb-0.5"
            >
              Read all writing
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
