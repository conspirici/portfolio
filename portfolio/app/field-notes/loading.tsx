export default function FieldNotesLoading() {
  return (
    <div 
      className="relative min-h-screen overflow-hidden"
      style={{ background: '#123024' }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 sm:py-20">
        <header className="mb-16 max-w-2xl flex flex-col gap-4">
          <div className="w-64 h-12 bg-white/20 animate-pulse rounded-sm" />
          <div className="w-full max-w-[400px] h-6 bg-white/20 animate-pulse rounded-sm" />
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-full aspect-square bg-white/10 animate-pulse border border-white/5 p-4 flex flex-col justify-end">
              <div className="w-2/3 h-5 bg-white/20 animate-pulse mb-2 rounded-sm shadow-black" />
              <div className="w-1/3 h-4 bg-white/20 animate-pulse rounded-sm shadow-black" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
