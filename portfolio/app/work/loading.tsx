export default function WorkLoading() {
  return (
    <div 
      className="relative min-h-screen overflow-hidden"
      style={{ background: '#1B231F' }} // Dark fallback matching the radial gradient edge
    >
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 sm:py-20">
        <header className="mb-16">
          <div className="w-48 h-12 sm:h-14 bg-white/20 animate-pulse rounded-sm mb-4" />
          <div className="w-full max-w-sm h-6 bg-white/20 animate-pulse rounded-sm" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col p-4 bg-white/5 border border-white/10">
              {/* Thumbnail */}
              <div className="w-full aspect-[4/3] bg-white/10 animate-pulse mb-6 rounded-sm" />
              
              {/* Text Content */}
              <div className="w-3/4 h-8 bg-white/20 animate-pulse mb-3 rounded-sm" />
              <div className="w-full h-4 bg-white/10 animate-pulse mb-2 rounded-sm" />
              <div className="w-5/6 h-4 bg-white/10 animate-pulse mb-5 rounded-sm" />
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <div className="w-16 h-6 bg-white/10 animate-pulse rounded-sm" />
                <div className="w-20 h-6 bg-white/10 animate-pulse rounded-sm" />
                <div className="w-14 h-6 bg-white/10 animate-pulse rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
