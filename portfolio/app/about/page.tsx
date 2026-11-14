import Image from 'next/image';
import { fetchContent } from '@/lib/content';
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

// Desktop scrapbook: where each tag is pinned on the canvas (up to 20, then it
// wraps around). Only used from the `lg` breakpoint up — there is no room for
// absolute positions on a phone, so below that the tags flow in a wrapped row.
const TAG_POSITIONS: { top: string; left?: string; right?: string; rotate: string }[] = [
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
];

// Mobile: a slight tilt per tag keeps the hand-placed feel without overlap.
const MOBILE_TAG_TILTS = ['-2deg', '1.5deg', '-1deg', '2deg', '-1.5deg', '1deg'];

export default async function AboutPage() {
  const aboutData = await fetchContent<AboutContentResponse>('/public/about-content', 'about-content');

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
      {/* Below `lg` the pieces stack in normal flow (headline, tags, closing line,
          portrait) so nothing can collide. From `lg` up they are pinned to a
          fixed-height canvas, scrapbook style. */}
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col overflow-hidden border border-charcoal-green/20 bg-warm-gray-200 lg:block lg:h-[70vh] lg:min-h-[600px]">
        {/* grain overlay for entire canvas */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url("${noiseSvg}")`,
            mixBlendMode: 'multiply',
            opacity: 0.35,
          }}
        />

        {/* ── Headline (top on mobile, left side on desktop) ───────────────── */}
        {aboutData.headline && (
          <div className="relative z-20 px-6 pt-10 sm:px-10 lg:absolute lg:left-12 lg:top-1/2 lg:max-w-[350px] lg:-translate-y-1/2 lg:p-0">
            <h1
              className="font-display italic text-charcoal-green leading-[1.1] select-none"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
            >
              {aboutData.headline}
            </h1>
          </div>
        )}

        {/* ── Tags, mobile: wrapped row ────────────────────────────────────── */}
        {tags.length > 0 && (
          <ul className="relative z-20 flex flex-wrap gap-x-5 gap-y-4 px-6 pt-8 sm:px-10 lg:hidden">
            {tags.map((tag, i) => (
              <li
                key={`${tag}-${i}`}
                className="font-mono text-forest-900 whitespace-nowrap"
                style={{
                  transform: `rotate(${MOBILE_TAG_TILTS[i % MOBILE_TAG_TILTS.length]})`,
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  lineHeight: 1,
                }}
              >
                <span className="text-forest-700 mr-1">★</span>
                {tag}
              </li>
            ))}
          </ul>
        )}

        {/* ── Closing Line (under the tags on mobile, right side on desktop) ── */}
        {aboutData.closing_line && (
          <div className="relative z-20 px-6 pt-8 text-right sm:px-10 lg:absolute lg:right-12 lg:top-1/2 lg:max-w-[300px] lg:-translate-y-1/2 lg:p-0">
            <p
              className="font-display italic text-forest-900"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', lineHeight: 1.1 }}
            >
              {aboutData.closing_line}
            </p>
          </div>
        )}

        {/* ── Portrait (Bottom Center) ──────────────────────────────────────── */}
        {/* next/image throws on an empty src, so skip it until a portrait is uploaded */}
        {aboutData.portrait_url ? (
          <div className="relative z-10 mx-auto mt-2 w-[78%] max-w-[340px] lg:absolute lg:bottom-0 lg:left-1/2 lg:mt-0 lg:w-full lg:max-w-[400px] lg:-translate-x-1/2">
            <Image
              src={aboutData.portrait_url}
              alt={site.name}
              width={600}
              height={800}
              priority
              sizes="(max-width: 1023px) 78vw, 400px"
              className="w-full h-auto object-cover block"
              style={{ filter: 'grayscale(100%)' }}
            />
          </div>
        ) : (
          <div className="h-10 lg:hidden" />
        )}

        {/* ── Tags, desktop: scattered around the portrait ─────────────────── */}
        <div className="absolute inset-0 z-10 pointer-events-none hidden lg:block">
          {tags.map((tag, i) => {
            const pos = TAG_POSITIONS[i % TAG_POSITIONS.length];

            return (
              <div
                key={`${tag}-${i}`}
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
