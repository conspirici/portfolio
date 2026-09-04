import Link from 'next/link';
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
  thumbnail_url: string;
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
            {projects.map((project) => (
              <Link href={`/work/${project.slug}`} key={project.slug} className="group flex flex-col bg-white/5 backdrop-blur-sm p-6 border border-sage-white/10 hover:bg-white/10 transition-colors">
                <div 
                  className="mb-6 h-48 w-full transition-transform group-hover:-translate-y-1"
                  style={{
                    background: project.gradient_from && project.gradient_to 
                      ? `linear-gradient(to right, ${project.gradient_from}, ${project.gradient_to})`
                      : 'linear-gradient(to right, #4b5563, #1f2937)'
                  }}
                />
                <h2 className="font-display text-2xl text-sage-white mb-3 group-hover:text-white transition-colors">{project.title}</h2>
                <p className="font-sans text-sage-white/70 mb-5 flex-grow">{project.summary}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <TagPill key={tag.id} label={tag.name} type="tech" className="bg-transparent border-sage-white/30 text-sage-white/80" />
                  ))}
                </div>
                
                <span className="font-mono text-[12px] tracking-wider text-sage-white underline decoration-sage-white/30 underline-offset-4 group-hover:decoration-sage-white/100 transition-colors mt-auto">
                  VIEW PROJECT
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
