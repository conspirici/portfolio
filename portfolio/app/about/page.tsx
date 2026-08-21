import Image from 'next/image';
import { fetchApi } from '@/lib/api';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Button } from '@/components/ui/Button';
import { site } from '@/config/site';
import { socials } from '@/config/socials';

interface AboutContentResponse {
  headline?: string;
  portrait_url: string;
  tags: string[];
  body: string;
  closing_line?: string;
}

// Noise SVG for the grain overlay on the portrait
const noiseSvg = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E`;

// Tag positions scattered around the portrait — carefully placed to avoid portrait center zone
const TAG_POSITIONS = [
  { top: '4%',  left: '0%',   rotate: '-2deg'  },
  { top: '18%', left: '1%',   rotate: '1.5deg' },
  { top: '34%', left: '0%',   rotate: '-1deg'  },
  { top: '52%', left: '1%',   rotate: '2deg'   },
  { top: '70%', left: '0%',   rotate: '-1.5deg'},
  { top: '6%',  right: '0%',  rotate: '2deg'   },
  { top: '22%', right: '0%',  rotate: '-1deg'  },
  { top: '40%', right: '0%',  rotate: '1.5deg' },
  { top: '58%', right: '1%',  rotate: '-2deg'  },
  { top: '76%', right: '0%',  rotate: '1deg'   },
  { top: '86%', left: '8%',   rotate: '-1deg'  },
  { top: '88%', right: '8%',  rotate: '2deg'   },
];

// Decorative stickers — placed in safe corner zones away from portrait/text/tags
const STICKERS = [
  { symbol: '✦', top: '2%',   left: '46%',  rotate: '12deg',  size: '1.4rem'  },
  { symbol: '✧', top: '91%',  left: '44%',  rotate: '-8deg',  size: '1.1rem'  },
  { symbol: '◆', top: '48%',  left: '44%',  rotate: '6deg',   size: '0.85rem' },
  { symbol: '※', top: '78%',  left: '46%',  rotate: '-12deg', size: '1rem'    },
  { symbol: '✦', top: '22%',  left: '45%',  rotate: '-6deg',  size: '0.75rem' },
];

export default async function AboutPage() {
  let aboutData: AboutContentResponse | null = null;
  try {
    aboutData = await fetchApi('/public/about-content', { next: { tags: ['about-content'] } });
  } catch (error) {
    console.error('Error fetching about content:', error);
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!aboutData) {
    return (
      <div
        className="relative min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F5F7F4' }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-forest-700/40">
          About content coming soon
        </p>
      </div>
    );
  }

  const tags = aboutData.tags ?? [];

  // ── Main layout ─────────────────────────────────────────────────────────────
  return (
    <div
      className="relative min-h-screen overflow-x-hidden pt-16 pb-24"
      style={{ backgroundColor: '#F5F7F4' }}
    >
      {/* ── SCRAPBOOK CANVAS ────────────────────────────────────────────────── */}
      <div 
        className="relative mx-auto w-full max-w-[1200px] bg-warm-gray-200 overflow-hidden border border-charcoal-green/20"
        style={{ height: '70vh', minHeight: '600px' }}
      >
        {/* grain overlay for entire canvas */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url("${noiseSvg}")`,
            mixBlendMode: 'multiply',
            opacity: 0.35,
          }}
        />

        {/* ── Portrait (Bottom Center) ──────────────────────────────────────── */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-full max-w-[400px]">
          <Image
            src={aboutData.portrait_url}
            alt={site.name}
            width={600}
            height={800}
            priority
            className="w-full h-auto object-cover block"
            style={{ filter: 'grayscale(100%)' }}
          />
        </div>

        {/* ── Headline (Left Side) ─────────────────────────────────────────── */}
        {aboutData.headline && (
          <div className="absolute left-4 md:left-12 top-1/3 md:top-1/2 -translate-y-1/2 z-20 max-w-[350px]">
            <h1
              className="font-display italic text-charcoal-green leading-[1.1] select-none"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
            >
              {aboutData.headline}
            </h1>
          </div>
        )}

        {/* ── Closing Line (Right Side) ────────────────────────────────────── */}
        {aboutData.closing_line && (
          <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-20 max-w-[300px] text-right">
            <p
              className="font-display italic text-forest-900"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', lineHeight: 1.1 }}
            >
              {aboutData.closing_line}
            </p>
          </div>
        )}

        {/* ── Tag labels scattered ──────────────────────────────────────────── */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {tags.map((tag, i) => {
            // Distribute up to 20 tags across the top, left, and right
            const pos = [
              { top: '10%', left: '12%', rotate: '-5deg' },
              { top: '8%',  left: '35%', rotate: '3deg' },
              { top: '12%', right: '15%', rotate: '-2deg' },
              { top: '22%', left: '22%', rotate: '6deg' },
              { top: '20%', right: '35%', rotate: '-4deg' },
              { top: '65%', left: '8%',  rotate: '2deg' },
              { top: '60%', right: '12%', rotate: '-6deg' },
              { top: '82%', left: '18%', rotate: '4deg' },
              { top: '78%', right: '22%', rotate: '-3deg' },
              { top: '35%', left: '4%',  rotate: '-8deg' },
              { top: '45%', right: '5%', rotate: '5deg' },
              { top: '88%', left: '38%', rotate: '-2deg' },
              { top: '85%', right: '42%', rotate: '7deg' },
              { top: '5%',  left: '55%', rotate: '-6deg' },
              { top: '32%', right: '8%', rotate: '4deg' },
              { top: '72%', left: '28%', rotate: '-5deg' },
              { top: '50%', left: '12%', rotate: '3deg' },
              { top: '92%', left: '15%', rotate: '-4deg' },
              { top: '90%', right: '15%', rotate: '5deg' },
              { top: '15%', right: '45%', rotate: '-1deg' },
            ][i % 20];
            
            return (
              <div
                key={tag}
                className="absolute font-mono text-forest-900 whitespace-nowrap"
                style={{
                  top: pos.top,
                  left: pos.left,
                  right: pos.right,
                  transform: `rotate(${pos.rotate})`,
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  lineHeight: 1,
                }}
              >
                <span className="text-forest-700 mr-1">★</span>
                {tag}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BIO BODY ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 mt-16">
        <div className="prose prose-base md:prose-lg font-sans text-charcoal-green max-w-none space-y-6
                        prose-p:leading-relaxed prose-p:text-charcoal-green
                        prose-strong:text-forest-900 prose-a:text-teal-700
                        prose-a:underline prose-a:underline-offset-4">
          <MDXRemote source={aboutData.body || ''} />
        </div>

        {/* nav links */}
        <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-charcoal-green/10">
          <Button label="Work"         href="/work"                   variant="text-link" accent="forest" />
          <Button label="Writing"      href="/writing"                variant="text-link" accent="forest" />
          <Button label="Field Notes"  href="/field-notes"            variant="text-link" accent="forest" />
          <Button label="Get in Touch" href={`mailto:${socials.email}`} variant="text-link" accent="teal" />
        </div>
      </div>
    </div>
  );
}
