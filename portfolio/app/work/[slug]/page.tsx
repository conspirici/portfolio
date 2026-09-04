import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Aside, ImageCarousel, ImageGrid, VideoEmbed, Mermaid } from "@/components/mdx";
import VideoPlayer from "@/components/VideoPlayer";
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

interface TechStackItem {
  id: string;
  name: string;
  category: string;
}

interface ProjectVideo {
  id: string;
  url: string;
  title: string;
  duration?: string;
  is_overview: boolean;
}

interface ProjectResponse {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  thumbnail_url: string;
  live_url?: string;
  github_url?: string;
  status: string;
  tech_stack: TechStackItem[];
  videos?: ProjectVideo[];
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
  
  const overviewVideo = project.videos?.find(v => v.is_overview);
  const additionalVideos = project.videos?.filter(v => !v.is_overview) || [];

  return (
    <article className="max-w-6xl mx-auto px-6 sm:px-10 py-24">
      <header className="mb-16">
        <div className="mb-8">
          <Link href="/work" className="font-mono text-[12px] tracking-wider text-forest-700 hover:text-forest-900 flex items-center gap-2 transition-colors w-fit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            BACK TO WORK
          </Link>
        </div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
          <div className="lg:w-2/3">
            <h1 className="font-display text-5xl sm:text-6xl font-medium leading-tight mb-6 text-forest-900">
              {project.title}
            </h1>
            <p className="text-xl sm:text-2xl text-forest-800/80 leading-relaxed font-sans max-w-3xl">
              {project.summary}
            </p>
          </div>
          
          <div className="flex flex-col gap-4 min-w-[200px]">
            {project.live_url && (
              <a 
                href={project.live_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full text-center bg-forest-900 text-white font-mono text-[13px] tracking-widest px-6 py-4 hover:bg-forest-800 transition-colors uppercase"
              >
                Live Demo
              </a>
            )}
            
            {project.github_url && (
              <a 
                href={project.github_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full text-center border border-forest-900 text-forest-900 font-mono text-[13px] tracking-widest px-6 py-4 hover:bg-forest-50 transition-colors uppercase"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </header>
      
      {/* Media Section */}
      {(overviewVideo || additionalVideos.length > 0) && (
        <section className="mb-24 flex flex-col lg:flex-row gap-8">
          {/* Overview Video - takes up most space on desktop, on top on mobile */}
          <div className="w-full lg:w-3/4 flex flex-col">
            {overviewVideo ? (
              <div className="w-full">
                <VideoPlayer url={overviewVideo.url} title={overviewVideo.title} />
                <p className="mt-4 text-forest-800/70 font-sans">
                  <strong className="text-forest-900 mr-2">Overview:</strong> 
                  {overviewVideo.title} {overviewVideo.duration && `(${overviewVideo.duration})`}
                </p>
              </div>
            ) : project.thumbnail_url ? (
               <div className="w-full h-[600px] relative overflow-hidden bg-forest-900">
                <Image 
                  src={project.thumbnail_url} 
                  alt={`Thumbnail for ${project.title}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
          
          {/* Media Navigator - right col on desktop, below overview on mobile */}
          {additionalVideos.length > 0 && (
            <div className="w-full lg:w-1/4">
              <h3 className="font-mono text-[12px] tracking-wider text-forest-700 uppercase mb-4 border-b border-forest-200 pb-2">
                Explore This Project
              </h3>
              <div className="flex flex-col gap-6">
                {additionalVideos.map((video) => (
                  <div key={video.id} className="group">
                    <VideoPlayer url={video.url} title={video.title} duration={video.duration} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Tech Stack Details */}
      {project.tech_stack && project.tech_stack.length > 0 && (
         <div className="mb-16 p-6 border-y border-mist-100 flex flex-wrap gap-x-8 gap-y-4 items-center">
           <span className="font-mono text-[11px] tracking-wider text-forest-700 uppercase">Tech Stack:</span>
           <div className="flex flex-wrap gap-2">
             {project.tech_stack.map(tech => (
               <span key={tech.id} className="font-mono text-[11px] tracking-wider text-forest-900 bg-mist-50 px-3 py-1">
                 {tech.name}
               </span>
             ))}
           </div>
         </div>
      )}

      {/* MDX Body Content */}
      <div className="max-w-4xl mx-auto prose prose-forest max-w-none prose-lg">
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
    </article>
  );
}
