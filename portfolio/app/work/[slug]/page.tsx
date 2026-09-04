import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Aside, ImageCarousel, ImageGrid, VideoEmbed, Mermaid } from "@/components/mdx";
import { sharedRehypePlugins } from "@/lib/mdx-plugins";
import { VideoPlayer } from "@/components/VideoPlayer";
import { TagPill } from "@/components/ui/TagPill";

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

interface TechStackItem {
  id: string;
  name: string;
  category: string;
}

interface ProjectVideo {
  id: string;
  youtube_url: string;
  label: string;
}

interface ProjectResponse {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  live_url?: string;
  github_url?: string;
  status: string;
  gradient_from?: string;
  gradient_to?: string;
  tech_stack: TechStackItem[];
  videos: ProjectVideo[];
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  let project: ProjectResponse | null = null;
  try {
    const projects = await fetchApi(`/public/projects`, { next: { revalidate: 60 } });
    project = projects.find((p: ProjectResponse) => p.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching project:', error);
    notFound();
  }

  if (!project) {
    notFound();
  }

  const gradientFrom = project.gradient_from || "#288760";
  const gradientTo = project.gradient_to || "#075057";
  const hasVideos = project.videos && project.videos.length > 0;

  return (
    <article className="min-h-screen">
      {/* Gradient Hero Section */}
      <div 
        className="relative w-full pt-24 pb-20 px-6 sm:px-10 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}
      >
        <div className="grain-overlay opacity-10" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="mb-12">
            <Link href="/work" className="font-mono text-[12px] tracking-wider text-sage-white/80 hover:text-white flex items-center gap-2 transition-colors w-fit">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              BACK TO WORK
            </Link>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium leading-tight mb-6 text-white drop-shadow-sm">
            {project.title}
          </h1>
          <p className="text-xl sm:text-2xl text-sage-white/90 leading-relaxed font-sans max-w-3xl mb-12 drop-shadow-sm">
            {project.summary}
          </p>

          <div className="flex flex-wrap items-center gap-6 font-mono text-sm uppercase tracking-wider text-sage-white">
            <div className="flex items-center gap-2">
              <span className="opacity-60">Status:</span>
              <span className="font-semibold">{project.status}</span>
            </div>
            
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors group">
                <span className="opacity-60 group-hover:opacity-100 transition-opacity">Live Site</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
              </a>
            )}
            
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors group">
                <span className="opacity-60 group-hover:opacity-100 transition-opacity">GitHub</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
              </a>
            )}
          </div>
          
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {project.tech_stack.map(tech => (
                <TagPill 
                  key={tech.id} 
                  label={tech.name} 
                  type="tech" 
                  className="bg-white/10 border-white/20 text-white backdrop-blur-sm" 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-10 pb-24">
        {hasVideos && (
          <VideoPlayer videos={project.videos} />
        )}

        <div className={`prose prose-forest max-w-none ${hasVideos ? '' : 'mt-16'}`}>
          <MDXRemote 
            source={project.body || ""} 
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
