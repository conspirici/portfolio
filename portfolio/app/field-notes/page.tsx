import { fetchContent } from '@/lib/content';
import { FieldNotesGrid } from '@/components/FieldNotesGrid';

interface FieldNote {
  id: string;
  photo_url: string;
  caption?: string;
  location?: string;
}

export default async function FieldNotesPage() {
  const notes = (await fetchContent<FieldNote[]>('/public/field-notes', 'field-notes')) ?? [];

  return (
    <div 
      className="relative min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #123024 0%, #0D2B33 50%, #075057 100%)' }}
    >
      <div className="grain-overlay" />
      <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-20">
        <header className="mb-16 max-w-2xl">
          <h1 className="font-display text-[48px] leading-tight text-sage-white mb-4">Field Notes</h1>
          <p className="font-sans text-sage-white/80 text-lg">A visual notebook — fragments of places, details, and light that caught my eye.</p>
        </header>

        <FieldNotesGrid notes={notes} />
      </div>
    </div>
  );
}
