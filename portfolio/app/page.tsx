import Image from "next/image";
import ScatteredLogos from "@/components/ScatteredLogos";
import Hero from "@/components/Hero";
import { site } from "@/config/site";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
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
  let featuredProjects: ProjectResponse[] = [];
  let featuredPosts: BlogPostResponse[] = [];
  let homeData: HomeContentResponse | null = null;

  // Try to get personalized home-content first
  try {
    homeData = await fetchApi('/public/home-content', { next: { tags: ['home-content'] } });
    if ((homeData?.featured_projects?.length ?? 0) > 0) featuredProjects = homeData!.featured_projects!;
    if ((homeData?.featured_posts?.length ?? 0) > 0) featuredPosts = homeData!.featured_posts!;
  } catch (e) { console.error("Error fetching home content", e); }

  // Fall back to latest published content if home-content has no featured items
  if (featuredProjects.length === 0) {
    try {
      const all = await fetchApi('/public/projects', { next: { revalidate: 60 } });
      featuredProjects = all.slice(0, 4);
    } catch { /* no projects yet */ }
  }
  if (featuredPosts.length === 0) {
    try {
      const all = await fetchApi('/public/posts', { next: { revalidate: 60 } });
      featuredPosts = all.slice(0, 4);
    } catch { /* no posts yet */ }
  }

  const headline = homeData?.hero_headline || "Meet Brainka,";
  const subheadline = homeData?.hero_subheadline || "and discover connections you didn't know existed.";
  const heroImage = homeData?.hero_image_url || "";
  const logos = homeData?.hero_logo_urls || [];

  return (
    <div>
      {/* ─── 1. New Hero ─── */}
      <section 
        id="hero-container"
        className="relative w-full pt-8 pb-0 flex flex-col items-start justify-start overflow-hidden min-h-[90vh] md:min-h-screen"
        style={{ background: 'linear-gradient(135deg, #F5F7F4 0%, #E8EBE6 100%)' }}
      >
        <div className="grain-overlay opacity-[0.15]" />
        {/* TEXT CONTENT - Upper Left */}
        <div className="z-30 relative px-6 md:px-16 mt-0 w-full max-w-7xl mx-auto pointer-events-none">
          <div id="hero-text" className="max-w-[800px] inline-flex flex-col items-start pointer-events-auto">
            <h1 className="font-display text-[40px] sm:text-5xl md:text-6xl lg:text-[72px] leading-[1.1] text-charcoal-green mb-4">
              {headline}
            </h1>
            <p className="font-sans text-base md:text-lg lg:text-xl text-forest-900 mb-6 md:mb-8 max-w-[500px]">
              {subheadline}
            </p>
            <a
              href="/work"
              className="inline-flex items-center gap-2 px-6 py-2.5 md:px-8 md:py-3 border border-forest-700 text-forest-700 font-mono text-xs md:text-sm uppercase tracking-wider hover:bg-forest-700 hover:text-sage-white transition-all cursor-pointer relative z-40 group shadow-sm bg-sage-white/50 backdrop-blur-sm"
            >
              View Work
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* HERO PORTRAIT - Bottom Center */}
        {heroImage && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-[90%] sm:w-[600px] md:w-[700px] lg:w-[850px] flex justify-center items-end pointer-events-none">
            <Image 
              id="hero-photo"
              src={heroImage} 
              alt="Hero Portrait" 
              width={850}
              height={850}
              className="w-full h-auto max-h-[85vh] object-contain object-bottom grayscale block pointer-events-auto"
            />
          </div>
        )}
            
        {/* SCATTERED LOGOS - Global Background (z-10) */}
        {logos && logos.length > 0 && <ScatteredLogos logos={logos} />}
      </section>

      {/* ─── 3. Work Preview ─── */}
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

          {featuredProjects.length === 0 ? (
            <div className="w-full py-16 flex items-center justify-center">
              <p className="font-mono text-sm text-sage-white/40 tracking-wider uppercase">
                No projects yet
              </p>
            </div>
          ) : (
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
          )}

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

      {/* ─── 4. Writing Preview ─── */}
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

          {featuredPosts.length === 0 ? (
            <div className="w-full py-16 flex items-center justify-center">
              <p className="font-mono text-sm text-sage-white/40 tracking-wider uppercase">
                No posts yet
              </p>
            </div>
          ) : (
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
          )}

          <Link
            href="/writing"
            className="sm:hidden mt-8 inline-flex items-center gap-1.5 font-mono text-[12px] tracking-[0.04em] uppercase text-sage-white/80 border-b border-sage-white/80 pb-0.5"
          >
            Read all writing
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
