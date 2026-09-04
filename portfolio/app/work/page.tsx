import Link from 'next/link';
import { PrintedPhotoFrame } from '@/components/ui/PrintedPhotoFrame';
import { TagPill } from '@/components/ui/TagPill';
import { fetchApi } from '@/lib/api';

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
  gradient_from?: string;
  gradient_to?: string;
  tags: TagResponse[];
}

export default async function WorkPage() {
  let projects: ProjectResponse[] = [];
  try {
    projects = await fetchApi('/public/projects', { next: { revalidate: 60 } });
  } catch (error) {
    console.error('Error fetching projects:', error);
  }

  return (
    <div 
      className="relative min-h-screen overflow-hidden"
      style={{ background: 'radial-gradient(circle at 30% 30%, #288760 0%, #09606D 55%, #1B231F 100%)' }}
    >
      <div className="grain-overlay" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 sm:py-20">
        <header className="mb-16">
          <h1 className="font-display text-4xl sm:text-[48px] leading-tight text-sage-white mb-4">Work</h1>
          <p className="font-sans text-sage-white/80 text-lg">Systems I have designed, built, and shipped.</p>
        </header>

        {projects.length === 0 ? (
          <div className="w-full py-24 flex items-center justify-center border border-dashed border-sage-white/20 bg-sage-white/5">
            <p className="font-mono text-sm text-sage-white/60 tracking-wider uppercase">
              Projects will appear when added via CMS
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {projects.map((project) => {
              const gradientFrom = project.gradient_from || "#288760";
              const gradientTo = project.gradient_to || "#075057";

              return (
                <Link 
                  href={`/work/${project.slug}`} 
                  key={project.slug} 
                  className="group flex flex-col transition-transform hover:-translate-y-1"
                >
                  <div 
                    className="relative w-full aspect-[4/3] p-8 flex flex-col border border-white/10 overflow-hidden shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}
                  >
                    <div className="grain-overlay opacity-20" />
                    <div className="relative z-10 flex flex-col h-full">
                      <h2 className="font-display text-3xl text-white mb-3 drop-shadow-sm">{project.title}</h2>
                      <p className="font-sans text-sage-white/90 text-lg leading-relaxed flex-grow drop-shadow-sm">{project.summary}</p>
                      
                      <div className="mt-auto pt-6 flex items-center gap-2 text-white font-mono text-sm uppercase tracking-wider">
                        <span className="underline decoration-white/30 underline-offset-4 group-hover:decoration-white transition-colors">View Project</span>
                        <svg className="transform group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
